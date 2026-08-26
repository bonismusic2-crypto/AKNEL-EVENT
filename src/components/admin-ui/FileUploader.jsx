import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileAudio, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const FileUploader = ({
  label,
  accept = 'image/*',
  bucket = 'media',
  multiple = false, // Permet la sélection multiple de fichiers à la fois
  onUploadSuccess,
  onMultiUploadSuccess, // Callback recevant la liste des fichiers uploadés : [{ name, title, url, duration }]
  required = false,
  helperText,
  currentPreviewUrl,
}) => {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(currentPreviewUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(currentPreviewUrl || '');
  const [uploadedList, setUploadedList] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isImage = accept.includes('image');
  const isVideo = accept.includes('video');
  const isAudio = accept.includes('audio');

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError('');

    if (multiple) {
      // Téléversement multiple de plusieurs fichiers en parallèle
      setFiles(selectedFiles);
      await uploadMultipleToSupabase(selectedFiles);
    } else {
      // Téléversement d'un seul fichier
      const singleFile = selectedFiles[0];
      setFiles([singleFile]);

      if (singleFile.type.startsWith('image/')) {
        const localPreview = URL.createObjectURL(singleFile);
        setPreview(localPreview);
      } else {
        setPreview('');
      }

      await uploadSingleToSupabase(singleFile);
    }
  };

  const uploadSingleToSupabase = async (selectedFile) => {
    setUploading(true);
    setUploadProgress(20);
    setError('');

    try {
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${Date.now()}_${cleanFileName}`;

      setUploadProgress(50);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Erreur lors du téléversement du fichier');
      }

      setUploadProgress(85);

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      setUploadedUrl(publicUrl);
      setUploadProgress(100);

      if (onUploadSuccess) {
        onUploadSuccess(publicUrl, selectedFile);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Échec du téléversement.');
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleToSupabase = async (fileList) => {
    setUploading(true);
    setUploadProgress(10);
    setError('');
    const uploadedResults = [];

    try {
      const total = fileList.length;
      for (let i = 0; i < total; i++) {
        const fileItem = fileList[i];
        const cleanFileName = fileItem.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${Date.now()}_${i}_${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileItem, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        const url = publicUrlData.publicUrl;
        
        // Nettoyer le titre par défaut à partir du nom de fichier
        const cleanTitle = fileItem.name
          .replace(/\.[^/.]+$/, '') // retirer extension
          .replace(/[_-]/g, ' ')   // remplacer tirets par espaces
          .replace(/^\d+\s*/, '')   // retirer numérotation de début si présente
          .trim();

        uploadedResults.push({
          name: fileItem.name,
          title: cleanTitle || fileItem.name,
          url: url,
          duration: '04:30',
        });

        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      setUploadedList(uploadedResults);
      if (onMultiUploadSuccess) {
        onMultiUploadSuccess(uploadedResults);
      }
    } catch (err) {
      console.error('Multi upload error:', err);
      setError(err.message || 'Échec lors du téléversement multiple.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFiles([]);
    setPreview('');
    setUploadedUrl('');
    setUploadedList([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadSuccess) {
      onUploadSuccess('');
    }
    if (onMultiUploadSuccess) {
      onMultiUploadSuccess([]);
    }
  };

  const handleRemoveSingleFromList = (index, e) => {
    e.stopPropagation();
    const updated = uploadedList.filter((_, idx) => idx !== index);
    setUploadedList(updated);
    if (onMultiUploadSuccess) {
      onMultiUploadSuccess(updated);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
          uploadedUrl || uploadedList.length > 0
            ? 'border-emerald-400 bg-emerald-50/40'
            : error
            ? 'border-red-300 bg-red-50/30'
            : 'border-gray-200 bg-gray-50/70 hover:bg-gold/5 hover:border-gold'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="py-4 flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin text-gold" />
            <p className="text-xs font-bold text-dark">
              {multiple ? `Téléversement multiple en cours (${files.length} fichiers)... ${uploadProgress}%` : `Téléversement en cours... ${uploadProgress}%`}
            </p>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : multiple && uploadedList.length > 0 ? (
          <div className="w-full space-y-2 py-1 text-left">
            <div className="flex justify-between items-center pb-1 border-b border-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-800">
                  {uploadedList.length} fichier(s) téléversé(s) avec succès
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
              >
                Tout retirer
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {uploadedList.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileAudio size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate font-semibold text-dark">{idx + 1}. {item.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSingleFromList(idx, e)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded"
                    title="Retirer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-500 italic pt-1 text-center">
              + Cliquez pour ajouter d'autres fichiers
            </p>
          </div>
        ) : uploadedUrl ? (
          <div className="w-full flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3">
              {preview || (isImage && uploadedUrl) ? (
                <img
                  src={preview || uploadedUrl}
                  alt="Aperçu"
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-200 shadow-sm"
                />
              ) : isVideo ? (
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <FileVideo size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <FileAudio size={24} />
                </div>
              )}

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <p className="text-xs font-extrabold text-emerald-800">Fichier prêt & hébergé</p>
                </div>
                <p className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                  {files[0] ? files[0].name : 'Fichier en ligne'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Changer de fichier"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              {isImage ? <ImageIcon size={20} /> : isVideo ? <FileVideo size={20} /> : isAudio ? <FileAudio size={20} /> : <Upload size={20} />}
            </div>
            <div>
              <p className="text-xs font-bold text-dark">
                {multiple ? (
                  <>Sélectionnez <span className="text-gold underline">plusieurs fichiers à la fois</span></>
                ) : (
                  <>Cliquez pour <span className="text-gold underline">sélectionner un fichier</span></>
                )}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {helperText || (multiple ? 'Sélectionnez plusieurs audios MP3/WAV ou vidéos MP4' : isImage ? 'JPG, PNG, WEBP (Max 10 Mo)' : isVideo ? 'Vidéo MP4 HD (Max 200 Mo)' : 'Audio MP3 / WAV')}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium mt-1">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
