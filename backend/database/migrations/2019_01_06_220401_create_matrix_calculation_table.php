<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMatrixCalculationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('matrix_calculation', function (Blueprint $table) {
            $table->increments('id');
            $table->double('width');
            $table->double('height');
            $table->double('price');
            $table->double('base_price');
            $table->integer('calculation_id')->unsigned()->index();
            $table->foreign('calculation_id')->references('id')->on('price_calculation');
            $table->timestamps();

            $table->integer('curtain_system_id')->unsigned()->index();
            $table->foreign('curtain_system_id')->references('id')->on('curtain_systems');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('matrix_calculation');
    }
}
