import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            session_id,
            path,
            event_type = 'page_view',
            event_data = null,
            user_agent,
            browser,
            os,
            device_type,
            screen_resolution,
            referrer,
        } = body;

        // Try to get IP and coarse location from Vercel headers if available, or fallbacks
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const country = req.headers.get('x-vercel-ip-country') || 'unknown';
        const city = req.headers.get('x-vercel-ip-city') || 'unknown';

        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('site_visits')
            .insert([
                {
                    session_id,
                    path,
                    event_type,
                    event_data,
                    user_agent,
                    browser,
                    os,
                    device_type,
                    screen_resolution,
                    referrer,
                    ip,
                    country,
                    city
                }
            ])
            .select('id')
            .single();

        if (error) {
            console.error('Error recording visit:', error);
            return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        console.error('Visitor tracking error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
