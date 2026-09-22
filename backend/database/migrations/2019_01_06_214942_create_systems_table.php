<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSystemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('systems', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('image');
            $table->integer('motion_id')->unsigned()->index()->nullable();
            $table->integer('motor_id')->unsigned()->index()->nullable();
            $table->integer('chain_id')->unsigned()->index()->nullable();
            $table->integer('telecomand_id')->unsigned()->index()->nullable();
            $table->timestamps();

            $table->foreign('motor_id')->references('id')->on('type_motor');
            $table->foreign('chain_id')->references('id')->on('type_chain');
            $table->foreign('motion_id')->references('id')->on('type_motion');
            $table->foreign('telecomand_id')->references('id')->on('telecomand');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('systems');
    }
}
