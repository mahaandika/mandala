<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{

    public function downloadInvoice(Booking $booking)
    {
        $booking->load(['items.menu', 'user', 'tables', 'walkInPayments']);

        // 1. Pisahkan item berdasarkan TYPE (BENAR)
        $onlineItems = $booking->items->where('type', 'online');
        $walkInItems = $booking->items->where('type', 'walk_in');

        // 2. Hitung subtotal
        $totalOnline = $onlineItems->sum('subtotal');
        $totalWalkIn = $walkInItems->sum('subtotal');

        // 3. Payment walk-in (1 object)
        $payment = $booking->walkInPayments;

        return Pdf::loadView('pdf.invoice', [
            'booking'      => $booking,
            'onlineItems'  => $onlineItems,
            'walkInItems'  => $walkInItems,
            'totalOnline'  => $totalOnline,
            'totalWalkIn'  => $totalWalkIn,
            'payment'      => $payment,
        ])
        ->setPaper('A4', 'portrait')
        ->stream('Invoice-' . $booking->booking_code . '.pdf');
    }

}
