<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Custom Logika Verifikasi Email agar menggunakan Queue secara global
        VerifyEmail::toMailUsing(function ($notifiable, $url) {
            return (new \Illuminate\Auth\Notifications\VerifyEmail)
                ->toMail($notifiable);
        });
    }
}
