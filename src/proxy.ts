import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    console.log(`[Middleware] Request for: ${request.nextUrl.pathname}`);

    let response = NextResponse.next({ request });

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return request.cookies.get(name)?.value; },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({ name, value, ...options });
                        response.cookies.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({ name, value: '', ...options });
                        response.cookies.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        // 1. API Route Protection
        if (request.nextUrl.pathname.startsWith('/api/cart')) {
            if (!session) {
                console.log(`[Middleware] API /api/cart: No session, 401`);
                return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
            }
        }

        // 2. Admin Dashboard Protection
        if (request.nextUrl.pathname.startsWith('/admin')) {
            if (!session) {
                console.log(`[Middleware] Admin /admin: No session, redirect to /login`);
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const role = session.user.user_metadata?.role;
            const isAdminEmail = session.user.email === 'ElectroMart123@gmail.com';

            if (role !== 'admin' && !isAdminEmail) {
                console.log(`[Middleware] Admin /admin: Not admin, redirect to /`);
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    } catch (e) {
        console.error("[Middleware] Critical Error:", e);
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/api/cart/:path*'],
};
