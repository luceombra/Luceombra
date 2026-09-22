<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use JWTAuth;
use stdClass;
use Yajra\DataTables\Facades\DataTables;
use Image;

class SystemMotorTypeController extends Controller
{
    public function indexBySystemId($system_id)
    {
        $motors = DB::table('system_motor_rel')
        ->join('systems','system_motor_rel.system_id','=','systems.id')
        ->join('type_motor','type_motor.id','=','system_motor_rel.motor_id')
        ->select(DB::raw('CONCAT(type_motor.name, " - ", type_motor.price, " €") AS name'), 'type_motor.id', 'type_motor.image','system_motor_rel.system_id','system_motor_rel.motor_id')
        ->where('system_motor_rel.system_id','=',$system_id)
        ->orderBy('id', 'desc')
        ->get();

        if($motors){
            return response()->json($motors);
        }

        return response()->json(
            ['error'=>'There is no data']
        );
    }


    public function index(Request $request)
    {
        $motors = DB::table('type_motor')
        ->get();

        if($motors){
            return response()->json($motors);
        }

        return response()->json(
            ['error'=>'There is no data']
        );
    }

    public function create(Request $request)
    {   
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "user.jpg";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
        }
        
        $insert = DB::table('type_motor')->insertGetId(
            [
                'name' => $request->name,
                'price' => $request->price,
                'image' => "/images/".$imageName,
                'description' => $request->description,
                'motion_id' =>2,
            ]
        );

        return response()->json($insert);
    }

    function update(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'aggiornamento ha avuto successo!";
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
            try{
                DB::table('type_motor')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'price' => $request->price,
                        'image' => "/images/".$imageName,
                        'description' => $request->description
                    ]);
    
            }
            catch(Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        }else{
            try{
                DB::table('type_motor')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'price' => $request->price,
                        'description' => $request->description
                    ]);
    
            }
            catch(Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        }

        

        return json_encode($resp);
    }


    function delete(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Motori è stato cancellato con successo";
        

        try{
            $delete = DB::table('type_motor')
                ->where('id', '=', $request->id)
                ->delete();
                
        }
        catch(\Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'eliminazione dell'motori";
            return response()->json($resp, 200);
        }

        return json_encode($resp);
    }

}
