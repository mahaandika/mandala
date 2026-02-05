<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    protected $fillable = [
        'booking_id',
        'menu_id',
        'quantity',
        'unit_price',
        'subtotal',
        'type',
    ];

    // helper
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->unit_price, 0, ',', '.');
    }
    
    public function getFormattedSubtotalAttribute()
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}