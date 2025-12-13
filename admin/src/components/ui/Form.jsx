import React from 'react';

export const Input = ({ label, register, name, error, ...props }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            {...register(name)}
            {...props}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${error ? 'border-red-500' : 'border-slate-300'}`}
        />
        {error && <span className="text-xs text-red-500 mt-1">{error.message}</span>}
    </div>
);

export const TextArea = ({ label, register, name, error, ...props }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea
            {...register(name)}
            {...props}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${error ? 'border-red-500' : 'border-slate-300'}`}
        />
        {error && <span className="text-xs text-red-500 mt-1">{error.message}</span>}
    </div>
);

export const Button = ({ children, isLoading, ...props }) => (
    <button
        {...props}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
    >
        {isLoading ? 'Enregistrement...' : children}
    </button>
);
