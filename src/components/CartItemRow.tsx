"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CartItemRowProps {
    item: any;
    refreshCart: () => void;
}

export default function CartItemRow({ item, refreshCart }: CartItemRowProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateQuantity = async (newQuantity: number) => {
        if (newQuantity < 1) return;
        setIsUpdating(true);
        try {
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;

            if (!user) {
                // Handle guest cart update
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const itemIndex = guestCart.findIndex((i: any) => i.id === item.id);
                if (itemIndex > -1) {
                    guestCart[itemIndex].quantity = newQuantity;
                    localStorage.setItem('guestCart', JSON.stringify(guestCart));
                    window.dispatchEvent(new Event('cartUpdated'));
                    refreshCart();
                }
                return;
            }

            const { error } = await supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', item.id);

            if (error) throw error;
            refreshCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsUpdating(true);
        try {
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;

            if (!user) {
                // Handle guest cart remove
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const filteredCart = guestCart.filter((i: any) => i.id !== item.id);
                localStorage.setItem('guestCart', JSON.stringify(filteredCart));
                window.dispatchEvent(new Event('cartUpdated'));
                refreshCart();
                return;
            }

            const { error } = await supabase
                .from('cart')
                .delete()
                .eq('id', item.id);

            if (error) throw error;
            refreshCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item from cart');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={`flex gap-3 items-center relative ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="size-14 bg-background-light dark:bg-background-dark rounded-md overflow-hidden shrink-0">
                <img
                    alt={item.products?.name || "Produit"}
                    className="object-cover w-full h-full"
                    src={item.products?.image || (item.products?.images && item.products.images[0]) || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-medium truncate mb-1">{item.products?.name}</p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleUpdateQuantity(item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="text-sm font-bold w-4 text-center text-text-secondary-light dark:text-text-secondary-dark">{item.quantity}</span>
                    <button
                        onClick={() => handleUpdateQuantity(item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                    onClick={handleRemove}
                    className="text-red-500 hover:text-red-600 transition p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Retirer du panier"
                >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
                <span className="text-sm font-bold">{(item.products?.price * item.quantity)?.toLocaleString()} DA</span>
            </div>
            {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded z-10">
                    <span className="material-symbols-outlined animate-spin text-primary">refresh</span>
                </div>
            )}
        </div>
    );
}
