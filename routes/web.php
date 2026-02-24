<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PersonalizationUserController;
use App\Http\Controllers\PersonalMenuController;
use App\Http\Controllers\PersonalOptionController;
use App\Http\Controllers\PersonalTypeController;
use App\Http\Controllers\Reservation\CartsController;
use App\Http\Controllers\Reservation\HistoryController;
use App\Http\Controllers\Reservation\InvoiceController;
use App\Http\Controllers\Reservation\ItemMenusController;
use App\Http\Controllers\Reservation\PaymentController;
use App\Http\Controllers\Reservation\ReservationController;
use App\Http\Controllers\ReservationHistoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::middleware(['checkPersonalization'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    })->name('home');

    Route::get('/about', function () {
        return Inertia::render('aboutUs', []);
    })->name('about-us');

    Route::get('/menus', [MenuController::class, 'menuClient'])->name('menus');

    Route::get('/reservations', [ReservationController::class, 'indexReservation'])
        ->name('reservations');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/bookings', [ReservationController::class, 'storeReservation'])
        ->name('bookings.store');
    Route::get('/carts', [CartsController::class, 'showCart'])->name('carts');
    Route::delete('/carts/cancel', [CartsController::class, 'cancelCurrentBooking'])->name('carts.cancel');
    Route::post('/carts/add', [ItemMenusController::class, 'addToCart'])->name('cart.add');
    Route::patch('/carts/items/{id}', [CartsController::class, 'updateQty']);
    Route::delete('/carts/items/{id}', [CartsController::class, 'removeItem']);

    Route::post('/payment/checkout', [PaymentController::class, 'checkout'])->name('payment.checkout');
    Route::get('/payment-finish/{booking}', [PaymentController::class, 'paymentFinish'])->name('payment-finish');
    Route::get('/historys', [HistoryController::class, 'index'])->name('historys');

    Route::post('/personalization/save', [PersonalizationUserController::class, 'savePersonalization']);
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'isReceptionis'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete'])
        ->name('bookings.complete');

    Route::post('/bookings/{booking}/no-show', [BookingController::class, 'noShow'])
        ->name('bookings.no_show');
    Route::post('scan-checkin', [ReservationController::class, 'checkIn'])->name('scan.checkin');
    Route::post('/walk-in', [ReservationController::class, 'walkInReservation'])->name('walk-in');
    Route::post('/bookings/{booking}/add-items', [ReservationController::class, 'addItems'])
        ->name('bookings.add-items');
    Route::post('/bookings/{booking}/pay', [PaymentController::class, 'processPayment'])->name('bookings.pay');
    Route::get('/bookings/{booking}/invoice', [InvoiceController::class, 'downloadInvoice'])
        ->name('bookings.invoice');
    Route::middleware('admin')->group(function () {
        Route::get('categories', [CategoriesController::class, 'indexCategory'])->name('categories.index');
        Route::get('categories/create', [CategoriesController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoriesController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}/edit', [CategoriesController::class, 'edit'])->name('categories.edit');
        Route::put('categories/{category}', [CategoriesController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoriesController::class, 'destroy'])->name('categories.destroy');

        Route::get('menu', [MenuController::class, 'indexMenu'])->name('menu.index');
        Route::get('menu/create', [MenuController::class, 'create'])->name('menu.create');
        Route::post('menu', [MenuController::class, 'store'])->name('menu.store');
        Route::get('menu/{menu}/edit', [MenuController::class, 'edit'])->name('menu.edit');
        Route::put('menu/{menu}', [MenuController::class, 'update'])->name('menu.update');
        Route::delete('menu/{menu}', [MenuController::class, 'destroy'])->name('menu.destroy');

        Route::get('personalType', [PersonalTypeController::class, 'indexPersonalType'])->name('personaltype.index');
        Route::get('personalType/create', [PersonalTypeController::class, 'create'])->name('personalisation.create');
        Route::post('personalType', [PersonalTypeController::class, 'store'])->name('personalisation.store');
        Route::get('personalType/{personalizationType}/edit', [PersonalTypeController::class, 'edit'])->name('personalisation.edit');
        Route::put('personalType/{personalizationType}', [PersonalTypeController::class, 'update'])->name('personalisation.update');
        Route::delete('personalType/{personalizationType}', [PersonalTypeController::class, 'destroy'])->name('personalisation.destroy');

        Route::get('personalOption', [PersonalOptionController::class, 'indexPersonalOption'])->name('personaloption.index');
        Route::get('personalOption/create', [PersonalOptionController::class, 'create'])->name('personaloption.create');
        Route::post('personalOption', [PersonalOptionController::class, 'store'])->name('personaloption.store');
        Route::get('personalOption/{personalizationOption}/edit', [PersonalOptionController::class, 'edit'])->name('personaloption.edit');
        Route::put('personalOption/{personalizationOption}', [PersonalOptionController::class, 'update'])->name('personaloption.update');
        Route::delete('personalOption/{personalizationOption}', [PersonalOptionController::class, 'destroy'])->name('personaloption.destroy');

        Route::get('personalMenu', [PersonalMenuController::class, 'indexPersonalMenu'])->name('personalmenu.index');
        Route::get('personalMenu/create', [PersonalMenuController::class, 'create'])->name('personalmenu.create');
        Route::post('personalMenu', [PersonalMenuController::class, 'store'])->name('personalmenu.store');
        Route::get('personalMenu/{menu}/edit', [PersonalMenuController::class, 'edit'])->name('personalmenu.edit');
        Route::put('personalMenu/{menu}', [PersonalMenuController::class, 'update'])->name('personalmenu.update');
        Route::get('reservationHistory', [ReservationHistoryController::class, 'indexReservationHistory'])->name('reservationHistory.index');
   
        Route::resource('employee', EmployeeController::class)->except(['create', 'show', 'edit']);
        });
});

require __DIR__.'/api.php';
require __DIR__.'/settings.php';
