<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user:id,name', 'tables:id,table_name,capacity'])
                        ->where('user_id', Auth::id());

            // 1. Filter Tanggal (Sesuaikan dengan nama parameter di React: from_date & to_date)
if ($request->from_date) {
    $query->whereDate('booking_date', '>=', $request->from_date);
}
if ($request->to_date) {
    $query->whereDate('booking_date', '<=', $request->to_date);
}

// 2. Filter Status (Logika tetap sama)
if ($request->status && $request->status !== 'all') {
    $status = $request->status;
    $query->where(function($q) use ($status) {
        if ($status === 'confirmed') {
            $q->whereIn('booking_status', ['reserve', 'seated'])
              ->where('payment_status', 'success');
        } elseif ($status === 'completed') {
            $q->where('booking_status', 'completed')
              ->where('payment_status', 'success');
        } elseif ($status === 'unpaid') {
            $q->whereIn('payment_status', ['pending', 'placed']);
        } elseif ($status === 'cancelled') {
            // Gunakan where berkelompok agar OR tidak merusak filter user_id
            $q->where(function($sub) {
                $sub->where('booking_status', 'no_show')
                    ->orWhereIn('payment_status', ['canceled', 'expired']);
            });
        }
    });
}

// 3. Pagination & Sort (DIBUAT DUA TINGKAT)
$bookings = $query->orderBy('booking_date', 'desc') // Tanggal terbaru di atas
                  ->orderBy('booking_time', 'desc') // Jika tanggal sama, jam terbaru di atas
                  ->paginate(5)
                  ->withQueryString();

return Inertia::render('historys', [
    'bookings' => $bookings,
    'filters' => $request->only(['from_date', 'to_date', 'status'])
]);
    }
}
