<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalizationOption extends Model
{
    protected $table = 'personalization_options';
    protected $fillable = [
        'personalization_type_id',
        'name',
        'is_active',
    ];
    public function personalizationType()
    {
        return $this->belongsTo(PersonalizationType::class);
    }
    
    public function menus()
    {
        return $this->belongsToMany(
            Menu::class,
            'personalization_menus'
        )->withTimestamps();
    }
}
