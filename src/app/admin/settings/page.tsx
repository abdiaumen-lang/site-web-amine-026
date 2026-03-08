"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSettings, WebsiteSettings } from "@/context/SettingsContext";
import AdminSidebar from "@/components/AdminSidebar";
import { FONT_OPTIONS } from "@/components/ThemeInjector";

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
    const [telegramBotToken, setTelegramBotToken] = useState<string>("");
    const [telegramChatId, setTelegramChatId] = useState<string>("");
    const [mapsEmbedUrl, setMapsEmbedUrl] = useState<string>("");
    const [mapsStoreImageUrl, setMapsStoreImageUrl] = useState<string>("");
    const [mapsStoreName, setMapsStoreName] = useState<string>("");
    const [mapsStoreAddress, setMapsStoreAddress] = useState<string>("");
    const [isUploadingStoreImage, setIsUploadingStoreImage] = useState(false);

    const [contactPhone, setContactPhone] = useState<string>("");
    const [contactEmail, setContactEmail] = useState<string>("");
    const [socialFacebook, setSocialFacebook] = useState<string>("");
    const [socialInstagram, setSocialInstagram] = useState<string>("");
    const [socialTiktok, setSocialTiktok] = useState<string>("");
    const [socialYoutube, setSocialYoutube] = useState<string>("");
    const [socialTwitter, setSocialTwitter] = useState<string>("");
    const [themePrimaryColor, setThemePrimaryColor] = useState<string>("#FF6B00");
    const [themeFontFamily, setThemeFontFamily] = useState<string>("Inter");
    const [menuBgColor, setMenuBgColor] = useState<string>("#1a1525");
    const [topBarText, setTopBarText] = useState<string>("");

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
            setTelegramBotToken(settings.telegram_bot_token || "");
            setTelegramChatId(settings.telegram_chat_id || "");
            setMapsEmbedUrl(settings.maps_embed_url || "");
            setMapsStoreImageUrl(settings.maps_store_image_url || "");
            setMapsStoreName(settings.maps_store_name || "");
            setMapsStoreAddress(settings.maps_store_address || "");
            setContactPhone(settings.contact_phone || "");
            setContactEmail(settings.contact_email || "");
            setSocialFacebook(settings.social_facebook || "");
            setSocialInstagram(settings.social_instagram || "");
            setSocialTiktok(settings.social_tiktok || "");
            setSocialYoutube(settings.social_youtube || "");
            setSocialTwitter(settings.social_twitter || "");
            setThemePrimaryColor(settings.theme_primary_color || "#FF6B00");
            setThemeFontFamily(settings.theme_font_family || "Inter");
            setMenuBgColor(settings.menu_bg_color || "#1a1525");
            setTopBarText(settings.top_bar_text || "");
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
                telegram_bot_token: telegramBotToken || null,
                telegram_chat_id: telegramChatId || null,
                maps_embed_url: mapsEmbedUrl || null,
                maps_store_image_url: mapsStoreImageUrl || null,
                maps_store_name: mapsStoreName || null,
                maps_store_address: mapsStoreAddress || null,
                contact_phone: contactPhone || null,
                contact_email: contactEmail || null,
                social_facebook: socialFacebook || null,
                social_instagram: socialInstagram || null,
                social_tiktok: socialTiktok || null,
                social_youtube: socialYoutube || null,
                social_twitter: socialTwitter || null,
                theme_primary_color: themePrimaryColor,
                theme_font_family: themeFontFamily,
                menu_bg_color: menuBgColor,
                top_bar_text: topBarText || null,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("website_settings")
                .upsert(updates, { onConflict: "id" });

            if (error) {
                if (error.message.includes("does not exist") && (error.message.includes("telegram_bot_token") || error.message.includes("telegram_chat_id"))) {
                    throw new Error("Pour sauvegarder les paramètres Telegram, vous DEVEZ d'abord exécuter le script SQL dans Supabase (add_telegram_to_settings.sql). Les colonnes sont absentes dans la base de données !");
                }
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

                        {/* Top Bar / Marquee Text Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-[#FF6600]/10 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#FF6600]">breaking_news</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bandeau défilant</h2>
                                        <p className="text-sm text-slate-500">Le texte qui défile en haut du site (barre orange).</p>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <div className="bg-[#FF6600] text-white text-xs font-bold py-2 overflow-hidden whitespace-nowrap">
                                        <div className="animate-marquee-smooth">
                                            <span className="px-8">
                                                {topBarText || "🚀 Livraison offerte à Alger à partir de 50 000 DA ! | 📞 Contactez-nous : +213 555 123 456 | 🏷️ Offres spéciales sur l'électroménager cette semaine !"}
                                            </span>
                                            <span className="px-8">
                                                {topBarText || "🚀 Livraison offerte à Alger à partir de 50 000 DA ! | 📞 Contactez-nous : +213 555 123 456 | 🏷️ Offres spéciales sur l'électroménager cette semaine !"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center py-1 bg-slate-50 dark:bg-slate-900">Aperçu en direct</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Texte du bandeau</label>
                                    <textarea
                                        value={topBarText}
                                        onChange={(e) => setTopBarText(e.target.value)}
                                        placeholder="🚀 Livraison offerte à Alger à partir de 50 000 DA ! | 📞 Contactez-nous : +213 555 123 456"
                                        rows={3}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary resize-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Utilisez le symbole <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">|</code> pour séparer les messages. Ajoutez des emojis pour rendre le texte plus attrayant. Laissez vide pour utiliser le texte par défaut.</p>
                                </div>
                            </div>
                        </div>

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

                                {/* Telegram Configuration Section */}
                                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                                Notifications Telegram
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-1">Recevez une notification instantanée sur Telegram à chaque nouvelle commande.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bot Token</label>
                                                <input
                                                    type="text"
                                                    value={telegramBotToken}
                                                    onChange={(e) => setTelegramBotToken(e.target.value)}
                                                    placeholder="ex: 123456789:ABCdefGHIjklmNOPqrstUVWxyz"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-[#0088cc] focus:border-[#0088cc] font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Chat ID</label>
                                                <input
                                                    type="text"
                                                    value={telegramChatId}
                                                    onChange={(e) => setTelegramChatId(e.target.value)}
                                                    placeholder="ex: -1001234567890 ou 12345678"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-[#0088cc] focus:border-[#0088cc] font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-sm shrink-0">info</span>
                                            <span>
                                                Utilisez <strong>@BotFather</strong> sur Telegram pour créer un bot et obtenir le Token. Pour trouver votre Chat ID, envoyez un message à votre bot, puis accédez à <code>https://api.telegram.org/bot[VOTRE_TOKEN]/getUpdates</code>.
                                            </span>
                                        </p>
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
                                                    <li>Choisissez l&apos;onglet <strong>&quot;Intégrer une carte&quot;</strong></li>
                                                    <li>Copiez <strong>tout le code iframe</strong> ou <strong>uniquement le lien dans</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">src=&quot;...&quot;</code></li>
                                                </ol>
                                                <p className="text-green-700 dark:text-green-400 font-medium">✅ Vous pouvez coller le code iframe complet — l&apos;URL sera extraite automatiquement !</p>
                                                <p className="text-red-600 dark:text-red-400 font-medium">❌ Mauvais lien: <code className="bg-red-100 dark:bg-red-900 px-1 rounded">https://maps.app.goo.gl/...</code></p>
                                            </div>

                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">map</span>
                                                <textarea
                                                    value={mapsEmbedUrl}
                                                    onChange={(e) => {
                                                        let val = e.target.value.trim();
                                                        // Auto-extract src URL from pasted iframe code
                                                        const srcMatch = val.match(/src=["']([^"']+)["']/);
                                                        if (srcMatch && srcMatch[1]) {
                                                            val = srcMatch[1];
                                                        }
                                                        // Clean up any trailing HTML attributes that may have been pasted
                                                        const quoteIdx = val.indexOf('"');
                                                        if (quoteIdx > 0 && val.startsWith('http')) {
                                                            val = val.substring(0, quoteIdx);
                                                        }
                                                        setMapsEmbedUrl(val);
                                                    }}
                                                    placeholder="Collez ici le code iframe complet ou l'URL: https://www.google.com/maps/embed?pb=..."
                                                    rows={3}
                                                    className={`w-full rounded-xl border bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary resize-none ${mapsEmbedUrl && !mapsEmbedUrl.includes('google.com/maps/embed')
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
                                                    height="400"
                                                    style={{ border: 0, minHeight: '400px' }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    className="block w-full"
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

                                {/* Theme Colors & Font Section */}
                                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">🎨 Thème &amp; Apparence</h2>
                                        <p className="text-sm text-slate-500 mt-1">Personnalisez la couleur principale et la police du site.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Color Picker */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Couleur principale</label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={themePrimaryColor}
                                                        onChange={(e) => setThemePrimaryColor(e.target.value)}
                                                        className="w-16 h-12 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                                        <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: themePrimaryColor }} />
                                                        <input
                                                            type="text"
                                                            value={themePrimaryColor}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setThemePrimaryColor(v);
                                                            }}
                                                            placeholder="#FF6B00"
                                                            maxLength={7}
                                                            className="flex-1 text-sm font-mono bg-transparent text-slate-600 dark:text-slate-400 focus:outline-none w-24"
                                                        />
                                                    </div>
                                                    {/* Quick presets */}
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {['#FF6B00', '#E11D48', '#7C3AED', '#2563EB', '#059669', '#D97706', '#0F172A', '#64748B'].map(c => (
                                                            <button key={c} type="button" onClick={() => setThemePrimaryColor(c)}
                                                                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${themePrimaryColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                                                                style={{ backgroundColor: c }} title={c}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">Change la couleur de tous les boutons, liens et éléments actifs du site.</p>
                                        </div>
                                        {/* Font Picker */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Police de caractères</label>
                                            <div className="space-y-2">
                                                <select
                                                    value={themeFontFamily}
                                                    onChange={(e) => setThemeFontFamily(e.target.value)}
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                                                >
                                                    {FONT_OPTIONS.map(f => (
                                                        <option key={f.value} value={f.value}>{f.label}</option>
                                                    ))}
                                                </select>
                                                {/* Preview */}
                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                                    <p className="text-xs text-slate-500 mb-1">Aperçu:</p>
                                                    <p className="text-slate-900 dark:text-white text-sm font-medium" style={{ fontFamily: FONT_OPTIONS.find(f => f.value === themeFontFamily)?.css || 'inherit' }}>
                                                        Electro Mart — Votre boutique en Algérie
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">S&apos;applique à tout le texte du site (titres, paragraphes, boutons).</p>
                                        </div>
                                    </div>

                                    {/* Menu Background Color */}
                                    <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Couleur de fond du menu mobile
                                        </label>
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={menuBgColor}
                                                    onChange={(e) => setMenuBgColor(e.target.value)}
                                                    className="w-16 h-12 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-transparent p-0.5"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                                    <div className="w-5 h-5 rounded-md shrink-0 border border-white/20" style={{ backgroundColor: menuBgColor }} />
                                                    <input
                                                        type="text"
                                                        value={menuBgColor}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setMenuBgColor(v);
                                                        }}
                                                        placeholder="#1a1525"
                                                        maxLength={7}
                                                        className="flex-1 text-sm font-mono bg-transparent text-slate-600 dark:text-slate-400 focus:outline-none w-24"
                                                    />
                                                </div>
                                                {/* Quick presets */}
                                                <div className="flex gap-2 flex-wrap">
                                                    {[
                                                        { color: '#1a1525', label: 'Défaut (sombre)' },
                                                        { color: '#0f172a', label: 'Bleu nuit' },
                                                        { color: '#1e1b4b', label: 'Violet sombre' },
                                                        { color: '#0a0a0a', label: 'Noir' },
                                                        { color: '#1c2632', label: 'Ardoise' },
                                                        { color: '#ffffff', label: 'Blanc' },
                                                        { color: '#f8f7f6', label: 'Crème' },
                                                        { color: '#111827', label: 'Gris sombre' },
                                                    ].map(({ color, label }) => (
                                                        <button key={color} type="button" onClick={() => setMenuBgColor(color)} title={label}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${menuBgColor === color ? 'border-primary scale-110' : 'border-slate-300 dark:border-slate-700'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Mini preview */}
                                            <div className="shrink-0 w-28 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md" style={{ backgroundColor: menuBgColor }}>
                                                <div className="p-2 border-b border-white/10">
                                                    <span className="text-white text-[10px] font-bold">Nos univers</span>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {['Cuisine', 'TV & Son', 'Beauté'].map(n => (
                                                        <div key={n} className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded bg-white/20 shrink-0" />
                                                            <span className="text-white/80 text-[9px]">{n}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Personnalise la couleur de fond du tiroir de navigation sur mobile.</p>
                                    </div>
                                </div>

                                {/* Contact & Social Section */}
                                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact &amp; Réseaux Sociaux</h2>
                                        <p className="text-sm text-slate-500 mt-1">Ces informations s&apos;affichent dans le menu mobile en bas de l&apos;écran.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Numéro de Téléphone</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">phone</span>
                                                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+213 770 06 16 12"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse Email</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                                                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@electromart.dz"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* Facebook */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Facebook (URL)</label>
                                            <div className="relative">
                                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                                                <input type="url" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/votrepage"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* Instagram */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instagram (URL)</label>
                                            <div className="relative">
                                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                                                <input type="url" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/votrepage"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* TikTok */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">TikTok (URL)</label>
                                            <div className="relative">
                                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                                                <input type="url" value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/@votrepage"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* YouTube */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">YouTube (URL)</label>
                                            <div className="relative">
                                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
                                                <input type="url" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/@votrechaine"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        {/* Twitter/X */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Twitter / X (URL)</label>
                                            <div className="relative">
                                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                                                <input type="url" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} placeholder="https://x.com/votrepage"
                                                    className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary" />
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
