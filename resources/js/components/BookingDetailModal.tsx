import { Button } from '@/components/ui/button';
import { BookingDetail } from '@/types/booking-detail';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Phone,
    PlusCircle,
    User,
    Utensils,
    X,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmActionModal from './ConfirmActionModal';

interface Props {
    booking: BookingDetail;
    allBookingIds: number[];
    onNavigate: (id: number) => void;
    onClose: () => void;
    // Callbacks
    onCreateWalkIn: () => void;
    onAddItems: () => void;
    // PROP BARU: Izin untuk menampilkan tombol walk-in
    canCreateWalkIn: boolean;
}

export default function BookingDetailModal({
    booking,
    allBookingIds,
    onNavigate,
    onClose,
    onCreateWalkIn,
    onAddItems,
    canCreateWalkIn, // Terima prop ini
}: Props) {
    const [confirmType, setConfirmType] = useState<
        'complete' | 'no_show' | null
    >(null);

    // Navigasi logic
    const currentIndex = allBookingIds.indexOf(booking.id);
    const hasNext = currentIndex < allBookingIds.length - 1;
    const hasPrev = currentIndex > 0;

    // Helper warna
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'seated':
            case 'checked_in':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'no_show':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm fade-in">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-xl border-b bg-gray-50 p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Booking Detail
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-500">
                                #{booking.booking_code}
                            </span>
                            {allBookingIds.length > 1 && (
                                <span className="rounded-full bg-slate-200 px-2 text-[10px] text-slate-600">
                                    {currentIndex + 1} / {allBookingIds.length}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-200"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="flex items-center gap-2 text-lg font-bold">
                                <User size={18} className="text-slate-400" />{' '}
                                {booking.customer_name}
                            </h3>
                            <p className="ml-6 flex items-center gap-2 text-sm text-slate-500">
                                <Phone size={14} />{' '}
                                {booking.customer_phone || '-'}
                            </p>
                        </div>
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${getStatusColor(booking.status)}`}
                        >
                            {booking.status.replace('_', ' ')}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Date
                                </p>
                                <p className="text-sm font-semibold">
                                    {booking.booking_date}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Time
                                </p>
                                <p className="text-sm font-semibold">
                                    {booking.booking_time}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                            Tables
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {booking.tables.map((t) => (
                                <span
                                    key={t.id}
                                    className="rounded border bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm"
                                >
                                    {t.name}{' '}
                                    <span className="font-normal text-slate-400">
                                        ({t.capacity}p)
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between border-b border-dashed pb-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase">
                                <Utensils size={12} /> Orders
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onAddItems}
                                className="h-6 gap-1 text-[10px] text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                                <PlusCircle size={10} /> Add Menu
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {booking.items &&
                                booking.items.map((i) => (
                                    <li
                                        key={i.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <div className="flex gap-2">
                                            <span className="w-6 text-right font-bold text-slate-700">
                                                {i.qty}x
                                            </span>
                                            <span className="text-slate-600">
                                                {i.name}
                                            </span>
                                        </div>
                                        <span className="font-mono text-xs text-slate-900">
                                            {i.subtotal.toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                        </ul>
                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                            <span className="text-sm font-bold text-slate-900">
                                Total
                            </span>
                            <span className="text-base font-bold text-orange-600">
                                Rp {booking.total_price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Navigasi */}
                <div className="flex flex-col gap-3 rounded-b-xl border-t bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={!hasPrev}
                            onClick={() =>
                                onNavigate(allBookingIds[currentIndex - 1])
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex gap-2">
                            {booking.status === 'reserve' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setConfirmType('no_show')}
                                >
                                    No Show
                                </Button>
                            )}
                            {(booking.status === 'seated' ||
                                booking.status === 'reserve') && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                    onClick={() => setConfirmType('complete')}
                                >
                                    Complete
                                </Button>
                            )}
                        </div>

                        {hasNext ? (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    onNavigate(allBookingIds[currentIndex + 1])
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : // LOGIC BARU: HANYA TAMPIL JIKA canCreateWalkIn = TRUE
                        canCreateWalkIn ? (
                            <Button
                                className="gap-1 bg-slate-900 pr-2 pl-3 text-white hover:bg-slate-800"
                                size="sm"
                                onClick={onCreateWalkIn}
                            >
                                Create Walk-In{' '}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="w-10"></div> // Placeholder agar layout tetap rapi
                        )}
                    </div>
                </div>

                {confirmType === 'complete' && (
                    <ConfirmActionModal
                        title="Complete Booking?"
                        description="Customer finished?"
                        confirmText="Complete"
                        confirmColor="bg-green-600 hover:bg-green-700"
                        actionUrl={`/admin/bookings/${booking.id}/complete`}
                        onClose={() => setConfirmType(null)}
                        onSuccess={onClose}
                    />
                )}
                {confirmType === 'no_show' && (
                    <ConfirmActionModal
                        title="Mark as No Show?"
                        description="Customer didn't arrive?"
                        confirmText="Confirm No Show"
                        actionUrl={`/admin/bookings/${booking.id}/no-show`}
                        onClose={() => setConfirmType(null)}
                        onSuccess={onClose}
                    />
                )}
            </div>
        </div>
    );
}
