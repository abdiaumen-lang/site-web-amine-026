"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from 'next/navigation';

export type Commune = {
    id: string;
    wilaya_name: string;
    commune_name: string;
    shipping_cost: number;
    is_active: boolean;
};

export default function AdminCommunesContent() {
    const searchParams = useSearchParams();
    const initialWilaya = searchParams.get('wilaya') || "";

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [wilayas, setWilayas] = useState<string[]>([]);
    const [selectedWilaya, setSelectedWilaya] = useState<string>(initialWilaya);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [showActive, setShowActive] = useState(true);
    const [showInactive, setShowInactive] = useState(true);

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editShippingCost, setEditShippingCost] = useState<number>(0);

    useEffect(() => {
        fetchWilayas();
    }, []);

    useEffect(() => {
        if (selectedWilaya) {
            fetchCommunes(selectedWilaya);
        } else if (wilayas.length > 0) {
            setSelectedWilaya(wilayas[0]);
        }
    }, [selectedWilaya, wilayas]);

    const fetchWilayas = async () => {
        const { data, error } = await supabase.from('communes').select('wilaya_name');
        if (error) {
            console.error("Error fetching wilayas:", error);
            return;
        }

        if (data) {
            const uniqueWilayas = Array.from(new Set(data.map(d => d.wilaya_name))).sort();
            setWilayas(uniqueWilayas);
            if (!initialWilaya && uniqueWilayas.length > 0) {
                setSelectedWilaya(uniqueWilayas[0]);
            }
        }
    };

    const fetchCommunes = async (wilaya: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('communes')
            .select('*')
            .eq('wilaya_name', wilaya)
            .order('commune_name');

        if (error) {
            console.error("Error fetching communes:", error);
        } else if (data) {
            setCommunes(data as Commune[]);
        }
        setIsLoading(false);
    };

    const toggleCommuneStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setCommunes(prev => prev.map(c => c.id === id ? { ...c, is_active: newStatus } : c));

        const { error } = await supabase
            .from('communes')
            .update({ is_active: newStatus })
            .eq('id', id);

        if (error) {
            console.error("Error updating commune status:", error);
            // Revert on error
            setCommunes(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
        }
    };

    const startEditing = (commune: Commune) => {
        setEditingId(commune.id);
        setEditShippingCost(commune.shipping_cost);
    };

    const saveShippingCost = async (id: string) => {
        const oldCost = communes.find(c => c.id === id)?.shipping_cost;

        // Optimistic update
        setCommunes(prev => prev.map(c => c.id === id ? { ...c, shipping_cost: editShippingCost } : c));
        setEditingId(null);

        const { error } = await supabase
            .from('communes')
            .update({ shipping_cost: editShippingCost })
            .eq('id', id);

        if (error) {
            console.error("Error updating shipping cost:", error);
            // Revert on error
            setCommunes(prev => prev.map(c => c.id === id ? { ...c, shipping_cost: oldCost || 0 } : c));
        }
    };

    const deleteCommune = async (id: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commune ?")) return;

        // Optimistic update
        setCommunes(prev => prev.filter(c => c.id !== id));

        const { error } = await supabase
            .from('communes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting commune:", error);
            alert("Erreur lors de la suppression.");
            // Refresh to restore state on error
            if (selectedWilaya) fetchCommunes(selectedWilaya);
        }
    };

    const handleAddCommune = async () => {
        const name = window.prompt("Nom de la nouvelle commune :");
        if (!name) return;

        const { data, error } = await supabase
            .from('communes')
            .insert({
                wilaya_name: selectedWilaya,
                commune_name: name,
                shipping_cost: 500,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding commune:", error);
            alert("Erreur lors de l'ajout.");
        } else if (data) {
            setCommunes(prev => [...prev, data as Commune].sort((a, b) => a.commune_name.localeCompare(b.commune_name)));
        }
    };


    const activeCount = communes.filter(c => c.is_active).length;
    const inactiveCount = communes.length - activeCount;

    const filteredCommunes = communes.filter(c => {
        const matchesSearch = c.commune_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesActive = (showActive && c.is_active) || (showInactive && !c.is_active);
        return matchesSearch && matchesActive;
    });

    return (
        <div className="bg-background-light font-display h-screen flex overflow-hidden text-text-primary-light">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 flex flex-col min-w-0 bg-background-light overflow-y-auto">
                <header className="h-16 bg-surface-light border-b border-border-light flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="xl:hidden p-2 -ml-2 text-text-secondary-light hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-text-primary-light hidden sm:block">Gestion spécifique des communes</h1>
                        <h1 className="text-xl font-bold text-text-primary-light sm:hidden">Communes</h1>
                    </div>
                </header>

                <div className="p-6">
                    <div className="mb-8 hidden sm:flex items-center text-sm text-text-secondary-light">
                        <span>Gestion des emplacements</span>
                        <span className="material-symbols-outlined text-[18px] mx-2">chevron_right</span>
                        <span className="text-text-primary-light font-medium">{selectedWilaya || "Toutes"}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Filters Sidebar */}
                        <div className="w-full lg:w-80 shrink-0 space-y-6">
                            <div className="bg-surface-light rounded-xl p-5 shadow-sm border border-border-light relative overflow-hidden">
                                <div className="absolute top-0 right-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-6xl text-primary">map</span>
                                </div>
                                <h3 className="font-bold text-text-primary-light mb-4 flex items-center gap-2 relative z-10">
                                    <span className="material-symbols-outlined text-primary">map</span>
                                    Contexte actuel
                                </h3>

                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-secondary-light uppercase tracking-wider mb-2">Wilaya sélectionnée</label>
                                        <div className="relative">
                                            <select
                                                value={selectedWilaya}
                                                onChange={(e) => setSelectedWilaya(e.target.value)}
                                                className="w-full appearance-none rounded-lg bg-background-light border-none focus:ring-0 cursor-pointer font-medium p-3 pr-10"
                                            >
                                                {wilayas.map(w => (
                                                    <option key={w} value={w}>{w}</option>
                                                ))}
                                            </select>
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-text-secondary-light">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border-light/50 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-secondary-light">Total des communes</span>
                                            <span className="font-bold">{communes.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-secondary-light">Actives</span>
                                            <span className="font-bold text-green-600">{activeCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-text-secondary-light">Inactives</span>
                                            <span className="font-bold text-orange-500">{inactiveCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                                <h4 className="font-bold text-primary flex items-center gap-2 mb-2 text-sm">
                                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                                    Le saviez-vous ?
                                </h4>
                                <p className="text-sm text-text-secondary-light leading-relaxed">
                                    Définir une commune sur "Inactive" empêchera les clients de la sélectionner lors du paiement. Utilisez cela pour les zones actuellement inaccessibles par les partenaires de livraison.
                                </p>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary-light">Gestion des communes</h2>
                                    <p className="text-text-secondary-light text-sm mt-1">Gérer les zones de livraison et les prix pour {selectedWilaya}.</p>
                                </div>
                                <button
                                    onClick={handleAddCommune}
                                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm shadow-primary/20 transition-all shrink-0"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Ajouter une nouvelle commune
                                </button>
                            </div>

                            <div className="bg-surface-light rounded-xl shadow-sm border border-border-light flex flex-col">
                                <div className="p-4 border-b border-border-light flex gap-4 flex-col md:flex-row md:items-center justify-between bg-zinc-50/50">
                                    <div className="relative w-full md:w-80">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light">search</span>
                                        <input
                                            type="text"
                                            placeholder="Rechercher par nom de commune..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white"
                                        />
                                    </div>

                                    <div className="flex gap-4 sm:gap-6 items-center">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-600"
                                                checked={showActive}
                                                onChange={(e) => setShowActive(e.target.checked)}
                                            />
                                            <span className="text-sm font-medium text-text-secondary-light group-hover:text-text-primary-light transition-colors">Afficher les actives</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                                checked={showInactive}
                                                onChange={(e) => setShowInactive(e.target.checked)}
                                            />
                                            <span className="text-sm font-medium text-text-secondary-light group-hover:text-text-primary-light transition-colors">Afficher les inactives</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="overflow-x-auto min-h-[400px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-50/80 border-b border-border-light text-[10px] uppercase tracking-wider text-text-secondary-light font-bold">
                                                <th className="p-4 pl-6 w-16">ID</th>
                                                <th className="p-4">Nom de la commune</th>
                                                <th className="p-4 w-40">Frais de livraison</th>
                                                <th className="p-4 w-32">Statut</th>
                                                <th className="p-4 pr-6 w-32 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-border-light">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-text-secondary-light">
                                                        <div className="flex flex-col items-center justify-center space-y-3">
                                                            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                                                            <p>Chargement des communes...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredCommunes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-text-secondary-light">
                                                        <div className="flex flex-col items-center justify-center space-y-3">
                                                            <span className="material-symbols-outlined text-4xl opacity-20">location_off</span>
                                                            <p>Aucune commune trouvée correspondant à vos filtres.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredCommunes.map((commune, index) => (
                                                    <tr key={commune.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                        <td className="p-4 pl-6 text-text-secondary-light">#{index + 1}</td>
                                                        <td className="p-4 font-bold text-text-primary-light">{commune.commune_name}</td>
                                                        <td className="p-4">
                                                            {editingId === commune.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        value={editShippingCost}
                                                                        onChange={(e) => setEditShippingCost(Number(e.target.value))}
                                                                        className="w-24 px-2 py-1 text-sm border-2 border-primary rounded focus:outline-none focus:ring-0"
                                                                        autoFocus
                                                                    />
                                                                    <span className="text-xs font-bold text-text-secondary-light">DA</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 bg-background-light px-3 py-1.5 rounded-md border border-border-light w-fit font-medium">
                                                                    {commune.shipping_cost.toLocaleString()} <span className="text-[10px] tracking-wide text-text-secondary-light mt-0.5">DA</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => toggleCommuneStatus(commune.id, commune.is_active)}
                                                                    className={`w-10 h-5 rounded-full relative transition-colors ${commune.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                                                >
                                                                    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${commune.is_active ? 'translate-x-5.5' : 'translate-x-1'}`}></div>
                                                                </button>
                                                                <span className={`text-xs font-bold ${commune.is_active ? 'text-text-primary-light' : 'text-text-secondary-light'}`}>
                                                                    {commune.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 pr-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {editingId === commune.id ? (
                                                                    <>
                                                                        <button onClick={() => saveShippingCost(commune.id)} className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                                                                            Enregistrer
                                                                        </button>
                                                                        <button onClick={() => setEditingId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                                                                            Annuler
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => startEditing(commune)} className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-1.5 font-medium text-sm">
                                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                        </button>
                                                                        <button onClick={() => deleteCommune(commune.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 font-medium text-sm">
                                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

