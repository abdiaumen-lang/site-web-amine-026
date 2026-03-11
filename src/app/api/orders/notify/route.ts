import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { order, telegramBotToken, telegramChatId, googleSheetsWebhookUrl } = body;

        const results: any = {};

        // 1. Telegram Sync
        if (telegramBotToken && telegramChatId) {
            let msg = `🛍️ <b>Nouvelle Commande #EM-${order.id.slice(0, 6).toUpperCase()}</b>\n\n`;
            msg += `👤 <b>Client / الزبون:</b> ${order.customer_name}\n`;
            msg += `📞 <b>Téléphone / الهاتف:</b> ${order.customer_phone}\n`;
            msg += `📍 <b>Wilaya / الولاية:</b> ${order.wilaya}\n`;
            msg += `🏙️ <b>Commune / البلدية:</b> ${order.commune}\n`;
            msg += `🏠 <b>Adresse / العنوان:</b> ${order.address}\n\n`;
            msg += `📦 <b>Produits commandés:</b>\n`;

            order.order_items?.forEach((item: any) => {
                msg += `- ${item.quantity}x ${item.product_name} (${item.price_at_time.toLocaleString()} DA)\n`;
            });

            msg += `\n🚚 <b>Livraison:</b> ${order.shipping_cost === 0 ? 'GRATUIT' : `${order.shipping_cost.toLocaleString()} DA`}\n`;
            msg += `💰 <b>Total à payer:</b> ${order.total_amount.toLocaleString()} DA\n`;

            const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

            try {
                const response = await fetch(telegramApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: telegramChatId,
                        text: msg,
                        parse_mode: 'HTML',
                    }),
                });
                results.telegram = response.ok;
            } catch (err) {
                console.error("Telegram error:", err);
                results.telegram = false;
            }
        }

        // 2. Google Sheets Sync
        if (googleSheetsWebhookUrl) {
            try {
                const response = await fetch(googleSheetsWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order }),
                });
                results.googleSheets = response.ok;
            } catch (err) {
                console.error("Google Sheets error:", err);
                results.googleSheets = false;
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('Error in notification route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
