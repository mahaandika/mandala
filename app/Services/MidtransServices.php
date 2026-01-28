<?php

namespace App\Services;

use App\Models\Booking;
use Exception;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Notification;
use Midtrans\Snap;

class MidtransServices
{
    protected $server_key;
    protected $is_production;
    protected $is_3ds;
    protected $isSanitized;

    public function __construct()
    {
        $this->server_key = config('midtrans-payment-gateaway.server_key');
        $this->is_production = config('midtrans-payment-gateaway.is_production');
        $this->is_3ds = config('midtrans-payment-gateaway.is_3ds');
        $this->isSanitized = true;

        Config::$serverKey      = $this->server_key;
        Config::$isProduction   = $this->is_production;
        Config::$isSanitized    = $this->isSanitized;
        Config::$is3ds          = $this->is_3ds;
    }

    public function createSnapToken(Booking $booking)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
                'gross_amount' => $booking->total_price
            ],
            'items_details' => [
                $this->itemsDetail($booking)
            ],
            'costumer_details' => [
                '$customer_details' => $this->getCustomerDetails($booking)
            ],
        ];
        try {
            return Snap::getSnapToken($params);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            throw new Exception($e->getMessage());
        }
    }

    public function isSignatureKeyVerified(): bool
    {
        $notification = new Notification();

        $localSignatureKey = hash(
            'sha512',
            $notification->order_id . $notification->status_code . $notification->gross_amount . $this->server_key
        );

        return $localSignatureKey === $notification->signature_key;
    }

    public function getTransaction(): ?Booking
    {
        $notification = new Notification();

        return Booking::where('booking_code', $notification->order_id)->first();
    }

    public function getStatus(): string
    {
        $notification       = new Notification();
        $transactionStatus  = $notification->transaction_status;
        $fraudStatus        = $notification->fraud_status;

        return match ($transactionStatus) {
            'capture'       => ($fraudStatus == 'accept') ? 'success' : 'pending',
            'settlement'    => 'success',
            'deny'          => 'failed',
            'cancel'        => 'cancel',
            'expire'        => 'expire',
            'pending'       => 'pending',
            default         => 'unknown',
        };
    }

    public function itemsDetail(Booking $booking)
    {
        return $booking->items->map(function ($item) {

            $menuName = $item->menu?->name ?? 'Menu Item';

            return [
                'id'       => (string) $item->menu_id, 
                'price'    => (int) $item->unit_price, 
                'quantity' => (int) $item->quantity,
                'name'     => substr($menuName, 0, 50),
            ];
        })->toArray();
    }


    protected function getCustomerDetails(Booking $booking): array
    {
        $user = $booking->user;

        return [
            'first_name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '0', 
            'shipping_address' => [
                'first_name'   => $user->name,
                'email'        => $user->email,
                'phone'        => $user->phone ?? '0', 
                'address'      => $user->address ?? 'Alamat tidak tersedia',
            ],
        ];
    }

}