<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalizationType extends Model
{
    protected $table = 'personalization_types';

    protected $fillable = [
        'name',
        'description',
        'selection_mode',
        'selection_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function personalizationOptions()
    {
        return $this->hasMany(PersonalizationOption::class);
    }
}