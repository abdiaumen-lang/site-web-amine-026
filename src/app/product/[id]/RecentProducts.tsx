import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
}

interface RecentProductsProps {
    currentProductId: string;
}

export default async function RecentProducts({ currentProductId }: RecentProductsProps) {
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, image, images')
        .neq('id', currentProductId)
        .order('created_at', { ascending: false })
        .limit(6);

    if (!products || products.length === 0) return null;

    return (
        <div className="mt-12 md:mt-16 bg-white dark:bg-slate-900 rounded-[20px] md:rounded-[24px] p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5 md:mb-6">
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px] md:text-[22px]">new_releases</span>
                    Produits récents
                </h2>
                <Link href="/product" className="text-[11px] md:text-sm font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 group/link">
                    <span>Voir tout</span>
                    <span className="material-symbols-outlined text-[14px] md:text-[18px] transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(products as Product[]).map((product) => (
                    <div key={product.id} className="group flex flex-col h-full bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        <Link href={`/product/${product.id}`} className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden mb-4 block group">
                            <img
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={product.image || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                                loading="lazy"
                                decoding="async"
                            />
                        </Link>

                        <div className="flex flex-col flex-1 items-center text-center gap-2 px-2 pb-2">
                            <Link href={`/product/${product.id}`} className="block w-full">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[14px] leading-tight hover:text-primary transition-colors line-clamp-2 h-9">
                                    {product.name}
                                </h3>
                            </Link>

                            <div className="flex flex-col mt-1 items-center">
                                <p className="text-slate-900 dark:text-white font-bold text-sm md:text-md">
                                    DA {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} DZD
                                </p>
                            </div>

                            <Link href={`/product/${product.id}`} className="mt-4 w-full">
                                <button className="w-full py-2.5 px-4 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300 text-[13px]">
                                    Voir le produits
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

