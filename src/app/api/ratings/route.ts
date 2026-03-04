import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('product_ratings')
            .select('rating')
            .eq('product_id', productId);

        if (error) {
            console.error('Error fetching ratings:', error);
            return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
        }

        const count = data.length;
        if (count === 0) {
            return NextResponse.json({ average: 0, count: 0 });
        }

        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        const average = sum / count;

        return NextResponse.json({ average: Number(average.toFixed(1)), count });
    } catch (err) {
        console.error('Server error fetching ratings:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { productId, rating } = await request.json();

        if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { error } = await supabase
            .from('product_ratings')
            .insert([{ product_id: productId, rating }]);

        if (error) {
            console.error('Error saving rating:', error);
            // Ignore constraint errors if they happen, but usually it's a direct insert
            return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Server error saving rating:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
