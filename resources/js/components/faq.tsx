import { useState } from 'react';

// Data FAQ dipisahkan agar mudah diupdate
const faqData = [
    {
        question: 'How Do I Make A Regular Table Booking?',
        answer: "You can make a regular table booking through our website's reservation form. Simply select your preferred date, time, and number of guests, then confirm your booking.",
    },
    {
        question: 'How Do I Cancel A Booking?',
        answer: 'To cancel your booking, please contact us via phone or WhatsApp at least 24 hours in advance. This helps us manage our reservations and offer the table to other guests.',
    },
    {
        question: 'What Happens If I Arrive Late For My Reservation?',
        answer: 'If you arrive more than 15 minutes late, your reservation will be considered canceled and your table may be given to another customer. We kindly ask for your understanding and request that you arrive on time.',
    },
];

const FAQSection = () => {
    // State untuk melacak item mana yang sedang terbuka
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index: any) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="bg-[#050a11] px-6 py-16 md:py-24">
            <div className="mx-auto flex max-w-7xl flex-col items-start gap-12 lg:flex-row">
                {/* Bagian Kiri: Teks & Akordeon */}
                <div className="w-full lg:w-1/2">
                    <p className="mb-4 text-sm font-bold tracking-[0.3em] text-[#c5a059]">
                        FAQ
                    </p>
                    <h2 className="mb-10 font-serif text-4xl text-white md:text-5xl">
                        General Question
                    </h2>

                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                            <div
                                key={index}
                                className="overflow-hidden border border-white/10"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="flex w-full items-center justify-between p-5 text-left text-white transition-colors hover:bg-white/5"
                                >
                                    <span className="text-lg font-medium">
                                        {item.question}
                                    </span>
                                    <span
                                        className={`text-2xl text-[#c5a059] transition-transform duration-300 ${activeIndex === index ? 'rotate-45' : ''}`}
                                    >
                                        +
                                    </span>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${activeIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="border-t border-white/5 p-5 pt-0 text-gray-400">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bagian Kanan: Gambar (Responsif) */}
                <div className="w-full lg:w-1/2 lg:self-stretch">
                    <div className="relative h-full min-h-[400px] w-full overflow-hidden shadow-2xl">
                        <img
                            src="images/gelas-wine-merah.jpg"
                            alt="Mandala FAQ"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
