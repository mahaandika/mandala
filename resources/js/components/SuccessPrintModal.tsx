import { Button } from '@/components/ui/button';
import { CheckCircle, Printer } from 'lucide-react';

interface Props {
    bookingId: number;
    onClose: () => void;
}

export default function SuccessPrintModal({ bookingId, onClose }: Props) {
    const handlePrint = () => {
        window.open(`/admin/bookings/${bookingId}/invoice`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[200] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm fade-in">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle size={32} />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                    Booking Completed
                </h3>
                <p className="mt-2 mb-6 text-sm text-slate-500">
                    Status booking telah diperbarui menjadi selesai.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={handlePrint}
                        className="w-full gap-2 bg-slate-900 hover:bg-slate-800"
                    >
                        <Printer size={16} /> Download / Print Invoice
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full"
                    >
                        Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
}
