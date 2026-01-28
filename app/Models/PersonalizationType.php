<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalizationType extends Model
{
    protected $table = 'personalization_types';

    protected $fillable = [
        'name',
        'slug',
        'label',
        'selection_mode',
        'selection_type',
        'is_active',
    ];

    public function personalizationOptions()
    {
        return $this->hasMany(PersonalizationOption::class);
    }
}
