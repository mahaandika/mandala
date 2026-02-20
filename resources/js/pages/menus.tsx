import FooterClient from '@/components/footer-Client';
import NavbarClient from '@/components/navbar-client';
import PersonalizationModal from '@/components/PersonalizationModal';
import { login } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    LogIn, // <--- Ditambahkan
    Search,
    Settings2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    description?: string; // Opsional jika ada
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
    personalized_menus: Menu[];
    user_selected_ids: number[]; // ID yang sudah dipilih user di DB
    categories: Category[];
    personalizations: PersonalizationType[];
    filters: {
        search?: string;
        category?: string | number;
    };
    auth: {
        user?: any;
    };
};

export default function Menus() {
    const {
        menus,
        personalized_menus,
        user_selected_ids,
        categories,
        personalizations,
        filters,
        auth,
    } = usePage<PageProps>().props;

    /* ================= STATE ================= */
    const [search, setSearch] = useState(filters.search ?? '');
    const [activeCategory, setActiveCategory] = useState<number | null>(
        filters.category ? Number(filters.category) : null,
    );

    // Modal & Personalization State
    const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false); // <--- State baru untuk Modal Login

    const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(
        user_selected_ids || [],
    );
    const [loadingPref, setLoadingPref] = useState(false);

    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    /* ================= EFFECT ================= */
    // Sync state ketika data dari server (user_selected_ids) berubah
    useEffect(() => {
        setSelectedOptionIds(user_selected_ids || []);
    }, [user_selected_ids]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    /* ================= LOGIC ================= */
    const performQuery = (params: Record<string, any>) => {
        router.get('/menus', params, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timeout = setTimeout(() => {
            performQuery({ search: value, category: activeCategory });
        }, 600);
        return () => clearTimeout(timeout);
    };

    const handleToggle = (type: any, optionId: number) => {
        const optionIdsInThisType = type.personalization_options.map(
            (o: any) => o.id,
        );
        setSelectedOptionIds((prev) => {
            if (type.selection_type === 'single') {
                const filtered = prev.filter(
                    (id) => !optionIdsInThisType.includes(id),
                );
                return [...filtered, optionId];
            } else {
                return prev.includes(optionId)
                    ? prev.filter((id) => id !== optionId)
                    : [...prev, optionId];
            }
        });
    };

    const applyPersonalization = async () => {
        setLoadingPref(true);
        try {
            await axios.post('/personalization/save', {
                option_ids: selectedOptionIds,
            });
            setShowPersonalizeModal(false);
            router.reload({ preserveScroll: true });
            setNotification({
                message: 'Preferences updated!',
                type: 'success',
            });
        } catch (error) {
            setNotification({
                message: 'Failed to update preferences.',
                type: 'error',
            });
        } finally {
            setLoadingPref(false);
        }
    };

    const handleAddToCart = (menu: Menu) => {
        // PERUBAHAN DI SINI: Cek login dulu, tampilkan modal jika belum login
        if (!auth?.user) {
            setShowLoginModal(true);
            return;
        }

        router.post(
            '/carts/add',
            { menu_id: menu.id },
            {
                preserveScroll: true,
                onStart: () => setLoadingId(menu.id),
                onSuccess: () =>
                    setNotification({
                        message: `${menu.name} added to cart!`,
                        type: 'success',
                    }),
                onFinish: () => setLoadingId(null),
            },
        );
    };

    return (
        <div className="min-h-screen bg-[#02080c]">
            <NavbarClient />

            {/* --- NOTIFICATION --- */}
            {notification && (
                <div className="fixed top-24 right-6 z-[100] w-[90%] max-w-md animate-in fade-in slide-in-from-top-4 sm:right-6">
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
                        <p className="flex-1 text-sm font-medium text-white">
                            {notification.message}
                        </p>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-white/60 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <section className="relative h-[350px] w-full overflow-hidden md:h-[450px]">
                <div className="absolute inset-0">
                    <img
                        src="/images/wine-putih.jpg"
                        className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                    <h1 className="font-serif text-5xl tracking-wide text-white md:text-6xl">
                        Our Menu
                    </h1>
                    {auth.user && (
                        <button
                            onClick={() => setShowPersonalizeModal(true)}
                            className="mt-8 flex items-center gap-3 bg-[#9c6b3b] px-8 py-4 text-xs tracking-[0.2em] text-white uppercase transition-all hover:bg-[#b07a43]"
                        >
                            <Settings2 size={16} /> Change Your Personalization
                        </button>
                    )}
                </div>
                <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-[#02080c] to-transparent" />
            </section>

            {/* --- SEARCH & CATEGORY --- */}
            <section className="relative z-30 px-6 pb-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 flex justify-center">
                        <div className="relative w-full max-w-2xl">
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

                    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
                        <button
                            onClick={() =>
                                performQuery({ search, category: null })
                            }
                            className={`min-w-[160px] border px-6 py-4 text-xs tracking-widest uppercase transition-all ${
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
                                onClick={() =>
                                    performQuery({ search, category: cat.id })
                                }
                                className={`min-w-[160px] border px-6 py-4 text-xs tracking-widest uppercase transition-all ${
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

                <div className="mx-auto mt-16 max-w-7xl space-y-28">
                    {/* --- SECTION 1: YOUR FOOD PREFERENCES (Login Only) --- */}
                    {auth.user && (
                        <div>
                            <div className="mb-10 flex items-center gap-4">
                                <h2 className="font-serif text-3xl tracking-wide text-white">
                                    Your Food Preferences
                                </h2>
                                <div className="h-px flex-1 bg-[#c5a059]/20" />
                            </div>

                            {personalized_menus.length > 0 ? (
                                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                                    {personalized_menus.map((menu) => (
                                        <MenuCard
                                            key={`pref-${menu.id}`}
                                            menu={menu}
                                            loadingId={loadingId}
                                            onAdd={() => handleAddToCart(menu)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-[#c5a059]/20 bg-[#c5a059]/5 py-20 text-center">
                                    <p className="text-xs font-light tracking-[0.2em] text-[#c5a059]/60 uppercase">
                                        We cannot find menus matching your food
                                        preferences
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- SECTION 2: ALL FOODS --- */}
                    <div>
                        <div className="mb-10 flex items-center gap-4">
                            <h2 className="font-serif text-3xl tracking-wide text-white">
                                All Menus
                            </h2>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        {menus.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                                    {menus.data.map((menu) => (
                                        <MenuCard
                                            key={`all-${menu.id}`}
                                            menu={menu}
                                            loadingId={loadingId}
                                            onAdd={() => handleAddToCart(menu)}
                                        />
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
                                                className={`border px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${
                                                    link.active
                                                        ? 'border-[#9c6b3b] bg-[#9c6b3b] text-white'
                                                        : 'border-[#9c6b3b]/40 text-white hover:bg-[#9c6b3b]'
                                                } ${!link.url ? 'cursor-not-allowed opacity-30' : ''}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-24 text-center">
                                <p className="text-xs font-light tracking-[0.2em] text-gray-500 uppercase">
                                    We cannot find any menus
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <FooterClient />

            {/* --- MODAL KONFIRMASI LOGIN  */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowLoginModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md animate-in overflow-hidden rounded-lg border border-[#9c6b3b]/30 bg-[#0a1219] p-8 text-center shadow-2xl duration-200 zoom-in-95 fade-in">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#9c6b3b]/10">
                            <LogIn className="text-[#9c6b3b]" size={32} />
                        </div>

                        <h3 className="mb-3 font-serif text-2xl tracking-wide text-white">
                            Login Required
                        </h3>

                        <p className="mb-8 text-sm leading-relaxed font-light text-gray-400">
                            To add{' '}
                            <span className="font-medium text-white">
                                items to your cart
                            </span>{' '}
                            and enjoy our exclusive features, please log in to
                            your account first.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="flex-1 rounded border border-white/10 py-3 text-xs tracking-widest text-white uppercase transition-colors hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => router.visit(login())}
                                className="flex-1 rounded bg-[#9c6b3b] py-3 text-xs tracking-widest text-white uppercase shadow-[0_0_15px_rgba(156,107,59,0.3)] transition-colors hover:bg-[#8a5d32]"
                            >
                                Login Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALS EXISTING --- */}
            <PersonalizationModal
                show={showPersonalizeModal}
                loading={loadingPref}
                data={personalizations}
                selectedIds={selectedOptionIds}
                onToggle={handleToggle}
                onSave={applyPersonalization}
                onClose={() => setShowPersonalizeModal(false)}
            />
        </div>
    );
}

/* =====================================================
| SUB-COMPONENT: MENU CARD
===================================================== */
function MenuCard({
    menu,
    loadingId,
    onAdd,
}: {
    menu: Menu;
    loadingId: number | null;
    onAdd: () => void;
}) {
    const isLoading = loadingId === menu.id;

    return (
        <div className="group flex flex-col overflow-hidden rounded-md border border-white/5 bg-[#0a1219] shadow-xl transition-all duration-500 hover:border-[#9c6b3b]/30 hover:bg-[#0e1821]">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={`/storage/menus/${menu.image}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={menu.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1219]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>

            <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 font-serif text-xl tracking-wide text-white transition-colors group-hover:text-[#c5a059]">
                    {menu.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed font-light text-gray-400">
                    {menu.description}
                </p>
                <div className="mb-6 text-lg text-[#c5a059]">
                    Rp {Number(menu.price).toLocaleString('id-ID')}
                </div>

                <button
                    onClick={onAdd}
                    disabled={isLoading}
                    className="group/btn relative mt-auto flex items-center justify-center overflow-hidden border border-[#9c6b3b] py-3.5 text-[10px] tracking-[0.2em] text-white uppercase transition-all disabled:opacity-50"
                >
                    {!isLoading && (
                        <span className="absolute inset-0 translate-y-full bg-[#9c6b3b] transition-transform duration-300 group-hover/btn:translate-y-0" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Add to Cart'
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
}
