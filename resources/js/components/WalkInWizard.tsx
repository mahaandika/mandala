import { Button } from '@/components/ui/button';
import { CartItem, Category, Menu, Table } from '@/types/dashboard';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Search,
    ShoppingBag,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WalkInWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMoreTables: () => void;
    selectedTables: Table[];
    initialPax: number;
    isAddMenuMode?: boolean;
    existingBookingId?: number | null;
    gapTimeLimit?: string | null;
}

export default function WalkInWizard({
    isOpen,
    onClose,
    onAddMoreTables,
    selectedTables,
    initialPax,
    isAddMenuMode = false,
    existingBookingId = null,
    gapTimeLimit = null,
}: WalkInWizardProps) {
    const [step, setStep] = useState(1);
    const [pax, setPax] = useState(initialPax);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [searchMenu, setSearchMenu] = useState('');
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (isAddMenuMode) {
                setStep(2);
            } else {
                setStep(1);
            }
            setCart([]);
        }
    }, [isOpen, isAddMenuMode]);

    useEffect(() => {
        setPax(initialPax);
    }, [initialPax]);

    useEffect(() => {
        if (isOpen && step === 2) fetchMenus();
    }, [step, isOpen, activeCategory]);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && step === 2) fetchMenus();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchMenu]);

    const fetchMenus = async () => {
        setLoadingMenu(true);
        try {
            const res = await axios.get('/admin/api/menus', {
                params: { category_id: activeCategory, search: searchMenu },
            });
            setMenus(res.data.menus);
            if (categories.length === 0) setCategories(res.data.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMenu(false);
        }
    };

    const addToCart = (menu: Menu) => {
        setCart((prev) => {
            const exist = prev.find((i) => i.id === menu.id);
            if (exist)
                return prev.map((i) =>
                    i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i,
                );
            return [...prev, { ...menu, quantity: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((i) =>
                    i.id === id
                        ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                        : i,
                )
                .filter((i) => i.quantity > 0),
        );
    };

    const cartTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const handleConfirm = () => {
        if (isAddMenuMode && existingBookingId) {
            if (cart.length === 0) return alert('Keranjang kosong');
            router.post(
                `/admin/bookings/${existingBookingId}/add-items`,
                {
                    items: cart.map((i) => ({
                        id: i.id,
                        quantity: i.quantity,
                    })),
                },
                {
                    onSuccess: () => {
                        onClose();
                        setCart([]);
                    },
                    onError: (err) => alert('Error adding items'),
                },
            );
            return;
        }
        if (selectedTables.length === 0)
            return alert('Pilih meja minimal satu');
        router.post(
            '/admin/walk-in',
            {
                table_ids: selectedTables.map((t) => t.id),
                total_people: pax,
                items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
            },
            {
                onSuccess: () => {
                    onClose();
                    setCart([]);
                },
                onError: (err) => alert(Object.values(err)[0]),
            },
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                    <div>
                        <h2 className="text-xl font-bold">
                            {isAddMenuMode ? 'Tambah Pesanan' : 'New Walk-In'}
                        </h2>
                        {!isAddMenuMode && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <StepIndicator
                                    label="Tables"
                                    current={step}
                                    stepNum={1}
                                />{' '}
                                <ChevronRight size={12} />
                                <StepIndicator
                                    label="Menu"
                                    current={step}
                                    stepNum={2}
                                />{' '}
                                <ChevronRight size={12} />
                                <StepIndicator
                                    label="Confirm"
                                    current={step}
                                    stepNum={3}
                                />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Warning Limit */}
                {gapTimeLimit && !isAddMenuMode && (
                    <div className="flex animate-in items-start gap-3 border-b border-red-100 bg-red-50 px-4 py-3 slide-in-from-top-2">
                        <AlertTriangle
                            className="mt-0.5 shrink-0 text-red-600"
                            size={18}
                        />
                        <div>
                            <p className="text-sm font-bold text-red-800">
                                Booking Terbatas (Gap)
                            </p>
                            <p className="text-xs text-red-700">
                                Tamu HARUS checkout sebelum jam{' '}
                                <span className="rounded bg-red-100 px-1 font-black">
                                    {gapTimeLimit}
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && !isAddMenuMode && (
                        <div className="space-y-6">
                            <div className="rounded-lg border bg-blue-50 p-4">
                                <h3 className="text-sm font-semibold text-blue-900">
                                    Meja Terpilih:
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedTables.map((t) => (
                                        <span
                                            key={t.id}
                                            className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-sm font-bold shadow-sm"
                                        >
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={onAddMoreTables}
                                    className="mt-4 h-9 w-full border-blue-300 bg-white text-sm text-blue-700 hover:bg-blue-100"
                                >
                                    + Pilih / Tambah Meja Lain (Peta)
                                </Button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Jumlah Tamu (Pax)
                                </label>
                                <div className="mt-2 flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setPax(Math.max(1, pax - 1))
                                        }
                                    >
                                        <Minus size={16} />
                                    </Button>
                                    <span className="w-8 text-center text-xl font-bold">
                                        {pax}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPax(pax + 1)}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex h-full flex-col space-y-4">
                            <div className="sticky top-0 z-10 space-y-2 bg-white pb-2">
                                <div className="relative">
                                    <Search
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                        size={16}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cari menu..."
                                        className="w-full rounded-lg border py-2 pr-4 pl-9 text-sm"
                                        value={searchMenu}
                                        onChange={(e) =>
                                            setSearchMenu(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                                    <CategoryButton
                                        active={activeCategory === 'all'}
                                        label="All"
                                        onClick={() => setActiveCategory('all')}
                                    />
                                    {categories.map((cat) => (
                                        <CategoryButton
                                            key={cat.id}
                                            active={activeCategory === cat.id}
                                            label={cat.name}
                                            onClick={() =>
                                                setActiveCategory(cat.id)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="min-h-[300px] flex-1 overflow-y-auto">
                                {loadingMenu ? (
                                    <div className="py-10 text-center text-sm text-gray-500">
                                        Loading...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {menus.map((menu) => {
                                            const item = cart.find(
                                                (c) => c.id === menu.id,
                                            );
                                            return (
                                                <div
                                                    key={menu.id}
                                                    className="flex flex-col rounded-lg border p-3 hover:shadow-md"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="line-clamp-2 text-sm font-bold">
                                                            {menu.name}
                                                        </h4>
                                                        <p className="mt-1 text-xs font-bold text-orange-600">
                                                            Rp{' '}
                                                            {Number(
                                                                menu.price,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="mt-3">
                                                        {item ? (
                                                            <div className="flex items-center justify-between rounded bg-orange-50 px-2 py-1">
                                                                <button
                                                                    onClick={() =>
                                                                        updateQty(
                                                                            menu.id,
                                                                            -1,
                                                                        )
                                                                    }
                                                                    className="px-1 text-orange-600"
                                                                >
                                                                    <Minus
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </button>
                                                                <span className="text-xs font-bold">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        updateQty(
                                                                            menu.id,
                                                                            1,
                                                                        )
                                                                    }
                                                                    className="px-1 text-orange-600"
                                                                >
                                                                    <Plus
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 w-full bg-slate-900 text-xs"
                                                                onClick={() =>
                                                                    addToCart(
                                                                        menu,
                                                                    )
                                                                }
                                                            >
                                                                Tambah
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50 p-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-bold text-orange-900">
                                        <ShoppingBag size={16} />{' '}
                                        {cart.reduce(
                                            (a, b) => a + b.quantity,
                                            0,
                                        )}{' '}
                                        Items
                                    </div>
                                    <span className="text-sm font-bold text-orange-700">
                                        Rp {cartTotal.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            {!isAddMenuMode && (
                                <div className="space-y-3 rounded-lg border p-4 shadow-sm">
                                    <h3 className="border-b pb-2 text-sm font-bold">
                                        Detail Reservasi
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-gray-500">
                                            Meja
                                        </span>
                                        <span className="text-right font-medium">
                                            {selectedTables
                                                .map((t) => t.name)
                                                .join(', ')}
                                        </span>
                                        <span className="text-gray-500">
                                            Pax
                                        </span>
                                        <span className="text-right font-medium">
                                            {pax} Orang
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                                <h3 className="border-b pb-2 text-sm font-bold">
                                    {isAddMenuMode
                                        ? 'Tambahan Pesanan'
                                        : 'Pesanan'}
                                </h3>
                                <div className="max-h-40 space-y-2 overflow-y-auto">
                                    {cart.map((i) => (
                                        <div
                                            key={i.id}
                                            className="flex justify-between text-sm"
                                        >
                                            <span>
                                                {i.quantity}x {i.name}
                                            </span>
                                            <span>
                                                Rp{' '}
                                                {(
                                                    i.price * i.quantity
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                    <span>Total</span>
                                    <span>Rp {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between border-t bg-gray-50 p-4">
                    {step > 1 && !(isAddMenuMode && step === 2) ? (
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                        >
                            <ChevronLeft size={16} className="mr-2" /> Back
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            className="bg-slate-900 hover:bg-slate-800"
                        >
                            Next <ChevronRight size={16} className="ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConfirm}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isAddMenuMode
                                ? 'Simpan Tambahan'
                                : 'Confirm & Check In'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

const StepIndicator = ({
    label,
    current,
    stepNum,
}: {
    label: string;
    current: number;
    stepNum: number;
}) => (
    <span className={current >= stepNum ? 'font-bold text-orange-600' : ''}>
        {stepNum}. {label}
    </span>
);
const CategoryButton = ({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors ${active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}
    >
        {label}
    </button>
);
