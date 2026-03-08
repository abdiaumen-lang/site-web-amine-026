"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AddToCartActionProps {
    productId: string;
    stock: number;
    price: number;
}

export default function AddToCartAction({ productId, stock, price }: AddToCartActionProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);

        try {
            // Check if user is logged in
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;

            if (!user) {
                // Support guest cart via localStorage
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const existingItemIndex = guestCart.findIndex((item: any) => item.product_id === productId);

                if (existingItemIndex > -1) {
                    guestCart[existingItemIndex].quantity += quantity;
                } else {
                    guestCart.push({
                        id: crypto.randomUUID(),
                        product_id: productId,
                        quantity,
                        created_at: new Date().toISOString()
                    });
                }

                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                window.dispatchEvent(new Event('cartUpdated'));

                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
                return true;
            }

            // Logged in user - use API
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erreur lors de l\'ajout au panier');
            }

            window.dispatchEvent(new Event('cartUpdated'));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            return true;
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            alert(error.message);
            return false;
        } finally {
            setIsAdding(false);
        }
    };

    if (stock === 0) {
        return (
            <div className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-2xl flex items-center justify-center">
                Produit en rupture de stock
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className="flex items-center justify-between border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-3 px-5 sm:w-max bg-white dark:bg-slate-900">
                <span className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-6">Quantité</span>
                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-90 hover:shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <span className="font-black text-xl w-8 text-center text-slate-900 dark:text-white">{quantity}</span>
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-90 hover:shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding || isBuyingNow}
                    className={`flex-1 py-4 px-6 font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border-2 border-transparent ${showSuccess ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-[0.98]'}`}
                >
                    {isAdding ? (
                        <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
                    ) : showSuccess ? (
                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    ) : (
                        <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                    )}
                    <span className="text-lg tracking-wide">{showSuccess ? 'Ajouté avec succès' : 'Ajouter au panier'}</span>
                </button>
                <button
                    onClick={async () => {
                        setIsBuyingNow(true);
                        const success = await handleAddToCart();
                        if (success) {
                            router.push('/checkout');
                        } else {
                            setIsBuyingNow(false);
                        }
                    }}
                    disabled={isAdding || isBuyingNow}
                    className="flex-1 py-4 px-6 bg-primary dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-primary-dark dark:hover:bg-slate-100 transition-all duration-300 active:scale-[0.98] shadow-xl shadow-primary/20 dark:shadow-white/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100 hover:-translate-y-1"
                >
                    {isBuyingNow ? (
                        <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
                    ) : (
                        <span className="material-symbols-outlined text-[24px]">flash_on</span>
                    )}
                    <span className="text-lg tracking-wide">{isBuyingNow ? 'Redirection...' : 'Acheter maintenant'}</span>
                </button>
            </div>
        </div>
    );
}
