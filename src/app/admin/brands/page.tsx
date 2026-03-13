"use client";

import { useState, useEffect, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/lib/supabase";

interface Brand {
    id: string;
    name: string | null;
    image_url: string;
    width: number;
    height: number;
    created_at: string;
}

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Add Form State
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [width, setWidth] = useState(120);
    const [height, setHeight] = useState(60);

    // Edit Modal State
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [editName, setEditName] = useState("");
    const [editImageUrl, setEditImageUrl] = useState("");
    const [editWidth, setEditWidth] = useState(120);
    const [editHeight, setEditHeight] = useState(60);
    const [isEditUploading, setIsEditUploading] = useState(false);
    const [isEditSaving, setIsEditSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    // Filter brands whenever search or brands change
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredBrands(brands);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredBrands(brands.filter(b => (b.name || "").toLowerCase().includes(q)));
        }
    }, [searchQuery, brands]);

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(data.brands || []);
            }
        } catch (error) {
            console.error("Error fetching brands", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- Upload helpers ----------
    const uploadImage = async (file: File): Promise<string> => {
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const fileName = `brand_${timestamp}_${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `landing/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("landing_media")
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("landing_media").getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleEditUploadClick = () => editFileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) { alert("L'image est trop grande (Max 20MB)."); return; }

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            setImageUrl(url);
            if (!name) setName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        } catch (err) {
            console.error("Upload error:", err);
            alert("Erreur lors du téléchargement de l'image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) { alert("L'image est trop grande (Max 20MB)."); return; }

        setIsEditUploading(true);
        try {
            const url = await uploadImage(file);
            setEditImageUrl(url);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Erreur lors du téléchargement de l'image.");
        } finally {
            setIsEditUploading(false);
            if (editFileInputRef.current) editFileInputRef.current.value = '';
        }
    };

    // ---------- Add ----------
    const handleAddBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) { alert("Veuillez télécharger une image."); return; }

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/brands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, image_url: imageUrl, width, height })
            });
            if (!res.ok) throw new Error("Failed to save brand");
            setName(""); setImageUrl(""); setWidth(120); setHeight(60);
            fetchBrands();
        } catch (error) {
            console.error("Error saving brand", error);
            alert("Erreur lors de l'enregistrement de la marque.");
        } finally {
            setIsSaving(false);
        }
    };

    // ---------- Edit ----------
    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setEditName(brand.name || "");
        setEditImageUrl(brand.image_url);
        setEditWidth(brand.width);
        setEditHeight(brand.height);
    };

    const closeEditModal = () => {
        setEditingBrand(null);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;
        if (!editImageUrl) { alert("Veuillez télécharger une image."); return; }

        setIsEditSaving(true);
        try {
            const res = await fetch('/api/admin/brands', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingBrand.id, name: editName, image_url: editImageUrl, width: editWidth, height: editHeight })
            });
            if (!res.ok) throw new Error("Failed to update brand");
            closeEditModal();
            fetchBrands();
        } catch (error) {
            console.error("Error updating brand", error);
            alert("Erreur lors de la mise à jour de la marque.");
        } finally {
            setIsEditSaving(false);
        }
    };

    // ---------- Delete ----------
    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette marque ?")) return;
        try {
            const res = await fetch(`/api/admin/brands?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchBrands();
            else throw new Error("Failed to delete brand");
        } catch (error) {
            console.error("Error deleting brand", error);
            alert("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <header className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="xl:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Marques Partenaires</h1>
                                <p className="text-slate-600 dark:text-slate-400">Gérez les logos des marques affichés dans le carrousel sur la page d'accueil.</p>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Brand Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ajouter une marque</h2>
                                <form onSubmit={handleAddBrand} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Logo de la marque</label>
                                        <div
                                            onClick={handleUploadClick}
                                            className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${imageUrl ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 bg-slate-50 dark:bg-slate-900/50'}`}
                                        >
                                            {isUploading ? (
                                                <span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">autorenew</span>
                                            ) : imageUrl ? (
                                                <div className="w-full h-full p-2 flex items-center justify-center">
                                                    <img src={imageUrl} alt="Aperçu" className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" style={{ width: width + 'px', height: height + 'px' }} />
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">add_photo_alternate</span>
                                                    <span className="text-sm text-slate-500 font-medium">Cliquez pour ajouter</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={handleFileChange} />
                                        {imageUrl && (
                                            <button type="button" onClick={() => setImageUrl("")} className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium">
                                                Retirer l'image
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom (Optionnel)</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ex: Samsung"
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Largeur (px)</label>
                                            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hauteur (px)</label>
                                            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!imageUrl || isSaving || isUploading}
                                        className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? <span className="material-symbols-outlined animate-spin text-xl">autorenew</span> : <span className="material-symbols-outlined text-xl">save</span>}
                                        {isSaving ? "Enregistrement..." : "Ajouter la marque"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Brands List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                {/* Search Bar */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="relative flex-1">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">search</span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher une marque..."
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {filteredBrands.length} / {brands.length}
                                    </span>
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <span className="material-symbols-outlined animate-spin text-4xl mb-4">autorenew</span>
                                        <p>Chargement des marques...</p>
                                    </div>
                                ) : filteredBrands.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                                            {searchQuery ? "search_off" : "loyalty"}
                                        </span>
                                        <p className="text-slate-500 font-medium">
                                            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucune marque n'a été ajoutée pour le moment."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {filteredBrands.map(brand => (
                                            <div key={brand.id} className="group relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div className="h-20 w-full flex items-center justify-center mb-3">
                                                    <img
                                                        src={brand.image_url}
                                                        alt={brand.name || "Brand logo"}
                                                        className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                                        style={{ width: `${brand.width}px`, height: `${brand.height}px` }}
                                                    />
                                                </div>
                                                <div className="w-full text-center border-t border-slate-200 dark:border-slate-800 pt-3">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{brand.name || "Sans nom"}</p>
                                                    <p className="text-[10px] text-slate-500">{brand.width}x{brand.height}px</p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(brand)}
                                                        className="bg-blue-500 text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 hover:scale-110 transition-all"
                                                        title="Modifier"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(brand.id)}
                                                        className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 hover:scale-110 transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditModal} />

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md z-10 animate-[fadeInScale_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Modifier la marque</h2>
                            <button onClick={closeEditModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="flex flex-col gap-5">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Logo de la marque</label>
                                <div
                                    onClick={handleEditUploadClick}
                                    className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${editImageUrl ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 bg-slate-50 dark:bg-slate-900/50'}`}
                                >
                                    {isEditUploading ? (
                                        <span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">autorenew</span>
                                    ) : editImageUrl ? (
                                        <div className="w-full h-full p-2 flex items-center justify-center">
                                            <img src={editImageUrl} alt="Aperçu" className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" style={{ width: editWidth + 'px', height: editHeight + 'px' }} />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">add_photo_alternate</span>
                                            <span className="text-sm text-slate-500 font-medium">Cliquez pour changer</span>
                                        </>
                                    )}
                                </div>
                                <input type="file" ref={editFileInputRef} className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={handleEditFileChange} />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom (Optionnel)</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Ex: Samsung"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* Width/Height */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Largeur (px)</label>
                                    <input type="number" value={editWidth} onChange={(e) => setEditWidth(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hauteur (px)</label>
                                    <input type="number" value={editHeight} onChange={(e) => setEditHeight(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={closeEditModal} className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={!editImageUrl || isEditSaving || isEditUploading}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isEditSaving ? <span className="material-symbols-outlined animate-spin text-xl">autorenew</span> : <span className="material-symbols-outlined text-xl">save</span>}
                                    {isEditSaving ? "Enregistrement..." : "Sauvegarder"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
