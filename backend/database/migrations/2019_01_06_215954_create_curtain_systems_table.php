<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCurtainSystemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('curtain_systems', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('system_id')->unsigned()->index();
            $table->foreign('system_id')->references('id')->on('systems');
            $table->integer('curtain_id')->unsigned()->index();
            $table->foreign('curtain_id')->references('id')->on('curtains');
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
        Schema::dropIfExists('curtain_systems');
    }
}
