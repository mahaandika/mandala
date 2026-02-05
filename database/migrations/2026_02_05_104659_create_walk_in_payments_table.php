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
        Schema::create('walk_in_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method'); // cash, qris, debit, visa
            $table->decimal('total_amount', 12, 2); // Total yang harus dibayar (Walk-in items)
            $table->decimal('amount_tendered', 12, 2)->nullable(); // Uang yang diterima (Cash)
            $table->decimal('change_amount', 12, 2)->nullable(); // Kembalian (Cash)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('walk_in_payments');
    }
};
