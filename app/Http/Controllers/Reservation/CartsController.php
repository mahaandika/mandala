<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartsController extends Controller
{
    public function showCart()
    {
        $booking = Booking::with(['user', 'tables', 'items.menu'])
        ->where('user_id', Auth::user()->id)
        ->where('booking_status', 'pending')
        ->first();

    $validation = [
        'can_checkout' => true,
        'warnings' => [],
        'errors' => []
    ];

    if ($booking) {
        $tableIds = $booking->tables->pluck('id');
        // Pastikan format date & time digabung untuk perbandingan objek Carbon
        $myTime = \Carbon\Carbon::parse($booking->booking_date->format('Y-m-d') . ' ' . $booking->booking_time);

        // Cari booking orang lain di meja yang sama
        $conflictingBookings = Booking::whereHas('tables', function ($q) use ($tableIds) {
                // Gunakan ID dari restaurant_tables
                $q->whereIn('restaurant_tables.id', $tableIds);
            })
            ->where('id', '!=', $booking->id)
            ->whereDate('booking_date', $booking->booking_date)
            ->whereIn('booking_status', ['reserve', 'seated'])
            ->with('tables')
            ->get();


            foreach ($booking->tables as $table) {
                foreach ($conflictingBookings as $conflict) {
                    if ($conflict->tables->contains('id', $table->id)) {
                        $otherTime = \Carbon\Carbon::parse($conflict->booking_date->format('Y-m-d') . ' ' . $conflict->booking_time);
                        
                        // Selisih dalam menit (Positif jika booking kita SETELAH orang lain, Negatif jika SEBELUM)
                        $diffInMinutes = $otherTime->diffInMinutes($myTime, false);

                        if ($myTime->gt($otherTime)) {
                            // KONDISI: Jam kita DIATAS jam mereka (Kita datang belakangan tapi mereka belum selesai)
                            $validation['errors'][] = "Meja {$table->table_number} masih ada booking jam " . $otherTime->format('H:i') . " (Status: {$conflict->booking_status}). Tunggu hingga selesai.";
                            $validation['can_checkout'] = false;
                        } else {
                            // KONDISI: Jam kita DIBAWAH jam mereka (Kita datang duluan)
                            $absDiff = abs($diffInMinutes);

                            if ($absDiff <= 30) {
                                // Jika mepet 30 menit atau kurang
                                $validation['errors'][] = "Meja {$table->table_number} tidak dapat dibooking karena mepet 30 menit dengan booking lain jam " . $otherTime->format('H:i') . ".";
                                $validation['can_checkout'] = false;
                            } else {
                                // Jika masih boleh (di atas 30 menit sebelum orang lain datang) tapi kasih warning
                                $validation['warnings'][] = "Peringatan: Meja {$table->table_number} sudah di-reserve orang lain jam " . $otherTime->format('H:i') . ". Pastikan Anda selesai sebelum jam tersebut.";
                            }
                        }
                    }
                }
            }
        }

            return Inertia::render('carts', [
    'booking' => $booking ? [
        'id' => $booking->id,
        'booking_code' => $booking->booking_code,
        'total_people' => $booking->total_people,
        
        // UBAH BARIS INI: Tambahkan format('Y-m-d')
        'booking_date' => $booking->booking_date->format('Y-m-d'), 
        
        'booking_time' => $booking->booking_time,
        'user' => $booking->user,
        'tables' => $booking->tables,
        'menus' => $booking->items->map(function ($item) {
            return [
                'id' => $item->id, 
                'menu_id' => $item->menu_id,
                'name' => $item->menu->name ?? 'Menu deleted',
                'price' => (int) $item->unit_price,
                'qty' => $item->quantity,
            ];
        }),
        'validation' => $validation
    ] : null
]);

    }

    public function updateQty(Request $request, $id)
    {
        $item = BookingItem::findOrFail($id);
        $action = $request->action; // 'increment' atau 'decrement'

        if ($action === 'increment') {
            $item->increment('quantity');
        } else {
            if ($item->quantity > 1) {
                $item->decrement('quantity');
            }
        }

        $item->update(['subtotal' => $item->quantity * $item->unit_price]);
        return redirect()->back();
    }

    public function removeItem($id)
    {
        BookingItem::findOrFail($id)->delete();
        return redirect()->back();
    }

    public function cancelCurrentBooking()
    {
        $booking = Booking::where('user_id', Auth::user()->id)
            ->where('booking_status', 'pending')
            ->first();

        if ($booking) {
            $booking->tables()->detach();
            $booking->delete();
        }

        return redirect('/carts')->with('success', 'Reservasi berhasil dibatalkan.');
    }
}
