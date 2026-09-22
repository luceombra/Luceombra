<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddMotorIdTelecomand extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('telecomand', function (Blueprint $table) {
            $table->integer('motor_id')->unsigned()->index()->nullable();
            $table->foreign('motor_id')->references('id')->on('type_motor');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('telecomand');
    }
}
