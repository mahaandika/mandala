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
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            // Identitas meja
            $table->string('table_name', 10)->unique(); // T01, T02, dst
            $table->unsignedTinyInteger('capacity');

            // Posisi visual (top, left, shape)
            $table->json('position')->nullable();

            // Optional (tidak jadi sumber utama status)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabels');
    }
};
