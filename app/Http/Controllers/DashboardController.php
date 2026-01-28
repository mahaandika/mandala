<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\RestaurantTable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->get('date', Carbon::today()->toDateString());

        /**
         * Ambil booking aktif di tanggal tsb
         */
        $bookings = Booking::query()
            ->with([
                'user:id,name,phone',
                'tables:id,table_name,capacity',
            ])
            ->whereDate('booking_date', $date)
            ->whereIn('booking_status', ['reserve', 'seated'])
            // Urutkan dari database agar lebih rapi sejak awal
            ->orderBy('booking_time', 'asc') 
            ->get();

        $tableBookings = [];

        foreach ($bookings as $booking) {
            foreach ($booking->tables as $table) {
                $tableBookings[$table->id][] = [
                    'id' => $booking->id,
                    'customer' => $booking->user->name,
                    'phone' => $booking->user->phone,
                    'status' => $booking->booking_status,
                    'date' => $booking->booking_date,
                    'time' => $booking->booking_time,
                    'pax' => $booking->total_people,
                ];
            }
        }

        /**
         * Ambil semua meja
         */
        $tables = RestaurantTable::query()
            ->select('id', 'table_name', 'capacity', 'position')
            ->orderBy('table_name')
            ->get()
            ->map(function ($table) use ($tableBookings) {
                $reservationsForThisTable = $tableBookings[$table->id] ?? [];

                // --- PROSES PENGURUTAN BERDASARKAN WAKTU ---
                // Kita urutkan array reservasi menggunakan collect() agar lebih mudah
                $sortedReservations = collect($reservationsForThisTable)
                    ->sortBy('time') // Mengurutkan berdasarkan key 'time' (asc)
                    ->values()       // Mereset index array menjadi 0, 1, 2...
                    ->all();

                return [
                    'id' => $table->id,
                    'name' => $table->table_name,
                    'capacity' => $table->capacity,
                    'position' => $table->position,
                    'status' => !empty($sortedReservations) ? 'reserved' : 'available',

                    'reservations' => array_map(function ($res) {
                        return [
                            'booking_id' => $res['id'],
                            'customer' => $res['customer'],
                            'phone' => $res['phone'],
                            'status' => $res['status'],
                            'time' => $res['time'], 
                        ];
                    }, $sortedReservations),
                ];
            });

        // Kirim $tables ke Inertia atau view Anda
        return Inertia::render('admin/dashboard', [
            'tables' => $tables,
            'date' => $date
        ]);
    }
}   
