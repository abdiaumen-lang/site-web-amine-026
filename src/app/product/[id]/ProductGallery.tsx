"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ProductGalleryProps {
    images: string[];
    fallbackImage: string;
    productName: string;
}

export default function ProductGallery({ images, fallbackImage, productName }: ProductGalleryProps) {
    const galleryImages = images && images.length > 0 ? images : [fallbackImage];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    // Prevent scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isFullscreen]);

    const FullscreenViewer = () => {
        if (!isFullscreen) return null;
        return createPortal(
            <div
                className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
                onClick={() => setIsFullscreen(false)}
            >
                <div className="absolute top-6 right-6 flex gap-4">
                    <button
                        className="size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                        onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="relative w-full max-w-5xl aspect-square flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 z-10 size-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl">chevron_left</span>
                    </button>

                    <img
                        src={galleryImages[currentIndex]}
                        alt={productName}
                        className="max-w-full max-h-[85vh] object-contain select-none"
                    />

                    <button
                        onClick={nextImage}
                        className="absolute right-4 z-10 size-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl">chevron_right</span>
                    </button>
                </div>

                <div className="mt-8 flex gap-3 overflow-x-auto max-w-full px-4 items-center">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === idx ? 'border-primary' : 'border-white/20 opacity-50'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                    ))}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-white dark:bg-slate-900/10 flex items-center justify-center overflow-hidden group">
                {/* Main image */}
                <img
                    src={galleryImages[currentIndex]}
                    alt={productName}
                    className="w-full h-full object-contain md:group-hover:scale-105 transition-transform duration-700 ease-out z-10 cursor-zoom-in"
                    onClick={() => setIsFullscreen(true)}
                />

                {/* Navigation Arrows */}
                {galleryImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-700 shadow-lg"
                            aria-label="Previous image"
                        >
                            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-700 shadow-lg"
                            aria-label="Next image"
                        >
                            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                        </button>
                    </>
                )}

                {/* Zoom indicator */}
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute bottom-4 right-4 z-20 size-10 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                >
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                </button>

                {/* Counter indicator */}
                {galleryImages.length > 1 && (
                    <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded bg-slate-900/10 dark:bg-white/10 backdrop-blur-md text-[10px] font-bold text-slate-900 dark:text-white/80 border border-slate-900/5 dark:border-white/5">
                        {currentIndex + 1} / {galleryImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation */}
            {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative aspect-square w-16 sm:w-20 flex-shrink-0 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200 ${currentIndex === idx
                                ? 'ring-2 ring-primary ring-inset z-10'
                                : 'opacity-50 hover:opacity-100 border border-slate-100 dark:border-slate-800'
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

            {isMounted && <FullscreenViewer />}
        </div>
    );
}
