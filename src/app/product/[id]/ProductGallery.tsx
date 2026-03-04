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
        <div className="flex flex-col gap-4">
            <div className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group">
                <img
                    src={mainImage}
                    alt={productName}
                    className="w-full h-full object-contain md:group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {galleryImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(img)}
                            className={`relative aspect-square w-24 flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl p-2 border-2 transition-all ${mainImage === img
                                ? 'border-primary'
                                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                className="w-full h-full object-contain"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
