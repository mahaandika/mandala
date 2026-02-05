<?php

namespace App\Http\Middleware;

use App\Models\PersonalizationType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuPersonalization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Cek apakah user sudah punya personalisasi
            if (!$user->personalizations()->exists()) {
                
                // 1. Jika user sedang TIDAK di halaman utama (root /)
                // Maka paksa redirect ke halaman /
                if (!$request->is('/')) {
                    return redirect('/')->with('info', 'Please complete your personalization first.');
                }

                // 2. Jika user sudah di halaman /, kirim data untuk modal
                Inertia::share('personalization_list', function () {
                    return PersonalizationType::with(['personalizationOptions' => function ($query) {
                        $query->where('is_active', true);
                    }])
                    ->where('is_active', true)
                    ->get();
                });

                Inertia::share('must_personalize', true);
            }
        }

        return $next($request);
    }
}