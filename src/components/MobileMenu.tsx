"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSettings } from "@/context/SettingsContext";

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const { settings } = useSettings();

    // Fetch categories and subcategories from Supabase
    useEffect(() => {
        async function fetchCategories() {
            try {
                const { data, error } = await supabase
                    .from("categories")
                    .select("*, subcategories(*)")
                    .order("order_index", { ascending: true });

                if (data && !error && data.length > 0) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Build social links array from settings (only configured ones)
    const socialLinks = [
        settings?.social_facebook && { label: "Facebook", url: settings.social_facebook, color: "#1877F2", icon: "f", type: "text" },
        settings?.social_instagram && { label: "Instagram", url: settings.social_instagram, color: "#E1306C", icon: "photo_camera", type: "material" },
        settings?.social_tiktok && { label: "TikTok", url: settings.social_tiktok, color: "#ffffff", icon: "music_note", type: "material" },
        settings?.social_youtube && { label: "YouTube", url: settings.social_youtube, color: "#FF0000", icon: "play_circle", type: "material" },
        settings?.social_twitter && { label: "X", url: settings.social_twitter, color: "#ffffff", icon: "𝕏", type: "text" },
    ].filter(Boolean) as { label: string; url: string; color: string; icon: string; type: string }[];

    const hasContact = settings?.contact_phone || settings?.contact_email || socialLinks.length > 0;

    const menuContent = (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] z-[100] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ backgroundColor: settings?.menu_bg_color || '#1a1525' }}
            >
                {/* Header with Title and Close Button */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-white text-xl font-bold tracking-tight">Nos univers</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="size-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Close mobile menu"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Promotional / Preorder banner */}
                <div className="bg-primary/10 border-b border-primary/20 px-5 py-3 flex flex-col justify-center">
                    <p className="text-xs text-primary-light font-medium text-center leading-tight">
                        Précommandez dès maintenant et bénéficiez d&apos;offres exceptionnelles !
                    </p>
                </div>

                {/* Categories List */}
                <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">
                    {categories.map((category) => (
                        <div key={category.id} className="flex flex-col">
                            <button
                                onClick={() => {
                                    if (category.subcategories && category.subcategories.length > 0) {
                                        setExpandedCategory(expandedCategory === category.id ? null : category.id);
                                    } else {
                                        setIsOpen(false);
                                        window.location.href = `/product?category=${category.id}`;
                                    }
                                }}
                                className="flex items-center gap-4 group p-2 rounded-xl hover:bg-white/5 transition-colors w-full text-left"
                            >
                                <div className="size-14 bg-white shrink-0 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                                    {category.image ? (
                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-400 text-3xl group-hover:text-primary transition-colors">
                                            {category.icon || "category"}
                                        </span>
                                    )}
                                </div>
                                <span className="text-white font-medium flex-1 text-sm group-hover:text-primary transition-colors">
                                    {category.name}
                                </span>
                                <span className={`material-symbols-outlined text-white/40 group-hover:text-primary transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`}>
                                    chevron_right
                                </span>
                            </button>
                            {/* Subcategories */}
                            {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                                <div className="pl-16 pr-2 py-2 flex flex-col gap-2">
                                    {category.subcategories.map((sub: any) => (
                                        <Link
                                            key={sub.id}
                                            href={`/product?category=${category.id}&subcategory=${sub.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="text-white/70 hover:text-primary text-sm py-1.5 transition-colors block"
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href={`/product?category=${category.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="text-primary hover:text-primary-light text-sm py-1.5 font-medium transition-colors block mt-1"
                                    >
                                        Voir tout {category.name}
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Contact & Social info panel */}
                    {hasContact && (
                        <div className="mt-3 pt-4 border-t border-white/10">
                            {/* Phone & Email */}
                            <div className="flex flex-col gap-2 mb-3">
                                {settings?.contact_phone && (
                                    <a
                                        href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[18px]">phone</span>
                                        </div>
                                        <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">{settings.contact_phone}</span>
                                    </a>
                                )}
                                {settings?.contact_email && (
                                    <a
                                        href={`mailto:${settings.contact_email}`}
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                                        </div>
                                        <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors truncate">{settings.contact_email}</span>
                                    </a>
                                )}
                            </div>

                            {/* Social Media Icons Row */}
                            {socialLinks.length > 0 && (
                                <div className="flex items-center gap-2 px-2 pb-1 flex-wrap">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={social.label}
                                            className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                        >
                                            {social.type === "material" ? (
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: social.color }}>{social.icon}</span>
                                            ) : (
                                                <span className="font-black text-sm" style={{ color: social.color }}>{social.icon}</span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Access Link */}
                    <div className={`${hasContact ? 'mt-2' : 'mt-4'} pt-4 border-t border-white/10`}>
                        <Link
                            href="/admin-login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
                        >
                            <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm">Espace Admin</span>
                                <span className="text-primary-light/60 text-[10px]">Gérer la boutique</span>
                            </div>
                            <span className="material-symbols-outlined text-white/20 ml-auto text-sm">open_in_new</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center shrink-0"
                aria-label="Open mobile menu"
            >
                <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
            {mounted && createPortal(menuContent, document.body)}
        </>
    );
}
