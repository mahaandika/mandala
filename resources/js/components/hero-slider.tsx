import { useEffect, useState } from 'react';

const images = [
    '/images/mandala-wall.jpg',
    '/images/many-wine.jpg',
    '/images/mandala-staff.jpg',
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 6000);

        return () => clearInterval(timer);
    }, []);

    const scrollToSection = () => {
        // Cari elemen berdasarkan ID yang kita buat tadi
        const element = document.getElementById('authentic-section');

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth', // Animasi halus
                block: 'start', // Berhenti di bagian atas elemen
            });
        }
    };

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Images */}
            {images.map((src, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === current ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img
                        src={src}
                        alt="Mandala Bistro"
                        className="h-full w-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            ))}

            {/* STATIC CONTENT */}
            <div className="relative z-10 flex h-full items-center">
                <div className="mx-auto w-full max-w-7xl px-6">
                    <div className="max-w-xl space-y-4 text-white">
                        <span className="block h-px w-20 bg-white/70" />

                        <h1 className="text-4xl font-medium tracking-wide md:text-6xl">
                            Mandala Bistro
                        </h1>

                        <p className="pb-4 text-sm leading-relaxed text-white/80 md:w-80 md:text-sm">
                            A casual dining destination in Nusa Dua, Bali.
                            Serving curated Asian and European cuisine in a warm
                            and elegant setting.
                        </p>

                        <button
                            onClick={scrollToSection}
                            className="inline-flex cursor-pointer items-center gap-3 bg-[#9c6b3b] px-12 py-5 text-sm font-semibold tracking-widest text-white transition hover:bg-[#b07a43]"
                        >
                            DISCOVER MORE →
                        </button>
                    </div>
                </div>
            </div>

            {/* Indicators */}
            {/* <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-2 w-2 rounded-full transition ${
                            index === current ? 'bg-[#9c6b3b]' : 'bg-white/40'
                        }`}
                    />
                ))}
            </div> */}
        </section>
    );
}
