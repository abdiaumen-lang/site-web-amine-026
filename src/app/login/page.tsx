"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log("Login attempt:", { email, success: !!data.session, error });

            if (error) throw error;

            if (!data.session) throw new Error("No session returned");

            // Redirect to admin on success
            console.log("Redirecting to /admin...");
            window.location.href = "/admin";
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Failed to log in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <Logo />
                    </div>

                    <h1 className="text-2xl font-bold text-text-main text-center mb-2">Administration</h1>
                    <p className="text-text-muted text-center mb-8">Connectez-vous pour gérer votre boutique.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} autoComplete="off" className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-main" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-lg border-stone-300 focus:ring-primary focus:border-primary w-full py-2.5 px-4"
                                placeholder="votre@email.com"
                                required
                                autoComplete="off"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-main" htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-lg border-stone-300 focus:ring-primary focus:border-primary w-full py-2.5 px-4"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="material-symbols-outlined animate-spin">autorenew</span>
                            ) : (
                                <span className="material-symbols-outlined">login</span>
                            )}
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
                    <Link href="/" className="text-sm text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Retour à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}
