<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use JWTAuth;
use stdClass;
use Yajra\DataTables\Facades\DataTables;
use Image;

class SystemColorController extends Controller
{


    public function indexBySystemId($system_id)
    {
        $systemColors = DB::table('system_color_rel')
        ->join('systems','system_color_rel.system_id','=','systems.id')
        ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
        ->select('system_colors.name','system_colors.value', 'system_colors.image','system_colors.id','system_color_rel.system_id','system_color_rel.color_id')
        ->where('system_color_rel.system_id','=',$system_id)
        ->get();
        if($systemColors){
            return response()->json($systemColors);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }


    public function show($id)
    {
        $systemColor = DB::table('system_colors')
        // DB::table('system_color_rel')
        // ->join('systems','system_color_rel.system_id','=','systems.id')
        //->join('system_colors','system_colors.id','=','system_color_rel.color_id')
        // ->select('system_colors.name','system_colors.value','system_colors.id','system_color_rel.system_id','system_color_rel.color_id')
        // ->select('system_colors.*')
        ->where('system_colors.id', '=' ,$id)
        ->first();

        if($systemColor){
            return response()->json($systemColor);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }

    public function index(){
        $chains = DB::table('system_colors')
        ->get();

        if($chains){
            return response()->json($chains);
        }

        return response()->json(
            []
        );
    }

    public function create(Request $request)
    {
        $check = DB::table('system_colors')
            ->select('id')
            ->where('value', $request->value)
            ->first();
        if ($check && $request->value != ""){
            $resp = new stdClass();
            $resp->code = 1;
            $resp->message = "Questo colore è stato aggiunto prima";
            return json_encode($resp);
        }
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "user.jpg";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
        }

        $insert = DB::table('system_colors')->insertGetId(
            [
                'name' => $request->name,
                'value' => $request->value,
                'image' => "/images/".$imageName,
            ]
        );

        return response()->json($insert);
    }

    function update(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'aggiornamento ha avuto successo!";
            try{
                $check = DB::table('system_colors')
                    ->select('id')
                    ->where('value', $request->value)
                    ->where('id','!=', $request->id)
                    ->first();
                if ($check && $request->value != ""){
                    $resp = new stdClass();
                    $resp->code = 1;
                    $resp->message = "Questo colore è stato aggiunto prima";
                    return json_encode($resp);
                }

                $image = $request->url;  // your base64 encoded
                // $image = str_replace('data:image/png;base64,', '', $image);
                $imageName = "";
                if ($image){
                    $image = str_replace(' ', '+', $image);
                    $imageName = $request->image;
                    \Image::make($image)->save(public_path('images')."/".$imageName);

                    DB::table('system_colors')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'value' => $request->value,
                        'image' => "/images/".$imageName,
                    ]);
                } else {
                    DB::table('system_colors')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'value' => $request->value,
                    ]);
                }

            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        return json_encode($resp);
    }


    function delete(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Colori è stato cancellato con successo";

        try{
            DB::table('system_colors')
                ->where('id', '=', $request->id)
                ->delete();

        }
        catch(\Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'eliminazione dell'colori";
        }

        return json_encode($resp);
    }
}
