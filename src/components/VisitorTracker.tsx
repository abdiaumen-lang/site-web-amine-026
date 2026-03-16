"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Function to generate a simple UUID for session tracking
function generateSessionId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Helper to get device type
function getDeviceType() {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// Helper to deduce browser
function getBrowser() {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.indexOf("Chrome") > -1) return "Chrome";
    if (ua.indexOf("Safari") > -1) return "Safari";
    if (ua.indexOf("Opera") > -1) return "Opera";
    if (ua.indexOf("Firefox") > -1) return "Firefox";
    if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) return "Internet Explorer";
    return "Other";
}

// Helper to deduce OS
function getOS() {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.indexOf("Win") !== -1) return "Windows";
    if (ua.indexOf("Mac") !== -1) return "MacOS";
    if (ua.indexOf("Linux") !== -1) return "Linux";
    if (ua.indexOf("Android") !== -1) return "Android";
    if (ua.indexOf("like Mac") !== -1) return "iOS";
    return "Other";
}

// Global hook/function for tracking custom events
export const trackEvent = async (eventType: string, eventData?: any) => {
    try {
        let sessionId = sessionStorage.getItem('site_session_id');
        if (!sessionId) return; // If no session, wait for page view to create one

        const payload = {
            session_id: sessionId,
            path: window.location.pathname,
            event_type: eventType,
            event_data: eventData,
            user_agent: navigator.userAgent,
            browser: getBrowser(),
            os: getOS(),
            device_type: getDeviceType(),
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || '',
        };

        await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            // Use keepalive for events that might happen right before navigation
            keepalive: true
        });
    } catch (e) {
        console.error("Failed to track event:", e);
    }
};


export default function VisitorTracker() {
    const pathname = usePathname();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Initialize session
        let currentSessionId = sessionStorage.getItem('site_session_id');
        if (!currentSessionId) {
            currentSessionId = generateSessionId();
            sessionStorage.setItem('site_session_id', currentSessionId);
        }
        setSessionId(currentSessionId);
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        const trackPageView = async () => {
            try {
                const payload = {
                    session_id: sessionId,
                    path: pathname,
                    event_type: 'page_view',
                    user_agent: navigator.userAgent,
                    browser: getBrowser(),
                    os: getOS(),
                    device_type: getDeviceType(),
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    referrer: isInitialLoad ? document.referrer : '', // Only send referrer on initial load
                };

                await fetch('/api/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
            } catch (error) {
                console.error('Error tracking page view:', error);
            }
        };

        // Add a slight delay to ensure other components mount first
        const timeoutId = setTimeout(() => {
            trackPageView();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [pathname, sessionId]);

    return null; // This component does not render anything
}
