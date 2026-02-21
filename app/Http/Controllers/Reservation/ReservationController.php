<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Menu;
use App\Models\RestaurantTable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function indexReservation(Request $request)
    {
        $date = $request->get('date', Carbon::today()->toDateString());
        $user = Auth::user();

        $bookings = Booking::query()
            ->with([
                'user:id,name,phone',
                'tables:id,table_name,capacity',
            ])
            ->whereDate('booking_date', $date)
            ->whereIn('booking_status', ['reserve', 'seated'])
            ->get();

        // 1. Ubah menjadi array penampung (list)
        $tableBookings = [];
        foreach ($bookings as $booking) {
            foreach ($booking->tables as $table) {
                // Gunakan [] agar data di-push, bukan menimpa yang lama
                $tableBookings[$table->id][] = [
                    'booking_id' => $booking->id,
                    'customer'   => $booking->user->name,
                    'phone'      => $booking->user->phone,
                    'status'     => $booking->booking_status,
                    'time'       => $booking->booking_time,
                    'pax'        => $booking->total_people,
                ];
            }
        }

        $tables = RestaurantTable::query()
            ->select('id', 'table_name', 'capacity', 'position')
            ->orderBy('table_name')
            ->get()
            ->map(function ($table) use ($tableBookings) {
                // 2. Ambil semua list booking untuk meja ini (default array kosong)
                $reservations = $tableBookings[$table->id] ?? [];
                
                return [
                    'id'          => $table->id,
                    'name'        => $table->table_name,
                    'capacity'    => $table->capacity,
                    'position'    => $table->position,
                    // Jika array tidak kosong, berarti 'reserved'
                    'status'      => count($reservations) > 0 ? 'reserved' : 'available',
                    // 3. Kirimkan semua daftar reservasi (Array)
                    'reservations' => $reservations,
                ];
            });

        return Inertia::render('reservations', [
            'tables'    => $tables,
            'date'      => $date,
            'auth_user' => [
                'name'  => $user->name ?? '',
                'email' => $user->email ?? '',
                'phone' => $user->phone ?? '',
            ],
        ]);
    }

    public function storeReservation(Request $request)
    {
        $now = Carbon::now();
        $minTime = "11:00";
        $maxTime = "22:00";
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
            'person' => 'required|integer|min:1',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'table_ids' => 'required|array|min:1',
        ]);

        $bookingDate = Carbon::parse($request->date);
        $bookingTime = $request->time; // format "HH:mm"

        // --- VALIDASI JAM OPERASIONAL ---
        if ($bookingTime < $minTime || $bookingTime > $maxTime) {
            return back()->withErrors(['time' => "Jam operasional kami adalah $minTime sampai $maxTime."]);
        }

        // --- VALIDASI WAKTU LAMPAU (Jika tanggal hari ini) ---
        if ($bookingDate->isToday()) {
            $currentTime = $now->format('H:i');
            if ($bookingTime <= $currentTime) {
                return back()->withErrors(['time' => "Waktu sudah terlewat. Silahkan pilih jam setelah $currentTime."]);
            }
        }
        if ($bookingDate->gt(now()->addMonths(2))) {
            return back()->withErrors(['booking_date' => 'Maksimal pemesanan hanya bisa 2 bulan ke depan.']);
        }

        $user = Auth::user();
        $pax = $request->person;

        // 1. Validasi Kapasitas Meja
        $selectedTables = RestaurantTable::whereIn('id', $request->table_ids)->get();
        $totalCapacity = $selectedTables->sum('capacity');

        if ($totalCapacity < $pax) {
            return back()->withErrors(['table_ids' => "Meja hanya cukup untuk $totalCapacity orang."]);
        }

        // 2. Validasi Anti-Hoarding (Mencegah pesan banyak meja padahal satu cukup)
        if (count($request->table_ids) > 1) {
            foreach ($selectedTables as $table) {
                if ($table->capacity >= $pax) {
                    return back()->withErrors(['table_ids' => "Meja {$table->table_name} sudah cukup untuk $pax orang. Pilih satu meja saja."]);
                }
            }
        }

        // 3. Cari Booking PENDING yang sudah ada (Merge Logic)
        $existingBooking = Booking::where('user_id', $user->id)
            ->where('booking_status', 'pending')
            ->first();
        $userTime = $request->time; 
        // 4. Validasi Ketersediaan Meja 
       $isBooked = DB::table('booking_tables')
                ->join('bookings', 'bookings.id', '=', 'booking_tables.booking_id')
                ->whereIn('booking_tables.restaurant_table_id', $request->table_ids)
                ->whereDate('bookings.booking_date', $request->date)
                ->whereIn('bookings.booking_status', ['reserve', 'seated'])

                // ❌ userTime >= booking_time - 30 menit  → TIDAK BOLEH
                ->whereRaw("
                    TIME_TO_SEC(?) >= TIME_TO_SEC(bookings.booking_time) - (30 * 60)
                ", [$userTime])

                // abaikan booking sendiri saat update
                ->when($existingBooking, function ($query) use ($existingBooking) {
                    return $query->where('bookings.id', '!=', $existingBooking->id);
                })
                ->exists();


        if ($isBooked) {
            return back()->withErrors(['table_ids' => "Salah satu meja sudah dipesan orang lain pada tanggal tersebut."]);
        }

        try {
            DB::beginTransaction();
            
            // Update Profile User
            $user->update([
                'name' => $request->name,
                'phone' => $request->phone
            ]);

            if ($existingBooking) {
                // JIKA ADA: Update data yang sudah ada
                $existingBooking->update([
                    'total_people' => $pax,
                    'booking_date' => $request->date,
                    'booking_time' => $request->time,
                ]);
                
                // Hapus relasi meja lama (detach) agar bisa diganti yang baru
                $existingBooking->tables()->sync($request->table_ids);
                $booking = $existingBooking;
                $msg = 'Detail reservasi meja berhasil diperbarui.';
            } else {
                // JIKA TIDAK ADA: Buat Booking baru
                $booking = Booking::create([
                    'user_id' => $user->id,
                    'total_people' => $pax,
                    'booking_date' => $request->date,
                    'booking_time' => $request->time,
                    'booking_status' => 'pending',
                    'total_price' => 0,
                ]);
                
                $booking->tables()->attach($request->table_ids);
                $msg = 'Meja berhasil ditambahkan ke keranjang.';
            }

            DB::commit();

            return redirect()->route('carts') // sesuaikan nama route keranjangmu
                ->with('success', $msg);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function checkIn(Request $request)
{
    $request->validate([
        'booking_code' => 'required|exists:bookings,booking_code',
    ]);

    $booking = Booking::where('booking_code', $request->booking_code)->first();

    // 1. Validasi jika sudah discan sebelumnya
    if ($booking->qr_scanned) {
        return back()->withErrors(['message' => 'QR Code ini sudah pernah discan pada ' . $booking->checkin_time]);
    }

    // 2. Validasi status pembayaran
    if ($booking->payment_status !== 'success') {
        return back()->withErrors(['message' => 'Gagal: Pembayaran belum diselesaikan.']);
    }
    
    // Pastikan booking_date dikonversi ke string
    $dateString = $booking->booking_date instanceof \Carbon\Carbon 
        ? $booking->booking_date->format('Y-m-d') 
        : $booking->booking_date;

    // Waktu Reservasi asli
    $reservationStartTime = \Carbon\Carbon::parse($dateString . ' ' . $booking->booking_time);
    
    // Batas Keterlambatan: 15 Menit + 1 Menit (Toleransi) = 16 Menit
    $expirationTime = $reservationStartTime->copy()->addMinutes(15);
    
    // Waktu Sekarang
    $now = \Carbon\Carbon::now();

    // --- LOGIKA BARU: CEK KADALUARSA (NO SHOW) ---
    if ($now->gt($expirationTime)) {
        // Update status secara otomatis menjadi no_show karena telat
        $booking->update([
            'booking_status' => 'no_show',
        ]);

        return back()->withErrors([
            'message' => 'Gagal: QR Code Kadaluarsa. Batas check-in (15 menit) telah terlewati.'
        ]);
    }

    // --- CEK APAKAH TERLALU CEPAT ---
    if ($now->lt($reservationStartTime->subMinutes(5))) {
        return back()->withErrors([
            'message' => 'Gagal: Belum waktunya Check-in. Reservasi dijadwalkan pada jam ' . $reservationStartTime->format('H:i')
        ]);
    }

    // 3. Update data jika validasi lolos (Tepat Waktu)
    $booking->update([
        'booking_status' => 'seated',
        'qr_scanned'     => true,
        'checkin_time'   => $now,
    ]);

    return back()->with('success', 'Tamu berhasil Check-in. Silahkan arahkan ke meja.');
}

   public function walkInReservation(Request $request)
    {
        $request->validate([
            'table_ids' => 'required|array|min:1', // Array ID meja
            'table_ids.*' => 'exists:restaurant_tables,id',
            'total_people' => 'required|integer|min:1',
            'items' => 'nullable|array', // Item menu (opsional)
            'items.*.id' => 'exists:menus,id',
            'items.*.quantity' => 'integer|min:1',
        ]);

        // 1. Cek Ketersediaan Semua Meja
        $occupiedTables = DB::table('booking_tables')
            ->join('bookings', 'bookings.id', '=', 'booking_tables.booking_id')
            ->whereIn('booking_tables.restaurant_table_id', $request->table_ids)
            ->whereDate('bookings.booking_date', now()->toDateString())
            ->whereIn('bookings.booking_status', ['reserve', 'seated'])
            ->pluck('booking_tables.restaurant_table_id')
            ->toArray();

        // if (!empty($occupiedTables)) {
        //     return back()->withErrors(['message' => 'Salah satu meja yang dipilih sudah terisi.']);
        // }

        try {
            DB::beginTransaction();

            // 2. Hitung Total Harga Menu (Security: Hitung di backend)
            $totalMenuPrice = 0;
            $bookingItemsData = [];

            if (!empty($request->items)) {
                foreach ($request->items as $item) {
                    $menu = Menu::find($item['id']);
                    $subtotal = $menu->price * $item['quantity'];
                    $totalMenuPrice += $subtotal;

                    $bookingItemsData[] = [
                        'menu_id' => $menu->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $menu->price,
                        'subtotal' => $subtotal,
                    ];
                }
            }

            // 3. Buat Booking Header
            $booking = Booking::create([
                'user_id' => Auth::id(),
                'booking_date' => now()->toDateString(),
                'booking_time' => now()->format('H:i'),
                'total_people' => $request->total_people,
                'booking_status' => 'seated',
                'payment_status' => 'success', 
                'qr_scanned' => true,
                'checkin_time' => now(),
                'total_price' => $totalMenuPrice,
            ]);

            // 4. Attach Multiple Tables
            $booking->tables()->attach($request->table_ids);

            // 5. Create Booking Items
            foreach ($bookingItemsData as $data) {
                BookingItem::create([
                    'booking_id' => $booking->id,
                    'menu_id' => $data['menu_id'],
                    'quantity' => $data['quantity'],
                    'unit_price' => $data['unit_price'],
                    'subtotal' => $data['subtotal'],
                    'type' => 'walk_in',
                ]);
            }

            DB::commit();

            return back()->with('success', 'Walk-In berhasil disimpan untuk ' . count($request->table_ids) . ' meja.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function addItems(Request $request, Booking $booking)
    {
        // 1. Validasi Input dari Frontend (Wizard Step 2)
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($request, $booking) {
                
                foreach ($request->items as $itemData) {
                    // Ambil data menu master untuk mendapatkan harga saat ini
                    $menuMaster = Menu::findOrFail($itemData['id']);
                    $qtyToAdd = $itemData['quantity'];

                    // Cek apakah menu ini sudah ada di booking tersebut?
                    // Kita gunakan relasi items() yang ada di model Booking
                    $existingItem = $booking->items()
                        ->where('menu_id', $menuMaster->id)
                        ->where('type', 'walk_in')
                        ->first();

                    if ($existingItem) {
                        // SKENARIO A: Menu sudah ada, update quantity
                        $newQuantity = $existingItem->quantity + $qtyToAdd;
                        
                        // Hitung subtotal baru (Harga Satuan yg tersimpan * Quantity Baru)
                        // Note: Kita pakai unit_price yang sudah tersimpan untuk konsistensi, 
                        // atau pakai $menuMaster->price jika ingin mengikuti harga terbaru.
                        $newSubtotal = $newQuantity * $existingItem->unit_price;

                        $existingItem->update([
                            'quantity' => $newQuantity,
                            'subtotal' => $newSubtotal
                        ]);

                    } else {
                        // SKENARIO B: Menu baru, buat baris baru di booking_items
                        // Menggunakan Eloquent Create via Relationship
                        $booking->items()->create([
                            'menu_id' => $menuMaster->id,
                            'quantity' => $qtyToAdd,
                            'unit_price' => $menuMaster->price, // Simpan harga saat ini
                            'subtotal' => $menuMaster->price * $qtyToAdd,
                            'type' => 'walk_in',
                        ]);
                    }
                }

                // 2. Hitung Ulang Total Price Booking (Recalculate)
                // Sangat penting agar data konsisten
                // Kita sum kolom 'subtotal' dari semua item di booking ini
                $grandTotal = $booking->items()->sum('subtotal');

                // Update Booking Parent
                $booking->update([
                    'total_price' => $grandTotal,
                ]);
            });

            return back()->with('success', 'Menu berhasil ditambahkan.');

        } catch (\Exception $e) {
            // Log error jika perlu: \Log::error($e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}