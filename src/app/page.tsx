import Image from "next/image";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import HomeFooter from "@/components/HomeFooter";
import { supabase } from "@/lib/supabase";
import AnimatedBrandsMarquee from "@/components/AnimatedBrandsMarquee";

export default async function Home() {
  // Select only columns needed for the product card — avoids sending `landing_content`, `specifications`, etc.
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("id, name, price, original_price, discount_price, image, images, stock")
    .order("created_at", { ascending: false })
    .limit(4);
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <HomeHeader />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-10 py-6 lg:py-8 flex flex-col gap-10">
        <section className="@container">
          <div className="relative w-full rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex items-center bg-slate-900 shadow-xl border border-slate-800">
            <div className="absolute inset-0 z-0">
              <Image width={1920} height={1080} priority alt="Modern kitchen with high-end stainless steel appliances" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALn0tk_zRkyJyRqxhqGhzB5zHlb9J-Ogbs3W7OPRq-H6ap3nXsOyoKJlUKQcRmJMMN-Abh7tSoY8CZTu-wYJYiyTygfgGClnTrGxJRV_2yjYX--6SNmaiziog5AlixHN-xPTZMBnNstn3M9-_bwhFdqtEhhqRSW46QoR6THcsM5Cdt3anSM2tdIezDPPtvBGhWIYCR4iYAWN6NwCyalB0FK37i9YC9gNGW1DoG_a3EBYr1uuGKalzVO1itr-RTFWH-E-O09P9ERqc" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            </div>
            <div className="relative z-10 p-8 lg:p-16 max-w-2xl flex flex-col gap-6 items-start">
              <span className="inline-block px-3 py-1 rounded-full bg-primary text-white border border-primary text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                Qualité Premium
              </span>
              <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-lg">
                Équipez votre maison avec <span className="text-[#FF6600]">Electromart</span>
              </h1>
              <p className="text-slate-200 text-lg lg:text-xl font-medium max-w-lg leading-relaxed drop-shadow-md">
                Découvrez le plus grand choix d'électroménager authentique en Algérie. Meilleurs prix, garantie assurée et livraison à domicile.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <Link href="/product">
                  <button className="h-12 px-8 bg-primary hover:bg-primary-dark text-white text-base font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2">
                    <span>Acheter maintenant</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </Link>
                <Link href="/product">
                  <button className="h-12 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-base font-bold rounded-full transition-all flex items-center gap-2">
                    <span>Voir le catalogue</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- ANIMATED BRANDS MARQUEE SECTION --- */}
        <AnimatedBrandsMarquee />

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold tracking-tight">Magasiner par catégorie</h2>
            <Link className="text-primary text-sm font-bold hover:underline flex items-center gap-1" href="/product">
              Voir toutes les catégories
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <Image width={400} height={400} alt="Modern silver refrigerator" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1eyjmjBNUR7OtEf2l3L9gBaS66NIAptyTt4UptXhN46-Fy8SrkwReD_roYNjDFk95wNXgpqjaVck5hZF4k_cR5HlIWCHpRTlavxK9rMAVaON0NAqjdd32wh4ycK2DGWzNuXHiw1LS5nnEe9nQQFvv_zCg5aQzo2D8vz-Fw6NNpqO4ZVh4T670C0we9HY_gaFslAgjBAuDQoicCpS7ivekoFht_Movc0R_PMeqqI2Pq3SQNEWiG7TbtzVorPOlsEGeUtd1Rh1sr28" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Réfrigérateurs</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Multi-portes & plus</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <Image width={400} height={400} alt="Front load washing machine" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCR6DEY1xxwvQgZX86JJfFn1lLOdI8nopIC20Rs_XMF1nCeyeeIdMzV7ReTgKeI4lCV9ERLAsricVlBIY4mfY7KPHQpJtDcpA97FlbOQyzUTo96DLUnGTvbi9YcPp6EAgVcWRVg79RQXmohUBSqLdXsWudryeJYzJd-BjPs_NZbcevFexG8W4mbIv3dB6g39BTYiqAgaVMeY84xDx5J20Zcrd5Kte-xZcwquaXUltbo0ELbYCB4DkXB9iyh-UDMkw4ywlQ4x8mqQs" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Lave-linge</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Hublot & Top</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <Image width={400} height={400} alt="Smart 4K TV on a stand" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9xB7oHUTKt2g6ceJDU8W4eHNVVc-w8vy0c8kOKt97jb8Y97V_a7gik4tKbS39w_lId8HqeZ6Rl-ReyBpYHIucZGkGXxet_lXn2j0Ac1gURQwjEzzk1umyHFKevKy4gL5NGPpyZhSeX0o4tkIZH_N_84bpqAb9avhoMAv_vdOGtryIfzl8gfTjo0Tg79bZzakCCE1MFaLKYn00S7Jrd81Q45v0XULJMxCqkjVVi5BW3Bg3VnSJ9H6JP0RHrwZXO8P08L27cTqIO70" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Téléviseurs</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">4K, OLED & QLED</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <Image width={400} height={400} alt="Wall mounted air conditioner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7SsEE1e1dmVF9QNgWRO-Hx3augVU1e6XexdHLe68asCnihkV0f7i07ewiQpxkVIfHDpcKT1nbpo6aF4v4aheaLPTNAkrgolsBwc1ro1c18aumOzedgn61mwyrYbbpEdIdE5EM4E9Bu13qTsfOCRKdtuEt57-__h52RMuR-72mMH0dz0vyEUVJjugZ9UrKPBtELAZ-isNEidmB7tJ5tghBYXbbq2WZx4QuW09TKTpvtq2lQWbmLTM4k7JGzGd8w5sQ5HQyXJVwvow" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Climatiseurs</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Split & Mobile</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <Image width={400} height={400} alt="Modern kitchen stove and oven" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp1M4lDXYO_MWFKOHIGVc5pxko9Ol-7ujIr7xhWzmtVuVLhW7XHEyn6Rq-6gZ5z6R1KaLbkdj81HWjt3Pn133Nf0s1tS-Wdy3DY--55JFqzCVI6RbH2LpRjhuabKxlVGZkfjktAFZFL2MJtdj5ptW1nYwoYNeTOEhp1y2XkyksUo1g9TpyrZFsUOme3zOXpjeEOyxcKoG2IS_9ilPHF6OarB_cgPZ6BOeTIZZZaMuJEtj5rPeGdRPQKl51ofeOA5IxPWkKHs6R5O4" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Cuisinières</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Gaz & Électrique</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <Image width={400} height={400} alt="Microwave oven on counter" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTm9tdFwGtWUiy4PI0kek5KdUm2GqommwkSmXptnJTfkbEYoioMGdQCCzXmwBdHyD5UemFaRcW-BBcTR8R0TvU3WeWwKqnKaXBiYjMKRnxqSEjWdimpO04PLXojwIKNSkyzQGcR4HtHCcrcWxMftvVq-EDe2N9zPJrobELJ7tEotOO92l8_4H0-HMTiX8aK_6hTM2tXjo0kcqMweo1k5LXtO3qYfgXLFdxn7y3ilHy1YxMYFeZ8pyXNyJj4iqJAPpV5PJTC6E7mRk" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Petit Électroménager</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Micro-ondes & Mixeurs</p>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold tracking-tight">Produits Vedettes</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Les meilleurs choix pour votre maison ce mois-ci</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-primary text-white hover:bg-primary-dark transition-colors shadow-md shadow-primary/20">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts && featuredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-1.5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <Link href={`/product/${product.id}`} className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden mb-4 block group">
                  {product.discount_price && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-widest z-10 shadow-sm">
                      -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                    </span>
                  )}
                  <Image
                    width={500}
                    height={625}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={product.images?.[0] || 'https://via.placeholder.com/500x625?text=Electromart'}
                  />
                </Link>
                <div className="flex flex-col flex-1 items-center text-center gap-2 px-1">
                  <Link href={`/product/${product.id}`} className="block w-full">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-tight hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex flex-col mt-1 items-center">
                    {product.discount_price ? (
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-xs line-through">{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} DA</span>
                        <span className="text-slate-900 dark:text-white font-bold text-lg">DA {product.discount_price.toLocaleString('en-US', { minimumFractionDigits: 2 })} DZD</span>
                      </div>
                    ) : (
                      <span className="text-slate-900 dark:text-white font-bold text-lg">DA {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} DZD</span>
                    )}
                  </div>

                  <Link href={`/product/${product.id}`} className="mt-4 w-full">
                    <button className="w-full py-3 px-6 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300 text-sm">
                      Voir le produits
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-2xl overflow-hidden bg-slate-900 relative isolate px-6 py-24 shadow-2xl sm:px-24 xl:py-32">
            <Image width={1920} height={600} alt="Kitchen interior blurred background" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnZOLoPiAUos2FHu3XSEBdvWxJcs9AWKzmMyXGwUin9aGsltOPayH3ChTRe2L0TD-zUnSInCudicEjxJ5vSibvE8gO3KXhvevwTsHrIqnf01oeAy8eirgEOslrToZzOpcjjqOvyHzb3DbcUYdcJiaUKlBv7PH7wrFi5qXpvy73b44afbe2ZYymf8yMfwdE3_EOBNqLBOuH6g8G1QAHY6EeLhcPw5Gr1ychY9y0wzSdFUkyAY9Oub6pSWt0Czpf-2kMttEBNM3PIU8" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-transparent"></div>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Recevez nos bons plans en premier !</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">Abonnez-vous à notre newsletter et recevez des bons de réduction exclusifs pour vos prochains achats d'électroménager en Algérie.</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <div className="relative w-full max-w-md">
                  <input className="w-full h-12 rounded-lg pl-4 pr-32 bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Entrez votre adresse courriel" type="email" />
                  <button className="absolute right-1 top-1 bottom-1 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md text-sm transition-colors">
                    S'abonner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
