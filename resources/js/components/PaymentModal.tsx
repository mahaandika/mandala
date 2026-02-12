import { Button } from '@/components/ui/button';
import { BookingDetail } from '@/types/booking-detail';
import { router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle,
    CreditCard,
    Printer,
    QrCode,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    booking: BookingDetail;
    totalToPay: number;
    onClose: () => void;
    onSuccess: () => void; // Callback untuk refresh data parent
}

type PaymentMethod = 'cash' | 'qris' | 'debit' | 'kredit';

export default function PaymentModal({
    booking,
    totalToPay,
    onClose,
    onSuccess,
}: Props) {
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [cashAmount, setCashAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // STATE BARU: Untuk menandai pembayaran sukses
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // --- LOGIC FORMAT & HITUNG ---
    const formatRupiah = (value: string) => {
        const numberString = value.replace(/[^,\d]/g, '').toString();
        const split = numberString.split(',');
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
        if (ribuan) {
            const separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }
        return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    };

    const tendered = parseFloat(cashAmount.replace(/\./g, '')) || 0;
    const change = tendered - totalToPay;
    const isCashValid = method === 'cash' ? tendered >= totalToPay : true;

    // --- HANDLE PAYMENT ---
    const handlePayment = () => {
        if (!isCashValid) return;
        setLoading(true);

        router.post(
            `/admin/bookings/${booking.id}/pay`,
            {
                payment_method: method,
                total_amount: totalToPay,
                amount_tendered: method === 'cash' ? tendered : null,
            },
            {
                onSuccess: () => {
                    setLoading(false);
                    setPaymentSuccess(true); // UBAH STATE KE SUKSES
                    // Kita panggil onSuccess parent nanti saat user tutup modal
                },
                onError: () => {
                    setLoading(false);
                    alert('Gagal memproses pembayaran.');
                },
            },
        );
    };

    // --- HANDLE PRINT ---
    const handlePrint = () => {
        window.open(`/admin/bookings/${booking.id}/invoice`, '_blank');
    };

    // --- HANDLE FINISH (TUTUP) ---
    const handleFinish = () => {
        onSuccess(); // Refresh data dashboard
        onClose(); // Tutup modal
    };

    return (
        <div className="fixed inset-0 z-[200] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm fade-in">
            <div className="flex min-h-[300px] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        {paymentSuccess
                            ? 'Pembayaran Berhasil'
                            : 'Pembayaran Walk-In'}
                    </h2>
                    {/* Jika sukses, tombol close memicu finish */}
                    <button onClick={paymentSuccess ? handleFinish : onClose}>
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* --- TAMPILAN 1: FORM PEMBAYARAN --- */}
                {!paymentSuccess && (
                    <>
                        <div className="flex-1 space-y-6 p-6">
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-500 uppercase">
                                    Total Tagihan
                                </p>
                                <p className="mt-1 text-3xl font-black text-slate-900">
                                    Rp {totalToPay.toLocaleString('id-ID')}
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Metode
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <MethodButton
                                        active={method === 'cash'}
                                        onClick={() => setMethod('cash')}
                                        icon={<Banknote size={18} />}
                                        label="Tunai"
                                    />
                                    <MethodButton
                                        active={method === 'qris'}
                                        onClick={() => setMethod('qris')}
                                        icon={<QrCode size={18} />}
                                        label="QRIS"
                                    />
                                    <MethodButton
                                        active={method === 'debit'}
                                        onClick={() => setMethod('debit')}
                                        icon={<Wallet size={18} />}
                                        label="Debit"
                                    />
                                    <MethodButton
                                        active={method === 'kredit'}
                                        onClick={() => setMethod('kredit')}
                                        icon={<CreditCard size={18} />}
                                        label="Kredit"
                                    />
                                </div>
                            </div>

                            {method === 'cash' ? (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
                                        Uang Diterima
                                    </label>
                                    <div className="relative mb-2">
                                        <span className="absolute top-2.5 left-3 font-bold text-gray-500">
                                            Rp
                                        </span>
                                        <input
                                            type="text"
                                            className="w-full rounded-md border py-2 pr-3 pl-10 text-lg font-bold"
                                            placeholder="0"
                                            value={cashAmount}
                                            onChange={(e) =>
                                                setCashAmount(
                                                    formatRupiah(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                                        <span className="text-sm font-bold text-gray-600">
                                            Kembalian
                                        </span>
                                        <span
                                            className={`font-mono text-lg font-bold ${change < 0 ? 'text-red-500' : 'text-green-600'}`}
                                        >
                                            Rp{' '}
                                            {change < 0
                                                ? '-'
                                                : change.toLocaleString(
                                                      'id-ID',
                                                  )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center text-sm text-blue-800">
                                    Silakan proses pembayaran via mesin EDC /
                                    QRIS.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 border-t bg-gray-50 p-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Batal
                            </Button>
                            <Button
                                className="flex-[2] bg-slate-900 hover:bg-slate-800"
                                disabled={loading || !isCashValid}
                                onClick={handlePayment}
                            >
                                {loading ? 'Processing...' : 'Konfirmasi Bayar'}
                            </Button>
                        </div>
                    </>
                )}

                {/* --- TAMPILAN 2: SUKSES & CETAK INVOICE --- */}
                {paymentSuccess && (
                    <div className="flex flex-1 animate-in flex-col items-center justify-center p-8 text-center duration-300 zoom-in-95">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Transaksi Selesai!
                        </h3>
                        <p className="mt-2 mb-8 text-sm text-slate-500">
                            Pembayaran telah direkam dan status booking
                            diperbarui.
                        </p>

                        <div className="w-full space-y-3">
                            <Button
                                onClick={handlePrint}
                                className="h-12 w-full gap-2 bg-slate-900 text-base hover:bg-slate-800"
                            >
                                <Printer size={18} /> Cetak Invoice
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleFinish}
                                className="h-12 w-full"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const MethodButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 rounded-lg border py-3 transition-all ${
            active
                ? 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-1'
                : 'border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
        }`}
    >
        {icon} <span className="text-xs font-bold uppercase">{label}</span>
    </button>
);
