import FooterClient from '@/components/footer-Client';
import NavbarClient from '@/components/navbar-client';

export default function AboutUs() {
    return (
        <div>
            <NavbarClient />
            {/* header */}
            <section className="relative h-[350px] w-full overflow-hidden md:h-[450px] lg:h-[500px]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/many-wine.jpg"
                        alt="About Us Background"
                        className="h-full w-full object-cover"
                    />
                    {/* Overlay Hitam Transparan  */}
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                {/* Konten Teks di Tengah */}
                <div className="relative z-10 flex h-full items-center justify-center">
                    <h1 className="font-serif text-4xl tracking-wide text-white md:text-5xl lg:text-6xl">
                        About Us
                    </h1>
                </div>

                {/* Efek Fade Out di bagian bawah */}
                <div className="absolute bottom-0 left-0 z-20 h-24 w-full bg-gradient-to-t from-[#02080c] to-transparent" />
            </section>

            {/* our story */}
            <section className="bg-[#02080c] px-8 py-20 text-white lg:px-20">
                <div className="mx-auto max-w-7xl">
                    {/* --- SUB-SECTION 1: Header Teks --- */}
                    <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
                        <div>
                            <span className="mb-4 block text-xs font-bold tracking-[0.3em] text-[#9c6b3b] uppercase">
                                Our Story
                            </span>
                            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                                3+ Years Of Experience <br /> In Food &
                                Beverages <br /> Business
                            </h2>
                        </div>

                        <div className="flex items-start lg:pt-10">
                            <div className="border-l-2 border-[#9c6b3b] pl-6">
                                <h3 className="mb-4 text-lg font-medium italic md:text-xl">
                                    At Mandala Bistro & Bar, Every Sip Is An
                                    Experience.
                                </h3>
                                <p className="text-sm leading-relaxed font-light text-gray-400">
                                    Our bar is home to a crafted cocktail
                                    selection, blending premium spirits with
                                    fresh, house-made infusions for unique
                                    flavors you won't find anywhere else.
                                    Complementing our menu is a curated wine
                                    list, hand-picked to pair perfectly with
                                    every dish from light, refreshing whites to
                                    bold, full-bodied reds.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- SUB-SECTION 2: Galeri Gambar (Asymmetric Grayscale) --- */}
                    <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Gambar 1: Tim (Lebih tinggi) */}
                        <div className="h-[400px] overflow-hidden md:h-[600px]">
                            <img
                                src="/images/mandala-kitchen.jpg"
                                alt="Our Professional Team"
                                className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
                            />
                        </div>
                        {/* Gambar 2: Bar Service (Offset ke bawah sedikit pada desktop) */}
                        <div className="h-[400px] overflow-hidden md:h-[600px]">
                            <img
                                src="/images/staff-laugh.jpg"
                                alt="Bar Experience"
                                className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
                            />
                        </div>
                    </div>

                    {/* --- SUB-SECTION 3: Statistik Counter & Deskripsi Singkat --- */}
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                        {/* Item 1 */}
                        <div className="flex flex-col items-start gap-8 md:flex-row">
                            <div className="flex flex-col items-center">
                                <span className="font-serif text-5xl text-white">
                                    150{' '}
                                    <span className="text-[#9c6b3b]">+</span>
                                </span>
                                <span className="mt-2 text-center text-[10px] tracking-widest text-gray-500 uppercase">
                                    Menu Dishes
                                </span>
                            </div>
                            <p className="max-w-xs pt-2 text-sm leading-relaxed font-light text-gray-400">
                                Over 150 thoughtfully crafted dishes, blending
                                authentic Indonesian flavors with international
                                classics, perfect for casual dining in Nusa Dua.
                            </p>
                        </div>

                        {/* Item 2 */}
                        <div className="flex flex-col items-start gap-8 md:flex-row">
                            <div className="flex flex-col items-center">
                                <span className="font-serif text-5xl text-white">
                                    3 <span className="text-[#9c6b3b]">+</span>
                                </span>
                                <span className="mt-2 text-center text-[10px] tracking-widest text-gray-500 uppercase">
                                    Years
                                </span>
                            </div>
                            <p className="max-w-xs pt-2 text-sm leading-relaxed font-light text-gray-400">
                                More than three years of delivering refined
                                bistro experiences, signature cocktails, curated
                                wines, and 5-star service.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <FooterClient />
        </div>
    );
}
