<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationHistoryController extends Controller
{
  public function indexReservationHistory(Request $request)
{
    $query = Booking::with([
        'user:id,name,email,phone',
        'tables:id,table_name',
        'items.menu:id,name',
    ]);

    // 1. Ambil input dan pastikan kita membersihkan nilai kosong
    $fromDate = $request->input('from_date');
    $toDate = $request->input('to_date');
    $status = $request->input('status', 'all');

    // 2. Filter Status Booking (History: Bukan yang sedang aktif)
    $query->whereNotIn('booking_status', ['seated', 'reserve']);

    // 3. LOGIKA FILTER TANGGAL (FIXED)
    // Gunakan condition yang lebih ketat untuk mengecek apakah filter benar-benar ada
    if (!empty($fromDate) || !empty($toDate)) {
        if (!empty($fromDate)) {
            $query->whereDate('booking_date', '>=', $fromDate);
        }
        if (!empty($toDate)) {
            $query->whereDate('booking_date', '<=', $toDate);
        }
    } else {
        // DEFAULT: Jika tidak ada input tanggal, TAMPILKAN HARI INI SAJA
        $query->whereDate('booking_date', Carbon::today()->toDateString());
    }

    // 4. FILTER STATUS PEMBAYARAN
    if ($status === 'completed') {
        $query->where('payment_status', 'success');
    } elseif ($status === 'canceled') {
        $query->whereIn('payment_status', ['cancelled', 'expired']);
    } else {
        // Jika 'all', pastikan hanya status final yang muncul
        $query->whereIn('payment_status', ['success', 'cancelled', 'expired']);
    }

    // Hindari data yang belum final
    $query->whereNotIn('payment_status', ['placed', 'pending']);

    // 5. Eksekusi
    $bookings = $query
        ->orderBy('booking_date', 'desc') 
        ->orderBy('booking_time', 'desc') 
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('admin/reservationHistory/index', [
        'bookings' => $bookings,
        'filters' => [
            'from_date' => $fromDate ?? '',
            'to_date' => $toDate ?? '',
            'status' => $status,
        ],
    ]);
}
}
