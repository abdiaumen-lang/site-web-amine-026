"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface SearchBarProps {
    autoFocus?: boolean;
    onSearch?: () => void; // called when user navigates to a result
}

export default function SearchBar({ autoFocus = false, onSearch }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus support
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    // Close results when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                if (isMounted) {
                    setSearchResults([]);
                    setIsSearching(false);
                }
                return;
            }

            if (isMounted) setIsSearching(true);

            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("id, name, image, price, original_price, categories(name)")
                    .ilike("name", `%${searchQuery}%`)
                    .limit(5);

                if (error) throw error;

                if (isMounted) {
                    setSearchResults(data || []);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                if (isMounted) setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                fetchResults();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [searchQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/product?search=${encodeURIComponent(searchQuery.trim())}`;
            setShowResults(false);
            onSearch?.();
        }
    };

    const handleResultClick = () => {
        setShowResults(false);
        onSearch?.();
    };

    return (
        <div ref={wrapperRef} className="relative w-full group">
            <form onSubmit={handleSubmit} className="relative flex items-center w-full h-11 rounded-full focus-within:ring-2 focus-within:ring-primary/50 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-primary/30 transition-colors z-20">
                <button type="submit" className="grid place-items-center h-full w-12 text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
                <input
                    ref={inputRef}
                    name="search"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => {
                        if (searchQuery.trim().length >= 2) setShowResults(true);
                    }}
                    autoComplete="off"
                    className="peer h-full w-full outline-none text-sm text-slate-700 dark:text-slate-200 pr-4 bg-transparent placeholder-slate-500"
                    id="global-search"
                    placeholder="Rechercher un produit, une marque, une référence..."
                    type="search"
                />
                {/* Clear button */}
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => { setSearchQuery(""); setSearchResults([]); inputRef.current?.focus(); }}
                        className="mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label="Effacer"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}
            </form>

            {/* Dropdown Results */}
            {showResults && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col max-h-[400px]">
                    {isSearching ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            <span className="material-symbols-outlined animate-spin inline-block">autorenew</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="overflow-y-auto">
                            {searchResults.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={handleResultClick}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                >
                                    <div className="size-10 shrink-0 bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex items-center justify-center p-1">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={product.image || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=100&auto=format"} alt={product.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{product.categories?.name || "ElectroMart"}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-primary">{product.price?.toLocaleString()} DA</p>
                                    </div>
                                </Link>
                            ))}
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700/50">
                                <Link
                                    href={`/product?search=${encodeURIComponent(searchQuery.trim())}`}
                                    onClick={handleResultClick}
                                    className="block p-2 text-center text-sm font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Voir tous les résultats pour &quot;{searchQuery}&quot;
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500 py-8">
                            Aucun produit trouvé pour &quot;{searchQuery}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
