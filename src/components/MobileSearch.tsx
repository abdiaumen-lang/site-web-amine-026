"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    name: string;
    image: string | null;
    price: number;
    original_price: number | null;
    brand: string | null;
}

interface MobileSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState("");
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [displayed, setDisplayed] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);

    // Fetch all products when opened
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            return;
        }

        setLoading(true);
        supabase
            .from("products")
            .select("id, name, image, price, original_price, brand")
            .order("created_at", { ascending: false })
            .limit(60)
            .then(({ data }) => {
                setAllProducts(data || []);
                setDisplayed(data || []);
                setLoading(false);
            });

        // Focus input after short delay (lets portal mount first)
        const t = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(t);
    }, [isOpen]);

    // Filter locally
    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            setDisplayed(allProducts);
        } else {
            setDisplayed(
                allProducts.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    (p.brand || "").toLowerCase().includes(q)
                )
            );
        }
    }, [query, allProducts]);

    // Close on ESC
    useEffect(() => {
        if (!isOpen) return;
        const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-[999] flex flex-col bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl">search</span>
                <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="flex-1 text-base text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-400"
                    autoComplete="off"
                    type="search"
                />
                {query ? (
                    <button onClick={() => setQuery("")} className="p-1 text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                ) : (
                    <button onClick={onClose} className="p-1 text-slate-500 font-semibold text-sm">
                        Annuler
                    </button>
                )}
            </div>

            {/* Sub-header: link to full product page */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    {loading ? "Chargement..." : `${displayed.length} produit(s)`}
                    {query ? ` pour "${query}"` : ""}
                </span>
                <Link
                    href={query ? `/product?search=${encodeURIComponent(query)}` : "/product"}
                    onClick={onClose}
                    className="text-xs font-bold text-primary"
                >
                    Voir tout →
                </Link>
            </div>

            {/* Products list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                        <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
                        <p className="text-sm">Chargement des produits...</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                        <span className="material-symbols-outlined text-4xl">search_off</span>
                        <p className="text-sm">Aucun produit trouvé pour «&nbsp;{query}&nbsp;»</p>
                    </div>
                ) : (
                    <ul>
                        {displayed.map(product => (
                            <li key={product.id}>
                                <Link
                                    href={`/product/${product.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 transition-colors"
                                >
                                    {/* Image */}
                                    <div className="size-14 shrink-0 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center p-1">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={product.image || "https://placehold.co/80x80?text=?"}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                            {product.name}
                                        </p>
                                        {product.brand && (
                                            <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="text-right shrink-0 ml-2">
                                        <p className="text-sm font-bold text-primary">{Number(product.price).toLocaleString()} DA</p>
                                        {product.original_price && Number(product.original_price) > Number(product.price) && (
                                            <p className="text-[11px] text-slate-400 line-through">{Number(product.original_price).toLocaleString()} DA</p>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
