<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function($table) {
            $table->string('zone_covered');
            $table->string('image');
            $table->double('iva');
            $table->string('phone_number');
            $table->double('commision');
            $table->double('total_commision');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function($table) {
            $table->dropColumn('zone_covered');
            $table->dropColumn('image');
            $table->dropColumn('iva');
            $table->dropColumn('phone_number');
            $table->dropColumn('commision');
            $table->dropColumn('total_commision');
        });
    }
}
