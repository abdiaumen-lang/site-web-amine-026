"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface InteractiveStarRatingProps {
    productId: string;
}

export default function InteractiveStarRating({ productId }: InteractiveStarRatingProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [hasVoted, setHasVoted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Check if user already voted on this device
        const votedKey = `voted_${productId}`;
        if (localStorage.getItem(votedKey)) {
            setHasVoted(true);
            setRating(Number(localStorage.getItem(votedKey)));
        }

        // 2. Fetch the initial average rating and count
        const fetchRatings = async () => {
            try {
                const response = await fetch(`/api/ratings?productId=${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAverageRating(data.average);
                    setTotalVotes(data.count);
                }
            } catch (error) {
                console.error("Failed to fetch ratings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRatings();
    }, [productId]);

    const handleRate = async (newRating: number) => {
        if (hasVoted) return;

        // Optimistic UI Update
        const previousAverage = averageRating;
        const previousTotal = totalVotes;

        const newTotal = totalVotes + 1;
        const newAverage = ((averageRating * totalVotes) + newRating) / newTotal;

        setRating(newRating);
        setAverageRating(Number(newAverage.toFixed(1)));
        setTotalVotes(newTotal);
        setHasVoted(true);

        // Save to local storage
        const votedKey = `voted_${productId}`;
        localStorage.setItem(votedKey, newRating.toString());

        // Send to API
        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating: newRating }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit rating");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            // Revert on failure
            setRating(0);
            setAverageRating(previousAverage);
            setTotalVotes(previousTotal);
            setHasVoted(false);
            localStorage.removeItem(votedKey);
            alert("Erreur lors de l'envoi de votre note. Veuillez réessayer.");
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-32 mt-2"></div>;
    }

    return (
        <div className="flex flex-col items-start gap-1 mt-2">
            <div className="flex items-center gap-2">
                <div
                    className="flex text-[#FF9900]"
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`material-symbols-outlined cursor-pointer text-[22px] transition-colors ${hasVoted && rating >= star ? "fill-current" :
                                    !hasVoted && (hoverRating >= star || rating >= star) ? "fill-current drop-shadow-sm" : ""
                                } ${hasVoted ? "opacity-70 cursor-default" : "hover:scale-110 active:scale-95"}`}
                            style={{ fontVariationSettings: (hasVoted && rating >= star) || (!hasVoted && (hoverRating >= star || rating >= star)) ? "'FILL' 1" : "'FILL' 0" }}
                            onMouseEnter={() => !hasVoted && setHoverRating(star)}
                            onClick={() => !hasVoted && handleRate(star)}
                            title={hasVoted ? `Vous avez noté ${rating} étoiles` : `Noter ${star} étoiles`}
                        >
                            star
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{averageRating > 0 ? averageRating : "0"} / 5</span>
                    <span className="text-sm text-slate-500">
                        ({totalVotes} {totalVotes > 1 ? "avis" : "avis"})
                    </span>
                </div>
            </div>

            {!hasVoted && (
                <span className="text-xs text-slate-400 font-medium">Cliquez sur les étoiles pour noter ce produit</span>
            )}
            {hasVoted && (
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Merci pour votre évaluation !</span>
            )}
        </div>
    );
}
