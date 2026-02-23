<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use App\Models\PersonalizationOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryMenuSeeder extends Seeder
{
    public function run(): void
    {
        /* =======================
           CATEGORIES
        ========================*/
        foreach (['foods', 'drinks', 'dessert'] as $cat) {
            Category::firstOrCreate(
                ['name' => $cat],
                ['is_active' => true]
            );
        }

        $foods = Category::where('name', 'foods')->first()->id;
        $drinks = Category::where('name', 'drinks')->first()->id;
        $dessert = Category::where('name', 'dessert')->first()->id;

        /* =======================
           HELPER
        ========================*/
        $getOptionIds = function (string $type, array|string $names) {
            return PersonalizationOption::whereHas('personalizationType', fn ($q) => $q->where('name', $type)
            )->whereIn('name', (array) $names)
                ->pluck('id')
                ->toArray();
        };

        /* =========================================================
           1. Caesar Salad (foods) - No Spicy
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $foods,
            'name' => 'Caesar Salad',
            'description' => 'Fresh classic caesar salad',
            'price' => 25000,
            'image' => 'caesar-salad.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', 'No Spicy'),
            $getOptionIds('Dietary Preferences', 'vegetarian'),
            $getOptionIds('Flavor Preferences', ['fresh', 'savory', 'sweet']),
            $getOptionIds('Allergens to Avoid', ['eggs', 'dairy', 'nuts', 'soy'])
        ));

        /* =========================================================
           2. Chicken Lemongrass (foods) - Less Spicy
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $foods,
            'name' => 'Chicken Lemongrass',
            'description' => 'Savory lemongrass chicken',
            'price' => 90000,
            'image' => 'chicken-lemongrass.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', 'Less Spicy'),
            $getOptionIds('Flavor Preferences', 'savory'),
            $getOptionIds('Allergens to Avoid', 'nuts')
        ));

        /* =========================================================
           3. Tenderloin Steak (foods) - No Spicy
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $foods,
            'name' => 'Tenderloin Steak 200 GR',
            'description' => 'Smoky grilled tenderloin steak',
            'price' => 75000,
            'image' => 'tenderloin-steak.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', 'No Spicy'),
            $getOptionIds('Dietary Preferences', ['vegetarian', 'vegan']),
            $getOptionIds('Flavor Preferences', 'smoky')
        ));

        /* =========================================================
           4. Banana Tart (dessert) - No Spicy
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $dessert,
            'name' => 'Banana Tart',
            'description' => 'Sweet and creamy banana tart',
            'price' => 65000,
            'image' => 'banana-tart.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', 'No Spicy'),
            $getOptionIds('Dietary Preferences', 'dairy-free'),
            $getOptionIds('Flavor Preferences', ['sweet', 'fresh', 'creamy']),
            $getOptionIds('Allergens to Avoid', 'dairy')
        ));

        /* =========================================================
           5. Chicken Parmigiana (foods) - Medium Spicy
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $foods,
            'name' => 'Chicken Parmigiana',
            'description' => 'Classic Italian chicken parmigiana',
            'price' => 65000,
            'image' => 'chicken-parmigiana.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', 'Medium Spicy'),
            $getOptionIds('Flavor Preferences', ['fresh', 'smoky', 'savory']),
            $getOptionIds('Allergens to Avoid', ['dairy', 'eggs'])
        ));

        // ... Lanjutkan untuk menu lainnya dengan mengganti '0' menjadi 'No Spicy'
        // atau level lainnya sesuai kebutuhan menu tersebut.
    }

    private function attach(int $menuId, array $optionIds): void
    {
        $rows = [];
        foreach (array_unique($optionIds) as $optionId) {
            $rows[] = [
                'menu_id' => $menuId,
                'personalization_option_id' => $optionId,
            ];
        }
        DB::table('personalization_menus')->insert($rows);
    }
}
