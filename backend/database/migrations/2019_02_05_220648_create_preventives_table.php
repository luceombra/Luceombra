<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePreventivesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('preventives', function (Blueprint $table) {
            $table->increments('id');
            $table->date('date');
            $table->string('status');
            $table->integer('shop');
            $table->integer('client');
            $table->integer('user_created')->unsigned();
            $table->decimal('discount');
            $table->string('pdf');
            $table->decimal('amount');
            $table->decimal('shipping');
            $table->decimal('service_on_home');
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
        Schema::dropIfExists('preventives');
    }
}
