<?php

namespace App\Http\Controllers;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use JWTAuth;
use stdClass;
use Yajra\DataTables\Facades\DataTables;
use Image;

class SystemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        $systems = DB::table('systems')->get();

        if($systems){
            return response()->json($systems);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }


    function getAllSystems(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];
        
        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        $total = DB::table("systems")
            ->where(function ($q) use ($filter) {
                $q->where('name', 'like', '%' . $filter . '%');
            })
            ->count('id');

            

        $preventives = DB::table("systems")
            ->select("*")
            ->where(function ($q) use ($filter) {
                $q->where('name', 'like', '%' . $filter . '%');
            })
            ->limit($pageSize)
            ->offset($pageNumber * $pageSize)
            ->orderBy($sortBy, $sortType)
            ->get();
        $motors = DB::table("type_motor")
        ->get();
        $chains = DB::table("type_chain")
        ->get();

        $system_colors = DB::table("system_colors")
        ->get();

        $data["motors"] = $motors;
        $data["chains"] = $chains;
        $data["colors"] = $system_colors;

        $response = Datatables::of($preventives)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode([ 'response' =>$response, 'data' => $data]);
    }

    function getSystemLines($id) {
        $motors = DB::table("system_motor_rel")
        ->where('system_id', '=', $id)
        ->get();
        $chains = DB::table("system_chain_rel")
        ->where('system_id', '=', $id)
        ->get();

        $system_colors = DB::table("system_color_rel")
        ->where('system_id', '=', $id)
        ->get();

        $data["motors"] = $motors;
        $data["chains"] = $chains;
        $data["colors"] = $system_colors;
        return json_encode([ 'data' => $data]);
    }

    function deleteSystem(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Sistemi è stata cancellata con successo!";

        try{
            DB::table('system_color_rel')
                ->where('system_id', '=', $request->id)
                ->delete();
            DB::table('system_motor_rel')
                ->where('system_id', '=', $request->id)
                ->delete();
            DB::table('system_chain_rel')
                ->where('system_id', '=', $request->id)
                ->delete();
            DB::table('systems')
                ->where('id', '=', $request->id)
                ->delete();
            
        }catch(\Exception $ex){
            $resp->code = 1;
            $resp->message = "Questo sistema è correlato a un preventivo!";
            return response()->json($resp);
        }
        return json_encode($resp);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create(Request $request)
    {   
        try{
            
        $check = DB::table('systems')
            ->select('id')
            ->where('name', $request->name)
            ->first();
            
        if ($check){
            $resp = new stdClass();
            $resp->code = 1;
            $resp->message = "Questo systeme è stato aggiunto prima";
            return json_encode($resp);
        }
        $image = $request ? $request->url : "";

        
        
        $imageName = "user.jpg";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;

            \Image::make($image)->save(public_path('images')."/".$imageName);
        }
        $insert = DB::table('systems')->insertGetId(
            [
                'name' => $request->input('name'),
                'image' => "/images/".$imageName,
                'motion_id' => $request->motion_id ? $request->motion_id : 1,
            ]
        );
        if ( $request->input('motors') && (is_array($request->input('motors')) || is_object($request->input('motors')))) {
            foreach ($request->input('motors') as $line) {
                DB::table('system_motor_rel')->insertGetId(
                    [
                        'motor_id' => $line["id"],
                        'system_id' => $insert
                    ]
                );
            }
        }

        if ( $request->input('chains') && (is_array($request->input('chains')) || is_object($request->input('chains')))) {
            foreach ($request->input('chains') as $line) {
                DB::table('system_chain_rel')->insertGetId(
                    [
                        'chain_id' => $line["id"],
                        'system_id' => $insert
                    ]
                );
            }
        }

        if ( $request->input('colors') && (is_array($request->input('colors')) || is_object($request->input('colors')))) {
            foreach ($request->input('colors') as $line) {
                DB::table('system_color_rel')->insertGetId(
                    [
                        'color_id' => $line["id"],
                        'system_id' => $insert
                    ]
                );
            }
        }

        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Systeme è stato aggiornato con successo!";
        return response()->json($resp);
        
        // DB::table('system_motor_rel')->insert($request->motors);
        // DB::table('system_chain_rel')->insert($request->chains);
        // DB::table('system_color_rel')->insert($request->colors);
    }catch(\Exception $ex){
        $resp->code = 1;
        $resp->message = "There was a problem in server!";
        return response()->json($resp);
    }

    return response()->json($insert);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store()
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $system = DB::table('systems')
        ->where('id','=',$id)
        ->first();

        if($system){
            return response()->json($system);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    function update(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'aggiornamento ha avuto successo!";
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "";
        $insert = $request->id;
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
            try{
                DB::table('systems')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'image' => "/images/".$imageName,
                    ]);
    
            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        }else{
            try{
                DB::table('systems')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                    ]);
    
            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        }

        try {
            if ( $request->input('colors') && (is_array($request->input('colors')) || is_object($request->input('colors')))) {
                foreach ($request->input('colors') as $line) {
                    if ($line["toInsert"] === true){
                        DB::table('system_color_rel')->insertGetId(
                            [
                                'color_id' => $line["id"],
                                'system_id' => $insert
                            ]
                        );
                    }else if ($line["toDelete"] === true){
                        DB::table('system_color_rel')
                            ->where('color_id',  $line["id"])
                            ->where('system_id', $insert)
                            ->delete();
                    }
                    
                }
            }

            if ( $request->input('motors') && (is_array($request->input('motors')) 
            || is_object($request->input('motors')))) {
                foreach ($request->input('motors') as $line) {
                    // return response()->json($line);
                    if ($line["toInsert"] && $line["toInsert"] === true){
                        DB::table('system_motor_rel')->insertGetId(
                            [
                                'motor_id' => $line["id"],
                                'system_id' => $insert
                            ]
                        );
                    }else if ($line["toDelete"]&& $line["toDelete"] === true){
                        DB::table('system_motor_rel')
                            ->where('motor_id',  $line["id"])
                            ->where('system_id', $insert)
                            ->delete();
                    }
                    
                }
            }

            if ( $request->input('chains') && (is_array($request->input('chains')) || 
            is_object($request->input('chains')))) {
                foreach ($request->input('chains') as $line) {
                    if ($line["toInsert"] === true){
                        DB::table('system_chain_rel')->insertGetId(
                            [
                                'chain_id' => $line["id"],
                                'system_id' => $insert
                            ]
                        );
                    }else if ($line["toDelete"] === true){
                        DB::table('system_chain_rel')
                            ->where('chain_id', $line["id"])
                            ->where('system_id',  $insert)
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

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        //
    }
}
