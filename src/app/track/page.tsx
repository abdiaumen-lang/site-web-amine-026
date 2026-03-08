"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import HomeHeader from "@/components/HomeHeader";
import HomeFooter from "@/components/HomeFooter";

interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    tracking_notes: string | null;
    total_amount: number;
    shipping_cost: number;
    wilaya: string;
    commune: string;
    order_items?: any[];
}

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderId.trim()) {
            setError("Veuillez entrer le numéro de commande.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setOrder(null);

            // Allow looking up by full ID or the short EM-XXXXXX format
            let queryId = orderId.trim().toUpperCase();
            if (queryId.startsWith('EM-')) {
                // If they typed the prefix, we just search using like
                queryId = queryId.substring(3);
            }

            // Just take the first 6 chars to match the generated short_id in the DB
            if (queryId.length > 6 && !queryId.includes('-')) {
                queryId = queryId.substring(0, 6);
            } else if (queryId.length > 6 && queryId.includes('-')) {
                queryId = queryId.split('-')[0].substring(0, 6);
            }

            const { data, error } = await supabase
                .from('orders')
                .select('id, created_at, status, tracking_notes, total_amount, shipping_cost, wilaya, commune, order_items(quantity, price_at_time, products(name, image)), customer_phone')
                .eq('short_id', queryId.substring(0, 6));

            let matchingOrder = null;

            if (data && data.length > 0) {
                // Sort out exact match
                matchingOrder = data[0];
            } else {
                throw new Error("Commande introuvable. Vérifiez le numéro.");
            }

            // To make it secure, let's require phone number match
            if (phone.trim()) {
                const dbPhoneClean = matchingOrder.customer_phone.replace(/[\s\-\_\.]/g, '');
                const inputPhoneClean = phone.replace(/[\s\-\_\.]/g, '');
                if (dbPhoneClean !== inputPhoneClean) {
                    // Tolerate basic suffix matches (0560 vs +213560)
                    const isMatch = dbPhoneClean.endsWith(inputPhoneClean.slice(-8)) || inputPhoneClean.endsWith(dbPhoneClean.slice(-8));
                    if (!isMatch) {
                        throw new Error("Numéro de commande ou de téléphone incorrect.");
                    }
                }
            } else {
                throw new Error("Veuillez entrer le numéro de téléphone associé à la commande.");
            }

            setOrder(matchingOrder as any);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la recherche de la commande.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'schedule' };
            case 'confirmed': return { label: 'Confirmé', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'check_circle' };
            case 'delivered': return { label: 'Livré', color: 'bg-green-100 text-green-700 border-green-200', icon: 'local_shipping' };
            case 'cancelled': return { label: 'Annulé', color: 'bg-red-100 text-red-700 border-red-200', icon: 'cancel' };
            default: return { label: 'Inconnu', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'help' };
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-light font-display">
            <HomeHeader />

            <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-10 py-12 lg:py-20 w-full flex flex-col gap-10">

                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight">Suivre ma commande</h1>
                    <p className="text-stone-500 text-lg">Entrez votre numéro de commande et votre téléphone pour connaître l'état de la livraison.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* Search Form */}
                    <div className="lg:col-span-4 lg:col-start-3">
                        <form onSubmit={handleTrack} className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col gap-5 sticky top-28">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-stone-900 uppercase tracking-widest">Numéro de commande *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: EM-A3B4C5"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-stone-900 uppercase tracking-widest">Téléphone *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Ex: 0770 12 34 56"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <p className="text-[10px] text-stone-400 font-medium mt-1 leading-snug">Renseignez le numéro de téléphone utilisé lors de la commande pour des raisons de sécurité.</p>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-2 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                                        Recherche...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                        Suivre le colis
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results / Details */}
                    <div className="lg:col-span-5">
                        {order ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">

                                    {/* Order Status Header */}
                                    <div className="p-6 md:p-8 border-b border-stone-100 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-black text-stone-900">Commande #EM-{order.id.slice(0, 6).toUpperCase()}</h2>
                                                <p className="text-xs text-stone-500 font-bold mt-1">Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${getStatusInfo(order.status).color}`}>
                                                <span className="material-symbols-outlined text-[18px] mb-0.5">{getStatusInfo(order.status).icon}</span>
                                                <span className="text-xs font-black uppercase tracking-widest">{getStatusInfo(order.status).label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tracking Notes Focus */}
                                    <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50">
                                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <span className="material-symbols-outlined text-[18px]">near_me</span>
                                            État d'avancement
                                        </h3>
                                        <div className="bg-white p-5 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                            {order.tracking_notes ? (
                                                <div className="relative z-10">
                                                    <div className="flex items-start gap-4">
                                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-stone-900 leading-snug">Dernière mise à jour</p>
                                                            <p className="text-stone-600 font-medium text-sm mt-1 whitespace-pre-wrap">{order.tracking_notes}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative z-10 flex items-start gap-3 text-stone-500 text-sm">
                                                    <span className="material-symbols-outlined text-[18px] mt-0.5 text-stone-400">hourglass_empty</span>
                                                    <p>Votre commande est en cours de traitement. De nouvelles informations de suivi apparaîtront ici bientôt.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-6 md:p-8 flex flex-col gap-4">
                                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Résumé des articles</h3>
                                        <div className="flex flex-col gap-4">
                                            {order.order_items?.map((item: any, index: number) => (
                                                <div key={index} className="flex items-center gap-4">
                                                    <div className="size-14 rounded-xl border border-stone-100 bg-stone-50 flex items-center justify-center overflow-hidden shrink-0">
                                                        {item.products?.image ? (
                                                            <img src={item.products.image} alt="produit" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-stone-300">image</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-stone-900 leading-tight">{item.products?.name}</p>
                                                        <p className="text-xs text-stone-500 font-semibold mt-0.5">Qté: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                                <img src="/icon.png" alt="Electromart Tracking" className="w-16 h-16 opacity-30 grayscale mb-6" />
                                <h3 className="text-xl font-black text-stone-800 mb-2">Historique d'expédition</h3>
                                <p className="text-stone-500 text-sm max-w-[280px]">Veuillez utiliser le formulaire pour trouver votre commande et consulter son état en temps réel.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>

            <HomeFooter />
        </div>
    );
}
