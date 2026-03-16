"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/VisitorTracker";

interface ProductViewTrackerProps {
    productId: number;
    productName: string;
}

export default function ProductViewTracker({ productId, productName }: ProductViewTrackerProps) {
    useEffect(() => {
        // Track the 'view_item' event when this component mounts
        trackEvent('view_item', {
            product_id: productId,
            product_name: productName
        });
    }, [productId, productName]);

    return null; // Silent component
}
