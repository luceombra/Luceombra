<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use JWTAuth;
use stdClass;
use Yajra\DataTables\Facades\DataTables;
use Image;

class SystemChainTypeController extends Controller
{
    public function indexBySystemId($system_id)
    {
        $chains = DB::table('system_chain_rel')
        ->join('systems','system_chain_rel.system_id','=','systems.id')
        ->join('type_chain','type_chain.id','=','system_chain_rel.chain_id')
        ->select(DB::raw('CONCAT(type_chain.name, " - ", type_chain.price, " €") AS name'),'type_chain.id', 'type_chain.image','system_chain_rel.system_id','system_chain_rel.chain_id')
        ->where('system_chain_rel.system_id','=',$system_id)
        ->get();

        if($chains){
            return response()->json($chains);
        }

        return response()->json(
            ['error'=>'There is no data']
        );
    }

    public function index(){
        $chains = DB::table('type_chain')
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
        
        $insert = DB::table('type_chain')->insertGetId(
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
        $imageName = "user.jpg";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
            try{
                DB::table('type_chain')
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
                DB::table('type_chain')
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

        

        return json_encode($resp);
    }


    function delete(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Catena è stato cancellato con successo";

        try{
            DB::table('type_chain')
                ->where('id', '=', $request->id)
                ->delete();

        }
        catch(\Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'eliminazione dell'catena";
        }

        return json_encode($resp);
    }
}
