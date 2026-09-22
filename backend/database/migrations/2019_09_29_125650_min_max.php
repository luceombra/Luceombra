<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MinMax extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('curtain_systems', function ($table) {
            // Will set the type to LONGTEXT.
            $table->integer('minWidth')->default(0);
            $table->integer('maxWidth')->default(0);
            $table->integer('minHeight')->default(0);
            $table->integer('maxHeight')->default(0);
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
            $table->dropColumn('minWidth');
            $table->dropColumn('maxWidth');
            $table->dropColumn('minHeight');
            $table->dropColumn('maxHeight');
        });
    }
}
