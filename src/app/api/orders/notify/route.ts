import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { order, telegramBotToken, telegramChatId } = body;

        if (!telegramBotToken || !telegramChatId) {
            return NextResponse.json({ error: 'Missing Telegram configuration' }, { status: 400 });
        }

        let msg = `🛍️ *Nouvelle Commande #EM-${order.id.slice(0, 6).toUpperCase()}*\n\n`;
        msg += `👤 *Client:* ${order.customer_name}\n`;
        msg += `📞 *Téléphone:* ${order.customer_phone}\n`;
        msg += `📍 *Adresse:* ${order.address}, ${order.commune}, ${order.wilaya}\n\n`;
        msg += `📦 *Produits commandés:*\n`;

        order.order_items?.forEach((item: any) => {
            msg += `- ${item.quantity}x ${item.product_name} (${item.price_at_time.toLocaleString()} DA)\n`;
        });

        msg += `\n🚚 *Livraison:* ${order.shipping_cost === 0 ? 'GRATUIT' : `${order.shipping_cost.toLocaleString()} DA`}\n`;
        msg += `💰 *Total à payer:* ${order.total_amount.toLocaleString()} DA\n`;

        const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: msg,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Telegram API Error:', errorData);
            return NextResponse.json({ error: 'Failed to send Telegram message' }, { status: response.status });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in Telegram notification route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
