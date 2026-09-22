<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('curtain_id')->unsigned()->index()->nullable();
            $table->foreign('curtain_id')->references('id')->on('curtains');
            $table->integer('system_id')->unsigned()->index()->nullable();
            $table->foreign('system_id')->references('id')->on('systems');
            $table->integer('system_color_id')->unsigned()->index()->nullable();
            $table->foreign('system_color_id')->references('id')->on('system_colors');
            $table->integer('curtain_color_id')->unsigned()->index()->nullable();
            $table->foreign('curtain_color_id')->references('id')->on('curtain_colors');
            $table->double('price')->nullable();
            $table->double('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('motion_id')->unsigned()->index()->nullable();
            $table->foreign('motion_id')->references('id')->on('type_motion');
            $table->integer('motor_id')->unsigned()->index()->nullable();
            $table->foreign('motor_id')->references('id')->on('type_motor');
            $table->integer('chain_id')->unsigned()->index()->nullable();
            $table->foreign('chain_id')->references('id')->on('type_chain');
            $table->integer('telecomand_id')->unsigned()->index()->nullable();
            $table->foreign('telecomand_id')->references('id')->on('telecomand');
            $table->double('quantity')->nullable();
            $table->string('state')->default('draft');
            $table->integer('cart_id')->unsigned()->index()->nullable();
            $table->foreign('cart_id')->references('id')->on('cart');
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
        Schema::dropIfExists('products');
    }
}
