<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

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
                Rule::unique(User::class),
            ],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'phone' => ['required', 'string', 'max:16', Rule::unique(User::class)],
            'address' => ['required', 'string', 'max:50'],
        ]);

        Log::info('Validasi registrasi berhasil dilewati');

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'role' => Role::CUSTOMER->value, 
            ]);

            Log::info('User berhasil dibuat di memori sementara', ['user_id' => $user->id]);

            $emailVerif = $user->sendEmailVerificationNotification();

        if (! $emailVerif) {
            DB::rollBack();
            
            Log::error('Gagal mengirim email verifikasi, user batal dibuat', ['user_id' => $user->id]);
            
            return back()->withInput()->withErrors([
                'email' => 'Gagal mengirim email verifikasi. Silakan coba beberapa saat lagi.'
            ]);
            
        } else {
            DB::commit();
            
            Log::info('Email verifikasi berhasil dikirim', ['user_id' => $user->id]);

            return redirect()->route('verification.notice.unauthenticated', [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]);
        }

        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Registrasi dibatalkan karena gagal mengirim email', [
                'email' => $request->email,
                'error_message' => $e->getMessage()
            ]);

            return back()->withInput()->withErrors([
                'email' => 'Sistem kami sedang mengalami gangguan saat mengirim email verifikasi. Silakan coba beberapa saat lagi.'
            ]);
        }
    }
}