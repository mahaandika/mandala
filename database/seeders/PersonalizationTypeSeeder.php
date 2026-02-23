<?php

namespace Database\Seeders;

use App\Models\PersonalizationType;
use Illuminate\Database\Seeder;

class PersonalizationTypeSeeder extends Seeder
{
    public function run(): void
    {
        PersonalizationType::firstOrCreate(
            ['name' => 'Spiciness Level'],
            [
                'label' => 'How spicy do you like your food?',
                'slug' => 'spiciness-level',
                'selection_mode' => 'include',
                'selection_type' => 'single',
                'is_active' => true,
            ]
        );

        PersonalizationType::firstOrCreate(
            ['name' => 'Allergens to Avoid'],
            [
                'label' => 'Select any ingredients you are allergic to or wish to avoid',
                'slug' => 'allergens-to-avoid',
                'selection_mode' => 'exclude',
                'selection_type' => 'multiple',
                'is_active' => true,
            ]
        );

        PersonalizationType::firstOrCreate(
            ['name' => 'Dietary Preferences'],
            [
                'label' => 'Choose your dietary lifestyle',
                'slug' => 'dietary-preferences',
                'selection_mode' => 'include',
                'selection_type' => 'multiple',
                'is_active' => true,
            ]
        );

        PersonalizationType::firstOrCreate(
            ['name' => 'Flavor Preferences'],
            [
                'label' => 'What flavors do you enjoy most?',
                'slug' => 'flavor-preferences',
                'selection_mode' => 'include',
                'selection_type' => 'multiple',
                'is_active' => true,
            ]
        );
    }
}
