<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'booking_code',
        'user_id',
        'total_people',
        'booking_date',
        'booking_time',
        'booking_status',
        'payment_status',
        'total_price',
        'qr_code',
        'qr_scanned',
        'checkin_time',
        'checkout_time',
        'snap_token',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'qr_scanned' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($booking) {
            // Jika booking_code kosong, maka buatkan yang unik
            if (!$booking->booking_code) {
                do {
                    $code = strtoupper(Str::random(10));
                } while (static::where('booking_code', $code)->exists());
                
                $booking->booking_code = $code;
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tables()
    {
        return $this->belongsToMany(
            RestaurantTable::class,
            'booking_tables'
        )->withTimestamps();
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }
    public function walkInPayments()
    {
        return $this->hasOne(WalkInPayment::class);
    }
}
