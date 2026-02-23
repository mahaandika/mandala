<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResturantTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('restaurant_tables')->insert([
            [
                'table_name' => 'T01',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '15%',
                    'left' => '35%',
                    'shape' => 'circle',
                ]),
            ],
            [
                'table_name' => 'T02',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '15%',
                    'left' => '50%',
                    'shape' => 'circle',
                ]),
            ],
            [
                'table_name' => 'T03',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '15%',
                    'left' => '65%',
                    'shape' => 'small_circle',
                ]),
            ],
            [
                'table_name' => 'T04',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '35%',
                    'left' => '20%',
                    'shape' => 'square',
                ]),
            ],
            [
                'table_name' => 'T05',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '35%',
                    'left' => '35%',
                    'shape' => 'circle',
                ]),
            ],
            [
                'table_name' => 'T06',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '35%',
                    'left' => '50%',
                    'shape' => 'circle',
                ]),
            ],
            [
                'table_name' => 'T07',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '35%',
                    'left' => '65%',
                    'shape' => 'small_circle',
                ]),
            ],
            [
                'table_name' => 'T08',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '55%',
                    'left' => '20%',
                    'shape' => 'square',
                ]),
            ],
            [
                'table_name' => 'T09',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '55%',
                    'left' => '35%',
                    'shape' => 'square',
                ]),
            ],
            [
                'table_name' => 'T10',
                'capacity' => 4,
                'position' => json_encode([
                    'top' => '55%',
                    'left' => '50%',
                    'shape' => 'circle',
                ]),
            ],
            [
                'table_name' => 'T11',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '55%',
                    'left' => '65%',
                    'shape' => 'small_circle',
                ]),
            ],
            [
                'table_name' => 'T12',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '78%',
                    'left' => '20%',
                    'shape' => 'small_circle',
                ]),
            ],
            [
                'table_name' => 'T13',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '78%',
                    'left' => '35%',
                    'shape' => 'small_circle',
                ]),
            ],
            [
                'table_name' => 'T14',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '92%',
                    'left' => '20%',
                    'shape' => 'small_square',
                ]),
            ],
            [
                'table_name' => 'T15',
                'capacity' => 2,
                'position' => json_encode([
                    'top' => '92%',
                    'left' => '35%',
                    'shape' => 'small_square',
                ]),
            ],
        ]);
    }
}
