import FooterClient from '@/components/footer-Client';
import HeroSlider from '@/components/hero-slider';
import NavbarClient from '@/components/navbar-client';
import PersonalizationModal from '@/components/PersonalizationModal'; // Import komponen baru
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const { must_personalize, personalization_list } = usePage<any>().props;
    const [showModal, setShowModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (must_personalize) {
            setShowModal(true);
        }
    }, [must_personalize]);

    /**
     * Logika Toggle Opsi
     * Menangani aturan Single Selection vs Multiple Selection
     */
    const handleToggle = (type: any, optionId: number) => {
        const optionIdsInThisType = type.personalization_options.map(
            (o: any) => o.id,
        );

        setSelectedIds((prev) => {
            if (type.selection_type === 'single') {
                // Hapus semua ID yang termasuk dalam kategori ini, lalu masukkan yang baru
                const filtered = prev.filter(
                    (id) => !optionIdsInThisType.includes(id),
                );
                return [...filtered, optionId];
            } else {
                // Logika Multiple: Toggle biasa
                return prev.includes(optionId)
                    ? prev.filter((id) => id !== optionId)
                    : [...prev, optionId];
            }
        });
    };

    const handleSave = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            await axios.post('/personalization/save', {
                option_ids: selectedIds,
            });
            setShowModal(false);
            router.visit('/menus');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <NavbarClient />
            <HeroSlider />

            {/* authentic section */}
            <div id="authentic-section" className="scroll-mt-20 bg-[#02080c]">
                {/* --- SECTION ATAS (Teks Kiri, Gambar Kanan) --- */}
                <section className="relative flex min-h-[600px] w-full flex-col overflow-hidden lg:h-[90vh] lg:flex-row">
                    {/* teks */}
                    <div className="z-10 order-2 flex w-full flex-col justify-center px-8 py-16 lg:order-1 lg:w-[40%] lg:pr-10 lg:pl-20">
                        <div className="max-w-md">
                            <h1 className="mb-6 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
                                Discover The <br />
                                Authentic Taste <br />
                                Of <span className="italic">Mandala</span>
                            </h1>
                            <p className="mb-10 text-base leading-relaxed font-light text-gray-400 md:text-lg">
                                Experience the harmony of flavor, culture, and
                                tradition crafted with passion in every dish we
                                serve.
                            </p>
                            <Link href="/about">
                                <button className="group flex w-fit cursor-pointer items-center gap-4 border border-[#9c6b3b] px-8 py-5 text-sm tracking-widest text-white uppercase transition-all duration-500 hover:bg-[#9c6b3b]">
                                    Our History
                                    <span className="h-[1px] w-12 bg-white transition-colors"></span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* gambar */}
                    <div className="relative order-1 h-[400px] w-full overflow-hidden lg:order-2 lg:h-full lg:w-[60%]">
                        <div className="absolute inset-0 z-10 hidden bg-gradient-to-r from-[#02080c] via-transparent to-transparent lg:block" />
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#02080c] via-transparent to-transparent lg:hidden" />
                        <img
                            src="/images/chicken-burger.jpg"
                            alt="Authentic Mandala Burger"
                            className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105 lg:object-center"
                        />
                    </div>
                </section>

                {/* --- SECTION BAWAH (Gambar Kiri, Teks Kanan) --- */}
                <section className="relative flex min-h-[600px] w-full flex-col overflow-hidden lg:h-[90vh] lg:flex-row">
                    {/* gambar */}
                    <div className="relative order-1 h-[400px] w-full overflow-hidden lg:order-1 lg:h-full lg:w-[50%]">
                        {/* Gradient: Ke arah kanan karena teks ada di sebelah kanan */}
                        <div className="absolute inset-0 z-10 hidden bg-gradient-to-r from-transparent to-[#02080c] lg:block" />
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#02080c] via-transparent to-transparent lg:hidden" />

                        <img
                            src="/images/kebab.jpg"
                            alt="Authentic Mandala Dish"
                            className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105 lg:object-center"
                        />
                    </div>

                    {/* teks */}
                    <div className="z-10 order-2 flex w-full flex-col justify-center px-8 py-16 lg:order-2 lg:w-[50%] lg:pr-10 lg:pl-20">
                        <div className="max-w-2xl">
                            {' '}
                            <h1 className="mb-6 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
                                Where Authentic Taste <br />
                                Meets Culinary Art
                            </h1>
                            <p className="mb-10 max-w-lg text-base leading-relaxed font-light text-gray-400 md:text-lg">
                                Experience the harmony of flavor and culture in
                                every handcrafted dish.
                            </p>
                            <Link href="/reservation">
                                <button className="group flex w-fit cursor-pointer items-center gap-4 border border-[#9c6b3b] px-8 py-5 text-sm tracking-widest text-white uppercase transition-all duration-500 hover:bg-[#9c6b3b]">
                                    book a table
                                    <span className="h-[1px] w-12 bg-white transition-colors"></span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* cocktail section */}
            <section className="overflow-hidden bg-[#02080c] px-8 py-20 lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                        {' '}
                        {/* Gap diperkecil sedikit agar teks bisa lebih lebar */}
                        {/* --- BAGIAN KIRI: Kotak Teks (Ditingkatkan menjadi 6 kolom) --- */}
                        <div className="z-20 bg-[#0a1219] p-10 shadow-2xl md:p-16 lg:col-span-6 lg:p-20">
                            <h2 className="mb-8 font-serif text-3xl leading-tight text-white lg:text-5xl">
                                Crafted Cocktails <br /> & Curated Wines
                            </h2>
                            {/* max-w ditingkatkan dari sm ke lg agar paragraf tidak terlalu sempit */}
                            <p className="mb-12 max-w-lg text-lg leading-relaxed font-light text-gray-400">
                                Discover our handpicked wine list and signature
                                cocktails, perfectly tailored to elevate your
                                dining experience in Nusa Dua. Sip, savor, and
                                unwind.
                            </p>
                            <Link href="/menu">
                                <button className="group flex cursor-pointer items-center gap-4 border border-[#9c6b3b]/50 px-8 py-5 text-xs tracking-[0.2em] text-white uppercase transition-all duration-500 hover:bg-[#9c6b3b]">
                                    Discover Our Menu
                                    <span className="h-[1px] w-12 bg-white/50 transition-colors group-hover:bg-white"></span>
                                </button>
                            </Link>
                        </div>
                        {/* --- BAGIAN KANAN: Galeri Gambar (Disesuaikan menjadi 6 kolom) --- */}
                        <div className="relative grid h-full grid-cols-12 gap-4 lg:col-span-6">
                            {/* Gambar Utama */}
                            <div className="relative z-10 col-span-12 hidden md:col-span-8 md:block">
                                {/* Frame disesuaikan tingginya agar tetap proporsional */}
                                <div className="absolute -top-6 -left-6 z-1 hidden h-[109%] w-full border border-[#9c6b3b]/40 md:block" />

                                <div className="h-[400px] w-full overflow-hidden md:h-[500px]">
                                    <img
                                        src="/images/gelas-wine-merah.jpg"
                                        alt="Signature Cocktail"
                                        className="h-full w-full transform object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Dua Gambar Kecil */}
                            <div className="col-span-12 flex flex-col gap-4 md:col-span-4">
                                <div className="h-[240px] w-full overflow-hidden">
                                    <img
                                        src="/images/wine-putih.jpg"
                                        alt="Curated Wine"
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                                <div className="h-[240px] w-full overflow-hidden">
                                    <img
                                        src="/images/orange-juice.jpg"
                                        alt="Crafted Drink"
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <FooterClient />

            {/* --- MEMANGGIL KOMPONEN MODAL --- */}
            <PersonalizationModal
                show={showModal}
                loading={loading}
                data={personalization_list}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSave={handleSave}
                // onClose={() => setShowModal(false)} // Opsional jika boleh ditutup
            />
        </div>
    );
}
