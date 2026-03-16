"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

interface AdminSidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AdminSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { label: 'Produits', icon: 'inventory_2', href: '/admin' },
        { label: 'Ventes', icon: 'payments', href: '/admin/sales' },
        { label: 'Ajouter Produit', icon: 'add_box', href: '/admin/add-product' },
        { label: 'Catégories', icon: 'category', href: '/admin/categories' },
        { label: 'Livraison', icon: 'local_shipping', href: '/admin/shipping' },
        { label: 'Communes', icon: 'map', href: '/admin/communes' },
        { label: 'Marques', icon: 'loyalty', href: '/admin/brands' },
        { label: 'Codes Promo', icon: 'confirmation_number', href: '/admin/promo-codes' },
        { label: 'Statistiques', icon: 'bar_chart', href: '/admin/analytics' },
        { label: 'Paramètres', icon: 'settings', href: '/admin/settings' },
    ];

    return (
        <>
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 xl:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                    <Logo
                        className="flex items-center gap-1.5 shrink-0 group"
                    />
                </div>

                <div className="p-4 flex flex-col gap-6 overflow-y-auto flex-1 justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 block">Menu</span>
                        <nav className="flex flex-col gap-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary'}`}
                                        href={item.href}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? '' : 'group-hover:text-primary'}`}>{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => {
                                localStorage.removeItem("adminAuth");
                                window.location.href = "/";
                            }}
                            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            <span className="text-sm">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
