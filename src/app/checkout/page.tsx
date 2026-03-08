"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import CheckoutHeader from "@/components/CheckoutHeader";
import CheckoutFooter from "@/components/CheckoutFooter";
import CartItemRow from "@/components/CartItemRow";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/hooks/useCart";

type WilayaData = {
    wilaya_name: string;
};

type CommuneData = {
    id: string;
    commune_name: string;
    shipping_cost: number;
};

export default function CheckoutPage() {
    const [wilayas, setWilayas] = useState<string[]>([]);
    const [communes, setCommunes] = useState<CommuneData[]>([]);

    const [selectedWilaya, setSelectedWilaya] = useState<string>("");
    const [selectedCommuneName, setSelectedCommuneName] = useState<string>("");
    const [selectedCommune, setSelectedCommune] = useState<CommuneData | null>(null);

    const [isLoadingWilayas, setIsLoadingWilayas] = useState(true);
    const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Promo code state
    const [promoInput, setPromoInput] = useState("");
    const [promoResult, setPromoResult] = useState<{ valid: boolean; discount_amount: number; discount_type: string; discount_value: number; code: string; description?: string; promo_id?: string } | null>(null);
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        customer_phone_2: "",
        customer_email: "",
        address: "",
        postal_code: ""
    });

    const { cartItems, isLoading: isLoadingCart, refreshCart } = useCart();

    // Calculated Subtotal from the cart
    const subtotal = cartItems.reduce((acc, item) => acc + (item.products?.price * item.quantity), 0);
    const isFreeShipping = subtotal > 50000;

    // Calculated Shipping
    const shippingCost = isFreeShipping ? 0 : (selectedCommune ? selectedCommune.shipping_cost : 0);
    const promoDiscount = promoResult?.valid ? promoResult.discount_amount : 0;
    const total = subtotal + shippingCost - promoDiscount;

    const handleApplyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) return;
        setPromoLoading(true);
        setPromoError("");
        setPromoResult(null);
        try {
            const res = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, order_amount: subtotal }),
            });
            const data = await res.json();
            if (data.valid) {
                setPromoResult(data);
            } else {
                setPromoError(data.error || "Code invalide");
            }
        } catch { setPromoError("Erreur réseau"); }
        finally { setPromoLoading(false); }
    };

    useEffect(() => {
        fetchActiveWilayas();
        // Pre-fill email if user is logged in
        const checkUser = async () => {
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;
            if (user?.email) {
                setFormData(prev => ({ ...prev, customer_email: user.email || "" }));
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (selectedWilaya) {
            fetchActiveCommunes(selectedWilaya);
            setSelectedCommuneName("");
            setSelectedCommune(null);
        } else {
            setCommunes([]);
            setSelectedCommuneName("");
            setSelectedCommune(null);
        }
    }, [selectedWilaya]);

    useEffect(() => {
        if (selectedCommuneName) {
            const search = selectedCommuneName.trim().toLowerCase();
            const found = communes.find(c => c.commune_name.toLowerCase() === search);
            setSelectedCommune(found || null);
        } else {
            setSelectedCommune(null);
        }
    }, [selectedCommuneName, communes]);

    const fetchActiveWilayas = async () => {
        setIsLoadingWilayas(true);
        const { data, error } = await supabase
            .from('communes')
            .select('wilaya_name')
            .eq('is_active', true);

        if (!error && data) {
            const uniqueWilayas = Array.from(new Set(data.map(d => (d as WilayaData).wilaya_name))).sort();
            setWilayas(uniqueWilayas);
        }
        setIsLoadingWilayas(false);
    };

    const fetchActiveCommunes = async (wilaya: string) => {
        setIsLoadingCommunes(true);
        const { data, error } = await supabase
            .from('communes')
            .select('id, commune_name, shipping_cost')
            .eq('wilaya_name', wilaya)
            .eq('is_active', true)
            .order('commune_name');

        if (!error && data) {
            setCommunes(data as CommuneData[]);
        }
        setIsLoadingCommunes(false);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCommune) {
            alert("Veuillez sélectionner une commune.");
            return;
        }

        if (cartItems.length === 0) {
            alert("Votre panier est vide.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create the order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.customer_name,
                    customer_phone: formData.customer_phone,
                    customer_email: formData.customer_email || null,
                    wilaya: selectedWilaya,
                    commune: selectedCommune.commune_name,
                    address: formData.address,
                    total_amount: total,
                    shipping_cost: shippingCost,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create order items
            const orderItemsToInsert = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_time: item.products.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsToInsert);

            if (itemsError) throw itemsError;

            // 3. Clear the cart
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;
            if (user) {
                // Clear from DB
                await supabase.from('cart').delete().eq('user_id', user.id);
            } else {
                // Clear from localStorage
                localStorage.removeItem('guestCart');
            }

            // 4. Notify components and redirect
            window.dispatchEvent(new Event('cartUpdated'));
            window.location.href = '/checkout/success?order_id=' + order.id;
        } catch (error: any) {
            console.error('Error submitting order:', error);
            alert("Erreur lors de la confirmation de la commande: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col text-text-primary-light dark:text-text-primary-dark">
            <CheckoutHeader />
            <main className="flex-grow container mx-auto px-4 py-8 lg:px-10 max-w-[1440px]">
                <div className="max-w-4xl mx-auto mb-8 md:mb-12 px-2">
                    <div className="flex items-center justify-between w-full relative">
                        {/* Progress Line Background */}
                        <div className="absolute top-4 left-0 w-full h-[2px] bg-border-light dark:bg-border-dark -z-10 rounded-full"></div>
                        {/* Active Progress Line (33% for step 2) */}
                        <div className="absolute top-4 left-0 w-1/3 h-[2px] bg-primary -z-10 rounded-full transition-all duration-500"></div>

                        <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <div className="size-8 md:size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm ring-4 ring-background-light dark:ring-background-dark shadow-sm">
                                <span className="material-symbols-outlined text-[18px] md:text-[20px]">check</span>
                            </div>
                            <span className="text-[10px] md:text-xs font-semibold text-primary">Panier</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <div className="size-8 md:size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm ring-4 ring-background-light dark:ring-background-dark shadow-sm">2</div>
                            <span className="text-[10px] md:text-xs font-semibold text-primary">Livraison</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <div className="size-8 md:size-10 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center font-bold text-sm ring-4 ring-background-light dark:ring-background-dark">3</div>
                            <span className="text-[10px] md:text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Aperçu</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <div className="size-8 md:size-10 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center font-bold text-sm ring-4 ring-background-light dark:ring-background-dark">4</div>
                            <span className="text-[10px] md:text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Confirmer</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 md:p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">local_shipping</span>
                                Informations de livraison
                            </h2>
                            <form id="checkout-form" onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium">Nom complet</label>
                                    <input
                                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary placeholder:text-text-secondary-light/60 py-2.5 px-4"
                                        placeholder="ex. Ahmed Benali"
                                        required
                                        type="text"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Numéro de téléphone <span className="text-primary">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark material-symbols-outlined text-[18px]">phone</span>
                                        <input
                                            className="w-full pl-10 rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary placeholder:text-text-secondary-light/60 py-2.5"
                                            pattern="0[5-7][0-9]{8}"
                                            placeholder="05 XX XX XX XX"
                                            required
                                            title="Veuillez entrer un numéro de téléphone algérien valide."
                                            type="tel"
                                            value={formData.customer_phone}
                                            onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">E-mail <span className="text-xs font-normal text-text-secondary-light dark:text-text-secondary-dark">(Optionnel)</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark material-symbols-outlined text-[18px]">mail</span>
                                        <input
                                            className="w-full pl-10 rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary placeholder:text-text-secondary-light/60 py-2.5"
                                            placeholder="votre@email.com"
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Wilaya</label>
                                    <div className="relative">
                                        <select
                                            value={selectedWilaya}
                                            onChange={(e) => setSelectedWilaya(e.target.value)}
                                            disabled={isLoadingWilayas}
                                            required
                                            className="w-full appearance-none rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary cursor-pointer pr-10 py-2.5 px-4 disabled:opacity-50"
                                        >
                                            <option value="">Sélectionnez une wilaya...</option>
                                            {wilayas.map((w) => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">expand_more</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Commune</label>
                                    <div className="relative">
                                        <input
                                            className="w-full rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary placeholder:text-text-secondary-light/60 py-2.5 px-4 disabled:opacity-50"
                                            list="communes-list"
                                            placeholder={selectedWilaya ? "Rechercher une commune..." : "Sélectionnez une wilaya d'abord..."}
                                            type="text"
                                            required
                                            value={selectedCommuneName}
                                            onChange={(e) => setSelectedCommuneName(e.target.value)}
                                            disabled={!selectedWilaya || isLoadingCommunes}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark material-symbols-outlined pointer-events-none">search</span>
                                        <datalist id="communes-list">
                                            {communes.map((c) => (
                                                <option key={c.id} value={c.commune_name} />
                                            ))}
                                        </datalist>
                                    </div>
                                    {!selectedCommune && selectedCommuneName && communes.length > 0 && (
                                        <p className="text-xs text-red-500 mt-1">Veuillez sélectionner une commune valide dans la liste.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Code postal</label>
                                    <input
                                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary placeholder:text-text-secondary-light/60 py-2.5 px-4"
                                        placeholder="ex. 16000"
                                        type="text"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium">Adresse complète</label>
                                    <textarea
                                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary placeholder:text-text-secondary-light/60 resize-none h-20 md:h-24 py-2.5 px-4"
                                        placeholder="Nom de rue, numéro de bâtiment, étage..."
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 md:p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                Mode de livraison
                            </h2>
                            <div className="space-y-3">
                                {selectedCommune ? (
                                    <label className="flex items-center p-4 border border-primary bg-primary/5 rounded-xl cursor-pointer transition-all hover:bg-primary/10 relative group">
                                        <div className="flex items-center h-5">
                                            <input defaultChecked className="w-5 h-5 text-primary focus:ring-primary border-gray-300" name="shipping_method" type="radio" />
                                        </div>
                                        <div className="ml-4 flex flex-1 justify-between items-center">
                                            <div className="min-w-0 pr-2">
                                                <span className="block font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                                                    Livraison à {selectedCommune.commune_name}
                                                </span>
                                                <span className="block text-[10px] md:text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                                                    Délai de livraison estimé : 2-5 jours
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="block text-base md:text-lg font-bold text-primary">
                                                    {isFreeShipping ? "GRATUIT" : `${shippingCost.toLocaleString()} DA`}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                ) : (
                                    <div className="p-4 border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center bg-background-light dark:bg-background-dark text-text-secondary-light dark:text-text-secondary-dark text-xs text-center leading-relaxed">
                                        Veuillez sélectionner votre wilaya et commune pour voir les options et frais de livraison.
                                    </div>
                                )}

                                {isFreeShipping && (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-lg flex items-start gap-3 flex-shrink-0">
                                        <span className="material-symbols-outlined text-green-600 text-[20px] mt-0.5">verified</span>
                                        <div className="text-xs text-green-800 dark:text-green-300">
                                            <span className="font-bold">Livraison gratuite !</span>
                                            <p className="text-[10px] mt-0.5 opacity-90">Votre commande dépasse 50 000 DA.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 md:p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                Mode de paiement
                            </h2>
                            <div className="p-4 md:p-5 border-2 border-primary bg-surface-light dark:bg-surface-dark rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">Seule option</div>
                                <div className="flex items-start gap-3 md:gap-4">
                                    <div className="p-2.5 bg-background-light dark:bg-background-dark rounded-full shrink-0">
                                        <span className="material-symbols-outlined text-primary text-xl md:text-2xl">handshake</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-base md:text-lg mb-0.5 md:mb-1">Paiement à la livraison</h3>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-3">Payez en espèces lors de la réception.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-background-light dark:bg-background-dark rounded text-[9px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                                <span className="material-symbols-outlined text-[12px] text-green-600">check_circle</span> Aucun paiement anticipé
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-[400px] w-full shrink-0 space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 md:p-6 shadow-sm border border-border-light dark:border-border-dark sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
                            <div className="space-y-4 mb-6 max-h-[250px] md:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {isLoadingCart ? (
                                    <div className="flex justify-center py-4">
                                        <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
                                    </div>
                                ) : cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-center">
                                            <div className="size-12 md:size-14 bg-background-light dark:bg-background-dark rounded-md overflow-hidden shrink-0 border border-border-light dark:border-border-dark">
                                                <img
                                                    alt={item.products?.name || "Produit"}
                                                    className="object-cover w-full h-full"
                                                    src={item.products?.image || (item.products?.images && item.products.images[0]) || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs md:text-sm font-bold truncate leading-snug">{item.products?.name}</p>
                                                <p className="text-[10px] md:text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Qté : {item.quantity}</p>
                                            </div>
                                            <span className="text-xs md:text-sm font-bold whitespace-nowrap">{(item.products?.price * item.quantity)?.toLocaleString()} DA</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-sm text-text-secondary-light dark:text-text-secondary-dark border-2 border-dashed border-border-light dark:border-border-dark rounded-xl">
                                        Votre panier est vide.
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border-light dark:border-border-dark my-4"></div>

                            {/* Promo code input */}
                            <div className="mb-4">
                                {promoResult?.valid ? (
                                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2">
                                        <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-green-700 dark:text-green-400 tracking-widest">{promoResult.code}</p>
                                            <p className="text-[10px] text-green-600 dark:text-green-500">
                                                -{promoResult.discount_type === 'percentage' ? `${promoResult.discount_value}%` : `${Number(promoResult.discount_value).toLocaleString()} DA`}
                                            </p>
                                        </div>
                                        <button onClick={() => { setPromoResult(null); setPromoInput(""); setPromoError(""); }} className="text-green-500 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-[16px]">confirmation_number</span>
                                            <input
                                                value={promoInput}
                                                onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                                                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                                placeholder="Code promo"
                                                className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold uppercase tracking-widest border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleApplyPromo}
                                            disabled={promoLoading || !promoInput.trim()}
                                            className="px-3 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {promoLoading ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : "OK"}
                                        </button>
                                    </div>
                                )}
                                {promoError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{promoError}</p>}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-text-secondary-light dark:text-text-secondary-dark">
                                    <span>Sous-total</span>
                                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{subtotal.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between text-text-secondary-light dark:text-text-secondary-dark">
                                    <span>Livraison {!selectedCommune && "(Estimée)"}</span>
                                    <span className="font-medium text-primary">
                                        {selectedCommune ? (isFreeShipping ? "GRATUIT" : `${shippingCost.toLocaleString()} DA`) : "En attente"}
                                    </span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_offer</span>Réduction</span>
                                        <span className="font-bold">-{promoDiscount.toLocaleString()} DA</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border-light dark:border-border-dark mt-4 pt-4 flex justify-between items-center">
                                <span className="text-base md:text-lg font-bold">Total</span>
                                <div className="text-right">
                                    <span className="text-xl md:text-2xl font-black text-primary block">{total.toLocaleString()} DA</span>
                                    <p className="text-[10px] md:text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">TVA incluse</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={!selectedCommune || isSubmitting}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 md:py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">autorenew</span>
                                            <span>Traitement...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">verified</span>
                                            <span>Confirmer ma commande</span>
                                        </>
                                    )}
                                </button>
                                {!selectedCommune && (
                                    <p className="text-[10px] md:text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
                                        Veuillez sélectionner votre wilaya et commune pour confirmer.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border-light dark:border-border-dark">
                                <div className="flex flex-col items-center text-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                                    <span className="text-[10px] font-semibold leading-tight text-text-secondary-light dark:text-text-secondary-dark">Garantie officielle</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-[24px]">assignment_return</span>
                                    <span className="text-[10px] font-semibold leading-tight text-text-secondary-light dark:text-text-secondary-dark">Retour sous 7 jours</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-[24px]">headset_mic</span>
                                    <span className="text-[10px] font-semibold leading-tight text-text-secondary-light dark:text-text-secondary-dark">Assistance 24/7</span>
                                </div>
                            </div>

                            <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-4">
                                En passant votre commande, vous acceptez les <Link className="underline hover:text-primary" href="#">Conditions de service</Link> et la <Link className="underline hover:text-primary" href="#">Politique de confidentialité</Link> d'Electromart.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <CheckoutFooter />
        </div>
    );
}
