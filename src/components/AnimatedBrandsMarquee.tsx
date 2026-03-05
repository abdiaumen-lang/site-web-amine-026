"use client";

import { useEffect, useState } from 'react';

// Animation defined in global CSS or inline styles below
// We'll use inline styles for the keyframes to keep it self-contained

interface Brand {
    id: string;
    image_url: string;
    name: string | null;
    width: number;
    height: number;
}

export default function AnimatedBrandsMarquee() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                // Fetch directly from our API route
                const res = await fetch('/api/admin/brands');
                if (res.ok) {
                    const data = await res.json();
                    setBrands(data.brands || []);
                }
            } catch (error) {
                console.error("Failed to fetch brands", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrands();
    }, []);

    if (isLoading || brands.length === 0) {
        return null; // Don't render anything if empty or loading to avoid layout shift
    }

    // We duplicate the array to create the infinite scroll illusion seamlessly
    // The CSS animation will translate -50% of the total width
    const marqueeContent = [...brands, ...brands];

    return (
        <section className="w-full py-8 md:py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 overflow-hidden relative">
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: scroll 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="max-w-[1440px] mx-auto px-4 mb-6">
                <h3 className="text-center text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    Nos Marques Partenaires
                </h3>
            </div>

            {/* Gradient masks for smooth fade effect on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>

            <div className="flex overflow-hidden group py-4">
                <div className="animate-marquee flex gap-16 md:gap-32 items-center px-8">
                    {marqueeContent.map((brand, idx) => (
                        <div
                            key={`${brand.id}-${idx}`}
                            className="flex flex-col items-center justify-center gap-3 transition-transform hover:scale-110 duration-300 drop-shadow-sm filter grayscale hover:grayscale-0 shrink-0"
                            title={brand.name || "Marque Partenaire"}
                        >
                            <img
                                src={brand.image_url}
                                alt={brand.name || "Brand logo"}
                                loading="lazy"
                                className="object-contain mix-blend-multiply dark:mix-blend-normal"
                                style={{
                                    width: `${Math.min(brand.width, 150)}px`,
                                    height: `${Math.min(brand.height, 80)}px`
                                }}
                            />
                            {brand.name && (
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    {brand.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
