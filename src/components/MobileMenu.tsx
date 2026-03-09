"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSettings } from "@/context/SettingsContext";
import { usePathname, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function MobileMenuContent() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const { settings } = useSettings();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
        settings?.social_facebook && { label: "Facebook", url: settings.social_facebook, hex: "#1877F2", icon: <svg className="w-[18px] h-[18px] text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> },
        settings?.social_instagram && { label: "Instagram", url: settings.social_instagram, hex: "#E1306C", icon: <svg className="w-[18px] h-[18px] text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg> },
        settings?.social_tiktok && { label: "TikTok", url: settings.social_tiktok, hex: "#ffffff", icon: <svg className="w-[18px] h-[18px] text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg> },
        settings?.social_youtube && { label: "YouTube", url: settings.social_youtube, hex: "#FF0000", icon: <svg className="w-[18px] h-[18px] text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg> },
        settings?.social_twitter && { label: "X", url: settings.social_twitter, hex: "#ffffff", icon: <svg className="w-[16px] h-[16px] text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg> },
    ].filter(Boolean) as { label: string; url: string; hex: string; icon: React.ReactNode }[];

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

                    {/* Order Tracking Link */}
                    <div className="flex flex-col mb-2">
                        <Link
                            href="/track"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 group p-2 rounded-xl hover:bg-white/5 transition-colors w-full text-left"
                        >
                            <div className="size-14 bg-primary/10 border border-primary/20 shrink-0 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                                    local_shipping
                                </span>
                            </div>
                            <span className="text-white font-bold flex-1 text-sm group-hover:text-primary transition-colors">
                                Suivre ma commande
                            </span>
                            <span className="material-symbols-outlined text-white/40 group-hover:text-primary transition-colors">
                                chevron_right
                            </span>
                        </Link>
                    </div>

                    {/* Contact & Social info panel */}
                    {hasContact && (
                        <div className="mt-3 pt-4 border-t border-white/10">
                            {/* Phone Icons & Email */}
                            <div className="flex flex-col gap-2 pb-2">
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

                                {/* Social Links rendering in standard list form */}
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div
                                            className="size-9 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${social.hex}33` }}
                                        >
                                            {social.icon}
                                        </div>
                                        <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">{social.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Access Link - Hidden by default, shows only on /admin or with ?show_admin=true */}
                    {((pathname && pathname.startsWith('/admin')) || searchParams?.get('show_admin') === 'true') && (
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
                    )}
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

export default function MobileMenu() {
    return (
        <Suspense fallback={null}>
            <MobileMenuContent />
        </Suspense>
    );
}
