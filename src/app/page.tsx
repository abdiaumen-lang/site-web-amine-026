import Image from "next/image";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import HomeFooter from "@/components/HomeFooter";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .limit(4);
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <HomeHeader />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-10 py-6 lg:py-8 flex flex-col gap-10">
        <section className="@container">
          <div className="relative w-full rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex items-center bg-slate-900 shadow-xl border border-slate-800">
            <div className="absolute inset-0 z-0">
              <img alt="Modern kitchen with high-end stainless steel appliances" className="w-full h-full object-cover opacity-60" data-alt="Modern kitchen with high-end appliances" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALn0tk_zRkyJyRqxhqGhzB5zHlb9J-Ogbs3W7OPRq-H6ap3nXsOyoKJlUKQcRmJMMN-Abh7tSoY8CZTu-wYJYiyTygfgGClnTrGxJRV_2yjYX--6SNmaiziog5AlixHN-xPTZMBnNstn3M9-_bwhFdqtEhhqRSW46QoR6THcsM5Cdt3anSM2tdIezDPPtvBGhWIYCR4iYAWN6NwCyalB0FK37i9YC9gNGW1DoG_a3EBYr1uuGKalzVO1itr-RTFWH-E-O09P9ERqc" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            </div>
            <div className="relative z-10 p-8 lg:p-16 max-w-2xl flex flex-col gap-6 items-start">
              <span className="inline-block px-3 py-1 rounded-full bg-primary text-white border border-primary text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                Premium Quality
              </span>
              <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-lg">
                Upgrade Your Home with <span className="text-primary">ElectroMart</span>
              </h1>
              <p className="text-slate-200 text-lg lg:text-xl font-medium max-w-lg leading-relaxed drop-shadow-md">
                Discover Algeria&apos;s widest range of authentic home appliances. Best prices, guaranteed warranty, and doorstep delivery.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <button className="h-12 px-8 bg-primary hover:bg-primary-dark text-white text-base font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2">
                  <span>Shop Now</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button className="h-12 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-base font-bold rounded-full transition-all flex items-center gap-2">
                  <span>View Catalog</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold tracking-tight">Shop by Category</h2>
            <Link className="text-primary text-sm font-bold hover:underline flex items-center gap-1" href="/product">
              See all categories
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <img alt="Modern silver refrigerator" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Refrigerator product shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1eyjmjBNUR7OtEf2l3L9gBaS66NIAptyTt4UptXhN46-Fy8SrkwReD_roYNjDFk95wNXgpqjaVck5hZF4k_cR5HlIWCHpRTlavxK9rMAVaON0NAqjdd32wh4ycK2DGWzNuXHiw1LS5nnEe9nQQFvv_zCg5aQzo2D8vz-Fw6NNpqO4ZVh4T670C0we9HY_gaFslAgjBAuDQoicCpS7ivekoFht_Movc0R_PMeqqI2Pq3SQNEWiG7TbtzVorPOlsEGeUtd1Rh1sr28" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Refrigerators</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Side-by-side & more</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <img alt="Front load washing machine" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Washing machine product shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCR6DEY1xxwvQgZX86JJfFn1lLOdI8nopIC20Rs_XMF1nCeyeeIdMzV7ReTgKeI4lCV9ERLAsricVlBIY4mfY7KPHQpJtDcpA97FlbOQyzUTo96DLUnGTvbi9YcPp6EAgVcWRVg79RQXmohUBSqLdXsWudryeJYzJd-BjPs_NZbcevFexG8W4mbIv3dB6g39BTYiqAgaVMeY84xDx5J20Zcrd5Kte-xZcwquaXUltbo0ELbYCB4DkXB9iyh-UDMkw4ywlQ4x8mqQs" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Washing Machines</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Front & top load</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <img alt="Smart 4K TV on a stand" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Smart TV product shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9xB7oHUTKt2g6ceJDU8W4eHNVVc-w8vy0c8kOKt97jb8Y97V_a7gik4tKbS39w_lId8HqeZ6Rl-ReyBpYHIucZGkGXxet_lXn2j0Ac1gURQwjEzzk1umyHFKevKy4gL5NGPpyZhSeX0o4tkIZH_N_84bpqAb9avhoMAv_vdOGtryIfzl8gfTjo0Tg79bZzakCCE1MFaLKYn00S7Jrd81Q45v0XULJMxCqkjVVi5BW3Bg3VnSJ9H6JP0RHrwZXO8P08L27cTqIO70" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Televisions</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">4K, OLED & QLED</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <img alt="Wall mounted air conditioner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Air conditioner product shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7SsEE1e1dmVF9QNgWRO-Hx3augVU1e6XexdHLe68asCnihkV0f7i07ewiQpxkVIfHDpcKT1nbpo6aF4v4aheaLPTNAkrgolsBwc1ro1c18aumOzedgn61mwyrYbbpEdIdE5EM4E9Bu13qTsfOCRKdtuEt57-__h52RMuR-72mMH0dz0vyEUVJjugZ9UrKPBtELAZ-isNEidmB7tJ5tghBYXbbq2WZx4QuW09TKTpvtq2lQWbmLTM4k7JGzGd8w5sQ5HQyXJVwvow" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Air Conditioners</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Split & Window</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <img alt="Modern kitchen stove and oven" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Kitchen stove product shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp1M4lDXYO_MWFKOHIGVc5pxko9Ol-7ujIr7xhWzmtVuVLhW7XHEyn6Rq-6gZ5z6R1KaLbkdj81HWjt3Pn133Nf0s1tS-Wdy3DY--55JFqzCVI6RbH2LpRjhuabKxlVGZkfjktAFZFL2MJtdj5ptW1nYwoYNeTOEhp1y2XkyksUo1g9TpyrZFsUOme3zOXpjeEOyxcKoG2IS_9ilPHF6OarB_cgPZ6BOeTIZZZaMuJEtj5rPeGdRPQKl51ofeOA5IxPWkKHs6R5O4" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Kitchen Stoves</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Gas & Electric</p>
              </div>
            </Link>
            <Link className="group flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" href="/product">
              <div className="aspect-square rounded-lg bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
                <img alt="Microwave oven on counter" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Microwave product shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTm9tdFwGtWUiy4PI0kek5KdUm2GqommwkSmXptnJTfkbEYoioMGdQCCzXmwBdHyD5UemFaRcW-BBcTR8R0TvU3WeWwKqnKaXBiYjMKRnxqSEjWdimpO04PLXojwIKNSkyzQGcR4HtHCcrcWxMftvVq-EDe2N9zPJrobELJ7tEotOO92l8_4H0-HMTiX8aK_6hTM2tXjo0kcqMweo1k5LXtO3qYfgXLFdxn7y3ilHy1YxMYFeZ8pyXNyJj4iqJAPpV5PJTC6E7mRk" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors">Small Appliances</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Microwaves & Blenders</p>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Top picks for your home this month</p>
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
            {/* Product Cards */}
            <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300">
              <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden p-4">
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">-15%</span>
                <img alt="Samsung Smart 4-Door Flex Refrigerator" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" data-alt="Samsung Refrigerator Product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGXuOoAIZ96O348SJXflXVRs10S_xmlHoOR9dm65fvTDsU7w5vdLVtPmYnb6X-TyaupIH5dr9yuWOmDMw1J7J4TT8ZP4FAsHe5PlOODtiv3ClRypowm9lrq6GBHBHo67krrlWywuNbyZgI8VADVpHQ-JBpoXMhpQyz7_GMmc3KTjfKLfQ2Nfdstc9QJIncGb4aj-lEZC4b9-4eh1GAOVvO2yAMdzmk9LNXnJgOsm8XQOaZnGDJach60UrxLxJTB7MCFIjoHrR-7rw" />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star_half</span>
                  <span className="text-slate-400 text-xs ml-1">(42)</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">Samsung Family Hub™ French Door Refrigerator</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs line-through">280,000 DA</span>
                    <span className="text-primary text-xl font-black">238,000 DA</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/"
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center -ml-1"
                      title="Go Back to Home"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-lg hover:bg-primary hover:text-white dark:hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300">
              <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden p-4">
                <img alt="LG AI DD™ Front Load Washing Machine" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" data-alt="LG Washing Machine Product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFI9-bBSpgCj8YZqx4AHbgQ-k3RnagXcmpnsnTdGZL20_Cw4pjFCH4X0-xA_D9rtpziNqSnk1R2r9G8PYJq4Od3Ym0G8x5OD6zH0sDaC6lqib_7QQ6w9zMamXfRlMiJS2uRmlgmdnJj95W7X4gzlMEcCO03ORH_MLcoih_1zBffGJhsrZ8tSeWtsJwAoOGRodnVGsHHPyMNtlGg486EH5D5mKbYCWfD4hhVooEfFyZeYah1FWk2OV7AF6c-SicVLtKyuHTknfSLdw" />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-300">star</span>
                  <span className="text-slate-400 text-xs ml-1">(18)</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">LG AI DD™ 9kg Front Load Washer</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-primary text-xl font-black">95,500 DA</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/"
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center -ml-1"
                      title="Go Back to Home"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-lg hover:bg-primary hover:text-white dark:hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300">
              <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden p-4">
                <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">New</span>
                <img alt="Sony Bravia 55 inch 4K Ultra HD Smart LED Google TV" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" data-alt="Sony TV Product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJYOCEgn9xmwjoGhS1a56l44N6pgu8mqHeyjk2FfeXqPFAdOPLcMaDVUEm04QVhCXqNLfdcjGRY5ek0f4kjUTQXViphXqwwhkAP92ZVzLTlZ9mrV5istbDkO2IymymEgp-O3KsgNg--9Fxvgx13jodnvBA7_v7faonUpVGFk2-9nXv1RzMoO4BbaOYuKV9rJ31ZfZ_Nyspz1RsXyu0oHxVXv-EhAJD58Eu3z3N8kf_qA43R0tm-RuN5Lygo0ypm5a-eYTxO7nvHfA" />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="text-slate-400 text-xs ml-1">(124)</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">Sony Bravia 55&quot; 4K Ultra HD Smart TV</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-primary text-xl font-black">145,000 DA</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/"
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center -ml-1"
                      title="Go Back to Home"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-lg hover:bg-primary hover:text-white dark:hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300">
              <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden p-4">
                <img alt="Dyson V15 Detect Cordless Vacuum" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" data-alt="Dyson Vacuum Product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQRAG8xGdbZq5zEw56NsJK67y0ZD_SKos9MsI1a2_A7l0RZmGC1Iq3x8CgLY_GkqErua7civ5Xy0z0_rqg7EcDW9wCMkygcSBI_1kbC4Gxb3pV1EUGLnWso_Us_7Nn4IPdv32AQcR6oev1OBvSFcObNzWdjdbvv1pouAowOmNk-RQFoJdr2cXZ2SeAWRtoNJ-JEjgwJay_i8RPaFzoOyr6EB8kAU8Am34xyamkSt5XypM4Z0Vre99LvpaPsw3KsUQJbNvTe3DSbOk" />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star_half</span>
                  <span className="text-slate-400 text-xs ml-1">(89)</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">Dyson V15 Detect™ Absolute Cordless Vacuum</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-primary text-xl font-black">112,000 DA</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/"
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center -ml-1"
                      title="Go Back to Home"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-lg hover:bg-primary hover:text-white dark:hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-2xl overflow-hidden bg-slate-900 relative isolate px-6 py-24 shadow-2xl sm:px-24 xl:py-32">
            <img alt="Kitchen interior blurred background" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" data-alt="Abstract kitchen interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnZOLoPiAUos2FHu3XSEBdvWxJcs9AWKzmMyXGwUin9aGsltOPayH3ChTRe2L0TD-zUnSInCudicEjxJ5vSibvE8gO3KXhvevwTsHrIqnf01oeAy8eirgEOslrToZzOpcjjqOvyHzb3DbcUYdcJiaUKlBv7PH7wrFi5qXpvy73b44afbe2ZYymf8yMfwdE3_EOBNqLBOuH6g8G1QAHY6EeLhcPw5Gr1ychY9y0wzSdFUkyAY9Oub6pSWt0Czpf-2kMttEBNM3PIU8" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-transparent"></div>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get the best deals first!</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">Subscribe to our newsletter and receive exclusive coupons for your next appliance purchase in Algeria.</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <div className="relative w-full max-w-md">
                  <input className="w-full h-12 rounded-lg pl-4 pr-32 bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter your email address" type="email" />
                  <button className="absolute right-1 top-1 bottom-1 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md text-sm transition-colors">
                    Subscribe
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
