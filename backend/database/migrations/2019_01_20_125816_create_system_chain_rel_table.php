<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSystemChainRelTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('system_chain_rel', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('system_id')->unsigned()->index()->nullable();
            $table->foreign('system_id')->references('id')->on('systems');
            $table->integer('chain_id')->unsigned()->index()->nullable();
            $table->timestamps();

            $table->foreign('chain_id')->references('id')->on('type_chain');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('system_chain_rel');
    }
}
