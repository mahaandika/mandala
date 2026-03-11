<?php

use App\Http\Controllers\RegisterController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Request;

Route::get('/register', function () {
    return Inertia::render('auth/register'); 
})->middleware('guest')->name('register');
Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

Route::get('/email/verify-notice/{id}/{hash}', function ($id, $hash) {
    // Lakukan redirect biasa ke URL baru sambil membawa data
    return redirect()->to("/auth/verify-email?id={$id}&hash={$hash}");
})->name('verification.notice.unauthenticated');

// 2. Route baru untuk merender halamannya
Route::get('/auth/verify-email', function (Request $request) {
    return Inertia::render('auth/verify-email', [
        'id' => $request->query('id'),
        'hash' => $request->query('hash'),
        'status' => session('status'),
    ]);
});

// 2. Handler Klik Link dari Email
Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return redirect()->route('login')->with('error', 'Link verifikasi tidak valid.');
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    return redirect()->route('login')->with('status', 'Email berhasil diverifikasi! Silakan login.');
})->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

// 3. Resend Verification (Tanpa Login)
Route::post('/email/verification-notification/{id}', function ($id) {
    $user = User::findOrFail($id);

    if ($user->hasVerifiedEmail()) {
        return redirect()->route('login');
    }

    $user->sendEmailVerificationNotification();

    return back()->with('status', 'verification-link-sent');
})->name('verification.resend.unauthenticated');

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

});