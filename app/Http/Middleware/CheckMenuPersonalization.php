<?php

namespace App\Http\Middleware;

use App\Models\PersonalizationType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckMenuPersonalization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $needsPersonalization = false;

        if (Auth::check()) {
            // Cek DB untuk user yang login
            $needsPersonalization = !Auth::user()->personalizations()->exists();
        } else {
            // Cek Session untuk guest
            $needsPersonalization = !$request->session()->has('guest_personalizations');
        }

        if ($needsPersonalization) {
            // 1. Jika sedang TIDAK di halaman utama, paksa redirect ke /
            if (! $request->is('/')) {
                return redirect('/')->with('info', 'Please complete your personalization first.');
            }

            // 2. Jika di halaman /, kirim data untuk modal
            Inertia::share('personalization_list', function () {
                return PersonalizationType::with(['personalizationOptions' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->where('is_active', true)
                ->get();
            });

            Inertia::share('must_personalize', true);
        }

        return $next($request);
    }
}
