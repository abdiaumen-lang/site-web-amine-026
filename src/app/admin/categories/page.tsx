"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";

type Subcategory = {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    created_at: string;
};

type Category = {
    id: string;
    name: string;
    link: string;
    image: string;
    icon: string;
};

export default function CategoriesAdminPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form states for Category
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [catName, setCatName] = useState("");
    const [catIcon, setCatIcon] = useState("");

    // Form states for Subcategory
    const [showSubModal, setShowSubModal] = useState(false);
    const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
    const [subName, setSubName] = useState("");
    const [subSlug, setSubSlug] = useState("");

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from("categories").select("*").order("name");
            if (!error && data) {
                setCategories(data);
                if (data.length > 0 && !selectedCategory) {
                    setSelectedCategory(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const { data, error } = await supabase
                .from("subcategories")
                .select("*")
                .eq("category_id", categoryId)
                .order("name");
            if (!error && data) {
                setSubcategories(data);
            }
        } catch (err) {
            console.error("Failed to fetch subcategories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchSubcategories(selectedCategory.id);
        }
    }, [selectedCategory]);

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (editingCat) {
                const { error } = await supabase
                    .from("categories")
                    .update({
                        name: catName,
                        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                        icon: catIcon
                    })
                    .eq("id", editingCat.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("categories")
                    .insert([{
                        name: catName,
                        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                        icon: catIcon,
                        image: '' // Fallback image if necessary, but empty should suffice if nullable or not enforced
                    }]);
                if (error) throw error;
            }
            setShowCatModal(false);
            setEditingCat(null);
            setCatName("");
            setCatIcon("");
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement de la catégorie: " + (error as any).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ? Cela supprimera également toutes ses sous-catégories et supprimera les liens des produits associés.`)) return;
        try {
            await supabase.from("categories").delete().eq("id", id);
            fetchCategories();
            if (selectedCategory?.id === id) {
                setSelectedCategory(null);
                setSubcategories([]);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression de la catégorie");
        }
    };

    const openCreateCatModal = () => {
        setEditingCat(null);
        setCatName("");
        setCatIcon("category");
        setShowCatModal(true);
    };

    const openEditCatModal = (cat: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCat(cat);
        setCatName(cat.name);
        setCatIcon(cat.icon || "");
        setShowCatModal(true);
    };

    const handleSaveSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        setIsLoading(true);

        try {
            if (editingSub) {
                const { error } = await supabase
                    .from("subcategories")
                    .update({ name: subName, slug: subSlug })
                    .eq("id", editingSub.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("subcategories")
                    .insert([{ category_id: selectedCategory.id, name: subName, slug: subSlug }]);
                if (error) throw error;
            }
            setShowSubModal(false);
            setEditingSub(null);
            setSubName("");
            setSubSlug("");
            fetchSubcategories(selectedCategory.id);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement de la sous-catégorie: " + (error as any).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSubcategory = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?")) return;
        try {
            await supabase.from("subcategories").delete().eq("id", id);
            if (selectedCategory) {
                fetchSubcategories(selectedCategory.id);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression de la sous-catégorie");
        }
    };

    const openCreateModal = () => {
        setEditingSub(null);
        setSubName("");
        setSubSlug("");
        setShowSubModal(true);
    };

    const openEditModal = (sub: Subcategory) => {
        setEditingSub(sub);
        setSubName(sub.name);
        setSubSlug(sub.slug);
        setShowSubModal(true);
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden h-screen flex relative">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="xl:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Catégories</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <img alt="Admin Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQfKpvkjDAvgMspnPXysho_eI53kK0kN0aepzGOVJtUsdV81ZQbn0J8_6qDQ38us-orytTCXDJmJj_5Vzp5B2WsT4KJ3845KE801nMsqTtaz0W3P21OAyDIBBU2W8FttoCVdpKG9Us-C4PWz_B2-wEKl5CmxM6d2k2ml-lwyGCz0MsLQbLq8JlbnN9ODKZVS2WQWvywGpiy2uYsEE4wIbAAX5vd3IDR242c6jnLwPmfVFi2qrENfF7oo0pa3VyGABNmtsbv69G3xo" />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Administrateur</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:h-full items-start">
                        {/* Main Categories List */}
                        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[50vh] lg:h-[calc(100vh-140px)] shrink-0">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white">Catégories Principales</h3>
                                <button onClick={openCreateCatModal} className="bg-primary hover:bg-primary-dark text-white p-1.5 rounded-lg text-sm font-semibold flex items-center transition-colors" title="Ajouter une catégorie">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`group w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${selectedCategory?.id === cat.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {cat.icon && <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>}
                                            <span className="text-sm">{cat.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 transition-opacity">
                                            <button onClick={(e) => openEditCatModal(cat, e)} className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subcategories View */}
                        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[60vh] lg:h-[calc(100vh-140px)] shrink-0 mb-8 lg:mb-0">
                            {selectedCategory ? (
                                <>
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            Sous-catégories de <span className="text-primary">{selectedCategory.name}</span>
                                        </h3>
                                        <button onClick={openCreateModal} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            Ajouter une sous-catégorie
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {subcategories.length === 0 ? (
                                            <div className="text-center py-10">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">dashboard_customize</span>
                                                <p className="text-slate-500 dark:text-slate-400">Aucune sous-catégorie trouvée.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {subcategories.map(sub => (
                                                    <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white">{sub.name}</p>
                                                            <p className="text-xs text-slate-500 mt-1">/{sub.slug}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditModal(sub)} className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>
                                                            <button onClick={() => handleDeleteSubcategory(sub.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-500">
                                    Sélectionnez une catégorie pour voir les sous-catégories
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showSubModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {editingSub ? 'Modifier la sous-catégorie' : 'Ajouter une sous-catégorie'}
                            </h3>
                            <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveSubcategory} className="p-5">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={subName}
                                    onChange={(e) => {
                                        setSubName(e.target.value);
                                        if (!editingSub) {
                                            setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                                        }
                                    }}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5"
                                    placeholder="ex: Smartphones"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Identifiant (Slug)</label>
                                <input
                                    type="text"
                                    required
                                    value={subSlug}
                                    onChange={(e) => setSubSlug(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5"
                                    placeholder="ex: smartphones"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowSubModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {editingCat ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
                            </h3>
                            <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-5">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5"
                                    placeholder="ex: Électroménager"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom de l'icône Material</label>
                                <input
                                    type="text"
                                    value={catIcon}
                                    onChange={(e) => setCatIcon(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary p-2.5"
                                    placeholder="ex: category, kitchen, tv"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
