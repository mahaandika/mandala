import {
    FaFacebookF,
    FaInstagram,
    FaMapMarkerAlt,
    FaTripadvisor,
    FaWhatsapp,
} from 'react-icons/fa';

const FooterClient = () => {
    return (
        <footer className="border-t border-white/5 bg-[#0a1219] px-8 py-20 text-gray-400 lg:px-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 items-start gap-16 text-center md:grid-cols-3 md:gap-8 md:text-left">
                    {/* --- KOLOM 1: INFORMATION --- */}
                    <div className="flex flex-col items-center space-y-6 md:items-start">
                        <h3 className="mb-4 text-xl font-medium tracking-widest text-white uppercase">
                            Information
                        </h3>
                        <div className="flex max-w-xs gap-4">
                            <FaMapMarkerAlt className="mt-1 shrink-0 text-[#9c6b3b]" />
                            <p className="text-sm leading-relaxed">
                                Jalan Pratama. 55X, Jalan Nusa Dua Tanjung
                                Benoa, Benoa, Tanjung, Kec. Kuta Sel., Kabupaten
                                Badung, Bali
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaWhatsapp className="shrink-0 text-[#9c6b3b]" />
                            <p className="text-sm">0813-2550-5561</p>
                        </div>
                    </div>

                    {/* --- KOLOM 2: BRAND CENTRAL --- */}
                    <div className="flex flex-col items-center space-y-8 border-y border-white/10 px-4 py-12 md:border-x md:border-y-0 md:py-0">
                        <div className="text-center">
                            {/* Logo Gambar Anda */}
                            <img
                                src="/images/mandala_white.png" // Sesuaikan dengan path logo Anda
                                alt="Mandala Bistro & Bar Logo"
                                className="h-20 w-auto object-contain md:h-28"
                            />
                        </div>

                        <p className="max-w-xs text-center text-sm leading-relaxed font-light text-gray-500 italic">
                            A casual dining destination in Nusa Dua, Bali.
                            Serving curated Asian and European cuisine in a warm
                            and elegant setting.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-6">
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-white transition-all duration-300 hover:border-[#9c6b3b] hover:bg-[#9c6b3b]"
                            >
                                <FaFacebookF size={14} />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-all duration-300 hover:bg-[#9c6b3b] hover:text-white"
                            >
                                <FaInstagram size={16} />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-white transition-all duration-300 hover:border-[#9c6b3b] hover:bg-[#9c6b3b]"
                            >
                                <FaTripadvisor size={18} />
                            </a>
                        </div>
                    </div>

                    {/* --- KOLOM 3: OPENING HOURS --- */}
                    <div className="flex flex-col items-center space-y-6 md:items-end">
                        <h3 className="mb-4 text-xl font-medium tracking-widest text-white uppercase">
                            Opening Hours
                        </h3>
                        <div className="w-full max-w-[240px] space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                                <span>Mon - Fri :</span>
                                <span className="flex items-center gap-2 text-white italic">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#9c6b3b]"></span>
                                    11.00 AM - 22.00 PM
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                                <span>Sat - Sun :</span>
                                <span className="flex items-center gap-2 text-white italic">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#9c6b3b]"></span>
                                    11.00 AM - 22.00 PM
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                                <span>Holiday :</span>
                                <span className="flex items-center gap-2 text-white italic">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#9c6b3b]"></span>
                                    11.00 AM - 22.00 PM
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="mt-20 border-t border-white/5 pt-8 text-center text-[10px] tracking-[0.3em] text-gray-600 uppercase">
                    © {new Date().getFullYear()} Mandala Bistro & Bar. All
                    Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default FooterClient;
