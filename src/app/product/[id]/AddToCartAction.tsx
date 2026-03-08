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
        <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Quantité</span>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[24px]">remove</span>
                    </button>
                    <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                    <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                        className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[24px]">add</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding || isBuyingNow}
                    className={`flex-1 py-5 px-6 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 ${showSuccess ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]'}`}
                >
                    {isAdding ? (
                        <span className="material-symbols-outlined animate-spin text-[22px]">refresh</span>
                    ) : showSuccess ? (
                        <span className="material-symbols-outlined text-[22px]">check_circle</span>
                    ) : (
                        <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                    )}
                    <span className="text-lg">{showSuccess ? 'Ajouté !' : 'Ajouter au panier'}</span>
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
                    className="flex-1 py-5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                >
                    {isBuyingNow ? (
                        <span className="material-symbols-outlined animate-spin text-[22px]">refresh</span>
                    ) : (
                        <span className="material-symbols-outlined text-[22px]">flash_on</span>
                    )}
                    <span className="text-lg">{isBuyingNow ? 'Redirection...' : 'Acheter maintenant'}</span>
                </button>
            </div>
        </div>
    );
}
