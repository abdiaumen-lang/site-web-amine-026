import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper function to create authenticated Supabase client for admin operations
async function getSupabaseAdmin() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle cookie setting error in server components
                    }
                },
                remove(name: string, options: any) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Handle cookie removal error in server components
                    }
                },
            },
        }
    );
}

export async function GET() {
    try {
        const supabase = await getSupabaseAdmin();
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ brands: data || [] });
    } catch (err: any) {
        console.error('Error fetching brands:', err);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, image_url, width, height } = await request.json();

        if (!image_url) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        const supabase = await getSupabaseAdmin();

        // In this template, Admin Auth is handled via localStorage on the client.
        // For a true production app with sensitive data, JWT verification should be used here.

        const { data, error } = await supabase
            .from('brands')
            .insert([{
                name: name || null,
                image_url,
                width: width || 120,
                height: height || 60
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ brand: data });
    } catch (err: any) {
        console.error('Error saving brand:', err);
        return NextResponse.json({ error: 'Failed to save brand' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
        }

        const supabase = await getSupabaseAdmin();

        // In this template, Admin Auth is handled via localStorage on the client.
        // For a true production app with sensitive data, JWT verification should be used here.

        // 1. Delete the record
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting brand:', err);
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }
}
