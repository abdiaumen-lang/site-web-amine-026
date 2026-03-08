"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductHeader from "@/components/ProductHeader";
import ProductFooter from "@/components/ProductFooter";
import { supabase } from "@/lib/supabase";

// ─── Product Card Skeleton ────────────────────────────────────────────────────
function ProductSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 animate-pulse">
            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700/50" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-1/3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-4/5" />
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-2/3" />
                <div className="flex items-center justify-between pt-2">
                    <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full w-24" />
                    <div className="h-9 w-9 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

// ─── Premium Product Card ─────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, isAdding }: {
    product: any;
    onAddToCart: (e: React.MouseEvent, id: string) => void;
    isAdding: boolean;
}) {
    const discount = product.original_price && product.price < product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : null;

    return (
        <div className="group bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 ease-out">
            <Link href={`/product/${product.id}`} className="relative block overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" style={{ aspectRatio: '4/3' }}>
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {product.stock === 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            Épuisé
                        </span>
                    )}
                    {discount && discount > 0 && (
                        <span className="bg-primary text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            -{discount}%
                        </span>
                    )}
                </div>

                <img
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                    src={product.image || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                    loading="lazy"
                    decoding="async"
                />

                {/* Wishlist btn */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                </button>
            </Link>

            <div className="p-4 flex flex-col flex-1">
                {/* Brand + Category */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {product.brand || "ElectroMart"}
                    </span>
                    {product.categories?.name && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                            {product.categories.name}
                        </span>
                    )}
                </div>

                {/* Name */}
                <Link href={`/product/${product.id}`} className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-primary transition-colors text-sm flex-1">
                    {product.name}
                </Link>

                {/* Price + Cart */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-col">
                        {product.original_price && product.original_price > product.price && (
                            <span className="text-slate-400 text-[10px] line-through">
                                {product.original_price.toLocaleString()} DA
                            </span>
                        )}
                        <span className="text-primary font-black text-lg leading-none">
                            {product.price?.toLocaleString()}<span className="text-xs font-bold ml-0.5">DA</span>
                        </span>
                    </div>

                    <button
                        onClick={(e) => onAddToCart(e, product.id)}
                        disabled={product.stock === 0 || isAdding}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${product.stock > 0
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white shadow-sm hover:shadow-md'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-300 cursor-not-allowed'
                            }`}
                        title={product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
                    >
                        {isAdding ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Categories Sidebar ───────────────────────────────────────────────────────
type SidebarProps = {
    categories: any[];
    categoryParam: string | null;
    subcategoryParam: string | null;
    productsCount: number;
    onClose?: () => void;
};

function CategorySidebar({ categories, categoryParam, subcategoryParam, productsCount, onClose }: SidebarProps) {
    return (
        <nav>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Catégories</h3>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                )}
            </div>
            <ul className="space-y-0.5">
                <li>
                    <Link
                        href="/product"
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group ${!categoryParam
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">apps</span>
                            Tous les produits
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono">
                            {productsCount}
                        </span>
                    </Link>
                </li>
                {categories.map(cat => (
                    <li key={cat.id} className="flex flex-col">
                        <Link
                            href={`/product?category=${cat.id}`}
                            onClick={onClose}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group ${categoryParam === cat.id && !subcategoryParam
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {cat.image ? (
                                    <img src={cat.image} alt="" className="w-4 h-4 rounded object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">folder</span>
                                )}
                                {cat.name}
                            </span>
                            {cat.subcategories?.length > 0 && (
                                <span className="material-symbols-outlined text-[14px] text-slate-400">
                                    {categoryParam === cat.id ? 'expand_less' : 'chevron_right'}
                                </span>
                            )}
                        </Link>
                        {categoryParam === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                            <ul className="mt-0.5 ml-3 pl-3 border-l-2 border-primary/20 space-y-0.5">
                                {cat.subcategories.map((sub: any) => (
                                    <li key={sub.id}>
                                        <Link
                                            href={`/product?category=${cat.id}&subcategory=${sub.id}`}
                                            onClick={onClose}
                                            className={`block px-2.5 py-1.5 rounded-lg text-xs transition-all ${subcategoryParam === sub.id
                                                ? 'text-primary font-semibold bg-primary/5'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5'
                                                }`}
                                        >
                                            {sub.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}

// ─── Main Catalog Component ───────────────────────────────────────────────────
function ProductCatalogContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    const categoryParam = searchParams?.get("category") || null;
    const subcategoryParam = searchParams?.get("subcategory") || null;
    const searchQueryParam = searchParams?.get("search") || null;

    // Fetch categories once
    useEffect(() => {
        supabase.from("categories").select("*, subcategories(*)").order("order_index", { ascending: true })
            .then(({ data }) => setCategories(data || []));
    }, []);

    // Fetch products on filter change
    useEffect(() => {
        let cancelled = false;
        async function fetchProducts() {
            setIsLoading(true);
            let query = supabase.from("products").select("id, name, price, original_price, image, stock, brand, category_id, subcategory_id, categories(name)");
            if (categoryParam) query = query.eq("category_id", categoryParam);
            if (subcategoryParam) query = query.eq("subcategory_id", subcategoryParam);
            if (searchQueryParam) query = query.ilike("name", `%${searchQueryParam}%`);
            query = query.order("id", { ascending: false });

            const { data } = await query;
            if (!cancelled) {
                setProducts(data || []);
                setIsLoading(false);
            }
        }
        fetchProducts();
        return () => { cancelled = true; };
    }, [categoryParam, subcategoryParam, searchQueryParam]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
        if (sortBy === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0; // newest (default server order)
    });

    const handleAddToCart = useCallback(async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (addingToCart[productId]) return;

        setAddingToCart(prev => ({ ...prev, [productId]: true }));
        try {
            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const idx = guestCart.findIndex((item: any) => item.product_id === productId);
                if (idx > -1) guestCart[idx].quantity += 1;
                else guestCart.push({ id: crypto.randomUUID(), product_id: productId, quantity: 1, created_at: new Date().toISOString() });
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                const response = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: 1 }) });
                if (response.ok) window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch { /* silent */ }
        finally { setTimeout(() => setAddingToCart(prev => ({ ...prev, [productId]: false })), 600); }
    }, [addingToCart]);

    const activeCategory = categories.find(c => c.id === categoryParam);
    const activeSubcategory = activeCategory?.subcategories?.find((s: any) => s.id === subcategoryParam);
    const pageTitle = searchQueryParam
        ? `"${searchQueryParam}"`
        : activeSubcategory?.name || activeCategory?.name || "Tous les produits";

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            {/* Mobile Sidebar Drawer */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} p-6 overflow-y-auto`}>
                <CategorySidebar
                    categories={categories}
                    categoryParam={categoryParam}
                    subcategoryParam={subcategoryParam}
                    productsCount={products.length}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ── Breadcrumb ───────────────────────────── */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
                    <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <Link href="/product" className="hover:text-primary transition-colors">Produits</Link>
                    {activeCategory && (
                        <>
                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                            <Link href={`/product?category=${activeCategory.id}`} className="hover:text-primary transition-colors">{activeCategory.name}</Link>
                        </>
                    )}
                    {activeSubcategory && (
                        <>
                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{activeSubcategory.name}</span>
                        </>
                    )}
                </nav>

                <div className="flex gap-8">
                    {/* ── Desktop Sidebar ──────────────────── */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <div className="sticky top-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm">
                            <CategorySidebar
                                categories={categories}
                                categoryParam={categoryParam}
                                subcategoryParam={subcategoryParam}
                                productsCount={products.length}
                            />
                        </div>
                    </aside>

                    {/* ── Products Area ─────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Header bar */}
                        <div className="flex items-center justify-between mb-5 gap-3">
                            <div className="flex items-center gap-3">
                                {/* Mobile filter button */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Filtres
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{pageTitle}</h1>
                                    {!isLoading && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {sortedProducts.length} {sortedProducts.length > 1 ? 'produits' : 'produit'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {(categoryParam || searchQueryParam) && (
                                    <Link
                                        href="/product"
                                        className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                        Effacer
                                    </Link>
                                )}
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer shadow-sm"
                                >
                                    <option value="newest">🆕 Plus récents</option>
                                    <option value="price-asc">⬆️ Prix croissant</option>
                                    <option value="price-desc">⬇️ Prix décroissant</option>
                                    <option value="name">🔤 Nom A→Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">inventory_2</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aucun produit trouvé</h3>
                                <p className="text-slate-500 max-w-xs mb-6">Essayez un autre filtre ou une autre recherche pour trouver ce que vous cherchez.</p>
                                <Link href="/product" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-primary/30 text-sm">
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                    Voir tous les produits
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {sortedProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        isAdding={!!addingToCart[product.id]}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────
export default function ProductPage() {
    return (
        <div className="bg-slate-50 dark:bg-background-dark text-text-main font-sans min-h-screen flex flex-col">
            <ProductHeader />
            <Suspense fallback={
                <main className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <span className="text-slate-500 text-sm">Chargement...</span>
                    </div>
                </main>
            }>
                <ProductCatalogContent />
            </Suspense>
            <ProductFooter />
        </div>
    );
}
