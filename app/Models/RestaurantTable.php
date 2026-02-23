<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantTable extends Model
{
    protected $table = 'restaurant_tables';

    protected $guarded = ['id'];

    protected $fillable = [
        'table_name',
        'capacity',
        'position',
        'is_active',
    ];

    protected $casts = [
        'position' => 'array',
        'is_active' => 'boolean',
    ];

    public function bookings()
    {
        return $this->belongsToMany(
            Booking::class,
            'booking_tables'
        )->withTimestamps();
    }
}
