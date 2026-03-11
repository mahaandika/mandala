<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Proses registrasi manual dimulai', ['email' => $request->email]);

        // 1. Validasi Input Manual
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:5'],
            'email' => [
                'required',
                'string',
                'email',
                'max:100',
                Rule::unique(User::class),
            ],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'phone' => ['required', 'string', 'max:16', Rule::unique(User::class)],
            'address' => ['required', 'string', 'max:50'],
        ]);

        Log::info('Validasi registrasi berhasil dilewati');

        // 2. Buat User Baru
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => Role::CUSTOMER->value, 
        ]);

        Log::info('User berhasil dibuat ke dalam database', ['user_id' => $user->id]);
        
        $emailVerif = $user->sendEmailVerificationNotification();
        if (! $emailVerif) {
            Log::error('Gagal mengirim email verifikasi', ['user_id' => $user->id]);
        }else {
            Log::info('Email verifikasi berhasil dikirim', ['user_id' => $user->id]);
        }

        // 4. Redirect ke Route Verification Notice
        return redirect()->route('verification.notice.unauthenticated', [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);
    }
}