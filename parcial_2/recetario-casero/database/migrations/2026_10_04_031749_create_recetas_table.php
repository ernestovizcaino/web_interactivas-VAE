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
        Schema::create('recetas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('titulo', 150);
            $table->string('categoria', 20);
            $table->unsignedInteger('tiempo_minutos');
            $table->string('dificultad', 20);
            $table->text('ingredientes');
            $table->text('pasos');
            $table->text('nota_personal')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'categoria']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recetas');
    }
};
