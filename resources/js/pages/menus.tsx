import NavbarClient from '@/components/navbar-client';
import { login } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    Settings2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* =====================================================
| TYPES
===================================================== */
type Menu = {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
};

type Category = {
    id: number;
    name: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Pagination<T> = {
    data: T[];
    links: PaginationLink[];
};

type PersonalizationType = {
    id: number;
    slug: string;
    name: string;
    label: string;
    selection_mode: 'include' | 'exclude';
    selection_type: 'single' | 'multiple';
    personalization_options: {
        id: number;
        name: string;
    }[];
};

type PageProps = {
    menus: Pagination<Menu>;
    categories: Category[];
    personalizations: PersonalizationType[];
    filters: {
        search?: string;
        category?: string | number;
        personalizations?: Record<string, any>;
    };
    auth: {
        user?: any;
    };
};

export default function Menus() {
    const { menus, categories, personalizations, filters, auth } =
        usePage<PageProps>().props;

    /* ================= STATE ================= */
    const [search, setSearch] = useState(filters.search ?? '');
    const [activeCategory, setActiveCategory] = useState<number | null>(
        filters.category ? Number(filters.category) : null,
    );
    const [selectedPersonalizations, setSelectedPersonalizations] = useState<
        Record<string, number[]>
    >(filters.personalizations ?? {});

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Efek untuk menghilangkan notifikasi otomatis setelah 3 detik
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    /* ================= EFFECT ================= */
    useEffect(() => {
        setSelectedPersonalizations(filters.personalizations ?? {});
        setSearch(filters.search ?? '');
        setActiveCategory(filters.category ? Number(filters.category) : null);
    }, [filters]);

    /* ================= LOGIKA FILTER ================= */

    // Perbaikan Error TS: Menggunakan Record<string, any> sebagai ganti object
    const performQuery = (params: Record<string, any>) => {
        router.get('/menus', params, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            performQuery({
                search: value,
                category: activeCategory,
                personalizations: selectedPersonalizations,
            });
        }, 600);
    };

    const selectCategory = (id: number | null) => {
        setActiveCategory(id);
        performQuery({
            search,
            category: id,
            personalizations: selectedPersonalizations,
        });
    };

    const toggleOption = (type: PersonalizationType, optionId: number) => {
        setSelectedPersonalizations((prev) => {
            const key = type.slug;
            const current = prev[key]
                ? Object.values(prev[key]).map((id) => Number(id))
                : [];

            const updated =
                type.selection_type === 'single'
                    ? [optionId]
                    : current.includes(optionId)
                      ? current.filter((id) => id !== optionId)
                      : [...current, optionId];

            const nextState = { ...prev, [key]: updated };
            if (updated.length === 0) delete nextState[key];
            return nextState;
        });
    };

    const resetFilters = () => {
        setSelectedPersonalizations({});
        performQuery({
            search,
            category: activeCategory,
            personalizations: null,
        });
        setShowPersonalizeModal(false);
    };

    const applyPersonalization = () => {
        performQuery({
            search,
            category: activeCategory,
            personalizations:
                Object.keys(selectedPersonalizations).length > 0
                    ? selectedPersonalizations
                    : null,
        });
        setShowPersonalizeModal(false);
    };

    const handleAddToCart = (menu: Menu) => {
        if (!auth?.user) {
            setShowLoginModal(true);
            return;
        }

        router.post(
            '/carts/add',
            {
                menu_id: menu.id,
            },
            {
                preserveScroll: true,
                onStart: () => {
                    setLoadingId(menu.id); // Mulai loading pada tombol yang diklik
                },
                onSuccess: () => {
                    setNotification({
                        message: `${menu.name} successfully added to cart!`,
                        type: 'success',
                    });
                },
                onError: () => {
                    setNotification({
                        message: 'Failed to add item. Please try again.',
                        type: 'error',
                    });
                },
                onFinish: () => {
                    setLoadingId(null); // Matikan loading apa pun hasilnya
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-[#02080c]">
            <NavbarClient />

            {/* --- POPUP NOTIFICATION --- */}
            {notification && (
                <div className="fixed top-24 left-1/2 z-[100] w-[90%] -translate-x-1/2 animate-in duration-300 fade-in slide-in-from-top-4 sm:right-6 sm:left-auto sm:w-full sm:max-w-md sm:translate-x-0">
                    <div
                        className={`flex items-center gap-4 rounded-lg border p-4 shadow-2xl backdrop-blur-md ${
                            notification.type === 'error'
                                ? 'border-red-500/50 bg-red-950/80'
                                : 'border-green-500/50 bg-green-950/80'
                        }`}
                    >
                        <div
                            className={`rounded-full p-2 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            {notification.type === 'error' ? (
                                <AlertCircle size={20} color="white" />
                            ) : (
                                <CheckCircle2 size={20} color="white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-white/60 transition-colors hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- HEADER SECTION (DESIGN MATCHED) --- */}
            <section className="relative h-[350px] w-full overflow-hidden md:h-[450px] lg:h-[550px]">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/wine-putih.jpg"
                        alt="Background"
                        className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                    <h1 className="font-serif text-5xl tracking-wide text-white md:text-6xl lg:text-7xl">
                        Our Menu
                    </h1>
                    <p className="mt-4 max-w-lg text-sm font-light text-gray-300 md:text-base">
                        Discover our carefully curated selection of culinary
                        delights.
                    </p>
                    <button
                        onClick={() => setShowPersonalizeModal(true)}
                        className="mt-8 flex cursor-pointer items-center gap-3 bg-[#9c6b3b] px-8 py-3 text-xs tracking-[0.2em] text-white uppercase transition-all hover:bg-[#b07a43] md:py-5"
                    >
                        <Settings2 size={16} /> Personalize Menu
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 z-20 h-32 w-full bg-gradient-to-t from-[#02080c] to-transparent" />
            </section>

            {/* --- SEARCH & CATEGORY SECTION --- */}
            <section className="relative z-30 px-6 pb-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 flex justify-center">
                        <div className="relative w-full max-w-sm md:max-w-2xl lg:max-w-4xl">
                            <input
                                type="text"
                                placeholder="Search your favorite dish..."
                                value={search}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="w-full border-b border-white bg-transparent py-4 pl-12 text-sm text-white outline-none focus:border-[#9c6b3b]"
                            />
                            <Search
                                className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-300"
                                size={20}
                            />
                        </div>
                    </div>

                    <div className="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto scroll-smooth pb-4">
                        <button
                            onClick={() => selectCategory(null)}
                            className={`min-w-[160px] border px-6 py-4 text-xs tracking-widest uppercase transition-all duration-300 ${
                                activeCategory === null
                                    ? 'border-[#9c6b3b] bg-[#9c6b3b] text-white'
                                    : 'border-[#9c6b3b] text-white hover:bg-[#9c6b3b]'
                            }`}
                        >
                            All Items
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => selectCategory(cat.id)}
                                className={`min-w-[160px] border px-6 py-4 text-xs tracking-widest uppercase transition-all duration-300 ${
                                    activeCategory === cat.id
                                        ? 'border-[#9c6b3b] bg-[#9c6b3b] text-white'
                                        : 'border-[#9c6b3b] text-white hover:bg-[#9c6b3b]'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- MENU GRID --- */}
                <div className="mx-auto mt-16 max-w-7xl">
                    {menus.data.length === 0 && (
                        <div className="py-20 text-center text-sm tracking-widest text-gray-400 uppercase">
                            No result found
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {menus.data.map((menu) => (
                            <div
                                key={menu.id}
                                className="group flex flex-col overflow-hidden rounded-md border border-white/5 bg-[#0a1219] shadow-xl transition-all duration-500 hover:border-[#9c6b3b]/30 hover:bg-[#0e1821]"
                            >
                                {/* Image Container - Menempel ke atas, kiri, kanan */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={`/storage/menus/${menu.image}`}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={menu.name}
                                    />
                                    {/* Overlay gradien halus agar teks lebih pop jika ada badge nantinya */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1219]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </div>

                                {/* Content Container - Baru diberi padding di sini */}
                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="mb-2 font-serif text-xl tracking-wide text-white transition-colors group-hover:text-[#c5a059]">
                                        {menu.name}
                                    </h3>

                                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed font-light text-gray-400">
                                        {menu.description}
                                    </p>

                                    <div className="mb-6 text-lg text-[#c5a059]">
                                        Rp{' '}
                                        {Number(menu.price).toLocaleString(
                                            'id-ID',
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(menu)}
                                        disabled={loadingId === menu.id}
                                        className={`group/btn relative mt-auto flex cursor-pointer items-center justify-center overflow-hidden border border-[#9c6b3b] py-3.5 text-[10px] tracking-[0.2em] text-white uppercase transition-all ${loadingId === menu.id ? 'cursor-not-allowed opacity-70' : 'hover:text-white'}`}
                                    >
                                        {/* Efek fill gold hanya muncul jika tidak sedang loading */}
                                        {loadingId !== menu.id && (
                                            <span className="absolute inset-0 translate-y-full bg-[#9c6b3b] transition-transform duration-300 group-hover/btn:translate-y-0" />
                                        )}

                                        <span className="relative z-10 flex items-center gap-2">
                                            {loadingId === menu.id ? (
                                                <>
                                                    <Loader2
                                                        size={14}
                                                        className="animate-spin"
                                                    />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Add to Cart'
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {menus.links.length > 3 && (
                        <div className="mt-20 flex justify-center gap-2">
                            {menus.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`border px-4 py-2 text-[10px] tracking-widest uppercase ${
                                        link.active
                                            ? 'bg-[#9c6b3b] text-white'
                                            : !link.url
                                              ? 'cursor-not-allowed text-gray-600'
                                              : 'text-white hover:bg-[#9c6b3b]'
                                    } border-[#9c6b3b]`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* --- PERSONALIZATION MODAL (DESIGN MATCHED) --- */}
            {showPersonalizeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowPersonalizeModal(false)}
                    />
                    <div className="no-scrollbar relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-[#0a1219] p-6 shadow-2xl md:p-10">
                        <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
                            <h2 className="font-serif text-2xl tracking-wide text-white md:text-3xl">
                                Personalize Your Menu
                            </h2>
                            <button
                                onClick={() => setShowPersonalizeModal(false)}
                                className="text-gray-500 hover:text-[#9c6b3b]"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-12">
                            {personalizations.map((type) => (
                                <section key={type.id}>
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="text-[#9c6b3b]">
                                            {type.selection_mode === 'exclude'
                                                ? '⚠️'
                                                : '✨'}
                                        </span>
                                        <h4 className="text-base font-bold tracking-widest text-white uppercase">
                                            {type.name}
                                        </h4>
                                    </div>
                                    <p className="mb-6 text-sm text-gray-300">
                                        {type.label}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {type.personalization_options.map(
                                            (opt) => {
                                                const isSelected =
                                                    selectedPersonalizations[
                                                        type.slug
                                                    ]?.some(
                                                        (id) =>
                                                            Number(id) ===
                                                            opt.id,
                                                    );
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() =>
                                                            toggleOption(
                                                                type,
                                                                opt.id,
                                                            )
                                                        }
                                                        className={`border px-2 py-3 text-[10px] tracking-widest uppercase transition-all duration-300 ${
                                                            isSelected
                                                                ? 'border-[#9c6b3b] bg-[#9c6b3b] text-white'
                                                                : 'border-[#9c6b3b] text-white hover:bg-[#9c6b3b]'
                                                        }`}
                                                    >
                                                        {opt.name}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row">
                            <button
                                onClick={resetFilters}
                                className="flex-1 border border-gray-500 py-4 text-[10px] tracking-[0.2em] text-gray-300 uppercase transition-all hover:border-white hover:text-white"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={applyPersonalization}
                                className="flex-1 bg-[#9c6b3b] py-4 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-[#b07a43]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LOGIN MODAL (DESIGN MATCHED) --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowLoginModal(false)}
                    />
                    <div className="relative w-full max-w-md border border-white/10 bg-[#0a1219] p-8 text-center shadow-2xl md:p-12">
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="mb-4 font-serif text-2xl text-white">
                            Login Required
                        </h2>
                        <p className="mb-8 text-sm font-light text-gray-400">
                            You need to be logged in to order our delicious
                            menu.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={login()}
                                className="w-full bg-[#9c6b3b] py-3.5 text-xs font-bold tracking-[0.2em] text-white uppercase"
                            >
                                Sign In Now
                            </Link>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full border border-white/10 py-3.5 text-[10px] text-gray-400 uppercase"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
