<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
        $table->id();

            $table->string('booking_code', 10)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->integer('total_people');

            $table->date('booking_date');
            $table->time('booking_time');

            $table->enum('booking_status', [
                'pending',
                'seated',
                'completed',
                'cancelled',
                'no_show',
                'reserve',
            ])->default('pending');

            $table->enum('payment_status', [
                'placed',
                'pending',
                'success',
                'cancelled',
                'expired',
            ])->default('placed')->nullable();

            $table->decimal('total_price', 10, 2)->default(0);

            $table->text('qr_code')->nullable();
            $table->boolean('qr_scanned')->default(false);

            $table->timestamp('checkin_time')->nullable();
            $table->timestamp('checkout_time')->nullable();
            $table->string('snap_token')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
