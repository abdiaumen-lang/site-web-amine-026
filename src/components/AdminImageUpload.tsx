"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface AdminImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    bucket?: string;
    folder?: string;
}

export default function AdminImageUpload({
    value,
    onChange,
    label,
    bucket = "landing_media",
    folder = "products"
}: AdminImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);
        setIsUploading(true);

        // Validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("L'image est trop volumineuse (max 10MB).");
            setIsUploading(false);
            return;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(publicUrlData.publicUrl);
        } catch (err: any) {
            console.error("Upload error:", err);
            setError("Erreur lors du téléchargement.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {label && <label className="text-xs font-medium text-slate-500">{label}</label>}

            <div className="relative group">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {value ? (
                    <div className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 group">
                        <img src={value} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Changer l'image"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                title="Supprimer l'image"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="aspect-square w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all bg-slate-50 dark:bg-slate-900"
                    >
                        {isUploading ? (
                            <span className="material-symbols-outlined text-3xl animate-spin">autorenew</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                <span className="text-[10px] mt-2 font-medium uppercase tracking-tight">Ajouter une image</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
        </div>
    );
}
