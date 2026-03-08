import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductHeader from "@/components/ProductHeader";
import ProductFooter from "@/components/ProductFooter";
import ProductGallery from "./ProductGallery";
import AddToCartAction from "./AddToCartAction";
import Link from "next/link";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import EditProductButton from "./EditProductButton";
import RecentProducts from "./RecentProducts";
import sanitizeHtml from 'sanitize-html';
import SocialLinks from "@/components/SocialLinks";
import VideoGallery from "@/components/VideoGallery";
import LandingFeatures from "@/components/LandingFeatures";
import LandingTestimonials from "@/components/LandingTestimonials";
import InteractiveStarRating from "@/components/InteractiveStarRating";


export const revalidate = 60; // Cache the product page for 60 seconds for ultra-fast edge loading

const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'iframe', 'video', 'source', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'u', 's', 'em', 'strong'
    ]),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style', 'class', 'dir', 'align'],
        'iframe': ['src', 'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'title', 'width', 'height'],
        'video': ['src', 'controls', 'width', 'height', 'autoplay', 'loop', 'muted', 'poster', 'playsinline'],
        'source': ['src', 'type'],
        'img': ['src', 'alt', 'width', 'height', 'loading']
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'vimeo.com']
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch product details
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            subcategories (name)
        `)
        .eq('id', id)
        .single();

    if (error || !product) {
        return notFound();
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main font-sans min-h-screen flex flex-col">
            <ProductHeader />

            <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-6 md:mb-8 flex flex-wrap items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-3 px-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-500">
                        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">home</span>
                            Accueil
                        </Link>
                        <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">chevron_right</span>
                        <Link href="/product" className="hover:text-primary transition-colors">Produits</Link>

                        {product.categories?.name && (
                            <>
                                <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">chevron_right</span>
                                <Link href={`/product?category=${product.category_id}`} className="hover:text-primary transition-colors px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    {product.categories.name}
                                </Link>
                            </>
                        )}
                        <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">chevron_right</span>
                        <span className="text-slate-900 dark:text-slate-200 truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">{product.name}</span>
                    </div>

                    <EditProductButton productId={product.id} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
                    {/* Left Column: Interactive Image Gallery */}
                    <div className="w-full">
                        <ProductGallery
                            images={product.images || []}
                            fallbackImage={product.image || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format"}
                            productName={product.name}
                        />
                    </div>

                    {/* Right Column: Product Info & Actions */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg mb-4">
                                {product.brand || "ElectroMart"}
                            </span>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                                {product.name}
                            </h1>

                            {/* Interactive Ratings */}
                            <div className="mb-6 flex items-center gap-4">
                                <InteractiveStarRating productId={product.id} />
                                {product.stock > 0 ? (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 border border-green-500/20">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        En stock
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 border border-red-500/20">
                                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                                        Rupture
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                {product.original_price && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400 text-lg md:text-xl line-through font-bold decoration-red-500/50 decoration-2">
                                            {product.original_price.toLocaleString()} DA
                                        </span>
                                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                            Économisez {(product.original_price - product.price).toLocaleString()} DA
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-primary text-5xl lg:text-6xl font-black tracking-tight">
                                        {product.price?.toLocaleString()}
                                    </span>
                                    <span className="text-primary/70 text-2xl font-bold">DA</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-6"></div>

                        {/* Interactive Add to Cart Component */}
                        <div className="mb-8">
                            <AddToCartAction
                                productId={product.id}
                                stock={product.stock}
                                price={product.price}
                            />
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-primary">local_shipping</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">Livraison<br />Rapide</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-primary">verified</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">Produit<br />Original</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-primary">support_agent</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">Support<br />24/7</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-primary">lock</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">Paiement<br />Sécurisé</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FULL WIDTH DESCRIPTION & LANDING PAGE SECTION --- */}
                <div className="mt-12 md:mt-16 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 pointer-events-none"></div>
                    <div className="p-8 md:p-12 lg:p-16 max-w-5xl mx-auto flex flex-col items-center relative z-10">

                        <div className="w-full mb-16 relative">
                            <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full hidden md:block"></div>
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 md:pl-6">Présentation du produit</h3>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed md:pl-6 prose-img:rounded-2xl prose-img:shadow-xl hover:prose-a:text-primary">
                                {product.description ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtml(product.description, sanitizeOptions)
                                        }}
                                    />
                                ) : (
                                    <p className="italic text-slate-400">Aucune description détaillée n&apos;est disponible pour ce produit pour le moment.</p>
                                )}
                            </div>
                        </div>

                        {/* Uploaded Media from landing_data.media */}
                        {product.landing_data?.media && product.landing_data.media.length > 0 && (
                            <div className="mb-12 w-full animate-fade-in-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
                                    {product.landing_data.media.map((item: any, idx: number) => (
                                        <div key={idx} className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 bg-black flex items-center justify-center">
                                            {item.type === 'video' ? (
                                                <video
                                                    src={item.url}
                                                    controls
                                                    className="w-full h-auto max-h-[600px] object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={item.url}
                                                        alt={`Media ${idx + 1} pour ${product.name}`}
                                                        className="w-full h-auto max-h-[600px] object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specifications block */}
                        {product.specifications && (
                            <div className="w-full mb-12">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Spécifications techniques</h3>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="whitespace-pre-line text-sm md:text-base">{product.specifications}</p>
                                </div>
                            </div>
                        )}

                        {/* Landing Image */}
                        {product.landing_image && (
                            <div className="mb-12 w-full animate-fade-in-up">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={product.landing_image}
                                    alt={`${product.name} - Landing`}
                                    className="w-full rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 object-cover max-h-[600px]"
                                />
                            </div>
                        )}

                        {/* Landing Page Rich Content */}
                        {product.landing_content && product.landing_content !== '<p><br></p>' && (
                            <div className="mb-12 w-full animate-fade-in-up">
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none w-full break-words prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-dark prose-img:rounded-2xl prose-img:shadow-md prose-video:w-full prose-video:aspect-video [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl overflow-x-hidden"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(product.landing_content, sanitizeOptions)
                                    }}
                                />
                            </div>
                        )}

                        {/* Social Links from landing_data */}
                        {product.landing_data?.socialLinks && product.landing_data.socialLinks.length > 0 && (
                            <div className="mb-12 w-full animate-fade-in-up">
                                <SocialLinks links={product.landing_data.socialLinks} />
                            </div>
                        )}

                        {/* Video Gallery from landing_data */}
                        {product.landing_data?.videos && product.landing_data.videos.length > 0 && (
                            <div className="mb-12 w-full animate-fade-in-up">
                                <VideoGallery videos={product.landing_data.videos} />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- DYNAMIC LANDING PAGE MODULAR SECTIONS --- */}
                {product.landing_data?.features && product.landing_data.features.length > 0 && (
                    <div className="mt-12 md:mt-16 animate-fade-in-up">
                        <LandingFeatures features={product.landing_data.features} />
                    </div>
                )}

                {product.landing_data?.testimonials && product.landing_data.testimonials.length > 0 && (
                    <div className="mt-12 md:mt-16 animate-fade-in-up">
                        <LandingTestimonials testimonials={product.landing_data.testimonials} />
                    </div>
                )}

                {/* Recent Products Section */}
                <div className="mt-12 md:mt-16">
                    <RecentProducts currentProductId={product.id} />
                </div>
            </main>

            <ProductFooter />
        </div>
    );
}
