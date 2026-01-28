<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Menu;
use App\Models\RestaurantTable;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $users  = User::where('role', Role::CUSTOMER)->get();
        $menus  = Menu::where('is_active', true)->get();
        $tables = RestaurantTable::all();

        $dates = [
            Carbon::yesterday(),
            Carbon::today(),
            Carbon::tomorrow(),
            Carbon::today()->addDays(2),
        ];

        $statuses = [
            'pending',
            'reserve',
            'seated',
            'completed',
            'cancelled',
            'no_show',
        ];

        // tracking meja terpakai [date][time] => [table_ids]
        $occupied = [];

        foreach ($dates as $date) {
            for ($i = 0; $i < 5; $i++) {
                $status = $statuses[array_rand($statuses)];
                $user   = $users->random();

                // jam booking random (17, 19, 21)
                $hour = collect([17, 19, 21])->random();
                $time = sprintf('%02d:00', $hour);

                $dateKey = $date->toDateString();

                $occupied[$dateKey][$time] ??= collect();

                // cari meja yang belum dipakai di waktu tsb
                $availableTables = $tables->reject(fn ($t) =>
                    $occupied[$dateKey][$time]->contains($t->id)
                );

                if ($availableTables->count() < 1) {
                    continue; // skip kalau sudah penuh
                }

                $selectedTables = $availableTables
                    ->random(rand(1, min(3, $availableTables->count())))
                    ->pluck('id');

                // tandai meja terpakai
                $occupied[$dateKey][$time] = $occupied[$dateKey][$time]
                    ->merge($selectedTables);

                /* ==========================
                   PAYMENT & QR LOGIC
                =========================== */
                $paymentStatus = match ($status) {
                    'completed', 'seated', 'reserve', 'no_show' => 'success',
                    'cancelled' => collect(['cancelled', 'expired'])->random(),
                    default => 'pending',
                };

                $hasPaid = $paymentStatus === 'success';

                $checkinTime = in_array($status, ['seated', 'completed'])
                    ? Carbon::parse("$dateKey $time")->addMinutes(rand(0, 15))
                    : null;

                $checkoutTime = $status === 'completed'
                    ? (clone $checkinTime)->addHours(2)
                    : null;

                $booking = Booking::create([
                    'booking_code' => strtoupper(Str::random(8)),
                    'user_id' => $user->id,
                    'total_people' => rand(2, 10),
                    'booking_date' => $dateKey,
                    'booking_time' => $time,
                    'booking_status' => $status,
                    'payment_status' => $paymentStatus,
                    'qr_code' => $hasPaid ? Str::uuid() : null,
                    'qr_scanned' => in_array($status, ['seated', 'completed']),
                    'checkin_time' => $checkinTime,
                    'checkout_time' => $checkoutTime,
                ]);

                // attach meja
                $booking->tables()->attach($selectedTables);

                // items
                $total = 0;

                foreach ($menus->random(rand(1, 3)) as $menu) {
                    $qty = rand(1, 3);
                    $subtotal = $qty * $menu->price;

                    BookingItem::create([
                        'booking_id' => $booking->id,
                        'menu_id' => $menu->id,
                        'quantity' => $qty,
                        'unit_price' => $menu->price,
                        'subtotal' => $subtotal,
                    ]);

                    $total += $subtotal;
                }

                $booking->update(['total_price' => $total]);
            }
        }
    }
}
