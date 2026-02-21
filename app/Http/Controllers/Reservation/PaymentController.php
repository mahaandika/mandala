<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\WalkInPayment;
use App\Services\MidtransServices;
use BaconQrCode\Renderer\Image\PngRenderer;
use BaconQrCode\Renderer\Image\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
   protected $midtransService;

    public function __construct(MidtransServices $midtransService)
    {
        $this->midtransService = $midtransService;
    }
    public function checkout(Request $request)
    {
        $booking = Booking::with(['user', 'items.menu'])
            ->where('user_id', Auth::user()->id)
            ->whereIn('booking_status', ['pending', 'reserve'])
            ->findOrFail($request->booking_id);
        if ($booking->tables->isEmpty()) {
            return response()->json(['message' => 'Anda belum memilih meja.'], 422);
        }

        if ($booking->items->isEmpty()) {
            return response()->json(['message' => 'Minimal pilih satu menu sebelum checkout.'], 422);
        }
            // 3. --- PENGECEKAN KETERSEDIAAN MEJA (TABRAKAN JADWAL) ---
            $tableIds = $booking->tables->pluck('id'); 
            $bookingDate = $booking->booking_date->format('Y-m-d');
            $bookingTime = $booking->booking_time; 

           $isTableTaken = Booking::where('bookings.id', '!=', $booking->id)
                ->whereDate('booking_date', $bookingDate)
                ->whereIn('booking_status', ['reserve', 'seated']) // Status yang dianggap menghalangi
                ->whereHas('tables', function ($query) use ($tableIds) {
                    $query->whereIn('restaurant_tables.id', $tableIds);
                })
                ->where(function ($q) use ($bookingTime) {
                    $q->whereRaw("
                        (
                            -- Syarat 1: Jika jam kita DI ATAS jam booking orang lain (Kita datang belakangan)
                            -- Maka kita harus tunggu mereka selesai (Error jika jam kita >= jam mereka)
                            TIME_TO_SEC(?) >= TIME_TO_SEC(bookings.booking_time)
                            
                            OR 
                            
                            -- Syarat 2: Jika jam kita DI BAWAH jam booking orang lain (Kita datang duluan)
                            -- Tapi selisihnya mepet kurang dari 30 menit
                            (
                                TIME_TO_SEC(?) < TIME_TO_SEC(bookings.booking_time) 
                                AND 
                                TIME_TO_SEC(?) >= TIME_TO_SEC(bookings.booking_time) - (30 * 60)
                            )
                        )
                    ", [$bookingTime, $bookingTime, $bookingTime]);
                })
                ->exists();

            // 3. Respon jika tidak tersedia
            if ($isTableTaken) {
                return response()->json([
                    'message' => 'Meja tidak tersedia. Jam yang Anda pilih mepet atau masih ada booking aktif (Reserved/Seated) di jam tersebut.'
                ], 422);
            }

        $total = $booking->items->sum(function($item) {
            return $item->unit_price * $item->quantity;
        });
        

        // Mulai Transaksi Database
        DB::beginTransaction();

        try {
            if (!$booking->snap_token || $booking->total_price != $total) {
                
                // 1. Update data sementara di memory/database
                $booking->update([
                    'total_price' => $total,
                    'booking_status' => 'reserve',
                    'payment_status' => 'placed'
                ]);

                // 2. Request token ke Midtrans (Potensi Error di sini)
                $snapToken = $this->midtransService->createSnapToken($booking);

                // 3. Simpan token jika berhasil
                $booking->update(['snap_token' => $snapToken]);

                // Jika semua lancar, simpan permanen ke DB
                DB::commit(); 
            } else {
                $snapToken = $booking->snap_token;
                // Tidak perlu commit karena tidak ada perubahan data di blok ini
            }

            return response()->json([
                'snap_token' => $snapToken,
                'booking_code' => $booking->booking_code
            ]);

        } catch (\Exception $e) {
            // JIKA ERROR: Batalkan semua perubahan update status/total_price di atas
            DB::rollBack(); 

            return response()->json([
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function callbackMidtrans(Request $request)
    {
        if (!$this->midtransService->isSignatureKeyVerified()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $booking = $this->midtransService->getTransaction();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        // Idempotency: Jika sudah success, jangan diproses lagi
        if ($booking->payment_status === 'success') {
            return response()->json([
                'success' => true,
                'message' => 'Transaction is paid successfully.',
            ]);
        }

        $status = $this->midtransService->getStatus();

        // Mapping Status
        $paymentStatus = match ($status) {
            'success' => 'success',
            'pending' => 'pending',
            'expire'  => 'expired',
            'cancel'  => 'cancelled',
            default   => $booking->payment_status,
        };

        $bookingStatus = match ($status) {
            'success' => 'reserve',   
            'expire', 'cancel' => 'cancelled', // Jika gagal, otomatis 'cancelled'
            default   => $booking->booking_status,
        };

        // Update Database
        $booking->update([
            'payment_status' => $paymentStatus,
            'booking_status' => $bookingStatus,
        ]);

        $qrCodeUrl = $booking->qr_code;

        // Logika Generate QR menggunakan Google Charts API (Gratis & Stabil)
        $qrCodeUrl = $booking->qr_code; // Default ke nilai lama jika tidak ada update

        if ($status === 'success') {
            // Sesuai saran dokumentasi: gunakan urlencode() untuk data
            $data = urlencode($booking->booking_code);
            $size = '300x300';
            
            // Parameter tambahan (ecc = Error Correction Code) 
            // Menggunakan level 'M' (Medium) agar seimbang antara redundancy & kapasitas
            $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size={$size}&data={$data}&ecc=M";
        }
        $booking->update([
            'payment_status' => $paymentStatus,
            'booking_status' => $bookingStatus,
            'qr_code'        => $qrCodeUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction is paid successfully.',
        ]);
    }

    public function paymentFinish(Booking $booking)
    {
        $user = Auth::user();
        
        // Pastikan booking ini milik user yang login
        if ($booking->user_id != $user->id) {
            abort(403);
        }

        // Load relasi agar data menu tersedia
        $booking->load(['items.menu', 'user', 'tables']);

        if ($booking->payment_status !== 'success') {
            return redirect()->route('dashboard');
        }

        return Inertia::render('payment-finish', [
            'booking' => $booking
        ]);
    }

    public function processPayment(Request $request, Booking $booking)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,qris,debit,kredit',
            'total_amount' => 'required|numeric',
            'amount_tendered' => 'nullable|numeric|gte:total_amount',
        ]);

        DB::transaction(function () use ($request, $booking) {
            $change = 0;
            if ($request->payment_method === 'cash') {
                $change = $request->amount_tendered - $request->total_amount;
            }

            WalkInPayment::create([
                'booking_id' => $booking->id,
                'payment_method' => $request->payment_method,
                'total_amount' => $request->total_amount,
                'amount_tendered' => $request->amount_tendered,
                'change_amount' => $change,
            ]);

            $booking->update([
                'booking_status' => 'completed',
            ]);
        });

        return back()->with('success', 'Pembayaran berhasil. Booking diselesaikan.');
    }
}
