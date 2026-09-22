<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class SystemMotionTypeController extends Controller
{
    public function indexBySystemId($system_id)
    {
//        $systemMotion = DB::table('system_motion_rel')
//        ->join('systems','system_motion_rel.system_id','=','systems.id')
//        ->join('type_motion','type_motion.id','=','system_motion_rel.motion_id')
//        ->select('type_motion.name','type_motion.id','system_motion_rel.system_id','system_motion_rel.motion_id')
//        ->where('system_motion_rel.system_id','=',$system_id)
//        ->get();

        $systemMotion = DB::table('type_motion')
            ->select('type_motion.name','type_motion.id')
            ->get();

        if($systemMotion){
            return response()->json($systemMotion);
        }

        return response()->json(
            ['error'=>'There is no data']
        );
    }
}
