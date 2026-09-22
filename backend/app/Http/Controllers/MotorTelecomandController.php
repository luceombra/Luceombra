<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class MotorTelecomandController extends Controller
{
    public function indexBymotorId($motorId)
    {
        $telecomand = DB::table('motor_telecomand_rel')
        ->join('type_motor','motor_telecomand_rel.motor_id','=','type_motor.id')
        ->join('telecomand','telecomand.id','=','motor_telecomand_rel.telecomand_id')
        ->select(DB::raw('CONCAT(telecomand.name, " - ", telecomand.price, " €") AS name'),'telecomand.id', 'telecomand.image')
        ->where('motor_telecomand_rel.motor_id','=',$motorId)
        ->get();

        if($telecomand){
            return response()->json($telecomand);
        }

        return response()->json(
            ['error'=>'There is no data']
        );
    }
}
