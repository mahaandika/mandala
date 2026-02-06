import { indexReservationHistory } from '@/actions/App/Http/Controllers/ReservationHistoryController';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BookingDetail } from '@/types/booking-detail';
import { Booking } from '@/types/booking-history';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reservation History',
        href: indexReservationHistory().url,
    },
];

type PageProps = {
    bookings: {
        data: Booking[];
        links: any[];
    };
    filters: {
        from_date?: string;
        to_date?: string;
        status?: string;
    };
};

interface Props {
    booking: BookingDetail;
}

export default function Index({ booking }: Props) {
    const { bookings, filters } = usePage<PageProps>().props;

    const [fromDate, setFromDate] = useState(filters?.from_date ?? '');
    const [toDate, setToDate] = useState(filters?.to_date ?? '');
    const [status, setStatus] = useState(filters?.status ?? 'all');
    const [error, setError] = useState('');

    const applyFilter = (
        newFrom?: string,
        newTo?: string,
        newStatus?: string,
    ) => {
        router.get(
            indexReservationHistory().url,
            {
                from_date: newFrom !== undefined ? newFrom : fromDate || null,
                to_date: newTo !== undefined ? newTo : toDate || null,
                status: newStatus !== undefined ? newStatus : status,
            },
            { preserveState: true, replace: true },
        );
    };

    useEffect(() => {
        // Hanya picu filter jika status berubah dan berbeda dengan filter di URL
        if (status !== (filters?.status ?? 'all')) {
            applyFilter(fromDate, toDate, status);
        }
    }, [status]);

    const handleReset = () => {
        setFromDate('');
        setToDate('');
        setStatus('all');
        router.get(indexReservationHistory().url, {}, { replace: true });
    };

    const formatPrice = (value: string) =>
        new Intl.NumberFormat('id-ID').format(Number(value));

    const formatTime = (time: string) => time.slice(0, 5);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    const mapPaymentStatus = (value: string) => {
        if (value === 'success')
            return (
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    Paid
                </span>
            );

        if (value === 'cancelled')
            return (
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                    Canceled
                </span>
            );

        if (value === 'expired')
            return (
                <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
                    Expired
                </span>
            );

        return null;
    };

    // Ganti handle change tanggal agar langsung memicu applyFilter
    const handleFromDateChange = (value: string) => {
        setFromDate(value);
        applyFilter(value, toDate, status);
    };

    const handleToDateChange = (value: string) => {
        if (fromDate && value < fromDate && value !== '') {
            setError('To date must be after From date');
            return;
        }
        setToDate(value);
        setError('');
        applyFilter(fromDate, value, status);
    };

    const mapBookingStatus = (value: string) => {
        if (value === 'completed') {
            return (
                <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Show
                </span>
            );
        }

        if (value === 'no_show') {
            return (
                <span className="mt-1 inline-block rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                    No Show
                </span>
            );
        }

        if (value === 'cancelled') {
            return (
                <span className="mt-1 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    Canceled
                </span>
            );
        }

        return null;
    };

    const handlePrint = (id: number) => {
        window.open(`/admin/bookings/${id}/invoice`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservation History" />

            <div className="px-4">
                <h1 className="pb-4 text-2xl font-semibold">
                    Reservation History
                </h1>

                <div className="rounded-md px-4 py-5 shadow-md sm:px-6">
                    {/* --- TAMBAHKAN BAGIAN INI --- */}
                    <div className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-medium tracking-wider text-gray-500 uppercase">
                                Status Tampilan:
                            </h2>
                            <p className="text-black-600 text-lg font-semibold">
                                {!filters.from_date && !filters.to_date
                                    ? `Hari Ini (${formatDate(new Date().toISOString())})`
                                    : `Rentang: ${filters.from_date ? formatDate(filters.from_date) : '...'} s/d ${filters.to_date ? formatDate(filters.to_date) : '...'}`}
                            </p>
                        </div>

                        <button
                            onClick={handleReset}
                            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            Reset Filter & Tampilkan Hari Ini
                        </button>
                    </div>
                    {/* --- END TAMBAHAN --- */}

                    {/* FILTER */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) =>
                                    handleFromDateChange(e.target.value)
                                }
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) =>
                                    handleToDateChange(e.target.value)
                                }
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            >
                                <option value="all">All</option>
                                <option value="completed">Completed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}

                    {/* TABLE */}
                    <div className="mt-6 overflow-x-auto">
                        <Table className="min-w-[1500px] table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">
                                        Customer
                                    </TableHead>
                                    <TableHead className="w-[220px]">
                                        Email
                                    </TableHead>
                                    <TableHead className="w-[160px]">
                                        Phone
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        Date
                                    </TableHead>
                                    <TableHead className="w-[100px]">
                                        Time
                                    </TableHead>
                                    <TableHead className="w-[80px]">
                                        Guests
                                    </TableHead>
                                    <TableHead className="w-[160px]">
                                        Table
                                    </TableHead>
                                    <TableHead className="w-[300px]">
                                        Menu
                                    </TableHead>
                                    <TableHead className="w-[140px]">
                                        Total
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        Payment
                                    </TableHead>
                                    <TableHead className="w-[140px] text-center">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {bookings.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10}>
                                            <div className="flex items-center justify-center"></div>
                                            <span className="text-sm text-gray-500">
                                                No data found
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {bookings.data.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell className="break-words">
                                            {b.user.name}
                                        </TableCell>
                                        <TableCell className="break-words">
                                            {b.user.email}
                                        </TableCell>
                                        <TableCell>{b.user.phone}</TableCell>
                                        <TableCell>
                                            {formatDate(b.booking_date)}
                                        </TableCell>
                                        <TableCell>
                                            {formatTime(b.booking_time)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{b.total_people}</span>
                                                {mapBookingStatus(
                                                    b.booking_status,
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {b.tables
                                                .map((t) => t.table_name)
                                                .join(', ')}
                                        </TableCell>
                                        <TableCell>
                                            <ul className="space-y-1">
                                                {b.items.map((i) => (
                                                    <li key={i.id}>
                                                        {i.menu.name} (
                                                        {i.quantity} x Rp{' '}
                                                        {formatPrice(
                                                            i.unit_price,
                                                        )}
                                                        )
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell>
                                            Rp {formatPrice(b.total_price)}
                                        </TableCell>
                                        <TableCell>
                                            {mapPaymentStatus(b.payment_status)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <button
                                                type="button" // Pastikan type button agar tidak trigger submit jika ada form
                                                onClick={() =>
                                                    handlePrint(b.id)
                                                } // <--- Kirim b.id di sini
                                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-none disabled:opacity-50"
                                            >
                                                <Printer size={16} />
                                                <span className="whitespace-nowrap">
                                                    Cetak Invoice
                                                </span>
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                        {bookings.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                preserveState
                                preserveScroll
                                className={`rounded px-3 py-2 text-sm ${
                                    !link.url
                                        ? 'pointer-events-none opacity-40'
                                        : 'border hover:bg-gray-50'
                                } ${
                                    link.active
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'bg-white text-gray-700'
                                }`}
                            >
                                {/* UBAH BAGIAN INI */}
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
