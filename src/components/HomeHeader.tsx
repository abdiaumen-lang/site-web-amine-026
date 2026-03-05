"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import { supabase } from "@/lib/supabase";
import Logo from "./Logo";
import { useSettings } from "@/context/SettingsContext";
import { useCart } from "@/hooks/useCart";

export default function HomeHeader() {
    const [categories, setCategories] = useState<any[]>([]);
    const { settings } = useSettings();
    const { itemCount } = useCart();
    const pos = settings?.logo_position || 'left';

    useEffect(() => {
        async function fetchCategories() {
            try {
                const { data, error } = await supabase
                    .from("categories")
                    .select("*, subcategories(*)")
                    .order("created_at", { ascending: true })
                    .limit(6); // Keep it to 6 items to not break the layout

                if (data && !error && data.length > 0) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        }
        fetchCategories();
    }, []);

    return (
        <>
            <div className="w-full bg-[#FF6600] text-white text-xs font-bold py-2 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee-smooth">
                    {/* Text duplicated for seamless infinite loop */}
                    <span className="px-8">
                        {settings?.top_bar_text || "🚀 Livraison offerte à Alger à partir de 50 000 DA ! | 📞 Contactez-nous : +213 555 123 456 | 🏷️ Offres spéciales sur l'électroménager cette semaine !"}
                    </span>
                    <span className="px-8">
                        {settings?.top_bar_text || "🚀 Livraison offerte à Alger à partir de 50 000 DA ! | 📞 Contactez-nous : +213 555 123 456 | 🏷️ Offres spéciales sur l'électroménager cette semaine !"}
                    </span>
                </div>
            </div>
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-solid border-slate-200 dark:border-slate-800 shadow-sm relative">
                <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 py-4">
                    <div className="flex items-center justify-between gap-4 relative">
                        {/* Mobile Menu & Left Logo Container */}
                        <div className={`flex items-center gap-2 ${pos === 'right' ? 'flex-1' : pos === 'center' ? 'flex-1' : ''}`}>
                            <MobileMenu />
                            {pos === 'left' && <Logo />}
                        </div>

                        {/* Centered Logo Override */}
                        {pos === 'center' && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden sm:flex z-10">
                                <Logo />
                            </div>
                        )}

                        {/* Mobile Centered Logo */}
                        {pos === 'center' && (
                            <div className="sm:hidden flex items-center justify-center">
                                <Logo />
                            </div>
                        )}

                        <div className={`flex-1 max-w-xl mx-4 hidden md:block ${pos === 'center' ? 'invisible xl:visible' : ''}`}>
                            <SearchBar />
                        </div>

                        <div className={`flex items-center gap-4 shrink-0 justify-end ${pos === 'left' ? '' : 'flex-1'}`}>
                            {pos === 'right' && <Logo />}

                            <button className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                <span className="material-symbols-outlined">search</span>
                            </button>

                            <Link href="/cart" className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-[#FF6600] transition-colors flex items-center gap-2">
                                <div className="relative">
                                    <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                                    {itemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 size-4 bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                                            {itemCount > 99 ? '99+' : itemCount}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden xl:block text-sm font-medium">Mon panier</span>
                            </Link>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center justify-center gap-8 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Link className="text-slate-900 dark:text-slate-100 text-sm font-semibold hover:text-[#FF6600] transition-colors" href="/">Accueil</Link>
                        {categories.map((cat) => (
                            <div key={cat.id} className="relative group">
                                <Link
                                    className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 py-2"
                                    href={`/product?category=${cat.id}`}
                                >
                                    {cat.name}
                                    {cat.subcategories && cat.subcategories.length > 0 && (
                                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                    )}
                                </Link>

                                {/* Dropdown for subcategories */}
                                {cat.subcategories && cat.subcategories.length > 0 && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 w-48 flex flex-col">
                                            {cat.subcategories.map((sub: any) => (
                                                <Link
                                                    key={sub.id}
                                                    href={`/product?category=${cat.id}&subcategory=${sub.id}`}
                                                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <Link className="bg-[#FF6600]/10 px-3 py-1 rounded-full text-[#FF6600] text-sm font-bold hover:bg-[#FF6600]/20 transition-colors" href="/product">Bons plans</Link>
                    </nav>
                </div>
            </header>
        </>
    );
}
