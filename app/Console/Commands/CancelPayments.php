<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class CancelPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cancel-payments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membatalkan reservasi yang tidak dibayar dalam 15 menit';

    /**
     * Execute the console command.
     */
public function handle()
    {
        $limit = Carbon::now()->subMinutes(5);

        // Ambil booking yang statusnya belum sukses dan sudah lewat 15 menit
        $expiredBookings = Booking::whereIn('payment_status', ['placed'])
            ->whereIn('booking_status', ['reserve'])
            ->where('updated_at', '<=', $limit)
            ->get();
        $this->info($expiredBookings->count() . ' reservasi ditemukan.');

        if ($expiredBookings->isEmpty()) {
            $this->info('Tidak ada pembayaran yang kedaluwarsa.');
            return;
        }

        foreach ($expiredBookings as $booking) {
            $booking->update([
                'payment_status' => 'expired',
                'booking_status' => 'cancelled',
            ]);
            
            $this->warn("Booking {$booking->booking_code} telah dibatalkan karena kedaluwarsa.");
        }

        $this->info($expiredBookings->count() . ' reservasi berhasil diperbarui ke status expired.');
        
        // Log ke Laravel log (opsional)
        Log::info('Scheduler CancelPayments berhasil dijalankan pada: ' . now());
    }
}
