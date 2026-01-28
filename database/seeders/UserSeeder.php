<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => 'admin123',
                'phone' => '1234567890',
                'address' => 'Test Address',
                'role' => Role::ADMIN->value,
                'email_verified_at' => now(),
            ]
        );
        User::firstOrCreate(
            ['email' => 'receptionist1@gmail.com'],
            [
                'name' => 'Receptionist User',
                'password' => 'admin123',
                'phone' => '1234567890',
                'address' => 'Test Address',
                'role' => Role::RECEPTIONIST->value,
                'email_verified_at' => now(),
            ]
        );
        User::firstOrCreate(
            ['email' => 'receptionist2@gmail.com'],
            [
                'name' => 'Receptionist User',
                'password' => 'admin123',
                'phone' => '1234567890',
                'address' => 'Test Address',
                'role' => Role::RECEPTIONIST->value,
                'email_verified_at' => now(),
            ]
        );
    }
}
