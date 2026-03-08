"use client";

import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
    fallbackImage: string;
    productName: string;
}

export default function ProductGallery({ images, fallbackImage, productName }: ProductGalleryProps) {
    // If no images array provided, fallback to the single image
    const galleryImages = images && images.length > 0 ? images : [fallbackImage];
    const [mainImage, setMainImage] = useState(galleryImages[0]);

    return (
        <div className="flex flex-col gap-6">
            <div className="aspect-[4/3] sm:aspect-square bg-slate-50/80 dark:bg-slate-900/50 rounded-3xl p-6 sm:p-10 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center relative overflow-hidden group shadow-inner">
                <img
                    src={mainImage}
                    alt={productName}
                    className="w-full h-full object-contain md:group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Decorative gradients */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {galleryImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-smooth">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(img)}
                            className={`relative aspect-square w-20 sm:w-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-2 sm:p-3 transition-all duration-300 shadow-sm overflow-hidden group/thumb ${mainImage === img
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 border-transparent shadow-primary/20 scale-105'
                                : 'border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${productName} vue ${idx + 1}`}
                                className={`w-full h-full object-contain transition-transform duration-300 ${mainImage !== img ? 'group-hover/thumb:scale-110' : ''}`}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
