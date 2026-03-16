"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import Logo from "@/components/Logo";

// Types derived from tracking payload
interface Visit {
    id: number;
    session_id: string;
    created_at: string;
    path: string;
    event_type: string;
    event_data?: any;
    user_agent: string;
    browser: string;
    os: string;
    device_type: string;
    screen_resolution: string;
    referrer: string;
    country: string;
    city: string;
}

export default function AdminAnalyticsPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Filter controls
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('site_visits')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply date filters
            const now = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'all':
                    startDate = new Date(0); // Very old date
                    break;
            }

            if (dateRange !== 'all') {
                query = query.gte('created_at', startDate.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            setVisits(data || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch analytics data. Make sure the site_visits table exists.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Analytics Derivations ---

    // Total unique sessions
    const uniqueSessions = new Set(visits.map(v => v.session_id)).size;

    // Page views
    const pageViews = visits.filter(v => v.event_type === 'page_view');
    const totalPageViews = pageViews.length;

    // Top Pages
    const pagesCount = pageViews.reduce((acc, visit) => {
        const path = visit.path || '/';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topPages = Object.entries(pagesCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5);

    // Top Products
    const productViews = visits.filter(v => v.event_type === 'view_item');
    const productsCount = productViews.reduce((acc, visit) => {
        const eventData = visit.event_data as { product_id?: number, product_name?: string } | null;
        if (eventData && eventData.product_name) {
            acc[eventData.product_name] = (acc[eventData.product_name] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    const topProducts = Object.entries(productsCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5);

    // Devices
    const devicesCount = visits.reduce((acc, visit) => {
        const device = visit.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Browsers
    const browsersCount = visits.reduce((acc, visit) => {
        const browser = visit.browser || 'unknown';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);


    return (
        <div className="bg-background-light text-text-main font-display antialiased min-h-screen flex flex-col overflow-hidden">
            <div className="flex h-screen w-full overflow-hidden relative">
                <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative">
                    <div className="xl:hidden flex items-center justify-between p-4 bg-surface-light border-b border-stone-200">
                        <Logo
                            className="flex items-center gap-2"
                            textClassName="font-black text-[22px] tracking-tight text-[#FF6600] leading-none lowercase"
                        />
                        <button className="text-text-main" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto flex flex-col gap-6">
                            
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-text-main text-3xl font-black tracking-tight">Statistiques</h2>
                                    <p className="text-text-muted text-base">Suivez le trafic et le comportement des visiteurs.</p>
                                </div>
                                <div className="flex bg-surface-light rounded-lg border border-stone-200 p-1">
                                    <button 
                                        onClick={() => setDateRange('today')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === 'today' ? 'bg-admin-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        Aujourd'hui
                                    </button>
                                    <button 
                                        onClick={() => setDateRange('week')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === 'week' ? 'bg-admin-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        7 Jours
                                    </button>
                                    <button 
                                        onClick={() => setDateRange('month')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === 'month' ? 'bg-admin-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        30 Jours
                                    </button>
                                    <button 
                                        onClick={() => setDateRange('all')}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === 'all' ? 'bg-admin-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        Tout
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-3">
                                    <span className="material-symbols-outlined">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Key Metrics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-surface-light p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-text-muted mb-1">
                                        <span className="material-symbols-outlined text-[20px] text-blue-500">group</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Visiteurs Uniques (Sessions)</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-main">{isLoading ? '...' : uniqueSessions}</p>
                                </div>
                                
                                <div className="bg-surface-light p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-text-muted mb-1">
                                        <span className="material-symbols-outlined text-[20px] text-green-500">visibility</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Pages Vues</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-main">{isLoading ? '...' : totalPageViews}</p>
                                </div>

                                <div className="bg-surface-light p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-text-muted mb-1">
                                        <span className="material-symbols-outlined text-[20px] text-purple-500">touch_app</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Pages par Session</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-main">
                                        {isLoading ? '...' : uniqueSessions > 0 ? (totalPageViews / uniqueSessions).toFixed(1) : '0'}
                                    </p>
                                </div>

                                <div className="bg-surface-light p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-text-muted mb-1">
                                        <span className="material-symbols-outlined text-[20px] text-orange-500">timeline</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Total Événements</span>
                                    </div>
                                    <p className="text-3xl font-black text-text-main">{isLoading ? '...' : visits.length}</p>
                                </div>
                            </div>

                            {/* Detailed Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Top Pages */}
                                <div className="bg-surface-light rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
                                    <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                                        <h3 className="font-bold text-text-main flex items-center gap-2">
                                            <span className="material-symbols-outlined text-admin-primary">description</span>
                                            Pages les plus visitées
                                        </h3>
                                    </div>
                                    <div className="p-0">
                                        {isLoading ? (
                                            <div className="p-8 text-center text-text-muted"><span className="material-symbols-outlined animate-spin text-3xl">autorenew</span></div>
                                        ) : topPages.length === 0 ? (
                                            <div className="p-8 text-center text-text-muted">Aucune donnée</div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead className="bg-stone-50 text-xs uppercase text-text-muted">
                                                    <tr>
                                                        <th className="px-5 py-3 font-semibold">Page/URL</th>
                                                        <th className="px-5 py-3 font-semibold text-right">Vues</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-100">
                                                    {topPages.map(([path, count]) => (
                                                        <tr key={path} className="hover:bg-stone-50/50 transition-colors">
                                                            <td className="px-5 py-3 text-sm text-text-main font-medium max-w-[200px] truncate" title={path}>{path}</td>
                                                            <td className="px-5 py-3 text-sm text-text-muted text-right font-bold">{count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                {/* Top Products */}
                                <div className="bg-surface-light rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
                                    <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                                        <h3 className="font-bold text-text-main flex items-center gap-2">
                                            <span className="material-symbols-outlined text-admin-primary">shopping_bag</span>
                                            Produits les plus consultés
                                        </h3>
                                    </div>
                                    <div className="p-0">
                                        {isLoading ? (
                                            <div className="p-8 text-center text-text-muted"><span className="material-symbols-outlined animate-spin text-3xl">autorenew</span></div>
                                        ) : topProducts.length === 0 ? (
                                            <div className="p-8 text-center text-text-muted">Aucune donnée sur les produits</div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead className="bg-stone-50 text-xs uppercase text-text-muted">
                                                    <tr>
                                                        <th className="px-5 py-3 font-semibold">Produit</th>
                                                        <th className="px-5 py-3 font-semibold text-right">Vues</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-100">
                                                    {topProducts.map(([name, count]) => (
                                                        <tr key={name} className="hover:bg-stone-50/50 transition-colors">
                                                            <td className="px-5 py-3 text-sm text-text-main font-medium max-w-[200px] truncate" title={name}>{name as string}</td>
                                                            <td className="px-5 py-3 text-sm text-text-muted text-right font-bold">{count as React.ReactNode}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                {/* Devices & Browsers */}
                                <div className="flex flex-col gap-6">
                                    <div className="bg-surface-light rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                                        <div className="p-4 border-b border-stone-100 flex items-center bg-stone-50/50">
                                            <h3 className="font-bold text-text-main flex items-center gap-2">
                                                <span className="material-symbols-outlined text-admin-primary">devices</span>
                                                Appareils
                                            </h3>
                                        </div>
                                        <div className="p-4">
                                            {isLoading ? (
                                                <div className="py-4 text-center text-text-muted">Chargement...</div>
                                            ) : Object.keys(devicesCount).length === 0 ? (
                                                <div className="py-4 text-center text-text-muted">Aucune donnée</div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {Object.entries(devicesCount).map(([device, count]) => (
                                                        <div key={device} className="flex items-center justify-between text-sm">
                                                            <span className="capitalize font-medium text-text-main flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[18px] text-stone-400">
                                                                    {device === 'desktop' ? 'computer' : device === 'mobile' ? 'smartphone' : device === 'tablet' ? 'tablet_mac' : 'device_unknown'}
                                                                </span>
                                                                {device}
                                                            </span>
                                                            <span className="font-bold text-text-muted">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-surface-light rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                                        <div className="p-4 border-b border-stone-100 flex items-center bg-stone-50/50">
                                            <h3 className="font-bold text-text-main flex items-center gap-2">
                                                <span className="material-symbols-outlined text-admin-primary">web</span>
                                                Navigateurs
                                            </h3>
                                        </div>
                                        <div className="p-4">
                                            {isLoading ? (
                                                <div className="py-4 text-center text-text-muted">Chargement...</div>
                                            ) : Object.keys(browsersCount).length === 0 ? (
                                                <div className="py-4 text-center text-text-muted">Aucune donnée</div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {Object.entries(browsersCount).sort((a,b) => b[1]-a[1]).map(([browser, count]) => (
                                                        <div key={browser} className="flex items-center justify-between text-sm">
                                                            <span className="font-medium text-text-main">{browser}</span>
                                                            <span className="font-bold text-text-muted">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                            </div>

                            {/* Recent Visitors Table */}
                            <div className="bg-surface-light rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-stone-100 flex items-center bg-stone-50/50">
                                    <h3 className="font-bold text-text-main flex items-center gap-2">
                                        <span className="material-symbols-outlined text-admin-primary">history</span>
                                        Derniers Événements
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50 border-b border-stone-200 text-xs uppercase tracking-wider text-text-muted font-semibold">
                                                <th className="px-5 py-3">Date</th>
                                                <th className="px-5 py-3">Page / Événement</th>
                                                <th className="px-5 py-3">Appareil</th>
                                                <th className="px-5 py-3">OS & Nav</th>
                                                <th className="px-5 py-3 text-right">Code Session</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                                                        Chargement...
                                                    </td>
                                                </tr>
                                            ) : visits.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                                                        Aucune donnée enregistrée
                                                    </td>
                                                </tr>
                                            ) : (
                                                visits.slice(0, 20).map((visit) => (
                                                    <tr key={visit.id} className="hover:bg-stone-50/50 transition-colors">
                                                        <td className="px-5 py-3 whitespace-nowrap text-xs text-text-muted">
                                                            {new Date(visit.created_at).toLocaleString('fr-FR')}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-medium text-text-main truncate max-w-[250px]">{visit.path}</span>
                                                                {visit.event_type !== 'page_view' && (
                                                                    <span className="text-[10px] uppercase font-bold text-admin-primary bg-admin-primary/10 px-1.5 py-0.5 rounded w-fit pb-0.5">
                                                                        {visit.event_type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap text-sm capitalize text-text-muted">
                                                            {visit.device_type}
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap text-sm text-text-muted flex flex-col">
                                                            <span>{visit.os}</span>
                                                            <span className="text-xs">{visit.browser}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right whitespace-nowrap text-xs text-stone-400 font-mono">
                                                            {visit.session_id.split('-')[0]}...
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
