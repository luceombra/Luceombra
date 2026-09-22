<?php

namespace App\Http\Controllers;
use Image;
use JWTAuth;
use stdClass;
use Exception;
use App\Markup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class CurtainController extends Controller
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

        $total = DB::table("curtains")
            ->where(function ($q) use ($filter) {
                $q->where('name', 'like', '%' . $filter . '%');
            })
            ->count('id');


        $preventives = DB::table("curtains")
            ->select("*")
            ->where(function ($q) use ($filter) {
                $q->where('name', 'like', '%' . $filter . '%');
            })
            ->limit($pageSize)
            ->offset($pageNumber * $pageSize)
            ->orderBy($sortBy, $sortType)
            ->get();

        $system_colors = DB::table("curtain_colors")
        ->get();

        $data["motors"] = [];
        $data["chains"] = [];
        $data["colors"] = $system_colors;

        $response = Datatables::of($preventives)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode(['response' => $response, 'data' => $data]);
    }

    public function indexBySystemId($systemId)
    {
        $systemCurtains = DB::table('curtain_systems')
        ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
        ->select('curtains.*','curtain_systems.system_id','curtain_systems.id as curtain_system_id')
        ->where('system_id','=',$systemId)
        ->get();

        if($systemCurtains){
            return response()->json($systemCurtains);
        }
        return response()->json(
            ['error' => 'There is no data']
        );
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create(Request $request)
    {
        try {

        $check = DB::table('curtains')
            ->select('id')
            ->where('name', $request->name)
            ->first();

        if ($check){
            $resp = new stdClass();
            $resp->code = 1;
            $resp->message = "Questo tessuti è stato aggiunto prima";
            return json_encode($resp);
        }
        $image = $request ? $request->url : "";



        $imageName = "user.jpg";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;

            \Image::make($image)->save(public_path('images')."/".$imageName);
        }
        $insert = DB::table('curtains')->insertGetId(
            [
                'name' => $request->input('name'),
                'image' => "/images/".$imageName,
                'description' => "",

            ]
        );

        if ( $request->input('colors') && (is_array($request->input('colors')) || is_object($request->input('colors')))) {
            foreach ($request->input('colors') as $line) {
                DB::table('curtain_color_rel')->insertGetId(
                    [
                        'color_id' => $line["id"],
                        'curtain_id' => $insert
                    ]
                );
            }
        }

        if ( $request->input('systems') && (is_array($request->input('systems')) || is_object($request->input('systems')))) {
            foreach ($request->input('systems') as $line) {
                //return response()->json($line);
                $id = DB::table('curtain_systems')->insertGetId(
                    [
                        'system_id' => $line["system"],
                        'curtain_id' => $insert,
                        'price_calculation_type' => $line["price_calculation_type"],
                        'minWidth'=> (int)$line['minWidth'],
                        'maxWidth'=> (int)$line['maxWidth'],
                        'minHeight'=> (int)$line['minHeight'],
                        'maxHeight'=> (int)$line['maxHeight'],
                    ]
                );
                if ($line['price_calculation_type'] == 3){
                    DB::table('meter_calculation')->insertGetId(
                        [
                            'price' => $line["price"],
                            'curtain_system_id' => $id,
                            'calculation_id' => 3
                        ]
                    );
                }else if ($line['price_calculation_type'] == 2){
                    //return response()->json($line);
                    foreach ($line['rows'] as $row) {
                        DB::table('interval_calculation')->insertGetId(
                            [
                                'price' => $row["price"],
                                'curtain_system_id' => $id,
                                'calculation_id' => 2,
                                'min'=> $row["min"],
                                'max'=> $row["max"]
                            ]
                        );
                    }
                }else if ($line['price_calculation_type'] == 1){
                    //return response()->json($line);
                    foreach ($line['rows'] as $row) {
                        DB::table('matrix_calculation')->insertGetId(
                            [
                                'price' => $row["price"],
                                'curtain_system_id' => $id,
                                'calculation_id' => 2,
                                'width'=> $row["min"],
                                'height'=> $row["max"]
                            ]
                        );
                    }
                }

            }
        }

        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Tessuti è stato aggiornato con successo!";
        return response()->json($resp);

        // DB::table('system_motor_rel')->insert($request->motors);
        // DB::table('system_chain_rel')->insert($request->chains);
        // DB::table('system_color_rel')->insert($request->colors);
    }catch(Exception $ex){
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
        $systemCurtain = DB::table('curtains')
        // DB::table('curtain_systems')
        //->join('curtains','curtains.id','=','curtain_systems.curtain_id')
        // ->select('curtains.*','curtain_systems.system_id','curtain_systems.id as curtain_system_id')
        // ->select('curtains.*')
        ->where('curtains.id','=',$id)
        ->first();

        if($systemCurtain){
            return response()->json($systemCurtain);
        }

        return response()->json(
            ['error'=>'There is no data']
        );
    }

    public function show_data($id)
    {
        $systemCurtain = DB::table('curtains')
        // DB::table('curtain_systems')
        //->join('curtains','curtains.id','=','curtain_systems.curtain_id')
        // ->select('curtains.*','curtain_systems.system_id','curtain_systems.id as curtain_system_id')
        // ->select('curtains.*')
        ->where('curtains.id','=',$id)
        ->first();

        $colors = DB::table('curtain_colors')
            ->get();

        $allSystem = DB::table('systems')
        ->get();

        $types = DB::table('price_calculation')
        ->get();

        $materialColors = DB::table('curtain_color_rel')
            ->where ('curtain_id', $id)
            ->get();

        $systems = DB::table('curtain_systems')
            ->select('systems.name','systems.id as system',
            'curtain_systems.id', 'curtain_systems.price_calculation_type',
             'price_calculation.name as priceName', 'curtain_systems.minWidth',
             'curtain_systems.maxWidth',
             'curtain_systems.minHeight',
             'curtain_systems.maxHeight')
            ->join('systems', 'curtain_systems.system_id', 'systems.id')
            ->join('price_calculation', 'price_calculation.id', 'curtain_systems.price_calculation_type')
            ->where('curtain_id', $id)
            ->get();
        $sys = [];
        $i = 0;
        $systems = json_decode($systems, true);
        foreach($systems as $system){
            //return json_decode($system);
            if ($system['price_calculation_type'] == '1'){
                $lines = [];
                $j =0;
                $rows = DB::table('matrix_calculation')
                    ->where('curtain_system_id', '=', $system['id'])
                    ->get();
                $rows = json_decode($rows, true);
                foreach($rows as $row){
                    $row['min'] = $row['width'];
                    $row['max'] = $row['height'];
                    $lines[$j] = $row;
                    $j ++;
                }
                $system['rows'] = $lines;

            }else if ($system['price_calculation_type'] == '2'){
                $rows = DB::table('interval_calculation')
                    ->where('curtain_system_id', '=', $system['id'])
                    ->get();

                $rows = json_decode($rows, true);
                $system['rows'] = $rows;

            } else {
                $price = DB::table('meter_calculation')
                    ->where('curtain_system_id', '=', $system['id'])
                    ->first();
                $system['price']= $price->price;
            }
            $sys[$i] = $system;
            $i ++;
        }


        return response()->json([
            'colors' => $colors,
            'data' => $systemCurtain,
            'curtainColors' => $materialColors,
            'systems' => $sys,
            'types' => $types,
            'allSystems' => $allSystem
        ]);

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */

    function update(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'aggiornamento ha avuto successo!";
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "";
        $insert = $request->id;
        if ($image) {
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
            try {
                DB::table('curtains')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'image' => "/images/".$imageName,
                    ]);

            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati 444";
            }
        } else {
            try{
                DB::table('curtains')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                    ]);

            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati 4";
            }
        }

        // try {

            if ( $request->input('colors') && (is_array($request->input('colors')) || is_object($request->input('colors')))) {
                foreach ($request->input('colors') as $line) {
                    if ($line["toInsert"] === true){
                        DB::table('curtain_color_rel')->insertGetId(
                            [
                                'color_id' => $line["id"],
                                'curtain_id' => $insert
                            ]
                        );
                    }else if ($line["toDelete"] === true){
                        DB::table('curtain_color_rel')
                            ->where('color_id',  $line["id"])
                            ->where('curtain_id', $insert)
                            ->delete();
                    }

                }
            }
            if ($request->input('systems') && (is_array($request->input('systems')) || is_object($request->input('systems')))) {

                foreach ($request->input('systems') as $line) {
                    $id = 0;
                    $add = true;

                    $rowExists = DB::table('curtain_systems')
                        ->where('system_id', $line["system"])
                        ->where('curtain_id', $insert)
                        ->get();

                    if ((!array_key_exists("id", $line))) {
                        if (! $rowExists->count()) {
                            $id = DB::table('curtain_systems')->insertGetId(
                                [
                                    'system_id' => $line["system"],
                                    'curtain_id' => $insert,
                                    'price_calculation_type' => $line["price_calculation_type"],
                                    'minWidth'=> (int)$line['minWidth'],
                                    'maxWidth'=> (int)$line['maxWidth'],
                                    'minHeight'=> (int)$line['minHeight'],
                                    'maxHeight'=> (int)$line['maxHeight']
                                ]
                            );
                        } elseif($rowExists->count()) {
                            $id = $rowExists[0]->id;
                        }
                    } else {
                        $id = DB::table('curtain_systems')
                            ->where('id', '=', $line['id'])
                            ->update(
                                [
                                    'system_id' => $line["system"],
                                    'curtain_id' => $insert,
                                    'price_calculation_type' => $line["price_calculation_type"],
                                    'minWidth'=> (int)$line['minWidth'],
                                    'maxWidth'=> (int)$line['maxWidth'],
                                    'minHeight'=> (int)$line['minHeight'],
                                    'maxHeight'=> (int)$line['maxHeight']
                                ]
                            );
                        $id = $line["id"];
                        $add = false;
                    }

                    if ($line['price_calculation_type'] == 3){
                        if (!array_key_exists('id', $line)){
                            DB::table('meter_calculation')->insertGetId(
                                [
                                    'price' => $line["price"],
                                    'curtain_system_id' => $id,
                                    'calculation_id' => 3
                                ]
                            );
                        } else {

                            DB::table('matrix_calculation')
                                ->where('curtain_system_id',  $id)
                                ->delete();
                            DB::table('interval_calculation')
                                ->where('curtain_system_id',  $id)
                                ->delete();

                            DB::table('meter_calculation')
                                ->where('curtain_system_id', '=', $id)
                                ->update([
                                    'price' => $line["price"],
                                    'curtain_system_id' => $id,
                                    'calculation_id' => 3
                                ]);
                        }
                    }else if ($line['price_calculation_type'] == 2) {

                        if ( array_key_exists('rowsToDelete', $line) && $line['rowsToDelete'] && (is_array($line['rowsToDelete']) || is_object($line['rowsToDelete']))) {
                            foreach ($line['rowsToDelete'] as $row) {
                                DB::table('interval_calculation')
                                    ->where('id',  $row)
                                    ->delete();
                            }
                        }

                        if (!array_key_exists('id', $line)){
                            foreach ($line['rows'] as $row) {
                                DB::table('interval_calculation')->insertGetId(
                                    [
                                        'price' => $row["price"],
                                        'curtain_system_id' => $id,
                                        'calculation_id' => 2,
                                        'min'=> $row["min"],
                                        'max'=> $row["max"]
                                    ]
                                );
                            }
                        }
                        else {
                            DB::table('matrix_calculation')
                                ->where('curtain_system_id',  $id)
                                ->delete();
                            DB::table('meter_calculation')
                                ->where('curtain_system_id',  $line)
                                ->delete();
                                foreach ($line['rows'] as $row) {
                                    if (array_key_exists('toInsert', $row))
                                        DB::table('interval_calculation')->insertGetId(
                                            [
                                                'price' => $row["price"],
                                                'curtain_system_id' => $id,
                                                'calculation_id' => 2,
                                                'min'=> $row["min"],
                                                'max'=> $row["max"]
                                            ]
                                        );
                                    else {
                                            DB::table('interval_calculation')
                                                ->where("id", "=", $row["id"])
                                                ->update(
                                                [
                                                    'price' => $row["price"],
                                                    'curtain_system_id' => $id,
                                                    'calculation_id' => 2,
                                                    'min'=> $row["min"],
                                                    'max'=> $row["max"]
                                                ]
                                            );

                                    }
                                }
                        }
                    } else if ($line['price_calculation_type'] == 1) {

                        if (array_key_exists('rowsToDelete', $line) &&  $line['rowsToDelete'] && (is_array($line['rowsToDelete']) || is_object($line['rowsToDelete']))) {
                            foreach ($line['rowsToDelete'] as $row) {
                                DB::table('matrix_calculation')
                                    ->where('id',  $row)
                                    ->delete();
                            }
                        }

                        if (!array_key_exists('id', $line)) {

                            foreach ($line['rows'] as $row) {

                                DB::table('matrix_calculation')->updateOrInsert(
                                [
                                    'width' => $row["min"],
                                    'height' => $row["max"],
                                    'curtain_system_id' => $id,
                                    'calculation_id' => 2,
                                ],
                                [
                                    'width' => $row["min"],
                                    'height' => $row["max"],
                                    'price' => number_format($row["price"], 2),
                                    'base_price' => $row['price'],
                                    'curtain_system_id' => $id,
                                    'calculation_id' => 2,
                                ]
                            );




                                // DB::table('matrix_calculation')->insertGetId(
                                //     [
                                //         'price' => $row["price"],
                                //         'curtain_system_id' => $id,
                                //         'calculation_id' => 2,
                                //         'width'=> $row["min"],
                                //         'height'=> $row["max"]
                                //     ]
                                // );
                            }
                        } else {

                            DB::table('interval_calculation')
                                ->where('curtain_system_id',  $id)
                                ->delete();
                            DB::table('meter_calculation')
                                ->where('curtain_system_id',  $line)
                                ->delete();
                                foreach ($line['rows'] as $row) {

                                    if (array_key_exists('toInsert', $row))
                                        DB::table('matrix_calculation')->insertGetId(
                                            [
                                                'price' => $row["price"],
                                                'base_price' => $row["price"],
                                                'curtain_system_id' => $id,
                                                'calculation_id' => 2,
                                                'width'=> $row["min"],
                                                'height'=> $row["max"]
                                            ]
                                        );
                                    else {

                                            DB::table('matrix_calculation')
                                                ->where("id", "=", $row["id"])
                                                ->update(
                                                [
                                                    'price' => $row["price"],
                                                    'curtain_system_id' => $id,
                                                    'calculation_id' => 2,
                                                    'width'=> $row["min"],
                                                    'height'=> $row["max"]
                                                ]
                                            );

                                    }
                                }

                        }
                    }
                }
            }

            if ( $request->input('systemToDelete') && (is_array($request->input('systemToDelete')) || is_object($request->input('systemToDelete')))) {
                foreach ($request->input('systemToDelete') as $line) {
                    DB::table('matrix_calculation')
                        ->where('curtain_system_id',  $line)
                        ->delete();
                    DB::table('meter_calculation')
                        ->where('curtain_system_id',  $line)
                        ->delete();
                    DB::table('interval_calculation')
                        ->where('curtain_system_id',  $line)
                        ->delete();
                    DB::table('curtain_systems')
                        ->where('id',  $line)
                        ->delete();
                }
            }

        // }
        // catch(\Exception $ex){

        //     $resp->code = 1;
        //     $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati 44";
        // }


        return json_encode($resp);
    }

    public function getMatrixFiltered(Request $request)
    {
        $rows = DB::table('matrix_calculation')
                    ->where('curtain_system_id', '=', $request->systemId)
                    ->where(function($query) use ($request) {
                        $query->where('width', $request->filterValue)
                              ->orWhere('height', $request->filterValue);
                    })
                    ->get();

        $data = $this->changeStructureOfRows($rows);

        return response()
            ->json($data);
    }

    public function uploadOrMarkup(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'aggiornamento ha avuto successo!";

        try {
            $rowExists = DB::table('curtain_systems')
                ->where('system_id', '=', $request->system)
                ->where('curtain_id', '=', $request->curtainId)
                ->first();

            if ($request->curtainId && empty($rowExists)) {
                $id = DB::table('curtain_systems')->insertGetId(
                    [
                        'system_id' => $request->system,
                        'curtain_id' => $request->curtainId,
                        'price_calculation_type' => 1,
                    ]
                );
            } elseif(! empty($rowExists)) {
                $id = $rowExists->id;
            }

            $systemId = $id ?? $request->id;

            if ($request->xlsxData) {
                $data = $this->parseXlsxData($request->xlsxData);
                foreach ($data as $matrix) {
                    $basePrice = $matrix['price'];

                    if ($request->markup !== 0) {
                        Markup::updateOrCreate(
                            ['id' =>  1],
                            ['amount' =>  $request->markup]
                        );
                        $addition = $request->markup / 100 * $matrix["price"];
                        $matrix["price"] = $matrix["price"] + $addition;
                    }

                    DB::table('matrix_calculation')->updateOrInsert(
                        [
                            'width' => $matrix["width"],
                            'height' => $matrix["height"],
                            'curtain_system_id' => $systemId,
                            'calculation_id' => 2,
                        ],
                        [
                            'width' => $matrix["width"],
                            'height' => $matrix["height"],
                            'price' => number_format($matrix["price"], 2),
                            'base_price' => $basePrice,
                            'curtain_system_id' => $systemId,
                            'calculation_id' => 2,
                        ]
                    );
                }
            } else {
                if ($request->markup !== 0) {
                    $rows = DB::table('matrix_calculation')
                            ->where('curtain_system_id', '=', $systemId)
                            ->get();

                    $rows = json_decode($rows, true);

                    Markup::updateOrCreate(
                        ['id' =>  1],
                        ['amount' =>  $request->markup]
                    );

                    foreach ($rows as $row) {
                        $addition = $request->markup / 100 * $row['base_price'];
                        $newPrice = $row['price'] + $addition;

                        DB::table('matrix_calculation')
                            ->where('id', $row['id'])
                            ->update(['price' => number_format($newPrice, 2)]);
                    }
                }
            }

            $rows = DB::table('matrix_calculation')
                        ->where('curtain_system_id', '=', $systemId)
                        ->get();
            $data = $this->changeStructureOfRows($rows);

        } catch (Exception $e) {
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
        }

        return response()
            ->json([
                'resp' => $resp,
                'data' => $data,
            ]);
    }

    function getSystemLines($id){
        $system_colors = DB::table("curtain_color_rel")
        ->where('curtain_id', '=', $id)
        ->get();
        $chains = DB::table("curtain_systems")
        ->where('curtain_id', '=', $id)
        ->get();

        $data["motors"] = [];
        $data["chains"] = $chains;
        $data["colors"] = $system_colors;

        return json_encode([ 'data' => $data]);
    }

    function deleteSystem(Request $request) {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Tessuti è stata cancellata con successo!";

        try{
            DB::table('curtain_color_rel')
                ->where('curtain_id', '=', $request->id)
                ->delete();

            DB::table('curtain_systems')
                ->where('curtain_id', '=', $request->id)
                ->delete();
            DB::table('curtains')
                ->where('id', '=', $request->id)
                ->delete();

        }catch(\Exception $ex){
            $resp->code = 1;
            $resp->message = "There was a problem in server!";
            return response()->json($resp);
        }
        return json_encode($resp);
    }


    public function getMarkup()
    {
        return response()
            ->json(Markup::first());
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */

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

    // protected function setMarkUp($markup)
    // {
    //      Markup::updateOrCreate(
    //         ['id' =>  1],
    //         ['amount' =>  $markup]
    //     );

    // }

    protected function parseXlsxData(array $data)
    {
        foreach ($data as $key => $array) {
            foreach ($array as $index => $val) {
                if (! is_numeric($val)) {
                    unset($data[$key][$index]);
                }
            }

            if (empty($data[$key])) {
                unset($data[$key]);
            }
        }

        $newArrays = [];

        foreach ($data as $array) {
            $newArrays[] = array_values($array);
        }

        $arr = array_values($newArrays);

        $results = [];

        $widths = array_shift($arr);

        for ($i = 0; $i < count($arr); $i++) {
            $h = array_shift($arr[$i]);

            foreach ($arr[$i] as $j => $price) {
                $results[] = ['height' => $h, 'width' => $widths[$j], 'price' => $price];
            }
        }

        return $results;
    }

    protected function changeStructureOfRows($rows)
    {
        $rows = json_decode($rows, true);

        $data = array_map(function($row) {
            return [
                'id' => $row['id'],
                'min' => $row['width'],
                'max' => $row['height'],
                'price' => $row['price'],
                'calculation_id' => $row['calculation_id'],
                'curtain_system_id' => $row['curtain_system_id'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ]; }, $rows);

        return $data;
    }
}
