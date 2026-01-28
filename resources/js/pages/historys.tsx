import FooterClient from '@/components/footer-Client';
import NavbarClient from '@/components/navbar-client';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Filter,
    MapPin,
    QrCode,
    Receipt,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    bookings: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        from_date?: string; // Ganti dari date
        to_date?: string; // Tambah to_date
        status: string;
    };
}

export default function History({ bookings, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            window.location.pathname,
            { ...filters, [key]: value },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleReset = () => {
        router.get(
            window.location.pathname,
            {},
            {
                preserveState: false,
                replace: true,
            },
        );
    };

    const openQrModal = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Fungsi handlePayment yang sudah diperbaiki
    const handlePayment = async (order: any) => {
        if (!(window as any).snap) {
            setNotification({
                type: 'error',
                message:
                    'Sistem pembayaran belum siap. Silakan refresh halaman.',
            });
            return;
        }

        try {
            // Gunakan order.id yang spesifik dari card yang diklik
            const response = await axios.post('/payment/checkout', {
                booking_id: order.id,
            });

            (window as any).snap.pay(response.data.snap_token, {
                onSuccess: function () {
                    setNotification({
                        type: 'success',
                        message: 'Pembayaran Berhasil!',
                    });
                    router.visit(`/payment-finish/${order.id}`);
                },
                onPending: function () {
                    setNotification({
                        type: 'success',
                        message: 'Menunggu pembayaran Anda.',
                    });
                },
                onError: function () {
                    setNotification({
                        type: 'error',
                        message: 'Pembayaran gagal.',
                    });
                },
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Gagal memproses checkout.',
            });
        }
    };

    const formatCurrency = (amount: any) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    const getStatusUI = (booking: any) => {
        const bStatus = booking.booking_status;
        const pStatus = booking.payment_status;

        if (
            (bStatus === 'reserve' || bStatus === 'seated') &&
            pStatus === 'success'
        ) {
            return {
                label: 'Confirmed',
                type: 'confirmed',
                class: 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20',
            };
        }
        if (bStatus === 'completed' && pStatus === 'success') {
            return {
                label: 'Completed',
                type: 'completed',
                class: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
            };
        }
        if (pStatus === 'pending' || pStatus === 'placed') {
            return {
                label: 'Unpaid',
                type: 'unpaid',
                class: 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20',
            };
        }
        return {
            label: 'Cancelled',
            type: 'cancelled',
            class: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
        };
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#050a11] text-white selection:bg-[#c5a059]/30">
            <NavbarClient />

            {/* Render Notification Toast */}
            {notification && (
                <div className="fixed top-24 right-5 z-[110] animate-in slide-in-from-right-5 fade-in">
                    <div
                        className={`flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-md ${
                            notification.type === 'success'
                                ? 'border-green-500/50 bg-green-500/20 text-green-400'
                                : 'border-red-500/50 bg-red-500/20 text-red-400'
                        }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 size={20} />
                        ) : (
                            <AlertCircle size={20} />
                        )}
                        <p className="text-sm font-bold tracking-wide">
                            {notification.message}
                        </p>
                    </div>
                </div>
            )}

            <main className="flex-grow px-4 pt-20 pb-20 md:px-6 md:pt-40">
                <div className="mx-auto max-w-4xl">
                    {/* Header & Filter Controls */}
                    <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div>
                            <h1 className="font-serif text-3xl tracking-wide md:text-4xl">
                                Order History
                            </h1>
                            <p className="mt-2 text-sm tracking-[0.1em] tracking-wider text-gray-400 uppercase">
                                {filters.from_date || filters.to_date
                                    ? `Filtered: ${bookings.total} results`
                                    : `Showing latest ${bookings.total} reservations`}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Input From Date */}
                            <div className="relative">
                                <Calendar
                                    size={14}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-[#c5a059]"
                                />
                                <input
                                    type="date"
                                    value={filters.from_date || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'from_date',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-[12px] text-gray-300 [color-scheme:dark] focus:border-[#c5a059]/50 focus:outline-none"
                                />
                            </div>

                            {/* Input To Date */}
                            <div className="relative">
                                <Calendar
                                    size={14}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-[#c5a059]"
                                />
                                <input
                                    type="date"
                                    value={filters.to_date || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'to_date',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-[12px] text-gray-300 [color-scheme:dark] focus:border-[#c5a059]/50 focus:outline-none"
                                />
                            </div>

                            {/* Select Status */}
                            <div className="relative">
                                <Filter
                                    size={14}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-[#c5a059]"
                                />
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'status',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#0c141f] py-2 pr-8 pl-9 text-[12px] text-gray-300 focus:border-[#c5a059]/50 focus:outline-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Tombol Reset */}
                            <button
                                onClick={handleReset}
                                className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-gray-400 transition-all hover:bg-white/10 hover:text-[#c5a059]"
                                title="Clear Filters"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {bookings.data.map((order) => {
                            const status = getStatusUI(order);
                            return (
                                <div
                                    key={order.id}
                                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0c141f] transition-all hover:border-[#c5a059]/40"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-xl bg-[#c5a059]/15 p-3 text-[#c5a059]">
                                                        <Receipt size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold tracking-[0.15em] text-[#c5a059] uppercase">
                                                            Order ID
                                                        </p>
                                                        <p className="font-mono text-[15px] text-gray-100">
                                                            {order.booking_code}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-5 md:grid-cols-3">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar
                                                            size={18}
                                                            className="text-gray-500"
                                                        />
                                                        <span className="text-sm">
                                                            {new Date(
                                                                order.booking_date,
                                                            ).toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Clock
                                                            size={18}
                                                            className="text-gray-500"
                                                        />
                                                        <span className="text-sm">
                                                            {order.booking_time.substring(
                                                                0,
                                                                5,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                                                        <MapPin
                                                            size={18}
                                                            className="text-gray-500"
                                                        />
                                                        <span className="truncate text-sm">
                                                            {order.tables
                                                                ?.map(
                                                                    (t: any) =>
                                                                        t.table_name,
                                                                )
                                                                .join(', ') ||
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-row items-center justify-between border-t border-white/5 pt-6 md:flex-col md:items-end md:border-t-0 md:pt-0">
                                                <div className="md:text-right">
                                                    <p className="text-[11px] font-bold text-gray-300 uppercase">
                                                        Total Paid
                                                    </p>
                                                    <p className="text-2xl font-semibold text-[#c5a059]">
                                                        {formatCurrency(
                                                            order.total_price,
                                                        )}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`mt-3 rounded-lg px-4 py-1.5 text-[11px] font-black uppercase ${status.class}`}
                                                >
                                                    {status.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button Logic */}
                                    <div className="border-t border-white/5 bg-black/20">
                                        {status.type === 'unpaid' ? (
                                            /* Tombol Tunggal: PAY NOW (Full Width) */
                                            <button
                                                onClick={() =>
                                                    handlePayment(order)
                                                }
                                                className="flex w-full items-center justify-center gap-3 bg-[#c5a059] py-5 text-[13px] font-black tracking-[0.25em] text-black transition-all hover:bg-[#d4b375]"
                                            >
                                                <Receipt size={18} />
                                                PAY NOW
                                            </button>
                                        ) : status.type === 'confirmed' ||
                                          status.type === 'completed' ? (
                                            /* Dua Tombol: SEE DETAIL & SHOW QR CODE (Split 50/50) */
                                            <div className="flex flex-col border-t border-white/5 bg-black/20 sm:flex-row">
                                                <Link
                                                    href={`/payment-finish/${order.id}`}
                                                    className="flex flex-1 items-center justify-center gap-2 border-white/5 py-5 text-[12px] font-bold tracking-[0.2em] text-gray-300 transition-all hover:bg-white/5 hover:text-white sm:border-r"
                                                >
                                                    SEE DETAIL
                                                    <ChevronRight
                                                        size={16}
                                                        className="text-gray-500"
                                                    />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        openQrModal(order)
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 py-5 text-[12px] font-bold tracking-[0.2em] text-white transition-all hover:bg-white/10"
                                                >
                                                    <QrCode size={18} />
                                                    SHOW QR CODE
                                                </button>
                                            </div>
                                        ) : (
                                            /* Tombol Tunggal: CANCELLED (Full Width Disabled) */
                                            <button
                                                disabled
                                                className="flex w-full cursor-not-allowed items-center justify-center gap-3 bg-gray-900/50 py-5 text-[12px] font-bold tracking-[0.2em] text-gray-600"
                                            >
                                                BOOKING CANCELLED
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="mt-12 flex justify-center gap-2">
                            {bookings.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm transition-all ${link.active ? 'bg-[#c5a059] text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'} ${!link.url && 'pointer-events-none opacity-20'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <FooterClient />

            {/* Modal QR */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={closeModal}
                    />
                    <div className="relative w-full max-w-sm animate-in rounded-3xl border border-white/10 bg-[#0c141f] p-8 text-center duration-200 zoom-in">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="mb-6 font-serif text-xl text-[#c5a059]">
                            Reservation QR
                        </h3>
                        <div className="mx-auto mb-6 inline-block rounded-2xl bg-white p-4">
                            <img
                                src={
                                    selectedOrder.qr_code?.startsWith('http')
                                        ? selectedOrder.qr_code
                                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedOrder.booking_code}`
                                }
                                alt="QR"
                                className="h-44 w-44"
                            />
                        </div>
                        <p className="font-mono text-sm text-gray-400">
                            {selectedOrder.booking_code}
                        </p>
                        <p className="mt-4 text-[10px] tracking-widest text-gray-500 uppercase">
                            Present this code to our staff upon arrival
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
