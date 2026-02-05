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
            // 1. Hitung jumlah item yang tipenya 'walk_in'
            ->withCount(['items as walk_in_items_count' => function ($query) {
                $query->where('type', 'walk_in');
            }])
            ->whereDate('booking_date', $date)
            ->whereIn('booking_status', ['reserve', 'seated'])
            ->orderBy('booking_time', 'asc')
            ->get();

        $tableBookings = [];

        foreach ($bookings as $booking) {
            // 2. Logika: Hitung hanya jika statusnya 'seated'
            $walkInCount = 0;
            if ($booking->booking_status === 'seated') {
                $walkInCount = $booking->walk_in_items_count;
            }

            foreach ($booking->tables as $table) {
                $tableBookings[$table->id][] = [
                    'id' => $booking->id,
                    'customer' => $booking->user->name ?? 'Guest', // Handle jika user null (walk-in no user)
                    'phone' => $booking->user->phone ?? '-',
                    'status' => $booking->booking_status,
                    'date' => $booking->booking_date,
                    'time' => $booking->booking_time,
                    'pax' => $booking->total_people,
                    // 3. Masukkan data count ke array
                    'walk_in_items' => $walkInCount, 
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
                $sortedReservations = collect($reservationsForThisTable)
                    ->sortBy('time')
                    ->values()
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
                            // 4. Sertakan di respon akhir
                            'walk_in_items' => $res['walk_in_items'], 
                        ];
                    }, $sortedReservations),
                ];
            });
        return Inertia::render('admin/dashboard', [
            'tables' => $tables,
            'date' => $date
        ]);
    }
}   