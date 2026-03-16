import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpdate() {
    // Try an update mimicking exactly what happens in settings save
    const { data, error } = await supabase
        .from('website_settings')
        .update({ id: 1, facebook_pixel_id: 'test_pixel_12345' })
        .eq('id', 1)
        .select();

    if (error) {
        console.error("Update failed:", error.message);
    } else {
        console.log("Update succeeded:", data);
        
        // Reset it back
        await supabase.from('website_settings').update({ facebook_pixel_id: null }).eq('id', 1);
    }
}

testUpdate();
