import FooterClient from '@/components/footer-Client';
import NavbarClient from '@/components/navbar-client';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Home,
    MapPin,
    Users,
} from 'lucide-react';

interface Props {
    booking: any;
}

export default function PaymentFinish({ booking }: Props) {
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    // Format Tanggal: 2026-01-02T00... -> 02 Januari 2026
    const formattedDate = new Date(booking.booking_date).toLocaleDateString(
        'id-ID',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        },
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#050a11] text-white selection:bg-[#c5a059]/30">
            <NavbarClient />

            <main className="flex flex-grow flex-col items-center justify-start px-4 pt-20 pb-15">
                <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/5 bg-[#0c141f] p-0 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]">
                    <div className="flex flex-col items-center pt-5 pb-4">
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <h1 className="font-serif text-2xl tracking-wide text-white">
                            Booking Confirmed
                        </h1>
                    </div>

                    <div className="bg-gradient-to-b from-white/[0.03] to-transparent p-6 text-center">
                        <div className="mb-1 flex justify-center">
                            <img
                                src="/images/mandala_white.png"
                                alt="Mandala Logo"
                                className="h-12 w-auto object-contain brightness-110"
                            />
                        </div>
                        <p className="mt-2 font-mono text-sm tracking-widest text-gray-400 uppercase italic">
                            {booking.booking_code}
                        </p>
                    </div>

                    <div className="px-6 pt-2 pb-8 md:px-8">
                        {/* Customer Info */}
                        <div className="mb-6 border-b border-white/5 pb-6">
                            <p className="mb-2 text-[11px] font-medium tracking-widest text-gray-500 uppercase">
                                Customer Info
                            </p>
                            <h3 className="mb-4 text-xl font-semibold text-gray-100 uppercase">
                                {booking.user?.name}
                            </h3>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="mb-1 text-[10px] font-bold tracking-wider text-[#c5a059] uppercase">
                                        Email
                                    </p>
                                    <p className="truncate text-sm text-gray-300">
                                        {booking.user?.email}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="mb-1 text-[10px] font-bold tracking-wider text-[#c5a059] uppercase">
                                        Phone
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        {booking.user?.phone || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reservation Grid */}
                        <div className="grid grid-cols-2 gap-y-6">
                            <div>
                                <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">
                                    Schedule
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                    <Calendar
                                        size={14}
                                        className="text-[#c5a059]/60"
                                    />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-200">
                                    <Clock
                                        size={14}
                                        className="text-[#c5a059]/60"
                                    />
                                    <span>{booking.booking_time}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">
                                    Guests
                                </p>
                                <div className="flex items-center justify-end gap-2 text-sm text-gray-200">
                                    <span>{booking.total_people} People</span>
                                    <Users
                                        size={14}
                                        className="text-[#c5a059]/60"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">
                                    Location
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                    <MapPin
                                        size={14}
                                        className="text-[#c5a059]/60"
                                    />
                                    {/* Akses array tables index ke-0 */}
                                    <span>
                                        {booking.tables?.[0]?.table_name ||
                                            'TBA'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Ordered Items */}
                        <div className="mt-8 border-t border-white/5 pt-6">
                            <p className="mb-5 text-[11px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">
                                Ordered Menu
                            </p>
                            <div className="space-y-5">
                                {booking.items?.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-4"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm leading-tight font-medium text-gray-200">
                                                {item.menu?.name}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {item.quantity} x{' '}
                                                {formatCurrency(
                                                    item.unit_price,
                                                )}
                                            </p>
                                        </div>
                                        <p className="font-mono text-sm font-medium text-gray-300">
                                            {formatCurrency(item.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Banner */}
                        <div className="mt-10 rounded-2xl border border-[#c5a059]/20 bg-[#c5a059]/5 p-5 text-center">
                            <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-gray-300 uppercase">
                                Total Paid
                            </p>
                            <p className="font-serif text-3xl text-[#c5a059]">
                                {formatCurrency(booking.total_price)}
                            </p>
                        </div>

                        {/* QR Code Section */}
                        <div className="mt-10 flex flex-col items-center">
                            <div className="group relative">
                                <div className="absolute -inset-1.5 rounded-2xl bg-[#c5a059]/20 opacity-40 blur-md"></div>
                                <div className="relative rounded-2xl bg-white p-4 shadow-2xl">
                                    <img
                                        src={booking.qr_code}
                                        alt="Entry QR"
                                        className="h-32 w-32"
                                    />
                                </div>
                            </div>
                            <p className="mt-5 text-[11px] font-medium tracking-[0.2em] text-gray-300 uppercase">
                                Scan for entry
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex w-full max-w-[400px] flex-col gap-3 px-4">
                    <Link
                        href="/"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#9c6b3b] py-4 text-[11px] font-bold tracking-[0.2em] text-gray-100 transition-all hover:bg-white/5"
                    >
                        <Home size={14} />
                        BACK TO HOME
                    </Link>
                </div>
            </main>
            <FooterClient />
        </div>
    );
}
