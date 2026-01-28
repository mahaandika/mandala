import BookingDetailModal from '@/components/BookingDetailModal';
import TableMapDashboard from '@/components/TableMapDashboard';
import WalkInWizard from '@/components/WalkInWizard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes/admin';
import { BookingDetail } from '@/types/booking-detail';
import { Table } from '@/types/dashboard';
import { BreadcrumbItem } from '@/types/index';
import { Head, router, usePage } from '@inertiajs/react';
import { addMinutes, differenceInMinutes, format, isAfter, isBefore, parse } from 'date-fns';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanQrCode, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'dashboard', href: dashboard().url }
];

interface DashboardProps {
    tables: Table[];
    date: string;
    server_time: string; // "YYYY-MM-DD HH:mm:ss"
}

export default function Index() {
    const { flash } = usePage().props as any;
    const { tables, date: serverDate, server_time } = usePage<DashboardProps>().props;

    // --- State ---
    const [date, setDate] = useState(serverDate);
    const [showFlash, setShowFlash] = useState(true);

    // Modal Details
    const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
    const [selectedTableForDetail, setSelectedTableForDetail] = useState<Table | null>(null);

    // Wizard
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [isPickingTables, setIsPickingTables] = useState(false);
    const [selectedWalkInTables, setSelectedWalkInTables] = useState<Table[]>([]);
    const [walkInPax, setWalkInPax] = useState(2);
    
    // Mode Khusus
    const [isAddMenuMode, setIsAddMenuMode] = useState(false);
    const [targetBookingId, setTargetBookingId] = useState<number | null>(null);
    const [gapTimeLimit, setGapTimeLimit] = useState<string | null>(null);

    // Scanner State
    const [showScanner, setShowScanner] = useState(false);
    const scannerId = "reader"; // ID element HTML untuk scanner

    // --- Effects ---
    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // --- SCANNER LOGIC (UPDATED) ---
    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        if (showScanner) {
            // Inisialisasi Scanner saat modal muncul
            html5QrCode = new Html5Qrcode(scannerId);
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            html5QrCode.start(
                { facingMode: "environment" }, 
                config, 
                (decodedText) => {
                    // Success callback
                    handleCheckIn(decodedText);
                    
                    // Stop scanner setelah sukses baca
                    if (html5QrCode) {
                        html5QrCode.stop().then(() => {
                            html5QrCode?.clear();
                        }).catch(err => console.error("Failed to stop", err));
                    }
                },
                (errorMessage) => {
                    // Error scanning (biasanya ignored karena scanning per frame)
                }
            ).catch((err) => {
                console.error("Gagal memulai kamera", err);
                setShowScanner(false);
                alert("Gagal memulai kamera. Pastikan izin diberikan.");
            });
        }

        // Cleanup function saat component unmount atau showScanner berubah jadi false
        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode?.clear();
                }).catch(err => console.error("Failed to stop on cleanup", err));
            }
        };
    }, [showScanner]);

    const requestPermission = () => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setShowScanner(true);
            } else {
                alert("Tidak ada kamera ditemukan.");
            }
        }).catch(err => alert("Izin kamera ditolak browser. Silakan cek pengaturan izin."));
    };

    const handleCheckIn = (bookingCode: string) => {
        if(!bookingCode) return;
        
        router.post('/admin/scan-checkin', { 
            booking_code: bookingCode 
        }, {
            onSuccess: () => {
                alert('Success! Guest status is now SEATED');
                setShowScanner(false);
            },
            onError: (errors) => {
                alert(Object.values(errors)[0] || "Gagal melakukan check-in.");
                // Jangan tutup scanner jika error, biar bisa scan ulang
            }
        });
    };

    // --- TABLE LOGIC (TETAP SAMA) ---
    const getTableAvailability = (table: Table) => {
        const now = server_time ? new Date(server_time) : new Date();
        
        // 1. Cek Occupied
        const activeRes = table.reservations?.find(r => {
            const resTime = parse(`${serverDate} ${r.time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
            const isTimePassed = isBefore(resTime, now);
            const isNotFinished = r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'no_show';
            return r.status === 'seated' || r.status === 'checked_in' || (isTimePassed && isNotFinished);
        });

        if (activeRes) return { status: 'occupied', detail: activeRes };

        // 2. Cek Future Reservation (Gap)
        const futureReservations = table.reservations?.filter(r => {
             const resTime = parse(`${serverDate} ${r.time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
             return isAfter(resTime, now) && r.status !== 'cancelled' && r.status !== 'completed' && r.status !== 'no_show';
        }).sort((a, b) => a.time.localeCompare(b.time));

        if (futureReservations && futureReservations.length > 0) {
            const nextRes = futureReservations[0];
            const nextResTime = parse(`${serverDate} ${nextRes.time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
            
            const minutesUntilNext = differenceInMinutes(nextResTime, now);
            const BUFFER = 30; 
            const MIN_DURATION = 45; 

            if ((minutesUntilNext - BUFFER) >= MIN_DURATION) {
                const limit = addMinutes(nextResTime, -BUFFER);
                return { status: 'available_gap', until: format(limit, 'HH:mm') };
            } else {
                return { status: 'reserved_soon', detail: nextRes };
            }
        }

        return { status: 'available' };
    };

    // --- HANDLERS ---
    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        router.get('/admin/dashboard', { date: newDate }, { preserveScroll: true });
    };

    const openBookingModal = async (bookingId: number) => {
        try {
            const res = await fetch(`/admin/api/bookings/${bookingId}`);
            const data: BookingDetail = await res.json();
            setBookingDetail(data);
        } catch (err) { console.error(err); }
    };

    const handleTableClick = (table: Table) => {
        const { status } = getTableAvailability(table);

        if (isPickingTables) {
            if (status === 'occupied' || status === 'reserved_soon') {
                alert("Meja ini sedang/akan dipakai. Tidak bisa digabungkan.");
                return;
            }
            const isSelected = selectedWalkInTables.find(t => t.id === table.id);
            if (isSelected) {
                setSelectedWalkInTables(prev => prev.filter(t => t.id !== table.id));
            } else {
                setSelectedWalkInTables(prev => [...prev, table]);
            }
            return;
        }

        const reservations = table.reservations?.filter(r => r.status !== 'cancelled') || [];

        if (reservations.length > 0) {
            const sortedReservations = reservations.sort((a, b) => a.time.localeCompare(b.time));
            setSelectedTableForDetail(table); 
            openBookingModal(sortedReservations[0].booking_id);
        } else {
            setGapTimeLimit(null);
            setSelectedWalkInTables([table]);
            setWalkInPax(table.capacity);
            setIsAddMenuMode(false);
            setShowWalkInModal(true);
        }
    };

    const handleAddItems = (bookingId: number) => {
        setBookingDetail(null);
        setTargetBookingId(bookingId);
        setIsAddMenuMode(true);
        setShowWalkInModal(true);
    };

    const handleTransitionToWalkIn = (lastBooking: BookingDetail) => {
        let targetTables: Table[] = [];
        if (selectedTableForDetail) {
            const foundTable = tables.find(t => t.id === selectedTableForDetail.id);
            if (foundTable) targetTables = [foundTable];
        } else {
            targetTables = tables.filter(t => lastBooking.tables.some(bt => bt.id === t.id));
        }
        
        const now = server_time ? new Date(server_time) : new Date();
        let earliestFutureResTime: Date | null = null;

        targetTables.forEach(table => {
            table.reservations?.forEach(res => {
                const resTime = parse(`${serverDate} ${res.time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
                if (isAfter(resTime, now) && res.status !== 'cancelled' && res.status !== 'completed' && res.status !== 'no_show') {
                    if (!earliestFutureResTime || isBefore(resTime, earliestFutureResTime)) {
                        earliestFutureResTime = resTime;
                    }
                }
            });
        });

        if (earliestFutureResTime) {
            const minutesUntilNext = differenceInMinutes(earliestFutureResTime, now);
            const BUFFER = 30;
            const MIN_DURATION = 45;

            if ((minutesUntilNext - BUFFER) < MIN_DURATION) {
                alert(`Waktu mepet! Sisa ${minutesUntilNext} menit.`);
                return;
            }

            const limit = addMinutes(earliestFutureResTime, -BUFFER);
            setGapTimeLimit(format(limit, 'HH:mm'));
        } else {
            setGapTimeLimit(null);
        }

        setSelectedWalkInTables(targetTables);
        setWalkInPax(2); 
        setIsAddMenuMode(false);
        setBookingDetail(null);
        setSelectedTableForDetail(null);
        setShowWalkInModal(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 px-4 pb-20">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Reservation Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Monitor table status & walk-ins.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPickingTables ? (
                            <Button onClick={() => { setIsPickingTables(false); setShowWalkInModal(true); }} className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold border-2 border-black">Finish ({selectedWalkInTables.length})</Button>
                        ) : (
                            <Button onClick={requestPermission} className="bg-slate-900 shadow-lg">
                                <ScanQrCode className="mr-2 h-4 w-4"/> Scan QR
                            </Button>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm w-fit">
                        <span className="text-sm font-bold text-slate-500 uppercase px-2">Select Date</span>
                        <input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} className="border-none focus:ring-0 font-bold text-slate-900" />
                    </div>
                    {flash?.success && showFlash && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in">{flash.success}</div>}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 py-2 border-y border-slate-100">
                    <LegendItem color="bg-orange-500" label="Occupied / Reserved Soon" />
                    <LegendItem color="bg-white border-slate-300" label="Available" />
                    <LegendItem color="bg-lime-300 border-lime-500" label="Available Gap" />
                    <LegendItem color="bg-yellow-400" label="Selected" />
                </div>

                {/* Map */}
                <TableMapDashboard 
                    tables={tables}
                    pickingMode={isPickingTables}
                    selectedTableIds={selectedWalkInTables.map(t => t.id)}
                    onTableClick={handleTableClick}
                    getAvailability={getTableAvailability}
                />

                {/* Wizard Modal */}
                <WalkInWizard 
                    isOpen={showWalkInModal}
                    onClose={() => {
                        setShowWalkInModal(false);
                        setIsPickingTables(false);
                        setSelectedWalkInTables([]);
                        setIsAddMenuMode(false);
                        setTargetBookingId(null);
                        setGapTimeLimit(null);
                    }}
                    onAddMoreTables={() => { setShowWalkInModal(false); setIsPickingTables(true); }}
                    selectedTables={selectedWalkInTables}
                    initialPax={walkInPax}
                    isAddMenuMode={isAddMenuMode}
                    existingBookingId={targetBookingId}
                    gapTimeLimit={gapTimeLimit}
                />

                {/* Booking Detail Modal */}
                {bookingDetail && (
                    <BookingDetailModal 
                        booking={bookingDetail}
                        allBookingIds={selectedTableForDetail?.reservations?.sort((a, b) => a.time.localeCompare(b.time)).map(r => r.booking_id) || [bookingDetail.id]}
                        onNavigate={(id) => openBookingModal(id)}
                        onClose={() => { setBookingDetail(null); setSelectedTableForDetail(null); }}
                        onAddItems={() => handleAddItems(bookingDetail.id)}
                        onCreateWalkIn={() => handleTransitionToWalkIn(bookingDetail)}
                        
                        canCreateWalkIn={
                            selectedTableForDetail 
                            ? ['available', 'available_gap'].includes(getTableAvailability(selectedTableForDetail).status)
                            : false
                        }
                    />
                )}

                {/* Scanner Modal */}
                {showScanner && (
                     <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
                         <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
                             <div className="flex items-center justify-between p-6 border-b border-white/5">
                                 <h3 className="font-bold text-white">Live QR Scanner</h3>
                                 <button onClick={() => setShowScanner(false)} className="text-white hover:text-gray-300">
                                     <X size={24}/>
                                 </button>
                             </div>
                             <div className="p-6 bg-black">
                                 <div id={scannerId} className="overflow-hidden rounded-2xl bg-black w-full h-[300px]"></div>
                                 <p className="text-center text-gray-400 text-sm mt-4">Arahkan kamera ke QR Code pelanggan</p>
                             </div>
                         </div>
                     </div>
                )}
            </div>
        </AppLayout>
    );
}

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`h-4 w-4 rounded border border-black/20 ${color}`} />
        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{label}</span>
    </div>
);