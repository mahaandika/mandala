<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Menu;
use App\Models\PersonalizationOption;
use App\Models\PersonalizationMenu;
use Illuminate\Support\Facades\DB;

class CategoryMenuSeeder extends Seeder
{
    public function run(): void
    {
        /* =======================
           CATEGORIES (ONLY 3)
        ========================*/
        foreach (['foods','drinks','dessert'] as $cat) {
            Category::firstOrCreate(
                ['name' => $cat],
                ['is_active' => true]
            );
        }

        $foods   = Category::where('name','foods')->first()->id;
        $drinks  = Category::where('name','drinks')->first()->id;
        $dessert = Category::where('name','dessert')->first()->id;

        /* =======================
           HELPER
        ========================*/
        $getOptionIds = function (string $type, array|string $names) {
            return PersonalizationOption::whereHas('personalizationType', fn ($q) =>
                $q->where('name', $type)
            )->whereIn('name', (array) $names)
             ->pluck('id')
             ->toArray();
        };

        /* =========================================================
           1. Caesar Salad (foods)
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
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Dietary Preferences', 'vegetarian'),
            $getOptionIds('Flavor Preferences', ['fresh','savory','sweet']),
            $getOptionIds('Allergens to Avoid', ['eggs','dairy','nuts','soy'])
        ));

        /* =========================================================
           2. Chicken Lemongrass (foods)
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
            $getOptionIds('Spiciness Level', '1'),
            $getOptionIds('Flavor Preferences', 'savory'),
            $getOptionIds('Allergens to Avoid', 'nuts')
        ));

        /* =========================================================
           3. Tenderloin Steak 200 GR (foods)
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
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Dietary Preferences', ['vegetarian','vegan']),
            $getOptionIds('Flavor Preferences', 'smoky')
        ));

        /* =========================================================
           4. Banana Tart (dessert)
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
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Dietary Preferences', 'dairy-free'),
            $getOptionIds('Flavor Preferences', ['sweet','fresh','creamy']),
            $getOptionIds('Allergens to Avoid', 'dairy')
        ));

        /* =========================================================
           5. Tropichill Margarita (drinks)
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $drinks,
            'name' => 'Tropichill Margarita',
            'description' => 'Fresh tropical margarita',
            'price' => 45000,
            'image' => 'tropichill-margarita.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Flavor Preferences', ['fresh','sweet'])
        ));

        /* =========================================================
           6. Chicken Parmigiana (foods)
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
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Flavor Preferences', ['fresh','smoky','savory']),
            $getOptionIds('Allergens to Avoid', ['dairy','eggs'])
        ));

        /* =========================================================
           7. Truffle Mushroom Pizza (foods)
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $foods,
            'name' => 'Truffle Mushroom Pizza',
            'description' => 'Vegan truffle mushroom pizza',
            'price' => 55000,
            'image' => 'truffle-mushroom-pizza.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Dietary Preferences', 'vegan'),
            $getOptionIds('Flavor Preferences', 'smoky'),
            $getOptionIds('Allergens to Avoid', ['gluten','dairy'])
        ));

        /* =========================================================
           8. Duck Leg Confit (foods)
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $foods,
            'name' => 'Duck Leg Confit',
            'description' => 'Slow cooked duck leg confit',
            'price' => 45000,
            'image' => 'duck-leg-confit.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Flavor Preferences', ['fresh','savory'])
        ));

        /* =========================================================
           9. Molten Lava Cake (dessert)
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $dessert,
            'name' => 'Molten Lava Cake',
            'description' => 'Warm chocolate molten lava cake',
            'price' => 35000,
            'image' => 'molten-lava-cake.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Dietary Preferences', 'vegetarian'),
            $getOptionIds('Flavor Preferences', 'sweet'),
            $getOptionIds('Allergens to Avoid', ['gluten','dairy'])
        ));

        /* =========================================================
           10. Mandala Negroni (drinks)
        ==========================================================*/
        $menu = Menu::create([
            'category_id' => $drinks,
            'name' => 'Mandala Negroni',
            'description' => 'Fresh and sweet negroni cocktail',
            'price' => 80000,
            'image' => 'mandala-negroni.jpg',
            'is_active' => true,
        ]);

        $this->attach($menu->id, array_merge(
            $getOptionIds('Spiciness Level', '0'),
            $getOptionIds('Flavor Preferences', ['fresh','sweet'])
        ));
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
