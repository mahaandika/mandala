import FAQSection from '@/components/faq';
import FooterClient from '@/components/footer-Client';
import NavbarClient from '@/components/navbar-client';
import { Head, router, useForm } from '@inertiajs/react'; // Tambahkan router untuk navigasi tanggal
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Phone,
    User,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// --- TYPES & INTERFACES ---
type TableStatus = 'available' | 'reserved';

interface ReservationDetail {
    booking_id: number;
    customer: string;
    phone: string;
    status: string;
    time: string;
    pax: number;
}

interface Table {
    id: number;
    name: string;
    capacity: number;
    position: {
        top: string;
        left: string;
        shape: 'square' | 'circle' | 'small_square' | 'small_circle';
    };
    status: TableStatus;
    reservations?: ReservationDetail[];
}

interface ReservationsProps {
    tables: Table[];
    date: string;
    auth_user: {
        name: string;
        email: string;
        phone: string;
    };
}

const today = new Date().toISOString().split('T')[0];

export default function Reservations({
    tables,
    date,
    auth_user,
}: ReservationsProps) {
    console.log(tables);
    const MIN_TIME = '11:00';
    const MAX_TIME = '22:00';
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        table: Table | null;
        endTime: string;
    }>({
        open: false,
        table: null,
        endTime: '',
    });

    // State untuk Notifikasi (Toast)
    const [notification, setNotification] = useState<{
        message: string;
        type: 'error' | 'success';
    } | null>(null);

    const { data, setData, post, processing, errors, setError } = useForm({
        // Cek apakah variabel auth_user ada, jika tidak gunakan string kosong
        name: auth_user?.name || '',
        email: auth_user?.email || '',
        phone: auth_user?.phone || '',
        person: 1,
        date: date || today,
        time: '',
        table_ids: [] as string[],
    });

    //helper ngurangin 30 menit
    const subtractMinutes = (time: string, minutes: number) => {
        const [h, m] = time.split(':').map(Number);
        const total = h * 60 + m - minutes;

        const newH = Math.floor(total / 60);
        const newM = total % 60;

        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    // Auto-close notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Hitung total kapasitas dari meja yang dipilih
    const currentTotalCapacity = tables
        .filter((t) => data.table_ids.includes(t.id.toString()))
        .reduce(
            (acc, curr) =>
                parseInt(acc.toString(), 10) +
                parseInt(curr.capacity.toString(), 10),
            0,
        );

    // Fungsi untuk filter tanggal (Reload data dari backend)
    const handleDateChange = (newDate: string) => {
        setData('date', newDate);
        setData('table_ids', []); // Reset pilihan meja saat ganti tanggal
        router.get('/reservations', { date: newDate }, { preserveState: true });
    };
    const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const handleTableClick = (table: Table) => {
        // 1. Validasi Jam tetap sama
        if (!data.time) {
            setNotification({
                message:
                    'Silahkan tentukan jam reservasi Anda terlebih dahulu.',
                type: 'error',
            });
            return;
        }

        const isAlreadySelected = data.table_ids.includes(table.id.toString());

        // --- LOGIKA VALIDASI KAPASITAS (OPTIMAL SELECTION) ---
        if (!isAlreadySelected) {
            // Jika user ingin menambah meja baru, cek apakah kapasitas saat ini sudah cukup/lebih
            if (currentTotalCapacity >= data.person) {
                setNotification({
                    message: `Kapasitas sudah terpenuhi (${currentTotalCapacity} kursi). Anda tidak perlu menambah meja lagi untuk ${data.person} orang.`,
                    type: 'error',
                });
                return;
            }
        }

        // --- VALIDASI BENTROK JADWAL (Sama seperti sebelumnya) ---
        const userTimeMin = toMin(data.time);
        if (table.reservations && table.reservations.length > 0) {
            const upcomingBookings = table.reservations
                .map((res) => ({
                    ...res,
                    startMin: toMin(res.time.split(' - ')[0]),
                    startTimeStr: res.time.split(' - ')[0],
                }))
                .filter((res) => res.startMin > userTimeMin)
                .sort((a, b) => a.startMin - b.startMin);

            const nearestBooking = upcomingBookings[0];
            const isCurrentlyOccupied = table.reservations.some((res) => {
                const [start, end] = res.time.split(' - ');
                return userTimeMin >= toMin(start) && userTimeMin < toMin(end);
            });

            if (isCurrentlyOccupied) {
                setNotification({
                    message: `Meja ${table.name} sedang digunakan pada jam tersebut.`,
                    type: 'error',
                });
                return;
            }

            if (nearestBooking && nearestBooking.startMin - userTimeMin <= 30) {
                setNotification({
                    message: `Waktu mepet. Meja akan digunakan pukul ${nearestBooking.startTimeStr}.`,
                    type: 'error',
                });
                return;
            }

            if (nearestBooking) {
                setConfirmModal({
                    open: true,
                    table,
                    endTime: nearestBooking.startTimeStr,
                });
                return;
            }
        }

        // Jika lolos semua validasi
        toggleTableSelection(table);
    };

    const toggleTableSelection = (table: Table) => {
        const isAlreadySelected = data.table_ids.includes(table.id.toString());
        let newSelection = [...data.table_ids];

        if (isAlreadySelected) {
            newSelection = newSelection.filter(
                (id) => id !== table.id.toString(),
            );
        } else {
            newSelection.push(table.id.toString());
        }

        setData('table_ids', newSelection);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('phone', '');
        if (!data.name || !data.phone || !data.date || !data.time) {
            setNotification({
                message:
                    'Mohon lengkapi semua data reservasi (Nama, HP, Tanggal & Waktu)!',
                type: 'error',
            });
            return;
        } else if (!isValidPhoneNumber(data.phone)) {
            setNotification({
                message: 'Mohon masukkan nomor telepon yang valid',
                type: 'error',
            });
            return;
        }

        const now = new Date();
        const currentTimeStr =
            now.getHours().toString().padStart(2, '0') +
            ':' +
            now.getMinutes().toString().padStart(2, '0');

        // --- VALIDASI JAM OPERASIONAL ---
        if (data.time < MIN_TIME || data.time > MAX_TIME) {
            setNotification({
                message: `Jam operasional adalah ${MIN_TIME} - ${MAX_TIME}`,
                type: 'error',
            });
            return;
        }

        // --- VALIDASI WAKTU LAMPAU (Jika pilih hari ini) ---
        if (data.date === today && data.time <= currentTimeStr) {
            setNotification({
                message: 'Waktu sudah terlewat untuk hari ini!',
                type: 'error',
            });
            return;
        }

        // 2. LOGIKA KAPASITAS MEJA
        const selectedTablesData = tables.filter((t) =>
            data.table_ids.includes(t.id.toString()),
        );
        const totalCap = selectedTablesData.reduce(
            (acc, curr) => acc + curr.capacity,
            0,
        );

        // --- VALIDASI PILIH MEJA ---
        if (data.table_ids.length === 0) {
            setNotification({
                message: 'Silahkan pilih minimal satu meja pada peta!',
                type: 'error',
            });
            return;
        }

        // Cek kapasitas minimal
        if (totalCap < data.person) {
            setNotification({
                message: `Kapasitas tidak cukup! Total meja hanya muat ${totalCap} orang.`,
                type: 'error',
            });
            return;
        }

        // Validasi Efisiensi (Anti-Hoarding)
        const hasSingleAdequateTable =
            selectedTablesData.length > 1 &&
            selectedTablesData.some((t) => t.capacity >= data.person);

        if (hasSingleAdequateTable) {
            setNotification({
                message:
                    'Satu meja saja sudah cukup untuk jumlah orang tersebut. Mohon tidak memilih meja berlebih.',
                type: 'error',
            });
            return;
        }

        // 3. KIRIM KE BACKEND
        post('/bookings', {
            onSuccess: () => {
                setNotification({
                    message: 'Reservasi berhasil dimasukkan ke keranjang!',
                    type: 'success',
                });
                // Opsional: Hilangkan notifikasi otomatis setelah 3 detik
                setTimeout(() => setNotification(null), 3000);
            },
            onError: (err) => {
                const errorMessages = Object.values(err);
                setNotification({
                    message:
                        errorMessages.length > 0
                            ? String(errorMessages[0])
                            : 'Terjadi kesalahan pada server.',
                    type: 'error',
                });
            },
        });
    };

    // Ambil tanggal hari ini
    const todayObj = new Date();
    const today = todayObj.toISOString().split('T')[0];

    // Hitung tanggal 2 bulan ke depan
    const maxDateObj = new Date();
    maxDateObj.setMonth(maxDateObj.getMonth() + 2);
    const maxDate = maxDateObj.toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-[#050a11] text-white selection:bg-[#c5a059] selection:text-black">
            {/* --- CUSTOM NOTIFICATION TOAST --- */}
            {notification && (
                <div className="fixed top-24 left-1/2 z-[100] w-[90%] -translate-x-1/2 animate-in duration-300 fade-in slide-in-from-top-4 sm:right-6 sm:left-auto sm:w-full sm:max-w-md sm:translate-x-0">
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
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-white/60 transition-colors hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        input[type="date"]::-webkit-calendar-picker-indicator,
                        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1) brightness(100%); cursor: pointer; }
                        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                        input[type="number"] { -moz-appearance: textfield; }
                    `,
                }}
            />

            <Head title="Book a Table" />
            <NavbarClient />

            <section className="relative flex h-[300px] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/login_pic.png"
                        className="h-full w-full object-cover opacity-40"
                        alt="bg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a11] to-transparent" />
                </div>
                <h1 className="relative z-10 font-serif text-4xl text-white md:text-5xl">
                    Reservations
                </h1>
            </section>

            <main className="container mx-auto px-4 pb-20">
                <div className="flex flex-col gap-10 lg:flex-row">
                    {/* LEFT: FORM */}
                    <div className="h-fit w-full space-y-6 rounded-xl border border-white/5 bg-[#0c141f] p-6 md:p-8 lg:w-4/12">
                        <h2 className="flex items-center gap-3 text-2xl font-semibold">
                            <span className="h-8 w-1 bg-[#c5a059]"></span> Fill
                            Details
                        </h2>

                        <form
                            onSubmit={submit}
                            className="space-y-5"
                            noValidate
                        >
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                    <User
                                        size={16}
                                        className="text-[#c5a059]"
                                    />{' '}
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-[#16202d] p-3 outline-none focus:border-[#c5a059]"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                            </div>

                            {/* Input Email - DIKUNCI (Read Only) */}
                            <div className="space-y-2 opacity-70">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                    <User
                                        size={16}
                                        className="text-[#c5a059]"
                                    />{' '}
                                    Email (Fixed)
                                </label>
                                <input
                                    type="email"
                                    readOnly // Mencegah pengetikan
                                    className="w-full cursor-not-allowed rounded-lg border border-white/5 bg-[#0a1018] p-3 text-gray-500 outline-none"
                                    value={data.email}
                                />
                                <p className="text-[10px] text-gray-600 italic">
                                    *Email cannot be changed
                                </p>
                            </div>

                            {/* Input Phone - Bisa Diedit */}
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                        <Phone
                                            size={16}
                                            className="text-[#c5a059]"
                                        />{' '}
                                        Phone
                                    </label>
                                    <PhoneInput
                                        international
                                        defaultCountry="ID"
                                        value={data.phone}
                                        onChange={(value) =>
                                            setData('phone', value || '')
                                        }
                                        className="phone-input-dark w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                        <Users
                                            size={16}
                                            className="text-[#c5a059]"
                                        />{' '}
                                        Pax
                                    </label>
                                    <select
                                        className="w-full appearance-none rounded-lg border border-white/10 bg-[#16202d] p-3 outline-none focus:border-[#c5a059]"
                                        value={data.person}
                                        onChange={(e) =>
                                            setData(
                                                'person',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                            (n) => (
                                                <option
                                                    key={n}
                                                    value={n}
                                                    className="bg-[#0c141f]"
                                                >
                                                    {n} People
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                        <Calendar
                                            size={16}
                                            className="text-[#c5a059]"
                                        />{' '}
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        min={today} // Tidak bisa pilih hari kemarin
                                        max={maxDate} // Tidak bisa pilih lebih dari 2 bulan ke depan
                                        className="w-full rounded-lg border border-white/10 bg-[#16202d] p-3 transition-all outline-none focus:border-[#c5a059]"
                                        value={data.date}
                                        onChange={(e) =>
                                            handleDateChange(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                    <Clock
                                        size={16}
                                        className="text-[#c5a059]"
                                    />{' '}
                                    Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-[#16202d] p-3 transition-all outline-none focus:border-[#c5a059]"
                                    value={data.time}
                                    onChange={(e) =>
                                        setData('time', e.target.value)
                                    }
                                />
                            </div>

                            {data.table_ids.length > 0 && (
                                <div
                                    className={`flex flex-col gap-2 rounded-lg border p-4 transition-all duration-300 ${currentTotalCapacity >= data.person ? 'border-green-500/50 bg-green-500/10' : 'border-orange-500/50 bg-orange-500/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {currentTotalCapacity >= data.person ? (
                                            <CheckCircle2 className="text-green-500" />
                                        ) : (
                                            <AlertCircle className="text-orange-500" />
                                        )}
                                        <span
                                            className={`text-xs font-bold ${currentTotalCapacity >= data.person ? 'text-green-400' : 'text-orange-400'}`}
                                        >
                                            TABLES:{' '}
                                            {data.table_ids
                                                .sort()
                                                .map((id) => {
                                                    const t = tables.find(
                                                        (x) =>
                                                            x.id.toString() ===
                                                            id,
                                                    );
                                                    return t ? t.name : '';
                                                })
                                                .join(', ')}
                                        </span>
                                    </div>
                                    <p className="text-[11px] tracking-wider uppercase opacity-80">
                                        Selected Capacity:{' '}
                                        {currentTotalCapacity} / {data.person}{' '}
                                        Pax
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full overflow-hidden rounded bg-[#9c6b3b] py-4 font-bold tracking-widest uppercase transition-all hover:bg-[#b07a43] active:scale-[0.98] disabled:opacity-50"
                            >
                                <span className="relative z-10">
                                    Confirm Reservation
                                </span>
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: MAP */}
                    <div className="w-full lg:w-8/12">
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h3 className="text-xl font-medium">
                                    Select Your Tables
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Pick multiple tables if needed for your
                                    group size
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold tracking-wider uppercase">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 border border-slate-900 bg-white"></span>{' '}
                                    Available
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 bg-orange-500"></span>{' '}
                                    Occupied
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 bg-[#c5a059]"></span>{' '}
                                    Your Choice
                                </div>
                            </div>
                        </div>

                        <div className="custom-scrollbar w-full overflow-x-auto rounded-xl border border-slate-300 bg-slate-200 p-4 text-slate-900 shadow-inner">
                            <div
                                className="relative mx-auto rounded-sm border border-slate-300 bg-slate-100 shadow-md"
                                style={{
                                    minWidth: '800px',
                                    aspectRatio: '16/10',
                                    width: '100%',
                                }}
                            >
                                {/* UI Decorative Elements */}
                                <div className="absolute top-[2%] left-[2%] z-10 flex flex-col gap-2">
                                    <div className="rounded border-2 border-slate-800 bg-white px-4 py-6 text-[10px] font-bold tracking-tighter uppercase shadow-sm">
                                        Bar & Cashier
                                    </div>
                                    <div className="rounded border-2 border-slate-800 bg-white px-1 py-4 text-center text-[9px] font-bold shadow-sm">
                                        Hand Wash
                                    </div>
                                </div>
                                <div className="absolute top-[65%] left-4 text-[11px] font-black tracking-[0.2em] uppercase italic opacity-40">
                                    Indoor Area
                                </div>
                                <div className="absolute top-[70%] left-0 h-[2px] w-[40%] bg-slate-300"></div>
                                <div className="absolute bottom-[25%] left-4 text-[11px] font-black tracking-[0.2em] uppercase italic opacity-40">
                                    Outdoor Area
                                </div>
                                {tables.map((table) => {
                                    const pos = table.position;
                                    const isReserved =
                                        table.status === 'reserved';
                                    const isSelected = data.table_ids.includes(
                                        table.id.toString(),
                                    );
                                    const isSmall = pos.shape.includes('small');

                                    return (
                                        <div
                                            key={table.id}
                                            onClick={() =>
                                                handleTableClick(table)
                                            }
                                            style={{
                                                top: pos.top,
                                                left: pos.left,
                                            }}
                                            // HAPUS 'cursor-not-allowed' agar meja oranye bisa diklik
                                            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95`}
                                            title={
                                                table.reservations &&
                                                table.reservations.length > 0
                                                    ? `Bookings for ${table.name}:\n` +
                                                      table.reservations
                                                          .map(
                                                              (res) =>
                                                                  `${res.customer} = ${res.time}`,
                                                          )
                                                          .join('\n')
                                                    : `Table ${table.name} | Capacity: ${table.capacity}`
                                            }
                                        >
                                            <div
                                                className={`relative flex items-center justify-center border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${
                                                    // Jika user memilih meja yang statusnya oranye, kita beri warna emas (isSelected) agar user tahu itu masuk pilihan dia
                                                    isSelected
                                                        ? 'border-slate-900 bg-[#c5a059] text-white'
                                                        : isReserved
                                                          ? 'border-orange-800 bg-orange-500 text-white opacity-80'
                                                          : 'border-slate-900 bg-white text-slate-900'
                                                } ${pos.shape.includes('circle') ? 'h-14 w-14 rounded-full' : 'h-12 w-16 rounded-md'} ${isSmall ? 'h-11 w-11' : ''}`}
                                            >
                                                <span className="text-[10px] font-black">
                                                    {table.name}
                                                </span>

                                                {/* Visual Kursi - Sesuaikan warna dengan status */}
                                                <div
                                                    className={`absolute -top-2 left-1/2 h-2 w-4 -translate-x-1/2 rounded-t-sm border-x border-t border-slate-900 ${isSelected ? 'bg-[#9d7d43]' : isReserved ? 'bg-orange-700' : 'bg-slate-800'}`}
                                                />
                                                <div
                                                    className={`absolute -bottom-2 left-1/2 h-2 w-4 -translate-x-1/2 rounded-b-sm border-x border-b border-slate-900 ${isSelected ? 'bg-[#9d7d43]' : isReserved ? 'bg-orange-700' : 'bg-slate-800'}`}
                                                />
                                                {!isSmall && (
                                                    <>
                                                        <div
                                                            className={`absolute top-1/2 -left-2 h-4 w-2 -translate-y-1/2 rounded-l-sm border-y border-l border-slate-900 ${isSelected ? 'bg-[#9d7d43]' : isReserved ? 'bg-orange-700' : 'bg-slate-800'}`}
                                                        />
                                                        <div
                                                            className={`absolute top-1/2 -right-2 h-4 w-2 -translate-y-1/2 rounded-r-sm border-y border-r border-slate-900 ${isSelected ? 'bg-[#9d7d43]' : isReserved ? 'bg-orange-700' : 'bg-slate-800'}`}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="absolute right-[30%] bottom-[5%] flex min-w-[150px] items-center justify-center rounded border-2 border-slate-800 bg-white p-8 text-[11px] font-black uppercase shadow-md md:bottom-[8%] lg:right-[35%] lg:bottom-[12%]">
                                    Receptionist
                                </div>
                            </div>
                        </div>
                        {confirmModal.open && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="w-full max-w-md rounded-xl bg-white p-6 text-slate-900">
                                    <h2 className="mb-3 text-lg font-bold">
                                        Konfirmasi Reservasi
                                    </h2>

                                    <p className="mb-4 text-sm">
                                        Meja <b>{confirmModal.table?.name}</b>{' '}
                                        akan digunakan Harus kosong pada pukul{' '}
                                        <b>
                                            {subtractMinutes(
                                                confirmModal.endTime,
                                                30,
                                            )}
                                        </b>
                                        <br />
                                        Apakah Anda bersedia menyelesaikan
                                        penggunaan meja sebelum jam tersebut?
                                    </p>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            className="rounded-md border px-4 py-2 text-sm"
                                            onClick={() =>
                                                setConfirmModal({
                                                    open: false,
                                                    table: null,
                                                    endTime: '',
                                                })
                                            }
                                        >
                                            Tidak
                                        </button>

                                        <button
                                            className="rounded-md bg-[#c5a059] px-4 py-2 text-sm text-white"
                                            onClick={() => {
                                                if (confirmModal.table) {
                                                    toggleTableSelection(
                                                        confirmModal.table,
                                                    );
                                                }
                                                setConfirmModal({
                                                    open: false,
                                                    table: null,
                                                    endTime: '',
                                                });
                                            }}
                                        >
                                            Ya, saya setuju
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <FAQSection />
            <FooterClient />
        </div>
    );
}
