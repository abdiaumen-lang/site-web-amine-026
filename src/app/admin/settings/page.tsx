"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSettings, WebsiteSettings } from "@/context/SettingsContext";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminSettingsPage() {
    const { settings, refreshSettings } = useSettings();
    const router = useRouter();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoWidth, setLogoWidth] = useState<number>(40);
    const [logoHeight, setLogoHeight] = useState<number>(40);
    const [logoPosition, setLogoPosition] = useState<"left" | "center" | "right">("left");
    const [logoUrl, setLogoUrl] = useState<string>("");

    const [whatsappNumber, setWhatsappNumber] = useState<string>("+213770061612");
    const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
    const [whatsappPosition, setWhatsappPosition] = useState<string>("bottom-right");
    const [whatsappOffsetX, setWhatsappOffsetX] = useState<number>(24);
    const [whatsappOffsetY, setWhatsappOffsetY] = useState<number>(24);
    const [mapsEmbedUrl, setMapsEmbedUrl] = useState<string>("");
    const [mapsStoreImageUrl, setMapsStoreImageUrl] = useState<string>("");
    const [mapsStoreName, setMapsStoreName] = useState<string>("");
    const [mapsStoreAddress, setMapsStoreAddress] = useState<string>("");
    const [isUploadingStoreImage, setIsUploadingStoreImage] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Load initial form states once settings are fetched
    useEffect(() => {
        if (settings) {
            setLogoWidth(settings.logo_width || 40);
            setLogoHeight(settings.logo_height || 40);
            setLogoPosition(settings.logo_position || "left");
            setLogoUrl(settings.logo_url || "");
            setWhatsappNumber(settings.whatsapp_number || "+213770061612");
            setWhatsappEnabled(settings.whatsapp_enabled ?? true);
            setWhatsappPosition(settings.whatsapp_position || "bottom-right");
            setWhatsappOffsetX(settings.whatsapp_offset_x || 24);
            setWhatsappOffsetY(settings.whatsapp_offset_y || 24);
            setMapsEmbedUrl(settings.maps_embed_url || "");
            setMapsStoreImageUrl(settings.maps_store_image_url || "");
            setMapsStoreName(settings.maps_store_name || "");
            setMapsStoreAddress(settings.maps_store_address || "");
        }
    }, [settings]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setErrorMessage("");

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("Veuillez sélectionner une image à télécharger.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            if (data?.publicUrl) {
                setLogoUrl(data.publicUrl);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveSettings = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const updates = {
                id: 1, // Fixed ID constraint
                logo_url: logoUrl || null,
                logo_width: logoWidth,
                logo_height: logoHeight,
                logo_position: logoPosition,
                whatsapp_number: whatsappNumber,
                whatsapp_enabled: whatsappEnabled,
                whatsapp_position: whatsappPosition,
                whatsapp_offset_x: whatsappOffsetX,
                whatsapp_offset_y: whatsappOffsetY,
                maps_embed_url: mapsEmbedUrl || null,
                maps_store_image_url: mapsStoreImageUrl || null,
                maps_store_name: mapsStoreName || null,
                maps_store_address: mapsStoreAddress || null,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("website_settings")
                .upsert(updates, { onConflict: "id" });

            if (error) {
                throw error;
            }

            setSuccessMessage("Paramètres enregistrés avec succès!");
            await refreshSettings();

            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const handleDeleteLogo = async () => {
        setLogoUrl("");
        const updates = {
            id: 1,
            logo_url: null,
            logo_width: logoWidth,
            logo_height: logoHeight,
            logo_position: logoPosition,
            whatsapp_number: whatsappNumber,
            whatsapp_enabled: whatsappEnabled,
            whatsapp_position: whatsappPosition,
            whatsapp_offset_x: whatsappOffsetX,
            whatsapp_offset_y: whatsappOffsetY,
            updated_at: new Date().toISOString(),
        };

        try {
            const { error } = await supabase
                .from("website_settings")
                .upsert(updates, { onConflict: "id" });

            if (error) throw error;
            await refreshSettings();
            setSuccessMessage("Logo supprimé.");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
            <AdminSidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Mobile Header */}
                <div className="xl:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FF6600] rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-black text-xl leading-none lowercase mt-0.5">e</span>
                        </div>
                        <span className="font-black text-[22px] tracking-tight text-[#FF6600] leading-none lowercase">electromart</span>
                    </div>
                    <button className="text-text-primary-light dark:text-text-primary-dark" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Paramètres du Site</h1>
                            <p className="text-slate-600 dark:text-slate-400">Gérez l'apparence de la navbar et le logo du site.</p>
                        </div>

                        {successMessage && (
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined">check_circle</span>
                                <p>{successMessage}</p>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined">error</span>
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 md:p-8 space-y-8">

                                {/* Logo Upload Section */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Logo du site</h2>

                                    <div className="flex flex-col md:flex-row gap-8 items-start">

                                        {/* Preview Area */}
                                        <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                            {logoUrl ? (
                                                <div className="relative group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={logoUrl}
                                                        alt="Logo preview"
                                                        className="object-contain"
                                                        style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}
                                                    />
                                                    <button
                                                        onClick={handleDeleteLogo}
                                                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        title="Supprimer le logo"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-400 flex flex-col items-center">
                                                    <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                                    <span className="text-sm">Aucun logo personnalisé</span>
                                                    <span className="text-xs mt-1">Logo par défaut actif</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Controls Area */}
                                        <div className="w-full md:w-2/3 space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Télécharger une nouvelle image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                    className="block w-full text-sm text-slate-500
                                                        file:mr-4 file:py-2.5 file:px-4
                                                        file:rounded-xl file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-primary/10 file:text-primary
                                                        hover:file:bg-primary/20 transition-all
                                                        file:cursor-pointer disabled:opacity-50"
                                                />
                                                {uploading && <p className="text-sm text-primary mt-2 flex items-center gap-2"><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Téléchargement en cours...</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Largeur (px)</label>
                                                    <input
                                                        type="number"
                                                        min="20" max="500"
                                                        value={logoWidth}
                                                        onChange={(e) => setLogoWidth(parseInt(e.target.value) || 40)}
                                                        className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Hauteur (px)</label>
                                                    <input
                                                        type="number"
                                                        min="20" max="500"
                                                        value={logoHeight}
                                                        onChange={(e) => setLogoHeight(parseInt(e.target.value) || 40)}
                                                        className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Position sur la Navbar</label>
                                                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                                    {(['left', 'center', 'right'] as const).map((pos) => (
                                                        <button
                                                            key={pos}
                                                            onClick={() => setLogoPosition(pos)}
                                                            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${logoPosition === pos
                                                                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white'
                                                                }`}
                                                        >
                                                            {pos === 'left' ? 'Gauche' : pos === 'center' ? 'Milieu' : 'Droite'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">Remarque : la position milieu supprime temporairement la barre de recherche sur de de petits écrans.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp Configuration Section */}
                                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configuration WhatsApp</h2>
                                            <p className="text-sm text-slate-500 mt-1">Gérez le bouton flottant WhatsApp sur votre site.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {whatsappEnabled ? "Activé" : "Désactivé"}
                                            </span>
                                            <button
                                                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${whatsappEnabled ? "bg-[#25D366]" : "bg-slate-300 dark:bg-slate-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${whatsappEnabled ? "translate-x-6" : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Numéro WhatsApp (avec code pays)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#25D366] font-bold">WA</span>
                                                    <input
                                                        type="text"
                                                        value={whatsappNumber}
                                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                                        placeholder="+213770061612"
                                                        className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-12 pr-4 py-2.5 text-sm focus:ring-[#25D366] focus:border-[#25D366]"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">Example: +213770061612 (sans espaces)</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Position du bouton</label>
                                                <select
                                                    value={whatsappPosition}
                                                    onChange={(e) => setWhatsappPosition(e.target.value)}
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                >
                                                    <option value="bottom-right">En bas à droite</option>
                                                    <option value="bottom-left">En bas à gauche</option>
                                                    <option value="top-right">En haut à droite</option>
                                                    <option value="top-left">En haut à gauche</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Décalage X (px)</label>
                                                    <input
                                                        type="number"
                                                        min="0" max="200"
                                                        value={whatsappOffsetX}
                                                        onChange={(e) => setWhatsappOffsetX(parseInt(e.target.value) || 0)}
                                                        className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Décalage Y (px)</label>
                                                    <input
                                                        type="number"
                                                        min="0" max="200"
                                                        value={whatsappOffsetY}
                                                        onChange={(e) => setWhatsappOffsetY(parseInt(e.target.value) || 0)}
                                                        className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    Le bouton WhatsApp permet à vos clients de vous contacter instantanément. Assurez-vous d'inclure l'indicatif pays sans le signe + (ex: 213 pour l'Algérie) si vous rencontrez des problèmes de lien.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Google Maps Section */}
                                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Localisation (Google Maps)</h2>
                                        <p className="text-sm text-slate-500 mt-1">Ajoutez l'URL d'intégration Google Maps pour afficher votre emplacement sur la page d'accueil.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">URL d'intégration Google Maps (iframe src)</label>

                                            {/* Step-by-step guide */}
                                            <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 space-y-2">
                                                <p className="font-bold text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">info</span> Comment obtenir le bon lien :</p>
                                                <ol className="list-decimal pl-5 space-y-1.5">
                                                    <li>Ouvrez <strong>Google Maps</strong> sur votre ordinateur</li>
                                                    <li>Recherchez votre adresse/magasin</li>
                                                    <li>Cliquez sur <strong>Partager</strong> (Share)</li>
                                                    <li>Choisissez l'onglet <strong>"Intégrer une carte"</strong></li>
                                                    <li>Copiez <strong>uniquement le lien dans</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">src="..."</code></li>
                                                </ol>
                                                <p className="text-green-700 dark:text-green-400 font-medium">✅ Bon lien: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">https://www.google.com/maps/embed?pb=...</code></p>
                                                <p className="text-red-600 dark:text-red-400 font-medium">❌ Mauvais lien: <code className="bg-red-100 dark:bg-red-900 px-1 rounded">https://maps.app.goo.gl/...</code></p>
                                            </div>

                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">map</span>
                                                <input
                                                    type="url"
                                                    value={mapsEmbedUrl}
                                                    onChange={(e) => setMapsEmbedUrl(e.target.value)}
                                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                                    className={`w-full rounded-xl border bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary ${mapsEmbedUrl && !mapsEmbedUrl.includes('google.com/maps/embed')
                                                            ? 'border-red-400 focus:ring-red-400'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                        }`}
                                                />
                                            </div>

                                            {/* Validation warning */}
                                            {mapsEmbedUrl && !mapsEmbedUrl.includes('google.com/maps/embed') && (
                                                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-xs">
                                                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                                                    <div>
                                                        <p className="font-bold">Lien incorrect détecté !</p>
                                                        <p>Ce lien est un lien de partage. Il ne fonctionnera pas dans l'iframe. Suivez les étapes ci-dessus pour obtenir le bon lien <strong>"Intégrer une carte"</strong>.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {mapsEmbedUrl && mapsEmbedUrl.includes('google.com/maps/embed') && (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold text-slate-500 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                                                    Prévisualisation
                                                </p>
                                                <iframe
                                                    src={mapsEmbedUrl}
                                                    width="100%"
                                                    height="250"
                                                    style={{ border: 0 }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    className="block"
                                                />
                                            </div>
                                        )}

                                        {/* Store Info */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Informations du Magasin (affichées à côté de la carte)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Photo du Magasin</label>
                                                    <div className="flex items-center gap-3">
                                                        {mapsStoreImageUrl ? (
                                                            <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-slate-200">
                                                                <img src={mapsStoreImageUrl} alt="Store" className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => setMapsStoreImageUrl("")} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full size-5 flex items-center justify-center shadow-md">
                                                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="size-16 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                                                <span className="material-symbols-outlined text-[20px]">store</span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                disabled={isUploadingStoreImage}
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    setIsUploadingStoreImage(true);
                                                                    try {
                                                                        const fileExt = file.name.split('.').pop();
                                                                        const filePath = `store/store_photo_${Date.now()}.${fileExt}`;
                                                                        const { error: uploadError } = await supabase.storage.from("landing_media").upload(filePath, file, { cacheControl: '3600', upsert: false });
                                                                        if (uploadError) throw uploadError;
                                                                        const { data } = supabase.storage.from("landing_media").getPublicUrl(filePath);
                                                                        setMapsStoreImageUrl(data.publicUrl);
                                                                    } catch (err: any) {
                                                                        setErrorMessage(err.message);
                                                                    } finally {
                                                                        setIsUploadingStoreImage(false);
                                                                    }
                                                                }}
                                                                className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                                                            />
                                                            {isUploadingStoreImage && <p className="text-xs text-primary mt-1 animate-pulse">Téléchargement...</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom du Magasin</label>
                                                        <input
                                                            type="text"
                                                            value={mapsStoreName}
                                                            onChange={(e) => setMapsStoreName(e.target.value)}
                                                            placeholder="ex: ElectroMart Alger"
                                                            className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse du Magasin</label>
                                                        <textarea
                                                            value={mapsStoreAddress}
                                                            onChange={(e) => setMapsStoreAddress(e.target.value)}
                                                            placeholder="ex: 12 Rue Didouche Mourad, Alger"
                                                            rows={2}
                                                            className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                    <button
                                        onClick={handleSaveSettings}
                                        className="bg-primary hover:bg-[#e55c00] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        Enregistrer les modifications
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
