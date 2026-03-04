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


export const dynamic = 'force-dynamic'; // Force real-time fetching to prevent stale cache on mobile/desktop

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
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <Link href="/product" className="hover:text-primary transition-colors">Produits</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        {product.categories?.name && (
                            <>
                                <Link href={`/product?category=${product.category_id}`} className="hover:text-primary transition-colors">{product.categories.name}</Link>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            </>
                        )}
                        <span className="text-slate-900 dark:text-slate-200 font-medium line-clamp-1">{product.name}</span>
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

                            {/* Ratings (Static for now, but ready for dynamic integration) */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={`material-symbols-outlined ${product.rating >= star ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`}>
                                            star
                                        </span>
                                    ))}
                                </div>
                                <span className="text-slate-500 font-medium">{product.rating || 0}/5</span>
                            </div>

                            <div className="flex flex-col gap-1 mb-8">
                                {product.original_price && (
                                    <span className="text-slate-400 text-lg line-through font-medium">
                                        {product.original_price.toLocaleString()} DA
                                    </span>
                                )}
                                <span className="text-primary text-4xl lg:text-5xl font-black">
                                    {product.price?.toLocaleString()} DA
                                </span>
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
                    </div>
                </div>

                {/* --- FULL WIDTH DESCRIPTION & LANDING PAGE SECTION --- */}
                <div className="mt-12 md:mt-16 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 md:p-12 lg:p-16 max-w-5xl mx-auto flex flex-col items-center">

                        <div className="w-full mb-12">
                            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6 text-center">À propos de ce produit</h3>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed text-center sm:text-left prose-img:rounded-xl prose-img:shadow-md">
                                {product.description ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtml(product.description, sanitizeOptions)
                                        }}
                                    />
                                ) : (
                                    <p>Aucune description détaillée n&apos;est disponible pour ce produit pour le moment.</p>
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
