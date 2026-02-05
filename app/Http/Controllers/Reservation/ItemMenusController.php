<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ItemMenusController extends Controller
{
   public function addToCart(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|exists:menus,id',
        ]);

        $menu = Menu::findOrFail($request->menu_id);
        $user = Auth::user();

        // 1. Cari atau buat booking "pending" milik user
        $booking = Booking::firstOrCreate(
            [
                'user_id' => $user->id,
                'booking_status' => 'pending',
            ],
            [
                'total_people' => 0, // Default awal
                'booking_date' => now()->toDateString(), // Default awal
                'booking_time' => now()->toTimeString(),
            ]
        );

        // 2. Cek apakah menu ini sudah ada di BookingItem untuk booking ini
        $existingItem = BookingItem::where('booking_id', $booking->id)
                                    ->where('menu_id', $menu->id)
                                    ->first();

        if ($existingItem) {
            // Jika sudah ada, tambah quantity
            $existingItem->increment('quantity');
            $existingItem->update([
                'subtotal' => $existingItem->quantity * $existingItem->unit_price
            ]);
        } else {
            // Jika belum ada, buat record baru
            BookingItem::create([
                'booking_id' => $booking->id,
                'menu_id'    => $menu->id,
                'quantity'   => 1,
                'unit_price' => $menu->price,
                'subtotal'   => $menu->price,
                'type'       => 'online',
            ]);
        }

        return redirect()->back()->with('success', 'Menu ditambahkan ke keranjang');
    }
}