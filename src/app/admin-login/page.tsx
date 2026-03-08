"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("aminebenslimane13@gmail.com");
    const [password, setPassword] = useState("ElectroMart@2026");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check if already logged in
    useEffect(() => {
        const isAuth = localStorage.getItem("adminAuth") === "true";
        if (isAuth) {
            router.push("/admin");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Simulate local authentication logic
        setTimeout(() => {
            if (email === "aminebenslimane13@gmail.com" && password === "ElectroMart@2026") {
                localStorage.setItem("adminAuth", "true");
                router.push("/admin");
            } else {
                setError("Email ou mot de passe invalide.");
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
                <div className="p-8 md:p-10">
                    <div className="flex justify-center mb-10">
                        <Logo />
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Espace Administrateur</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Veuillez vous identifier pour accéder à la gestion.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm flex items-center gap-3 animate-shake">
                            <span className="material-symbols-outlined text-lg">error</span>
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col gap-6" autoComplete="off">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">Email professionnel</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">mail</span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none text-slate-900 dark:text-white"
                                    placeholder="admin@electromart.com"
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1" htmlFor="password">Mot de passe</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">lock</span>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none text-slate-900 dark:text-white"
                                    placeholder="••••••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 mt-2"
                        >
                            {isLoading ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined">login</span>
                            )}
                            <span>{isLoading ? "Authentification..." : "Se connecter"}</span>
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link href="/" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Retourner à la boutique
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                &copy; 2026 ElectroMart - Panel de Sécurité
            </p>
        </div>
    );
}
