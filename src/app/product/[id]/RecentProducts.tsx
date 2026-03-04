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

            <div className="flex md:grid md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-0 -mx-1 px-1 snap-x select-none" style={{ scrollbarWidth: 'none' }}>
                {(products as Product[]).map((product) => (
                    <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="w-[120px] xs:w-[140px] sm:w-[160px] md:w-auto min-w-[120px] flex-shrink-0 group snap-start"
                    >
                        <div className="flex flex-col gap-2 md:gap-3">
                            <div className="aspect-square rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden border border-slate-100 dark:border-slate-800 transition-all group-hover:shadow-md group-hover:scale-[1.02] group-hover:border-primary/20 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={product.image || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5 px-0.5">
                                <h3 className="font-bold text-slate-900 dark:text-white text-[10px] md:text-xs line-clamp-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-primary font-black text-xs md:text-sm">
                                    {product.price.toLocaleString()} DA
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

