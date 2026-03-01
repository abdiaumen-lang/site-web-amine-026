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

    // Get the category filter from the URL if it exists (using category_id)
    const categoryParam = searchParams?.get("category");

    useEffect(() => {
        async function fetchInitialData() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch Categories
                const { data: catData, error: catError } = await supabase.from("categories").select("*");
                if (catError) {
                    throw new Error("Failed to load categories: " + catError.message);
                }
                setCategories(catData || []);

                // Start building the query
                let query = supabase.from("products").select("*, categories(name)").order("id", { ascending: false });

                // If a category filter is applied, add the filter on category_id
                if (categoryParam) {
                    query = query.eq("category_id", categoryParam);
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
    }, [categoryParam]);

    const activeCategory = categories.find(c => c.id === categoryParam);

    return (
        <main className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-main dark:text-white">
                        {activeCategory ? activeCategory.name : "All Products"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                {categoryParam && (
                    <Link href="/product" className="text-primary hover:underline text-sm font-semibold">
                        Clear Filter
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Categories */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-[#f4f3f0] dark:border-[#3e362a]">
                        <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">Categories</h3>
                        <ul className="space-y-3 text-sm text-text-muted dark:text-gray-400">
                            <li>
                                <Link className={`flex items-center justify-between hover:text-primary transition-colors group ${!categoryParam ? 'text-primary font-bold' : ''}`} href="/product">
                                    <span className="group-hover:translate-x-1 transition-transform">All Categories</span>
                                </Link>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <Link className={`flex items-center justify-between hover:text-primary transition-colors group ${categoryParam === cat.id ? 'text-primary font-bold' : ''}`} href={`/product?category=${cat.id}`}>
                                        <span className="group-hover:translate-x-1 transition-transform">{cat.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Product Grid */}
                <div className="lg:col-span-3">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100">
                            <strong>Error:</strong> {error}
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
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No products found</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your category filter to see more results.</p>
                            <Link href="/product" className="inline-block mt-6 px-6 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors">
                                View All Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300">
                                    <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden p-4">
                                        {product.stock === 0 && (
                                            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">Out of Stock</span>
                                        )}
                                        <img
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                                            src={product.image || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                                        />
                                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                                        </button>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 gap-2">
                                        <div className="flex items-center gap-1 text-slate-400 text-xs shadow-sm pb-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                                            <span className="font-semibold">{product.brand || "ElectroMart"}</span>
                                            {product.categories?.name && <span className="ml-auto px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">{product.categories.name}</span>}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem] mt-1">{product.name}</h3>

                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {product.original_price && (
                                                    <span className="text-slate-400 text-xs line-through">{product.original_price.toLocaleString()} DA</span>
                                                )}
                                                <span className="text-primary text-xl font-black">{product.price?.toLocaleString()} DA</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href="/"
                                                    className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center -ml-1"
                                                    title="Go Back to Home"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                                </Link>
                                                <button
                                                    className={`p-2.5 rounded-lg transition-colors ${product.stock > 0
                                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary hover:text-white dark:hover:text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={product.stock === 0}
                                                    title="Add to Cart"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
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
