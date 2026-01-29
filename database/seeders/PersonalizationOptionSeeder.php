<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PersonalizationType;
use App\Models\PersonalizationOption;

class PersonalizationOptionSeeder extends Seeder
{
    public function run(): void
    {
        $types = PersonalizationType::all()->keyBy('name');

        // Spiciness Level
        foreach (['No Spicy', 'Less Spicy', 'Medium Spicy', 'Spicy', 'Extra Spicy'] as $level) {
            PersonalizationOption::firstOrCreate([
                'personalization_type_id' => $types['Spiciness Level']->id,
                'name' => $level,
            ], ['is_active' => true]);
        }

        // Allergens
        foreach (['gluten','dairy','eggs','fish','shellfish','nuts','soy','coconut'] as $item) {
            PersonalizationOption::firstOrCreate([
                'personalization_type_id' => $types['Allergens to Avoid']->id,
                'name' => $item,
            ], ['is_active' => true]);
        }

        // Dietary
        foreach (['vegetarian','vegan','gluten-free','dairy-free','pescatarian'] as $item) {
            PersonalizationOption::firstOrCreate([
                'personalization_type_id' => $types['Dietary Preferences']->id,
                'name' => $item,
            ], ['is_active' => true]);
        }

        // Flavor
        foreach (['savory','spicy','sweet','rich','light','fresh','smoky','creamy'] as $item) {
            PersonalizationOption::firstOrCreate([
                'personalization_type_id' => $types['Flavor Preferences']->id,
                'name' => $item,
            ], ['is_active' => true]);
        }
    }
}
