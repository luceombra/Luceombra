<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCurtainsColorsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('curtain_color_rel', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('curtain_id')->unsigned()->index()->nullable();
            $table->foreign('curtain_id')->references('id')->on('curtains');
            $table->integer('color_id')->unsigned()->index()->nullable();
            $table->timestamps();

            $table->foreign('color_id')->references('id')->on('curtain_colors');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
