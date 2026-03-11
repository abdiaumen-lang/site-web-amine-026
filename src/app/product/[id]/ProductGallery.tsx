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
        <div className="flex flex-col gap-6">
            <div className="relative aspect-square sm:aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-12 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center overflow-hidden group shadow-xl">
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-700 shadow-lg -translate-x-2 group-hover:translate-x-0"
                            aria-label="Previous image"
                        >
                            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-slate-700 shadow-lg translate-x-2 group-hover:translate-x-0"
                            aria-label="Next image"
                        >
                            <span className="material-symbols-outlined text-[28px]">chevron_right</span>
                        </button>
                    </>
                )}

                {/* Zoom indicator */}
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute bottom-6 left-6 z-20 size-11 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                </button>

                {/* Counter indicator */}
                {galleryImages.length > 1 && (
                    <div className="absolute top-6 right-6 z-20 px-3 py-1.5 rounded-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md text-[11px] font-bold text-slate-900 dark:text-white/80">
                        {currentIndex + 1} / {galleryImages.length}
                    </div>
                )}

                {/* Decorative gradients */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/50 to-transparent dark:from-black/20 dark:to-transparent pointer-events-none transition-opacity duration-500"></div>
            </div>

            {/* Thumbnail Navigation */}
            {galleryImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar scroll-smooth">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative aspect-square w-20 sm:w-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 transition-all duration-300 shadow-sm overflow-hidden group/thumb ${currentIndex === idx
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 border-transparent shadow-primary/20 scale-105'
                                : 'border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md opacity-70 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                className={`w-full h-full object-contain transition-transform duration-300 ${currentIndex !== idx ? 'group-hover/thumb:scale-110' : ''}`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {isMounted && <FullscreenViewer />}
        </div>
    );
}
