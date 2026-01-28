import FooterClient from '@/components/footer-Client';
import NavbarClient from '@/components/navbar-client';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    CreditCard,
    MapPin,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    User,
    Users,
    Utensils,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Table {
    id: number;
    table_name: string;
}

interface MenuItem {
    id: number; // Ini ID dari table booking_items (untuk patch/delete)
    menu_id: number;
    name: string;
    price: number;
    qty: number;
}

interface BookingProps {
    booking: {
        id: number;
        booking_code: string;
        total_people: number;
        booking_date: string;
        booking_time: string;
        user: {
            name: string;
            email: string;
            phone: string;
        };
        tables: Table[];
        menus: MenuItem[];
        validation: {
            can_checkout: boolean;
            warnings: string[];
            errors: string[];
        };
    } | null;
}

export default function Carts({ booking }: BookingProps) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    // State Notifikasi Custom
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    // Auto-hide notifikasi setelah 3 detik
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#050a11] text-white">
                <NavbarClient />
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="mb-6 rounded-full bg-white/5 p-8 outline-1 outline-white/10">
                        <ShoppingBag size={64} className="text-gray-600" />
                    </div>
                    <h2 className="mb-2 font-serif text-3xl">
                        Keranjang Kosong
                    </h2>
                    <p className="mb-8 text-gray-400">
                        Anda tidak memiliki reservasi aktif saat ini.
                    </p>
                    <Link
                        href="/reservations"
                        className="rounded-sm bg-[#c5a059] px-10 py-4 text-sm font-bold tracking-widest text-black uppercase transition-all hover:bg-white"
                    >
                        Mulai Reservasi
                    </Link>
                </div>
                <FooterClient />
            </div>
        );
    }

    // Format Tanggal: 2026-01-09 -> 9 Januari 2026
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Belum dipilih';
        // Menghapus bagian jam jika string berisi ISO format (T00:00:00...)
        const cleanDate = dateString.split('T')[0];
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(cleanDate));
    };

    // Format Jam: 00:22:00 -> 00:22
    const formatTime = (timeString: string) => {
        if (!timeString) return '--:--';
        return timeString.split(':').slice(0, 2).join(':');
    };

    const handleUpdateQty = (
        itemId: number,
        action: 'increment' | 'decrement',
    ) => {
        router.patch(
            `/carts/items/${itemId}`,
            { action },
            {
                preserveScroll: true,
                onSuccess: () =>
                    setNotification({
                        type: 'success',
                        message: 'Jumlah berhasil diperbarui',
                    }),
                onError: () =>
                    setNotification({
                        type: 'error',
                        message: 'Gagal memperbarui jumlah',
                    }),
            },
        );
    };

    const handleRemoveItem = (itemId: number) => {
        router.delete(`/carts/items/${itemId}`, {
            preserveScroll: true,
            onSuccess: () =>
                setNotification({
                    type: 'success',
                    message: 'Menu dihapus dari keranjang',
                }),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const hasTable = booking.tables && booking.tables.length > 0;
    const hasMenu = (booking.menus ?? []).length > 0;
    const canCheckout =
        hasTable && hasMenu && booking?.validation?.can_checkout;
    const subtotalMenu =
        booking.menus?.reduce((acc, item) => acc + item.price * item.qty, 0) ||
        0;

    const handlePayment = async () => {
        if (!(window as any).snap) {
            setNotification({
                type: 'error',
                message:
                    'Sistem pembayaran belum siap. Silakan refresh halaman.',
            });
            return;
        }
        try {
            const response = await axios.post('/payment/checkout', {
                booking_id: booking.id,
            });

            // Panggil popup Midtrans
            (window as any).snap.pay(response.data.snap_token, {
                onSuccess: function (result: any) {
                    setNotification({
                        type: 'success',
                        message: 'Pembayaran Berhasil!',
                    });
                    router.visit(`/payment-finish/${booking.id}`);
                },
                onPending: function (result: any) {
                    setNotification({
                        type: 'success',
                        message: 'Menunggu pembayaran Anda.',
                    });
                },
                onError: function (result: any) {
                    setNotification({
                        type: 'error',
                        message: 'Pembayaran gagal.',
                    });
                },
            });
        } catch (error) {
            // Ambil pesan error dari backend (422)
            const errorMsg =
                error.response?.data?.message || 'Gagal memproses checkout.';
            setNotification({ type: 'error', message: errorMsg });
        }
    };

    return (
        <div className="min-h-screen bg-[#050a11] text-white">
            <Head title="Cart Summary" />
            <NavbarClient />

            <div className="mx-auto max-w-7xl px-4 py-12 pt-20 md:px-8 lg:px-16">
                {/* HEADER */}
                <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="mb-2 font-serif text-4xl">
                            Order Summary
                        </h1>
                        {/* <p className="font-mono text-sm tracking-widest text-gray-400 uppercase">
                            Booking Code:{' '}
                            <span className="font-bold text-[#c5a059]">
                                {booking.booking_code}
                            </span>
                        </p> */}
                    </div>
                    <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="flex items-center gap-2 rounded-sm border border-red-500/30 px-5 py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-600 hover:text-white"
                    >
                        <Trash2 size={14} /> CANCEL RESERVATION
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* CUSTOMER & TABLE DETAILS */}
                        <div
                            className={`rounded-sm border ${hasTable ? 'border-white/10' : 'border-red-500/40 bg-red-500/5'} bg-[#0c141f] p-6 shadow-xl`}
                        >
                            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-[#c5a059]" />
                                    <h2 className="text-xl font-semibold tracking-tight uppercase">
                                        Booking Details
                                    </h2>
                                </div>
                            </div>

                            {!hasTable ? (
                                <div className="py-6 text-center">
                                    <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                                    <h3 className="mb-2 text-lg font-bold text-white uppercase">
                                        Meja Belum Dipilih
                                    </h3>
                                    <p className="mb-6 text-sm text-gray-400">
                                        Anda belum menentukan meja. Silakan
                                        pilih meja untuk melanjutkan.
                                    </p>
                                    <Link
                                        href="/reservations"
                                        className="inline-flex items-center gap-2 rounded-sm bg-[#c5a059] px-8 py-3 text-sm font-bold text-black uppercase transition-all hover:bg-white"
                                    >
                                        Pilih Meja Sekarang{' '}
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <p className="text-sm tracking-widest text-gray-400 uppercase">
                                                Customer
                                            </p>
                                            <p className="font-medium">
                                                {booking.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {booking.user?.email}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {booking.user?.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <p className="mb-1 text-xs tracking-widest text-gray-500 uppercase">
                                                Schedule & Table
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {formatDate(
                                                    booking.booking_date,
                                                )}{' '}
                                                |{' '}
                                                {formatTime(
                                                    booking.booking_time,
                                                )}
                                            </p>

                                            {/* Indikator Nama Meja dengan warna dinamis */}
                                            <div
                                                className={`mt-1 mb-1 flex items-center gap-2 font-bold ${
                                                    booking.validation.errors
                                                        .length > 0
                                                        ? 'text-red-500'
                                                        : booking.validation
                                                                .warnings
                                                                .length > 0
                                                          ? 'text-yellow-500'
                                                          : 'text-[#c5a059]'
                                                }`}
                                            >
                                                <MapPin size={14} />
                                                <span>
                                                    {booking.tables
                                                        .map(
                                                            (t) => t.table_name,
                                                        )
                                                        .join(', ')}
                                                </span>
                                            </div>

                                            {/* MENAMPILKAN ERROR DARI BACKEND */}
                                            {booking.validation.errors.length >
                                                0 && (
                                                <div className="mt-3 space-y-2">
                                                    {booking.validation.errors.map(
                                                        (err, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-2 text-[11px] leading-relaxed text-red-400"
                                                            >
                                                                <AlertCircle
                                                                    size={14}
                                                                    className="mt-0.5 shrink-0"
                                                                />
                                                                <span>
                                                                    {err}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            {/* MENAMPILKAN WARNING DARI BACKEND */}
                                            {booking.validation.warnings
                                                .length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {booking.validation.warnings.map(
                                                        (warn, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-2 rounded-sm border border-yellow-500/20 bg-yellow-500/10 p-2 text-[11px] leading-relaxed text-yellow-400"
                                                            >
                                                                <AlertTriangle
                                                                    size={14}
                                                                    className="mt-0.5 shrink-0"
                                                                />
                                                                <span>
                                                                    {warn}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                <Users size={12} />{' '}
                                                {booking.total_people} People
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ORDER MENU SECTION */}
                        <div className="rounded-sm border border-white/10 bg-[#0c141f] p-6 shadow-xl">
                            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-[#c5a059]" />
                                    <h2 className="text-xl font-semibold tracking-tight uppercase">
                                        Order Menu
                                    </h2>
                                </div>
                                <Link
                                    href="/menus"
                                    className="border-b border-[#c5a059]/30 text-xs font-bold text-[#c5a059] transition-all hover:border-white hover:text-white"
                                >
                                    + ADD MENU
                                </Link>
                            </div>

                            <div className="space-y-6">
                                {booking.menus && booking.menus.length > 0 ? (
                                    booking.menus.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col items-start justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                                        >
                                            <div className="mb-4 sm:mb-0">
                                                <p className="text-lg font-medium text-white">
                                                    {item.name}
                                                </p>
                                                <p className="font-mono text-sm text-[#c5a059]">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </div>

                                            <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-end">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center overflow-hidden rounded-sm border border-white/10 bg-black/40">
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQty(
                                                                item.id,
                                                                'decrement',
                                                            )
                                                        }
                                                        className="p-2 text-gray-400 hover:bg-white/5 disabled:opacity-20"
                                                        disabled={item.qty <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-10 text-center font-mono text-sm">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateQty(
                                                                item.id,
                                                                'increment',
                                                            )
                                                        }
                                                        className="p-2 text-[#c5a059] hover:bg-white/5"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <span className="min-w-[100px] text-right font-mono font-bold text-white">
                                                        {formatCurrency(
                                                            item.price *
                                                                item.qty,
                                                        )}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-gray-600 transition-colors hover:text-red-500"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-sm border-2 border-dashed border-white/5 bg-black/10 py-12 text-center">
                                        <p className="mb-4 text-gray-500 italic">
                                            Keranjang menu masih kosong.
                                        </p>
                                        <Link
                                            href="/menus"
                                            className="inline-block rounded-sm border border-[#c5a059]/30 px-6 py-2 text-xs font-bold tracking-widest text-[#c5a059] uppercase transition-all hover:bg-[#c5a059] hover:text-black"
                                        >
                                            Daftar Menu
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 rounded-sm border border-[#c5a059]/30 bg-[#0c141f] p-8 shadow-2xl">
                            <h2 className="mb-6 border-b border-white/5 pb-4 font-serif text-2xl tracking-widest text-white uppercase">
                                Checkout
                            </h2>
                            <div className="mb-8 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        Reservation Fee
                                    </span>
                                    <span className="text-[10px] font-bold text-green-500 uppercase">
                                        Free
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        Subtotal Menu
                                    </span>
                                    <span className="font-mono text-white">
                                        {formatCurrency(subtotalMenu)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-4 text-xl font-bold">
                                    <span className="text-white">
                                        Grand Total
                                    </span>
                                    <span className="font-mono text-[#c5a059]">
                                        {formatCurrency(subtotalMenu)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handlePayment}
                                disabled={!canCheckout}
                                className="flex w-full items-center justify-center gap-3 rounded-sm bg-[#c5a059] py-4 text-sm font-bold tracking-widest text-black uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale"
                            >
                                <CreditCard className="h-5 w-5" />
                                {!hasTable
                                    ? 'Pilih Meja Dahulu'
                                    : !hasMenu
                                      ? 'Pilih Menu Dahulu'
                                      : !booking.validation.can_checkout // Tambahan kondisi ini
                                        ? 'Jadwal Tidak Tersedia'
                                        : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <FooterClient />

            {/* MODAL CANCEL (Sama seperti sebelumnya) */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={() => setIsCancelModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md transform rounded-sm border border-white/10 bg-[#0c141f] p-10 shadow-2xl">
                        <div className="mb-8 flex flex-col items-center text-center">
                            <Trash2 className="mb-4 h-12 w-12 text-red-500" />
                            <h3 className="mb-3 font-serif text-3xl text-white">
                                Batalkan Reservasi?
                            </h3>
                            <p className="text-sm text-gray-400">
                                Semua data meja dan menu akan dihapus. Anda
                                harus memulai ulang proses reservasi.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.delete('/carts/cancel')}
                                className="w-full rounded-sm bg-red-600 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-red-700"
                            >
                                Ya, Batalkan
                            </button>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="w-full rounded-sm border border-white/10 py-4 text-xs font-bold tracking-widest text-gray-400 uppercase transition-all hover:text-white"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
