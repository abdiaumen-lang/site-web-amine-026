"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useSettings } from "@/context/SettingsContext";

export default function HomeFooter() {
    const { settings } = useSettings();
    const mapsEmbedUrl = settings?.maps_embed_url;

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-10">

            {/* Google Maps Section — only shown if URL is configured */}
            {mapsEmbedUrl && (
                <div className="w-full border-b border-slate-100 dark:border-slate-800">
                    <div className="max-w-[1440px] mx-auto px-4 lg:px-10 pt-10 pb-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">Notre Magasin</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Venez nous rendre visite</p>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm mb-[-1px]">
                            <iframe
                                src={mapsEmbedUrl}
                                width="100%"
                                height="380"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Notre localisation sur Google Maps"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-4">
                        <Logo />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Votre partenaire de confiance pour l&apos;électroménager de haute qualité en Algérie. Vivez le confort et l&apos;innovation chez vous.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Service Client</h4>
                        <ul className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link className="hover:text-primary transition-colors" href="#">Centre d&apos;Aide</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Retours &amp; Remboursements</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Informations de Livraison</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Suivre ma commande</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Catégories</h4>
                        <ul className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link className="hover:text-primary transition-colors" href="#">Machine à café</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Cuisine et cuisson</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Maison &amp; Entretien</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Beauté &amp; Santé</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="#">Informatique &amp; Tablettes</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contactez-nous</h4>
                        <ul className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                Alger, Algérie
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">call</span>
                                <a href="tel:+213770061612" className="hover:underline hover:text-primary transition-colors">+213 770 06 16 12</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                support@electromart.dz
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">© 2026 Electromart. Tous droits réservés.</p>
                    <div className="flex gap-4">
                        <Link className="text-slate-400 hover:text-primary text-xs font-medium" href="#">Facebook</Link>
                        <Link className="text-slate-400 hover:text-primary text-xs font-medium" href="#">Instagram</Link>
                        <Link className="text-slate-400 hover:text-primary text-xs font-medium" href="#">Twitter</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
