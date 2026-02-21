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
        $booking = Booking::with(['user', 'tables', 'items.menu' => function($query) {
        $query->withTrashed(); // Menarik data menu meskipun sudah dihapus (soft delete)
    }])
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
        $bookingDateTime = \Carbon\Carbon::parse($booking->booking_date->format('Y-m-d') . ' ' . $booking->booking_time);

        if ($bookingDateTime->isPast()) {
            $validation['errors'][] = "Waktu reservasi (" . $bookingDateTime->format('H:i') . ") sudah terlewat. Silakan batalkan dan buat reservasi baru dengan waktu yang tersedia.";
            $validation['can_checkout'] = false;
        }

        if ($validation['can_checkout']) {
            $conflictingBookings = Booking::whereHas('tables', function ($q) use ($tableIds) {
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
                        $diffInMinutes = $otherTime->diffInMinutes($bookingDateTime, false);

                        if ($bookingDateTime->gt($otherTime)) {
                            $validation['errors'][] = "Meja {$table->table_number} masih ada booking jam " . $otherTime->format('H:i') . ".";
                            $validation['can_checkout'] = false;
                        } else {
                            $absDiff = abs($diffInMinutes);
                            if ($absDiff <= 30) {
                                $validation['errors'][] = "Meja {$table->table_number} terlalu mepet dengan booking lain (jam " . $otherTime->format('H:i') . ").";
                                $validation['can_checkout'] = false;
                            } else {
                                $validation['warnings'][] = "Peringatan: Meja {$table->table_number} sudah di-reserve orang lain jam " . $otherTime->format('H:i') . ".";
                            }
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
        // Di dalam CartsController.php fungsi showCart()
        'menus' => $booking->items->map(function ($item) {
            // Pastikan relasi menu ditarik dengan withTrashed() di query utamanya
            return [
                'id' => $item->id, 
                'menu_id' => $item->menu_id,
                'name' => $item->menu->name ?? 'Menu tidak ditemukan', // Nama asli akan muncul
                'price' => (int) $item->unit_price,
                'qty' => $item->quantity,
                // Flag untuk mengecek apakah menu masih aktif atau sudah di-soft delete
                'is_available' => $item->menu && !$item->menu->trashed(), 
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
