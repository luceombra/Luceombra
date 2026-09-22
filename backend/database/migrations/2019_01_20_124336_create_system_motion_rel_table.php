<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSystemMotionRelTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('system_motion_rel', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('system_id')->unsigned()->index()->nullable();
            $table->foreign('system_id')->references('id')->on('systems');
            $table->integer('motion_id')->unsigned()->index()->nullable();
            $table->foreign('motion_id')->references('id')->on('type_motion');
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
        Schema::dropIfExists('system_motion_rel');
    }
}
