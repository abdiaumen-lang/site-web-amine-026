"use client";

import { useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import Script from "next/script";

export default function FacebookPixel() {
    const { settings } = useSettings();
    const pixelId = settings?.facebook_pixel_id;

    useEffect(() => {
        if (!pixelId) return;

        // Standard Facebook Pixel initialization
        try {
            if ((window as any).fbq) return;
            const n = (window as any).fbq = function () {
                (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments);
            };
            if (!(window as any)._fbq) (window as any)._fbq = n;
            (n as any).push = n;
            (n as any).loaded = !0;
            (n as any).version = '2.0';
            (n as any).queue = [];
        } catch (e) {
            console.error("Facebook Pixel initialization failed", e);
        }
    }, [pixelId]);

    if (!pixelId) return null;

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${pixelId}');
                        fbq('track', 'PageView');
                    `,
                }}
            />
            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
}
