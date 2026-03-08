"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMediaUpload, { MediaItem } from "@/components/AdminMediaUpload";
import AdminImageUpload from "@/components/AdminImageUpload";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new');
    return function DynamicQuill({ forwardedRef, ...props }: any) {
        return <RQ ref={forwardedRef} {...props} />;
    };
}, { ssr: false });

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategoryId, setSubcategoryId] = useState("");
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [brand, setBrand] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [specifications, setSpecifications] = useState("");
    const [landingContent, setLandingContent] = useState("");
    const [landingImage, setLandingImage] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [socialLinks, setSocialLinks] = useState<{ platform: string, url: string }[]>([{ platform: "facebook", url: "" }]);
    const [videos, setVideos] = useState<{ url: string }[]>([{ url: "" }]);
    const [features, setFeatures] = useState<{ title: string, description: string, icon: string }[]>([]);
    const [testimonials, setTestimonials] = useState<{ name: string, role: string, content: string, rating: number }[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Quill editor reference for custom handlers
    const reactQuillRef = useRef<any>(null);

    // Custom image handler for ReactQuill
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `landing-content/${fileName}`;

                try {
                    // Show some uploading state if needed, or just let it upload
                    const { data, error } = await supabase.storage
                        .from('landing_media')
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.error("Error uploading image:", error);
                        alert("Erreur lors du téléchargement de l'image.");
                        return;
                    }

                    const { data: publicUrlData } = supabase.storage
                        .from('landing_media')
                        .getPublicUrl(filePath);

                    // Insert the image into the editor
                    const quill = reactQuillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection();
                        const position = range ? range.index : quill.getLength();
                        quill.insertEmbed(position, 'image', publicUrlData.publicUrl);
                        quill.setSelection(position + 1);
                    }
                } catch (err) {
                    console.error("Upload failed", err);
                    alert("Erreur lors du téléchargement.");
                }
            }
        };
    };

    // Memoize modules to prevent Quill from constantly re-rendering and losing focus
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            try {
                const { data, error } = await supabase.from("categories").select("*").order("name");
                if (!error && data) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        }
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        async function fetchSubcategories() {
            if (!categoryId) {
                setSubcategories([]);
                setSubcategoryId("");
                return;
            }
            try {
                const { data, error } = await supabase.from("subcategories").select("*").eq("category_id", categoryId).order("name");
                if (!error && data) {
                    setSubcategories(data);
                }
            } catch (err) {
                console.error("Failed to fetch subcategories:", err);
            }
        }
        fetchSubcategories();
    }, [categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const productData = {
                name,
                category_id: categoryId || null,
                subcategory_id: subcategoryId || null,
                brand,
                price: parseFloat(price),
                original_price: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock, 10),
                description,
                specifications,
                landing_content: landingContent || null,
                landing_image: landingImage || null,
                image: imageUrl || null,
                images: images.filter(img => img.trim() !== ""),
                landing_data: {
                    socialLinks: socialLinks.filter(link => link.url.trim() !== ""),
                    videos: videos.filter(video => video.url.trim() !== ""),
                    features: features.filter(f => f.title.trim() !== ""),
                    testimonials: testimonials.filter(t => t.name.trim() !== "" && t.content.trim() !== ""),
                    media: media
                }
            };

            const { error: supabaseError } = await supabase
                .from('products')
                .insert([productData]);

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            setSuccess("Product successfully added!");
            setTimeout(() => {
                window.location.href = '/admin'; // Force full reload to ensure data is fresh
            }, 1000);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden h-screen flex relative">
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="xl:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ajouter un produit</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <img alt="Admin Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQfKpvkjDAvgMspnPXysho_eI53kK0kN0aepzGOVJtUsdV81ZQbn0J8_6qDQ38us-orytTCXDJmJj_5Vzp5B2WsT4KJ3845KE801nMsqTtaz0W3P21OAyDIBBU2W8FttoCVdpKG9Us-C4PWz_B2-wEKl5CmxM6d2k2ml-lwyGCz0MsLQbLq8JlbnN9ODKZVS2WQWvywGpiy2uYsEE4wIbAAX5vd3IDR242c6jnLwPmfVFi2qrENfF7oo0pa3VyGABNmtsbv69G3xo" />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Administrateur</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Créer un nouveau produit</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Remplissez les détails ci-dessous pour ajouter un nouveau produit au catalogue.</p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/admin" className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Annuler</Link>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 lg:p-8">
                                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Informations de base</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="productName">Nom du produit <span className="text-red-500">*</span></label>
                                                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm py-2.5" id="productName" placeholder="ex. Samsung 4K TV" required type="text" />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="category">Catégorie</label>
                                                <select value={categoryId} onChange={(e) => {
                                                    setCategoryId(e.target.value);
                                                    setSubcategoryId("");
                                                }} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm py-2.5" id="category">
                                                    <option disabled value="">Sélectionner une catégorie</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="subcategory">Sous-catégorie</label>
                                                <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} disabled={!categoryId || subcategories.length === 0} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm py-2.5 disabled:opacity-50" id="subcategory">
                                                    <option disabled value="">Sélectionner une sous-catégorie</option>
                                                    {subcategories.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="brand">Marque</label>
                                                <input value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm py-2.5" id="brand" list="brands" placeholder="ex. Samsung" type="text" />
                                                <datalist id="brands">
                                                    <option value="Samsung" />
                                                    <option value="LG" />
                                                    <option value="Sony" />
                                                    <option value="Dyson" />
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Prix et Inventaire</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="price">Prix (DA) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full pl-3 pr-12 shadow-sm py-2.5" id="price" min="0" placeholder="0.00" required step="0.01" type="number" />
                                                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-medium">DZD</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="originalPrice">Prix d'origine (DA)</label>
                                                <div className="relative">
                                                    <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full pl-3 pr-12 shadow-sm py-2.5" id="originalPrice" min="0" placeholder="0.00" step="0.01" type="number" />
                                                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-medium">DZD</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400">Définissez ceci pour afficher un prix avant réduction.</p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="stock">Quantité en stock <span className="text-red-500">*</span></label>
                                                <input value={stock} onChange={(e) => setStock(e.target.value)} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm py-2.5" id="stock" min="0" placeholder="0" required type="number" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Détails et Multimédia</h3>
                                        <div className="grid grid-cols-1 gap-6 items-start">
                                            <div className="flex flex-col gap-2 w-full max-w-full">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="description">Description du produit</label>
                                                <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 [&_.ql-container]:min-h-[160px] [&_.ql-container]:text-base [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 dark:[&_.ql-toolbar]:border-slate-700 [&_.ql-container]:border-none [&_.ql-toolbar]:flex [&_.ql-toolbar]:flex-wrap">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={description}
                                                        onChange={setDescription}
                                                        modules={{
                                                            toolbar: [
                                                                [{ 'header': [2, 3, false] }],
                                                                ['bold', 'italic', 'underline', 'strike'],
                                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                                ['link', 'image', 'video'],
                                                                ['clean']
                                                            ],
                                                        }}
                                                        placeholder="Description détaillée..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="specifications">Spécifications</label>
                                                <textarea value={specifications} onChange={(e) => setSpecifications(e.target.value)} className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm resize-none min-h-[160px]" id="specifications" placeholder="ex. Dimensions : 50x50x100..." rows={6}></textarea>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-2 w-full max-w-full">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Landing Page Content</label>
                                            <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 [&_.ql-container]:min-h-[250px] [&_.ql-container]:text-base [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 dark:[&_.ql-toolbar]:border-slate-700 [&_.ql-container]:border-none [&_.ql-toolbar]:flex [&_.ql-toolbar]:flex-wrap">
                                                <ReactQuill
                                                    forwardedRef={reactQuillRef}
                                                    theme="snow"
                                                    value={landingContent}
                                                    onChange={setLandingContent}
                                                    modules={quillModules}
                                                    placeholder="Rédigez le contenu riche de la landing page (HTML supporté)..."
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                💡 Astuce Vidéo : Utilisez un lien d'intégration (Embed) pour les vidéos, ex: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">https://www.youtube.com/embed/votre_code</code>
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <AdminImageUpload
                                                label="Landing Image"
                                                value={landingImage}
                                                onChange={setLandingImage}
                                                folder="landing"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-2">Cette image sera affichée directement sous la description du produit.</p>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <AdminMediaUpload media={media} onChange={setMedia} />
                                        </div>

                                        <div className="mt-6 flex flex-col gap-4">
                                            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Réseaux Sociaux (Landing Page)</label>
                                                    <button type="button" onClick={() => setSocialLinks([...socialLinks, { platform: "facebook", url: "" }])} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">add</span> Ajouter
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    {socialLinks.map((link, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <select
                                                                value={link.platform}
                                                                onChange={(e) => {
                                                                    const newLinks = [...socialLinks];
                                                                    newLinks[idx].platform = e.target.value;
                                                                    setSocialLinks(newLinks);
                                                                }}
                                                                className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                            >
                                                                <option value="facebook">Facebook</option>
                                                                <option value="instagram">Instagram</option>
                                                                <option value="tiktok">TikTok</option>
                                                                <option value="youtube">YouTube</option>
                                                                <option value="twitter">X (Twitter)</option>
                                                                <option value="linkedin">LinkedIn</option>
                                                                <option value="website">Site Web</option>
                                                            </select>
                                                            <input
                                                                value={link.url}
                                                                onChange={(e) => {
                                                                    const newLinks = [...socialLinks];
                                                                    newLinks[idx].url = e.target.value;
                                                                    setSocialLinks(newLinks);
                                                                }}
                                                                className="flex-1 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                placeholder="https://..."
                                                                type="url"
                                                            />
                                                            <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2">
                                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {socialLinks.length === 0 && (
                                                        <p className="text-xs text-slate-500 italic">Aucun lien social ajouté.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vidéos Intégrées (Landing Page)</label>
                                                    <button type="button" onClick={() => setVideos([...videos, { url: "" }])} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">add</span> Ajouter
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    {videos.map((video, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <input
                                                                value={video.url}
                                                                onChange={(e) => {
                                                                    const newVideos = [...videos];
                                                                    newVideos[idx].url = e.target.value;
                                                                    setVideos(newVideos);
                                                                }}
                                                                className="flex-1 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                placeholder="URL d'intégration (ex: https://www.youtube.com/embed/...)"
                                                                type="url"
                                                            />
                                                            <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2">
                                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {videos.length === 0 && (
                                                        <p className="text-xs text-slate-500 italic">Aucune vidéo ajoutée.</p>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400">Assurez-vous d'utiliser les liens "Embed" (intégration) fournis par YouTube, TikTok, etc.</p>
                                            </div>

                                            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Caractéristiques (Features Section)</label>
                                                    <button type="button" onClick={() => setFeatures([...features, { title: "", description: "", icon: "star" }])} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">add</span> Ajouter
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    {features.map((feature, idx) => (
                                                        <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative">
                                                            <button type="button" onClick={() => setFeatures(features.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                            </button>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                                                                <input
                                                                    value={feature.title}
                                                                    onChange={(e) => {
                                                                        const newFeatures = [...features];
                                                                        newFeatures[idx].title = e.target.value;
                                                                        setFeatures(newFeatures);
                                                                    }}
                                                                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                    placeholder="Titre de la caractéristique"
                                                                    type="text"
                                                                />
                                                                <input
                                                                    value={feature.icon}
                                                                    onChange={(e) => {
                                                                        const newFeatures = [...features];
                                                                        newFeatures[idx].icon = e.target.value;
                                                                        setFeatures(newFeatures);
                                                                    }}
                                                                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                    placeholder="Nom de l'icône Material (ex: verified, star, auto_awesome)"
                                                                    type="text"
                                                                />
                                                            </div>
                                                            <textarea
                                                                value={feature.description}
                                                                onChange={(e) => {
                                                                    const newFeatures = [...features];
                                                                    newFeatures[idx].description = e.target.value;
                                                                    setFeatures(newFeatures);
                                                                }}
                                                                className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm resize-none"
                                                                placeholder="Description courte de l'avantage..."
                                                                rows={2}
                                                            ></textarea>
                                                        </div>
                                                    ))}
                                                    {features.length === 0 && (
                                                        <p className="text-xs text-slate-500 italic">Aucune caractéristique ajoutée.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Témoignages Clients (Testimonials Section)</label>
                                                    <button type="button" onClick={() => setTestimonials([...testimonials, { name: "", role: "", content: "", rating: 5 }])} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">add</span> Ajouter
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    {testimonials.map((testi, idx) => (
                                                        <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative">
                                                            <button type="button" onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                            </button>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                                                                <input
                                                                    value={testi.name}
                                                                    onChange={(e) => {
                                                                        const newTestis = [...testimonials];
                                                                        newTestis[idx].name = e.target.value;
                                                                        setTestimonials(newTestis);
                                                                    }}
                                                                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                    placeholder="Nom du client"
                                                                    type="text"
                                                                />
                                                                <input
                                                                    value={testi.role}
                                                                    onChange={(e) => {
                                                                        const newTestis = [...testimonials];
                                                                        newTestis[idx].role = e.target.value;
                                                                        setTestimonials(newTestis);
                                                                    }}
                                                                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                    placeholder="Rôle / Ville (Optionnel)"
                                                                    type="text"
                                                                />
                                                                <select
                                                                    value={testi.rating}
                                                                    onChange={(e) => {
                                                                        const newTestis = [...testimonials];
                                                                        newTestis[idx].rating = parseInt(e.target.value);
                                                                        setTestimonials(newTestis);
                                                                    }}
                                                                    className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary shadow-sm py-2"
                                                                >
                                                                    <option value={5}>5 Étoiles</option>
                                                                    <option value={4}>4 Étoiles</option>
                                                                    <option value={3}>3 Étoiles</option>
                                                                    <option value={2}>2 Étoiles</option>
                                                                    <option value={1}>1 Étoiles</option>
                                                                </select>
                                                            </div>
                                                            <textarea
                                                                value={testi.content}
                                                                onChange={(e) => {
                                                                    const newTestis = [...testimonials];
                                                                    newTestis[idx].content = e.target.value;
                                                                    setTestimonials(newTestis);
                                                                }}
                                                                className="rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-primary focus:border-primary w-full shadow-sm resize-none"
                                                                placeholder="Avis du client..."
                                                                rows={2}
                                                            ></textarea>
                                                        </div>
                                                    ))}
                                                    {testimonials.length === 0 && (
                                                        <p className="text-xs text-slate-500 italic">Aucun témoignage ajouté.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Images du produit</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                                                    {/* Main Image */}
                                                    <AdminImageUpload
                                                        label="Image principale"
                                                        value={imageUrl}
                                                        onChange={setImageUrl}
                                                    />

                                                    {/* Gallery Images */}
                                                    {images.map((img, idx) => (
                                                        <AdminImageUpload
                                                            key={idx}
                                                            label={`Image ${idx + 2}`}
                                                            value={img}
                                                            onChange={(newUrl) => {
                                                                const newImages = [...images];
                                                                if (newUrl === "") {
                                                                    // If deleted, remove from array
                                                                    setImages(images.filter((_, i) => i !== idx));
                                                                } else {
                                                                    newImages[idx] = newUrl;
                                                                    setImages(newImages);
                                                                }
                                                            }}
                                                        />
                                                    ))}

                                                    {/* Add Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setImages([...images, ""])}
                                                        className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all bg-slate-50 dark:bg-slate-900"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">add</span>
                                                        <span className="text-[10px] mt-2 font-medium uppercase tracking-tight">Nouvelle image</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-slate-100 dark:border-slate-700">
                                        <button className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" type="button" onClick={() => router.push('/admin')}>
                                            Annuler
                                        </button>
                                        <button disabled={isLoading} className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100" type="submit">
                                            {isLoading ? (
                                                <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[20px]">save</span>
                                            )}
                                            {isLoading ? 'Enregistrement...' : 'Enregistrer le produit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <footer className="mt-12 text-center text-xs text-slate-400 pb-4">
                        <p>© 2026 Panneau d'administration Electro Mart. Tous droits réservés.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
