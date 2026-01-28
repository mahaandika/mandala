<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function show(Booking $booking)
    {
        $booking->load([
            'user:id,name,phone',
            'tables:id,table_name,capacity',
            'items.menu:id,name,price',
        ]);

        return response()->json([
            'id' => $booking->id,
            'customer_name' => $booking->user->name,
            'customer_phone' => $booking->user->phone,

            'booking_date' => $booking->booking_date->toDateString(),
            'booking_time' => Carbon::parse($booking->booking_time)->format('H:i'), //$booking->booking_time->format('H:i'),

            'status' => $booking->booking_status,

            'tables' => $booking->tables->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->table_name,
                'capacity' => $t->capacity,
            ]),

            'items' => $booking->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->menu->name,
                'qty' => $item->quantity,
                'price' => $item->formatted_price,
                'subtotal' => $item->formatted_subtotal,
            ]),

            'total_price' => $booking->items->sum(fn ($i) => $i->subtotal),

            'checkin_time' => $booking->checkin_time,
            'checkout_time' => $booking->checkout_time,
        ]);
    }

    public function complete(Booking $booking)
    {
        $booking->update([
            'booking_status' => 'completed',
            'checkout_time' => now(),
        ]);

        $tableNames = $booking->tables
            ->pluck('table_name')
            ->join(', ');

        return redirect()
            ->route('admin.dashboard')
            ->with(
                'success',
                "Booking completed for table: {$tableNames}"
            );
    }

    public function noShow(Booking $booking)
    {
        $booking->update([
            'booking_status' => 'no_show',
        ]);

        $tableNames = $booking->tables
            ->pluck('table_name')
            ->join(', ');

        return redirect()
            ->route('admin.dashboard')
            ->with(
                'success',
                "No show recorded for table: {$tableNames}"
            );
    }




}
