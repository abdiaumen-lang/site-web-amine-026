"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export type MediaItem = {
    url: string;
    type: 'image' | 'video';
    name: string;
    size: number;
};

interface AdminMediaUploadProps {
    media: MediaItem[];
    onChange: (media: MediaItem[]) => void;
}

export default function AdminMediaUpload({ media, onChange }: AdminMediaUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setIsUploading(true);
        setUploadProgress(10);

        const uploadedMedia: MediaItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > 20 * 1024 * 1024) {
                setError("Fichier trop volumineux. La limite est de 20MB.");
                continue;
            }

            try {
                const timestamp = Date.now();
                const ext = file.name.split('.').pop();
                const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${ext}`;
                const filePath = `landing/${fileName}`;

                // Upload direct via le client Supabase
                const { error: uploadError } = await supabase.storage
                    .from("landing_media")
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw uploadError;
                }

                const { data } = supabase.storage
                    .from("landing_media")
                    .getPublicUrl(filePath);

                uploadedMedia.push({
                    url: data.publicUrl,
                    type: file.type.startsWith('video') ? 'video' : 'image',
                    name: file.name,
                    size: file.size
                });

            } catch (err: any) {
                console.error("Upload error:", err);
                setError(err.message || "Impossible de télécharger ce fichier.");
            }
            setUploadProgress(Math.floor(((i + 1) / files.length) * 100));
        }

        if (uploadedMedia.length > 0) {
            onChange([...media, ...uploadedMedia]);
        }

        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // reset input
        }
    };

    const handleDelete = async (url: string) => {
        setError(null);
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/landing_media/');
            if (pathParts.length < 2) {
                throw new Error("URL invalide.");
            }

            const filePath = decodeURIComponent(pathParts[1]);

            const { error: deleteError } = await supabase.storage
                .from("landing_media")
                .remove([filePath]);

            if (deleteError) {
                throw deleteError;
            }

            const updatedMedia = media.filter(item => item.url !== url);
            onChange(updatedMedia);

        } catch (err: any) {
            console.error("Delete error:", err);
            setError(err.message || "Impossible de supprimer ce fichier.");
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Médias de la Landing Page
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                        Images (JPG, PNG, WebP) et Vidéos (MP4). Taille MAX: 20MB.
                    </p>
                </div>
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleUploadClick}
                    className="text-sm w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    {isUploading ? (
                        <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                            {uploadProgress}%
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                            Ajouter des fichiers
                        </>
                    )}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,video/mp4"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-xs leading-relaxed">
                    {error}
                </div>
            )}

            {media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map((item, idx) => (
                        <div key={idx} className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden aspect-square flex flex-col shadow-sm">
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                                {item.type === 'video' ? (
                                    <>
                                        <video
                                            className="w-full h-full object-cover opacity-80"
                                            src={item.url}
                                            muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="size-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                                <span className="material-symbols-outlined text-white text-[24px]">play_arrow</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 transition-opacity">
                                <p className="text-white text-[10px] font-medium truncate mb-0.5">{item.name}</p>
                                <p className="text-white/70 text-[9px] mb-2">{formatBytes(item.size)}</p>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); handleDelete(item.url); }}
                                    className="w-full py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-[13px]">delete</span>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/10">
                    <span className="material-symbols-outlined text-3xl mb-3 opacity-50">perm_media</span>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Aucun média ajouté</p>
                </div>
            )}
        </div>
    );
}
