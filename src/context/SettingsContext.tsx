"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface WebsiteSettings {
    id: number;
    logo_url: string | null;
    logo_width: number;
    logo_height: number;
    logo_position: "left" | "center" | "right";
    whatsapp_number: string;
    whatsapp_enabled: boolean;
    whatsapp_position: string;
    whatsapp_offset_x: number;
    whatsapp_offset_y: number;
    maps_embed_url?: string | null;
    maps_store_image_url?: string | null;
    maps_store_name?: string | null;
    maps_store_address?: string | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    social_facebook?: string | null;
    social_instagram?: string | null;
    social_tiktok?: string | null;
    social_youtube?: string | null;
    social_twitter?: string | null;
    theme_primary_color?: string | null;
    theme_font_family?: string | null;
    menu_bg_color?: string | null;
    top_bar_text?: string | null;
    updated_at: string;
}

interface SettingsContextType {
    settings: WebsiteSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    refreshSettings: async () => { },
});

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<WebsiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("website_settings")
                .select("*")
                .eq("id", 1)
                .single();

            if (error) {
                // Ignore "Record not found", "Relation does not exist", and schema cache errors if setup is incomplete
                const isSetupError =
                    error.code === "PGRST116" ||
                    error.code === "42P01" ||
                    (error.message && error.message.includes("schema cache"));

                if (!isSetupError) {
                    console.error("Error fetching website settings:", error.message || error);
                }
            } else if (data) {
                setSettings(data as WebsiteSettings);
            }
        } catch (err) {
            console.error("Unexpected error fetching website settings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        // Subscribe to real-time changes
        const channel = supabase
            .channel("website_settings_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "website_settings",
                    filter: "id=eq.1",
                },
                (payload) => {
                    if (payload.new) {
                        setSettings(payload.new as WebsiteSettings);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
