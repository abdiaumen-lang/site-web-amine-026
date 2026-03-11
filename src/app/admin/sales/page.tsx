"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import Logo from "@/components/Logo";
import Link from "next/link";

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    products?: {
        name: string;
        image: string;
    }
}

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    wilaya: string;
    commune: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    total_amount: number;
    shipping_cost: number;
    tracking_notes?: string | null;
    order_items?: OrderItem[];
}

export default function AdminSalesPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trackingNotesInput, setTrackingNotesInput] = useState<string>("");

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (
                            name,
                            image
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        let docs = [...orders];

        if (statusFilter !== "all") {
            docs = docs.filter(o => o.status === statusFilter);
        }

        if (searchTerm) {
            const lowTerm = searchTerm.toLowerCase();
            docs = docs.filter(o =>
                o.customer_name.toLowerCase().includes(lowTerm) ||
                o.customer_phone.includes(lowTerm) ||
                o.id.toLowerCase().includes(lowTerm)
            );
        }

        setFilteredOrders(docs);
    };

    const handleUpdateOrder = async (orderId: string, newStatus: string, newNotes: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    status: newStatus,
                    tracking_notes: newNotes || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any, tracking_notes: newNotes } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any, tracking_notes: newNotes });
            }
            alert("Mise à jour enregistrée avec succès.");
        } catch (err: any) {
            alert("Erreur lors de la mise à jour : " + err.message);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ? Cette action supprimera également tous les articles associés et est irréversible.")) {
            return;
        }

        try {
            setIsLoading(true);

            // Delete order items first to handle potential FK constraints
            const { error: itemsError } = await supabase
                .from('order_items')
                .delete()
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            // Delete the order
            const { error: orderError } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (orderError) throw orderError;

            // Update local state
            setOrders(orders.filter(o => o.id !== orderId));
        } catch (err: any) {
            alert("Erreur lors de la suppression : " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        totalRevenue: orders.reduce((acc, o) => acc + o.total_amount, 0),
        totalOrders: orders.length,
        dailySales: orders
            .filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
            .reduce((acc, o) => acc + o.total_amount, 0),
        monthlySales: orders
            .filter(o => {
                const date = new Date(o.created_at);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            })
            .reduce((acc, o) => acc + o.total_amount, 0),
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-background-light text-text-main font-display antialiased min-h-screen flex flex-col overflow-hidden">
            <div className="flex h-screen w-full overflow-hidden relative">
                <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

                <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative">
                    {/* Mobile top bar */}
                    <div className="xl:hidden flex items-center justify-between p-4 bg-surface-light border-b border-stone-200">
                        <Logo className="flex items-center gap-2" textClassName="font-black text-[22px] tracking-tight text-[#FF6600] leading-none lowercase" />
                        <button className="text-text-main" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto flex flex-col gap-6">

                            {/* Header */}
                            <div className="flex flex-col gap-1">
                                <h2 className="text-text-main text-3xl font-black tracking-tight">Ventes & Commandes</h2>
                                <p className="text-text-muted text-base">Suivez vos revenus et gérez les commandes clients.</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Revenu Total</span>
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">account_balance_wallet</span>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900">{stats.totalRevenue.toLocaleString()} DA</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Commandes</span>
                                        <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2 rounded-xl">shopping_bag</span>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900">{stats.totalOrders}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Ventes du jour</span>
                                        <span className="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-xl">today</span>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900">{stats.dailySales.toLocaleString()} DA</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Ventes du mois</span>
                                        <span className="material-symbols-outlined text-purple-600 bg-purple-50 p-2 rounded-xl">calendar_month</span>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900">{stats.monthlySales.toLocaleString()} DA</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 material-symbols-outlined text-[20px]">search</span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom, téléphone ou ID..."
                                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-stone-50 border-transparent focus:bg-white border-2 focus:border-primary transition-all text-sm outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="px-4 py-2.5 rounded-xl bg-stone-50 border-2 border-transparent focus:border-primary outline-none text-sm font-bold text-stone-700 transition-all cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">Tous les statuts</option>
                                        <option value="pending">En attente</option>
                                        <option value="confirmed">Confirmé</option>
                                        <option value="delivered">Livré</option>
                                        <option value="cancelled">Annulé</option>
                                    </select>
                                    <button
                                        onClick={fetchOrders}
                                        className="p-2.5 bg-stone-50 hover:bg-stone-100 border-2 border-transparent rounded-xl transition-all text-stone-600 flex items-center justify-center"
                                        title="Actualiser"
                                    >
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50 border-b border-stone-200 text-[11px] uppercase tracking-widest text-stone-400 font-black">
                                                <th className="px-6 py-4">Commande</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Client</th>
                                                <th className="px-6 py-4">Localisation</th>
                                                <th className="px-6 py-4">Total</th>
                                                <th className="px-6 py-4">Statut</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
                                                            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Chargement des ventes...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center">
                                                        <p className="text-stone-400 font-bold">Aucune commande trouvée.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-xs font-black text-stone-400">#{order.id.slice(0, 8)}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-stone-900">{order.customer_name}</span>
                                                                <span className="text-xs text-stone-500">{order.customer_phone}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col truncate max-w-[150px]">
                                                                <span className="text-sm font-medium text-stone-700">{order.wilaya}</span>
                                                                <span className="text-xs text-stone-500">{order.commune}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-black text-primary">{order.total_amount.toLocaleString()} DA</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                                {order.status === 'pending' ? 'En attente' :
                                                                    order.status === 'confirmed' ? 'Confirmé' :
                                                                        order.status === 'delivered' ? 'Livré' : 'Annulé'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setTrackingNotesInput(order.tracking_notes || "");
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                    Détails
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-95 group"
                                                                    title="Supprimer la commande"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                </button>
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
                    </main>
                </div>
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm shadow-2xl" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-[32px] shadow-2xl border border-stone-200 dark:border-slate-800 flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-black text-stone-900 tracking-tight">Commande #{selectedOrder.id.slice(0, 8)}</h3>
                                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                                    Passée le {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-stone-500">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 custom-scrollbar">

                            {/* Status and Notes Update */}
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary bg-white size-10 flex items-center justify-center rounded-xl shadow-sm border border-primary/10">info</span>
                                        <div>
                                            <p className="text-sm font-black text-stone-900">Mettre à jour le statut</p>
                                            <p className="text-xs text-stone-500">Modifiez le statut ou le lieu de livraison.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['pending', 'confirmed', 'delivered', 'cancelled'].map((st) => (
                                            <button
                                                key={st}
                                                onClick={() => {
                                                    const updatedOrder = { ...selectedOrder, status: st as any };
                                                    setSelectedOrder(updatedOrder);
                                                }}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedOrder.status === st ? getStatusColor(st) : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400'}`}
                                            >
                                                {st === 'pending' ? 'Attente' : st === 'confirmed' ? 'Confirmé' : st === 'delivered' ? 'Livré' : 'Annulé'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Notes de suivi (Lieu actuel, Message au client)</label>
                                    <textarea
                                        className="w-full h-24 p-3 rounded-xl border border-stone-200 bg-white text-sm focus:border-primary focus:ring-primary focus:outline-none resize-none"
                                        placeholder="Ex: Le produit est actuellement au centre de distribution d'Alger..."
                                        value={trackingNotesInput}
                                        onChange={(e) => setTrackingNotesInput(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleUpdateOrder(selectedOrder.id, selectedOrder.status, trackingNotesInput)}
                                        className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all"
                                    >
                                        Enregistrer les modifications
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Info */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        Informations Client
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Nom complet</span>
                                            <span className="text-sm font-black text-stone-900">{selectedOrder.customer_name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Téléphone</span>
                                            <span className="text-sm font-black text-primary underline underline-offset-4">{selectedOrder.customer_phone}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Email</span>
                                            <span className="text-sm font-medium text-stone-700">{selectedOrder.customer_email || 'Non renseigné'}</span>
                                        </div>
                                        <div className="flex flex-col mt-2 p-3 rounded-xl bg-stone-50 border border-stone-100">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Localisation</span>
                                            <p className="text-sm font-medium text-stone-800 leading-relaxed">
                                                <span className="font-black text-stone-900">{selectedOrder.commune}, {selectedOrder.wilaya}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">inventory</span>
                                        Détails de commande
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {selectedOrder.order_items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <div className="size-12 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 border border-stone-100 overflow-hidden">
                                                    {item.products?.image ? (
                                                        <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-stone-400 text-lg">image</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-stone-900 truncate leading-snug">{item.products?.name || 'Produit inconnu'}</p>
                                                    <p className="text-[10px] text-stone-500 font-bold">Prix: {item.price_at_time.toLocaleString()} DA × {item.quantity}</p>
                                                </div>
                                                <span className="text-sm font-black text-stone-900">{(item.price_at_time * item.quantity).toLocaleString()} DA</span>
                                            </div>
                                        ))}

                                        <div className="border-t border-stone-100 mt-4 pt-4 flex flex-col gap-2">
                                            <div className="flex justify-between text-xs font-bold text-stone-500">
                                                <span>Sous-total</span>
                                                <span>{(selectedOrder.total_amount - selectedOrder.shipping_cost).toLocaleString()} DA</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold text-stone-500">
                                                <span>Frais de livraison ({selectedOrder.commune})</span>
                                                <span>{selectedOrder.shipping_cost.toLocaleString()} DA</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 p-3 rounded-xl bg-stone-900 text-white">
                                                <span className="text-xs font-bold uppercase tracking-widest">Total Payé</span>
                                                <span className="text-lg font-black">{selectedOrder.total_amount.toLocaleString()} DA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-stone-100 flex items-center justify-end gap-3 bg-stone-50/50">
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-black uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">print</span>
                                Imprimer Bon
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e7e5e4;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d6d3d1;
                }
            `}</style>
        </div>
    );
}
