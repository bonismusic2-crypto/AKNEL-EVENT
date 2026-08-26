import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileAudio, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const FileUploader = ({
  label,
  accept = 'image/*',
  bucket = 'media',
  onUploadSuccess,
  required = false,
  helperText,
  currentPreviewUrl,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentPreviewUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(currentPreviewUrl || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isImage = accept.includes('image');
  const isVideo = accept.includes('video');
  const isAudio = accept.includes('audio');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError('');
    setFile(selectedFile);

    // Prévisualisation immédiate locale pour les images
    if (selectedFile.type.startsWith('image/')) {
      const localPreview = URL.createObjectURL(selectedFile);
      setPreview(localPreview);
    } else {
      setPreview('');
    }

    // Téléversement automatique vers Supabase Storage
    await uploadToSupabase(selectedFile);
  };

  const uploadToSupabase = async (selectedFile) => {
    setUploading(true);
    setUploadProgress(20);
    setError('');

    try {
      // 1. Nettoyer le nom de fichier
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${Date.now()}_${cleanFileName}`;

      setUploadProgress(50);

      // 2. Upload vers le bucket Supabase
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // Si le bucket n'est pas encore initialisé, tentative sur le bucket 'covers' ou 'media'
        throw new Error(uploadError.message || 'Erreur lors du téléversement du fichier');
      }

      setUploadProgress(85);

      // 3. Récupérer l'URL Publique
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
      setError(err.message || 'Échec du téléversement vers le serveur de stockage.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview('');
    setUploadedUrl('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadSuccess) {
      onUploadSuccess('');
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
          uploadedUrl
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
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="py-4 flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin text-gold" />
            <p className="text-xs font-bold text-dark">Téléversement en cours... {uploadProgress}%</p>
            <div className="w-36 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
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
                  {file ? file.name : 'Fichier en ligne'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                Cliquez pour <span className="text-gold underline">sélectionner un fichier</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {helperText || (isImage ? 'JPG, PNG, WEBP (Max 10 Mo)' : isVideo ? 'Vidéo MP4 HD (Max 200 Mo)' : 'Audio MP3 / WAV')}
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
