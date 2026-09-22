<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Products;
use stdClass;

class DimensionsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

    }

    public function getPriceType(Request $request){

        $response = new \stdClass();

        $curtain_systems = DB::table('curtain_systems')
            ->select("id", "price_calculation_type")
            ->where("system_id", "=", $request->system_id)
            ->where("curtain_id", "=", $request->curtain_id)
            ->first();

        if($curtain_systems){
            $response->price_type = $curtain_systems->price_calculation_type;

            if($curtain_systems->price_calculation_type == 1){

                $heights = Array();
                $widths = Array();

                $matrix_heights = DB::table('matrix_calculation')
                    ->select('height')
                    ->where('curtain_system_id', '=', $curtain_systems->id)
                    ->distinct()
                    ->get();

                foreach($matrix_heights as $matrix_heigh){
                    array_push($heights, $matrix_heigh->height);
                }

                $matrix_widths = DB::table('matrix_calculation')
                    ->select('width')
                    ->where('curtain_system_id', '=', $curtain_systems->id)
                    ->distinct()
                    ->get();

                foreach($matrix_widths as $matrix_width){
                    array_push($widths, $matrix_width->width);
                }

                $response->widths = $widths;
                $response->heights = $heights;
            }
        }

        return json_encode($response);
    }

    public function getCorrespondingHeight(Request $request){

        $curtain_systems = DB::table('curtain_systems as cs')
            ->select("mc.height", "mc.price")
            ->join('matrix_calculation as mc', 'cs.id', '=', 'mc.curtain_system_id')
            ->where("cs.system_id", "=", $request->system_id)
            ->where("cs.curtain_id", "=", $request->curtain_id)
            ->where("mc.width", "=", $request->width)
            ->get();

        return json_encode($curtain_systems);
    }

    public function getCorrespondingWidth(Request $request){

        $curtain_systems = DB::table('curtain_systems as cs')
            ->select("mc.width", "mc.price")
            ->join('matrix_calculation as mc', 'cs.id', '=', 'mc.curtain_system_id')
            ->where("cs.system_id", "=", $request->system_id)
            ->where("cs.curtain_id", "=", $request->curtain_id)
            ->where("mc.height", "=", $request->height)
            ->get();

        return json_encode($curtain_systems);
    }

    public function getPrice(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Success";
        $resp->price = 0;
        $product = $request->product;
        $curtain_price = null;

        $curtain_systems = DB::table('curtain_systems')
            ->select("id", "price_calculation_type", "minHeight", "maxHeight", "minWidth", "maxWidth")
            ->where("system_id", "=", $product["system_id"])
            ->where("curtain_id", "=", $product["curtain_id"])
            ->first();

        if($curtain_systems != null) {

            $priceType = $curtain_systems->price_calculation_type;

            if ($priceType == 2 || $priceType == 3) {
                if ((int)$product['width'] < (int)($curtain_systems->minWidth)){
                    $resp->code = 1;
                    $resp->message = "Questa superficie non è disponibile. La larghezza dovrebbe essere negli intervalli da {$curtain_systems->minWidth} a {$curtain_systems->maxWidth}. La lunghezza deve essere compresa tra {$curtain_systems->minHeight} e {$curtain_systems->maxHeight}.";
                    $resp->price = 0;
                    return json_encode($resp);
                }

                if ((int)$curtain_systems->maxWidth > 0){
                    if ((int)$product['width'] > (int)($curtain_systems->maxWidth)){
                        $resp->code = 1;
                        $resp->message = "Questa superficie non è disponibile. La larghezza dovrebbe essere negli intervalli da {$curtain_systems->minWidth} a {$curtain_systems->maxWidth}. La lunghezza deve essere compresa tra {$curtain_systems->minHeight} e {$curtain_systems->maxHeight}.";
                        $resp->price = 0;
                        return json_encode($resp);
                    }
                }

                if ((int)$product['height'] < (int)($curtain_systems->minHeight)){
                    $resp->code = 1;
                    $resp->message = "Questa superficie non è disponibile. La larghezza dovrebbe essere negli intervalli da {$curtain_systems->minWidth} a {$curtain_systems->maxWidth}. La lunghezza deve essere compresa tra {$curtain_systems->minHeight} e {$curtain_systems->maxHeight}.";
                    $resp->price = 0;
                    return json_encode($resp);
                }

                if ((int)$curtain_systems->maxHeight > 0){
                    if ((int)$product['height'] > (int)($curtain_systems->maxHeight)){
                        $resp->code = 1;
                        $resp->message = "Questa superficie non è disponibile. La larghezza dovrebbe essere negli intervalli da {$curtain_systems->minWidth} a {$curtain_systems->maxWidth}. La lunghezza deve essere compresa tra {$curtain_systems->minHeight} e {$curtain_systems->maxHeight}.";
                        $resp->price = 0;
                        return json_encode($resp);
                    }
                }
            }

            if($priceType == 1) {
                $curtain_price_width = DB::table('matrix_calculation')
                    ->select("width")
                    ->where("curtain_system_id", "=", $curtain_systems->id)
                    ->where("width", ">=", $product["width"])
                    ->orderBy("width", "asc")
                    ->first();

                if(!$curtain_price_width) {
                    $curtain_price_width = DB::table('matrix_calculation')
                        ->select("width", "height")
                        ->where("curtain_system_id", "=", $curtain_systems->id)
                        ->where("width", "<", $product["width"])
                        ->orderBy("width", "desc")
                        ->first();

                    $resp->code = 1;
                    $resp->message = "Queste dimensioni non sono disponibili. Prova a inserire l'altezza {$curtain_price_width->height} e la larghezza {$curtain_price_width->width} o più piccoli!";
                    $resp->price = 0;

                } else {
                    $curtain_price = DB::table('matrix_calculation')
                        ->select("price")
                        ->where("curtain_system_id", "=", $curtain_systems->id)
                        ->where("width", ">=", $curtain_price_width->width)
                        ->where("height", ">=", $product["height"])
                        ->first();

                    if(!$curtain_price) {
                        $curtain_price_width = DB::table('matrix_calculation')
                            ->select("width", "height")
                            ->where("curtain_system_id", "=", $curtain_systems->id)
                            ->where("width", ">=", $curtain_price_width->width)
                            ->where("height", "<=", $product["height"])
                            ->orderBy("height", "desc")
                            ->first();

                        $resp->code = 1;
                        $resp->message = "Queste dimensioni non sono disponibili. Prova a inserire l'altezza {$curtain_price_width->height} e la larghezza {$curtain_price_width->width} o più piccoli!";
                        $resp->price = 0;
                    }
                }
            } else if($priceType == 2) {
                $surface = ($product["height"] / 100) * ($product["width"] / 100);
                $curtain_price = DB::table('interval_calculation')
                    ->select("price")
                    ->where('curtain_system_id', '=', $curtain_systems->id)
                    ->where("min", "<", $surface)
                    ->where("max", ">", $surface)
                    ->first();

                if(!$curtain_price) {
                    $curtain_price_dimensions = DB::table('interval_calculation')
                        ->select("min", "max")
                        ->where('curtain_system_id', '=', $curtain_systems->id)
                        ->orderBy("min", "desc")
                        ->first();

                    $resp->code = 1;
                    $resp->message = "Questa superficie non è disponibile. La larghezza dovrebbe essere negli intervalli da {$curtain_systems->minWidth} a {$curtain_systems->maxWidth}. La lunghezza deve essere compresa tra {$curtain_systems->minHeight} e {$curtain_systems->maxHeight}.";
                    $resp->price = 0;

                }
            }
            else if($priceType == 3) {

                $curtain_price = DB::table('meter_calculation')
                    ->select("price")
                    ->where('curtain_system_id', '=', $curtain_systems->id)
                    ->first();
            }

            if($curtain_price) {
                $resp->price = $curtain_price->price;
                $resp->priceType= $priceType;
            }
        }

        return json_encode($resp);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
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
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
