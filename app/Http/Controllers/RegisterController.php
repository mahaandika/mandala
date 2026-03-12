<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
public function store(Request $request)
    {
        Log::info('Proses registrasi manual dimulai', ['email' => $request->email]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:5'],
            'email' => [
                'required',
                'string',
                'email',
                'max:100',
                Rule::unique(User::class)->whereNotNull('email_verified_at'),
            ],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'phone' => ['required', 'string', 'max:16', Rule::unique(User::class)->whereNotNull('email_verified_at')],
            'address' => ['required', 'string', 'max:50'],
        ]);

        $existingUnverifiedUser = User::where('email', $validated['email'])
            ->whereNull('email_verified_at')
            ->first();
        if ($existingUnverifiedUser) {
            // Berhenti di sini dan balikan error ke field email
            throw ValidationException::withMessages([
                'email' => ['Email atau nomor telepon sudah terdaftar tetapi belum diverifikasi.'],
                'requires_verification' => true,
                'verification_id' => $existingUnverifiedUser->id,
                'verification_hash' => sha1($existingUnverifiedUser->getEmailForVerification()),
            ]);
        }
        // Gunakan Database Transaction untuk keamanan data
        // return DB::transaction(function () use ($validated) {
            
            $user = User::Create([
                'email' => $validated['email'],
                'email_verified_at' => null],[
                'name' => $validated['name'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'role' => Role::CUSTOMER->value, 
            ]);

            // Memicu event Registered
            // Event ini akan secara otomatis memanggil sendEmailVerificationNotification() 
            // yang sudah kita masukkan ke Queue di Model User.
            event(new Registered($user));

            Log::info('User berhasil dibuat dan email masuk antrean queue', ['user_id' => $user->id]);

            // Redirect langsung ke halaman verifikasi
            // Pengguna tidak perlu menunggu email terkirim karena prosesnya sudah di Queue
            return redirect()->route('verification.notice.unauthenticated', [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]);
        // });
    }
}