<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use JWTAuth;
use stdClass;
use Yajra\DataTables\Facades\DataTables;
use Image;

class TelecomandController extends Controller
{
    public function indexBymotorId($motorId)
    {
        $telecomands = DB::table('motor_telecomand_rel')
        ->select('telecomand.id', DB::raw('CONCAT(telecomand.name, " - ", telecomand.price, " €") AS name'), 'telecomand.price', 'telecomand.image')
        ->join('telecomand', 'telecomand.id', 'motor_telecomand_rel.telecomand_id')
        ->where('motor_telecomand_rel.motor_id','=',$motorId)
        ->get();
        if($telecomands){
            return response()->json($telecomands);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }

    public function index(){
        $chains = DB::table('telecomand')
        ->get();

        if($chains){
            return response()->json($chains);
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
        
        $insert = DB::table('telecomand')->insertGetId(
            [
                'name' => $request->name,
                'price' => $request->price,
                'image' => "/images/".$imageName,
                'description' => $request->description,
                'motor_id' =>1,
            ]
        );

        if ( $request->input('motors') && (is_array($request->input('motors')) || is_object($request->input('motors')))) {
            foreach ($request->input('motors') as $line) {
                DB::table('motor_telecomand_rel')->insertGetId(
                    [
                        'motor_id' => $line["id"],
                        'telecomand_id' => $insert
                    ]
                );
            }
        }

        return response()->json($insert);
    }

    function getSystemLines($id){
        $motors = DB::table("motor_telecomand_rel")
        ->where('telecomand_id', '=', $id)
        ->get();

        $data["motors"] = $motors;
        return json_encode([ 'data' => $data]);
    }

    function update(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'aggiornamento ha avuto successo!";
        $insert = $request->id;
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
            try{
                DB::table('telecomand')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'price' => $request->price,
                        'image' => "/images/".$imageName,
                        'description' => $request->description
                    ]);
    
            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        }else{
            try{
                DB::table('telecomand')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'price' => $request->price,
                        'description' => $request->description
                    ]);
    
            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        }

        try {

            if ( $request->input('motors') && (is_array($request->input('motors')) 
            || is_object($request->input('motors')))) {
                foreach ($request->input('motors') as $line) {
                    // return response()->json($line);
                    if ($line["toInsert"] && $line["toInsert"] === true){
                        DB::table('motor_telecomand_rel')->insertGetId(
                            [
                                'motor_id' => $line["id"],
                                'telecomand_id' => $insert
                            ]
                        );
                    }else if ($line["toDelete"]&& $line["toDelete"] === true){
                        DB::table('motor_telecomand_rel')
                            ->where('motor_id',  $line["id"])
                            ->where('telecomand_id', $insert)
                            ->delete();
                    }
                    
                }
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
        $resp->message = "Telecomande è stato cancellato con successo";

        try{
            DB::table('motor_telecomand_rel')
                ->where('telecomand_id', '=', $request->id)
                ->delete();

            DB::table('telecomand')
                ->where('id', '=', $request->id)
                ->delete();

        }
        catch(\Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'eliminazione dell'Telecomande";
        }

        return json_encode($resp);
    }
}
