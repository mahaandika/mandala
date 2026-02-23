<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CancelReservation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cancel-reservation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membatalkan reservasi secara otomatis jika user belum check-in setelah 15 menit dari waktu booking.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $bufferMinutes = 15;
        $now = now();

        $this->info('Memulai pengecekan reservasi...');

        // 1. Ambil booking yang statusnya masih 'reserve' dan belum check-in
        // Kita filter whereDate <= hari ini untuk optimasi (booking masa depan tidak perlu dicek)
        $bookings = Booking::where('booking_status', 'reserve')
            ->whereNull('checkin_time')
            ->whereDate('booking_date', '<=', $now->toDateString())
            ->get();

        $cancelledCount = 0;

        foreach ($bookings as $booking) {
            try {
                // 2. Gabungkan booking_date dan booking_time menjadi Carbon object yang utuh
                // Pastikan format string tanggal benar (Y-m-d H:i:s)
                $bookingDateTimeString = $booking->booking_date->format('Y-m-d').' '.$booking->booking_time;
                $reservationTime = Carbon::parse($bookingDateTimeString);

                // 3. Hitung batas waktu toleransi (Waktu Booking + 15 Menit)
                $expiryTime = $reservationTime->copy()->addMinutes($bufferMinutes);

                // 4. Cek apakah waktu sekarang sudah MELEWATI batas waktu?
                if ($now->greaterThanOrEqualTo($expiryTime)) {

                    // Lakukan Update Status
                    // Anda bisa menggunakan 'cancelled' atau 'no_show'
                    $booking->update([
                        'booking_status' => 'cancelled',
                    ]);

                    $this->line("Booking [{$booking->booking_code}] dibatalkan. (Jadwal: {$bookingDateTimeString})");
                    $cancelledCount++;
                }

            } catch (\Exception $e) {
                $this->error("Error pada booking ID {$booking->id}: ".$e->getMessage());
            }
        }

        if ($cancelledCount > 0) {
            $this->info("Berhasil membatalkan {$cancelledCount} reservasi yang terlambat.");
        } else {
            $this->info('Tidak ada reservasi yang perlu dibatalkan.');
        }
    }
}
