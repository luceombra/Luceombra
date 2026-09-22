<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMotorTelecomdRelTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('motor_telecomand_rel', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('motor_id')->unsigned()->index()->nullable();
            $table->foreign('motor_id')->references('id')->on('type_motor');
            $table->integer('telecomand_id')->unsigned()->index()->nullable();
            $table->foreign('telecomand_id')->references('id')->on('telecomand');
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
        Schema::dropIfExists('motor_telecomand_rel');
    }
}
