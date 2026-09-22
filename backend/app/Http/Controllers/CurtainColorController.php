<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use JWTAuth;
use stdClass;
use Yajra\DataTables\Facades\DataTables;
use Image;

class CurtainColorController extends Controller
{


    public function indexByCurtainId($curtainId)
    {
        $curtainColor = DB::table('curtain_color_rel')
            ->join('curtains', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
            ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
            ->select('curtain_colors.name', 'curtain_colors.value', 'curtain_colors.image', 'curtain_colors.id', 'curtain_color_rel.curtain_id', 'curtain_color_rel.color_id')
            ->where('curtain_color_rel.curtain_id', '=', $curtainId)
            ->get();

        if ($curtainColor) {
            return response()->json($curtainColor);
        }

        return response()->json(
            ['error' => 'There is no data']
        );
    }

    
    public function show($id)
    {
        $curtainColors = DB::table('curtain_colors')
            // DB::table('curtain_color_rel')
            //->join('curtains','curtain_color_rel.curtain_id','=','curtains.id')
            //->join('curtain_colors','curtain_colors.id','=','curtain_color_rel.color_id')
            // ->select('curtain_colors.name','curtain_colors.value','curtain_colors.id','curtain_color_rel.curtain_id','curtain_color_rel.color_id')
            // ->select('curtain_colors.*')
            ->where('curtain_colors.id', '=', $id)
            ->first();

        if ($curtainColors) {
            return response()->json($curtainColors);
        }

        return response()->json(
            ['error' => 'There is no data']
        );
    }

    public function index(){
        $chains = DB::table('curtain_colors')
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
        $check = DB::table('curtain_colors')
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
        $insert = DB::table('curtain_colors')->insertGetId(
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
                $check = DB::table('curtain_colors')
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
                DB::table('curtain_colors')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'value' => $request->value,
                        'image' => "/images/".$imageName,
                    ]);
                } else {
                    DB::table('curtain_colors')
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
            DB::table('curtain_colors')
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
