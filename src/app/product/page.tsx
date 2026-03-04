"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductHeader from "@/components/ProductHeader";
import ProductFooter from "@/components/ProductFooter";
import { supabase } from "@/lib/supabase";

function ProductCatalogContent() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

    const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (addingToCart[productId]) return; // Prevent double-clicks

        // Optimistic UI: Immediately show loading state
        setAddingToCart(prev => ({ ...prev, [productId]: true }));

        try {
            // First check if user is logged in natively
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Instantly support guest cart via localStorage
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const existingItemIndex = guestCart.findIndex((item: any) => item.product_id === productId);

                if (existingItemIndex > -1) {
                    guestCart[existingItemIndex].quantity += 1;
                } else {
                    guestCart.push({ id: crypto.randomUUID(), product_id: productId, quantity: 1, created_at: new Date().toISOString() });
                }

                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                window.dispatchEvent(new Event('cartUpdated'));

                // Keep the success state active for a moment
                setTimeout(() => setAddingToCart(prev => ({ ...prev, [productId]: false })), 600);
                return;
            }

            // Real API call for authenticated users
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erreur lors de l\'ajout au panier');
            }

            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            alert(error.message); // Only alert on actual failure
        } finally {
            // Slight delay before removing loading spinner looks better than instant flash
            setTimeout(() => setAddingToCart(prev => ({ ...prev, [productId]: false })), 600);
        }
    };

    // Get the filters from the URL if they exist
    const categoryParam = searchParams?.get("category");
    const subcategoryParam = searchParams?.get("subcategory");
    const searchQueryParam = searchParams?.get("search");

    useEffect(() => {
        async function fetchInitialData() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch Categories with nested subcategories
                const { data: catData, error: catError } = await supabase.from("categories").select("*, subcategories(*)");
                if (catError) {
                    throw new Error("Failed to load categories: " + catError.message);
                }
                setCategories(catData || []);

                // Start building the query
                let query = supabase.from("products").select("*, categories(name), subcategories(name)").order("id", { ascending: false });

                // If a category filter is applied, add the filter on category_id
                if (categoryParam) {
                    query = query.eq("category_id", categoryParam);
                }

                // If a subcategory filter is applied, add the filter on subcategory_id
                if (subcategoryParam) {
                    query = query.eq("subcategory_id", subcategoryParam);
                }

                // If a search query is applied, filter by name
                if (searchQueryParam) {
                    query = query.ilike("name", `%${searchQueryParam}%`);
                }

                const { data, error: supabaseError } = await query;

                if (supabaseError) {
                    console.error("Supabase Error Code:", supabaseError.code);
                    console.error("Supabase Error Message:", supabaseError.message);
                    console.error("Supabase Error Details:", supabaseError.details);
                    throw new Error(supabaseError.message || "Unknown database error");
                }

                setProducts(data || []);
            } catch (err: any) {
                console.error("Fetch Exception:", err.message);
                setError(err.message || "Failed to load products. Check the server console.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchInitialData();
    }, [categoryParam, subcategoryParam, searchQueryParam]);

    const activeCategory = categories.find(c => c.id === categoryParam);
    const activeSubcategory = activeCategory?.subcategories?.find((s: any) => s.id === subcategoryParam);

    return (
        <main className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-main dark:text-white">
                        {searchQueryParam ? `Résultats de recherche pour "${searchQueryParam}"` : (activeSubcategory ? activeSubcategory.name : (activeCategory ? activeCategory.name : "Tous les produits"))}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {products.length} {products.length > 1 ? 'produits trouvés' : 'produit trouvé'}
                    </p>
                </div>

                {(categoryParam || searchQueryParam) && (
                    <Link href="/product" className="text-primary hover:underline text-sm font-semibold">
                        Effacer le filtre
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Categories */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-[#f4f3f0] dark:border-[#3e362a]">
                        <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">Catégories</h3>
                        <ul className="space-y-3 text-sm text-text-muted dark:text-gray-400">
                            <li>
                                <Link className={`flex items-center justify-between hover:text-primary transition-colors group ${!categoryParam ? 'text-primary font-bold' : ''}`} href="/product">
                                    <span className="group-hover:translate-x-1 transition-transform">Toutes les catégories</span>
                                </Link>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.id} className="flex flex-col">
                                    <Link className={`flex items-center justify-between hover:text-primary transition-colors group ${categoryParam === cat.id && !subcategoryParam ? 'text-primary font-bold' : ''}`} href={`/product?category=${cat.id}`}>
                                        <span className="group-hover:translate-x-1 transition-transform">{cat.name}</span>
                                    </Link>
                                    {categoryParam === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                                        <ul className="pl-4 mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                            {cat.subcategories.map((sub: any) => (
                                                <li key={sub.id}>
                                                    <Link className={`flex items-center text-xs hover:text-primary transition-colors ${subcategoryParam === sub.id ? 'text-primary font-bold' : 'text-slate-500'}`} href={`/product?category=${cat.id}&subcategory=${sub.id}`}>
                                                        {sub.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Product Grid */}
                <div className="lg:col-span-3">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100">
                            <strong>Erreur :</strong> {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-[4/5]"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">inventory_2</span>
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Aucun produit trouvé</h3>
                            <p className="text-slate-500 mt-2">Essayez d'ajuster votre filtre de catégorie pour voir plus de résultats.</p>
                            <Link href="/product" className="inline-block mt-6 px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors">
                                Voir tous les produits
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300">
                                    <Link href={`/product/${product.id}`} className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden p-4 block">
                                        {product.stock === 0 && (
                                            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">Rupture de stock</span>
                                        )}
                                        <img
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                                            src={product.image || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                                        </button>
                                    </Link>
                                    <div className="p-5 flex flex-col flex-1 gap-2">
                                        <div className="flex items-center gap-1 text-slate-400 text-xs shadow-sm pb-1 mb-1 border-b border-slate-100 dark:border-slate-700 mt-auto">
                                            <span className="font-semibold">{product.brand || "ElectroMart"}</span>
                                            {product.subcategories?.name ? (
                                                <span className="ml-auto px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">{product.subcategories.name}</span>
                                            ) : product.categories?.name ? (
                                                <span className="ml-auto px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">{product.categories.name}</span>
                                            ) : null}
                                        </div>
                                        <Link href={`/product/${product.id}`} className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem] mt-1 hover:text-primary transition-colors">
                                            {product.name}
                                        </Link>

                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {product.original_price && (
                                                    <span className="text-slate-400 text-xs line-through">{product.original_price.toLocaleString()} DA</span>
                                                )}
                                                <span className="text-primary text-xl font-black">{product.price?.toLocaleString()} DA</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product.id)}
                                                    className={`p-2.5 rounded-lg transition-colors flex items-center justify-center min-w-[44px] ${product.stock > 0
                                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary hover:text-white dark:hover:text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={product.stock === 0 || addingToCart[product.id]}
                                                    title="Ajouter au panier"
                                                >
                                                    {addingToCart[product.id] ? (
                                                        <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function ProductPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main font-sans min-h-screen flex flex-col">
            <ProductHeader />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                <ProductCatalogContent />
            </Suspense>
            <ProductFooter />
        </div>
    );
}
