<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class preventive extends Model
{
    protected $table = 'preventives';

    function preventiveData($id) {
        return DB::table('products')
            ->select(
                'products.id', 'preventives.shop', 'systems.image as systemImage', 'systems.name as system', 'products.width', 'products.height',
                'products.price as totalPrice', 'curtains.name as curtain', 'curtains.description as desc',
                'curtains.image as curtainImage', 'type_motor.name as motor', 'type_chain.name as chain',
                'telecomand.name as telecomand', 'curtain_colors.name as curtainColor', 'system_colors.name as systemColor',
                'products.quantity', 'preventives.discount', 'preventives.shopDiscount', 'preventives.shipping', 'preventives.iva_shipping', 'preventives.iva_home_service', 'preventives.totalAmount', 'preventives.amount',
                'preventives.service_on_home', 'preventives.reference', 'products.preventive', 'preventives.created_at'
            )
            ->join('preventives', 'preventives.id', '=', 'products.preventive')
            ->join('systems', 'systems.id', '=', 'products.system_id')
            ->join('system_colors', 'system_colors.id', '=', 'products.system_color_id')
            ->join('curtains', 'curtains.id', '=', 'products.curtain_id')
            ->join('curtain_colors', 'curtain_colors.id', '=', 'products.curtain_color_id')
            ->leftJoin('type_chain', 'type_chain.id', '=', 'products.chain_id')
            ->leftJoin('type_motor', 'type_motor.id', '=', 'products.motor_id')
            ->leftJoin('telecomand', 'telecomand.id', '=', 'products.telecomand_id')
            ->where('products.preventive', '=', $id)
            ->orderBy('products.id', 'desc')
            ->get();
    }
}

