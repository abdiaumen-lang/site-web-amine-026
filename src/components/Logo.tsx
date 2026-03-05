"use client";

import React from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

interface LogoProps {
    className?: string; // Additional classes for the wrapper Link
    iconClassName?: string; // Classes for the 'e' circle if fallback
    textClassName?: string; // Classes for the 'electromart' text if fallback
}

export default function Logo({ className = "", iconClassName = "", textClassName = "" }: LogoProps) {
    const { settings, loading } = useSettings();

    // Default classes if not provided
    const defaultWrapper = "flex items-center gap-1.5 md:gap-2 shrink-0 group";
    const defaultIcon = "w-8 h-8 md:w-10 md:h-10 bg-[#FF6600] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105";
    const defaultIconText = "text-white font-black text-xl md:text-2xl leading-none lowercase mt-0.5";
    const defaultText = "text-[22px] md:text-[28px] font-black tracking-tight text-[#FF6600] leading-none lowercase transition-colors group-hover:text-[#e55c00]";

    if (loading) {
        return <div className={`animate-pulse w-32 h-10 ${className}`}></div>; // Skeleton
    }

    const wrapperClass = className || defaultWrapper;

    if (settings && settings.logo_url) {
        return (
            <Link href="/" className={`${wrapperClass} overflow-hidden block`}>
                {/* Custom Uploaded Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={settings.logo_url}
                    alt="Store Logo"
                    style={{
                        width: settings.logo_width ? `${settings.logo_width}px` : "auto",
                        height: settings.logo_height ? `${settings.logo_height}px` : "auto",
                        objectFit: "contain"
                    }}
                    className="transition-transform"
                />
            </Link>
        );
    }

    // Fallback: The Boulanger-styled native text logo we previously built - now just the 'e' icon
    return (
        <Link href="/" className={`${wrapperClass} block`}>
            <div className={iconClassName || defaultIcon}>
                <span className={defaultIconText}>e</span>
            </div>
        </Link>
    );
}
