<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMeterCalculationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('meter_calculation', function (Blueprint $table) {
            $table->increments('id');
            $table->double('price');
            $table->integer('calculation_id')->unsigned()->index();
            $table->foreign('calculation_id')->references('id')->on('price_calculation');
            $table->integer('curtain_system_id')->unsigned()->index();
            $table->foreign('curtain_system_id')->references('id')->on('curtain_systems');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('meter_calculation');
    }
}
