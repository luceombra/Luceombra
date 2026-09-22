<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPriceCalculationTypeOnCurtainsSystem extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('curtain_systems', function($table) {
            $table->integer('price_calculation_type')->unsigned()->index();
            $table->foreign('price_calculation_type')->references('id')->on('price_calculation');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('curtain_systems', function($table) {
            $table->dropForeign(['price_calculation_type']);
            $table->dropColumn('price_calculation_type');
        });
    }
}
