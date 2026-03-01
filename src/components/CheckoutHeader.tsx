import Link from "next/link";
import MobileMenu from "./MobileMenu";

export default function CheckoutHeader() {
    return (
        <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-10 py-3 shadow-sm">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between whitespace-nowrap">
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors mr-2">
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                        </Link>
                        <MobileMenu />
                        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                            <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl">
                                e
                            </div>
                            <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-primary">ElectroMart</h2>
                        </Link>
                    </div>
                    <div className="hidden md:flex flex-col min-w-64 max-w-96">
                        <div className="flex w-full items-center rounded-lg bg-background-light dark:bg-background-dark border border-transparent focus-within:border-primary transition-colors">
                            <div className="text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center pl-3">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input className="w-full bg-transparent border-none text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:ring-0 text-sm py-2 px-3" placeholder="Search appliances..." />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium hover:text-primary transition-colors" href="/">Home</Link>
                        <Link className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium hover:text-primary transition-colors" href="/product">Appliances</Link>
                        <Link className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium hover:text-primary transition-colors" href="/product">Deals</Link>
                        <Link className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium hover:text-primary transition-colors" href="/product">Support</Link>
                    </nav>
                    <div className="flex gap-3">
                        <Link href="/checkout" className="flex items-center justify-center rounded-lg size-10 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark hover:bg-primary/10 hover:text-primary transition-colors relative">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full"></span>
                        </Link>
                        <Link href="/admin" className="flex items-center justify-center rounded-lg size-10 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark hover:bg-primary/10 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">account_circle</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
