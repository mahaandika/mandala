<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\Reservation\PaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'isReceptionis'])->group(function () {
            Route::get('api/bookings/{booking}', [BookingController::class, 'show'])
        ->name('bookings.show');
        Route::get('api/menus', [MenuController::class, 'getMenus']);
    });

Route::post('/midtrans/callback', [PaymentController::class, 'callbackMidtrans']);