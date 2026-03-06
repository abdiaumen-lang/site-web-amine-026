import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }); } catch { } },
                remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }); } catch { } },
            },
        }
    );
}

// POST /api/promo/validate — validate a promo code and return discount
export async function POST(request: Request) {
    try {
        const { code, order_amount } = await request.json();
        if (!code) return NextResponse.json({ valid: false, error: 'Code requis' }, { status: 400 });

        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ valid: false, error: 'Code promo invalide ou inexistant' });
        }

        // Expiry check (allow the whole day of expiration, up to 23:59:59)
        if (data.expires_at) {
            const expiryDate = new Date(data.expires_at);
            // Set expired date to the end of that day
            expiryDate.setHours(23, 59, 59, 999);

            if (expiryDate < new Date()) {
                return NextResponse.json({ valid: false, error: 'Ce code promo a expiré' });
            }
        }

        // Max uses check
        if (data.max_uses !== null && data.uses_count >= data.max_uses) {
            return NextResponse.json({ valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' });
        }

        // Min order check
        if (data.min_order_amount && order_amount < data.min_order_amount) {
            return NextResponse.json({
                valid: false,
                error: `Montant minimum requis : ${Number(data.min_order_amount).toLocaleString()} DA`
            });
        }

        // Calculate discount
        let discount_amount = 0;
        if (data.discount_type === 'percentage') {
            discount_amount = Math.round((order_amount * data.discount_value) / 100);
        } else {
            discount_amount = Math.min(data.discount_value, order_amount);
        }

        return NextResponse.json({
            valid: true,
            discount_amount,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            code: data.code,
            description: data.description,
            promo_id: data.id,
        });
    } catch (err: any) {
        return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
