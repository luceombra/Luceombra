<?php

namespace App\Http\Controllers;
use App\preventive;
use App\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use JWTAuth;
use App\Cart;
use App\Products;
use stdClass;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        //
    }

    public function indexByUserId($userId)
    {
        $product = DB::table('products')
        ->join('cart','products.cart_id','=','cart.id')
        ->select('cart.user_id','products.*')
        ->where('cart.user_id','=',$userId)
        ->where('products.state','=','draft')
        ->get();

        if($product){
            return response()->json($product);
        }else{
            return response()->json(
                ['error'=>'There is no data']
            );
        }
    }
    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il prodotto è stato aggiunto al carrello con successo!";

        try {

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);

            $price_type = DB::table('curtain_systems')
                ->select("price_calculation_type")
                ->where("system_id", "=", $request["system_id"])
                ->where("curtain_id", "=", $request["curtain_id"])
                ->first();

            $product = $this->validateProduct($request, $price_type);

            if(!$product){
                throw new Exception("");
            }

            if($price_type->price_calculation_type == 1) {
                $price = $request["price"];
            } else {
                $price = round((($request["height"] / 100) * ($request["width"] / 100) * $request["price"]), 2);
            }

            $cart = DB::table('cart')
                ->select("id")
                ->where('cart.user_id', '=', $user->id)
                ->first();

            if(!$cart) {
                $cartid = DB::table('cart')->insertGetId(
                    [
                        'user_id' => $user->id,
                        'created_at' => date("Y-m-d H:i"),
                        'updated_at' => date("Y-m-d H:i")
                    ]
                );
            } else {
                $cartid = $cart->id;
            }

            $product = new Products;
            $product->curtain_id = $request["curtain_id"];
            $product->system_id = $request["system_id"];
            $product->system_color_id = $request["system_color_id"];
            $product->curtain_color_id = $request["curtain_color_id"];
            $product->width = $request["width"];
            $product->height = $request["height"];
            $product->motion_id = $request["motion_id"];

            if($product->motion_id == 1){
                $product->chain_id = $request["chain_id"];

                $chain = DB::table('type_chain')
                    ->select("price")
                    ->where('type_chain.id', '=', $request["chain_id"])
                    ->first();

                $price += $chain->price;
            }
            else{
                $product->telecomand_id = $request["telecomand_id"];
                $product->motor_id = $request["motor_id"];

                $motor = DB::table('type_motor')
                    ->select("price")
                    ->where('type_motor.id', '=', $request["motor_id"])
                    ->first();

                $remoteControl = DB::table('telecomand')
                    ->select("price")
                    ->where('telecomand.id', '=', $request["telecomand_id"])
                    ->first();

                $price += $motor->price + $remoteControl->price;
            }

            $product->cart_id = $cartid;
            $product->price = $price;
            $product->quantity = 1;
            $product->preventive = 0;
            $product->save();
        }
        catch(Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante il tentativo di aggiungere il prodotto al carrello. Si prega di inserire dati validi!";
        }

        return json_encode($resp);
    }

    public function updateQuantity(Request $request){
        $response = new stdClass();
        $response->code = 0;
        $response->message = "La quantità è stata aggiornata correttamente!";

        try{
            $product = Products::where('id', $request->id)->select("state", "preventive")->first();

            Products::where('id', $request->id)
                ->update(['quantity' => $request->value]);

            if($product->state == "preventive" && $product->preventive != 0){
                $preventive = Preventive::find($product->preventive);

                if ($preventive->client != 0 && $preventive->shop != 0) {
                    // User who owns preventive now
                    $owningUser = User::where('shop', $preventive->shop)->first();
                }
                else {
                    // User who owns preventive now
                    $owningUser = User::find($preventive->user_created);
                }

                $preventiveController = new PreventiveController();
                $preventiveController->updatePreventive($product->preventive, $owningUser);
            }
        }
        catch(Exception $ex){
            $response->code = 1;
            $response->message = "Si è verificato un errore durante il tentativo di aggiornare il valore della quantità!";
        }

        return json_encode($response);
    }

    public function updateProduct(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il prodotto è stato aggiunto al carrello con successo!";

        try{

            if($request["preventive"] != -1) {
                $user = User::find(preventive::find($request["preventive"])->user_created);
            } else {
                 $token = $request->bearerToken();
                 $user = JWTAuth::toUser($token);
            }

            $price_type = DB::table('curtain_systems')
                ->select("price_calculation_type")
                ->where("system_id", "=", $request["system_id"])
                ->where("curtain_id", "=", $request["curtain_id"])
                ->first();

            $product = $this->validateProduct($request, $price_type);

            if(!$product){
                throw new Exception("");
            }

            if($price_type->price_calculation_type == 1){
                $price = $request["price"];
            }
            else{
                $price = round((($request["height"] / 100) * ($request["width"] / 100) * $request["price"]), 2);
            }

            if($request["productId"] == "_NEW"){
                $product = new Products;

                $cart = DB::table('cart')
                    ->select("id")
                    ->where('cart.user_id', '=', $user->id)
                    ->first();

                if(!$cart){
                    $cartid = DB::table('cart')->insertGetId(
                        [
                            'user_id' => $user->id,
                            'created_at' => date("Y-m-d H:i"),
                            'updated_at' => date("Y-m-d H:i")
                        ]
                    );
                }
                else{
                    $cartid = $cart->id;
                }

                $product->cart_id = $cartid;
                $product->quantity = 1;
                $product->state = "preventive";
                $product->preventive = $request["preventive"];
            }
            else{
                $product = Products::find($request["productId"]);
            }

            $product->curtain_id = $request["curtain_id"];
            $product->system_id = $request["system_id"];
            $product->system_color_id = $request["system_color_id"];
            $product->curtain_color_id = $request["curtain_color_id"];
            $product->width = $request["width"];
            $product->height = $request["height"];
            $product->motion_id = $request["motion_id"];

            if($product->motion_id == 1){
                $product->chain_id = $request["chain_id"];
                $product->telecomand_id = null;
                $product->motor_id = null;

                $chain = DB::table('type_chain')
                    ->select("price")
                    ->where('type_chain.id', '=', $request["chain_id"])
                    ->first();

                $price += $chain->price;
            }
            else{
                $product->telecomand_id = $request["telecomand_id"];
                $product->motor_id = $request["motor_id"];
                $product->chain_id = null;

                $motor = DB::table('type_motor')
                    ->select("price")
                    ->where('type_motor.id', '=', $request["motor_id"])
                    ->first();

                $remoteControl = DB::table('telecomand')
                    ->select("price")
                    ->where('telecomand.id', '=', $request["telecomand_id"])
                    ->first();

                $price += $motor->price + $remoteControl->price;
            }

            $product->price = $price;
            $product->save();

            if($request["preventive"] != -1) {
                $preventive = preventive::find($request["preventive"]);

                if ($preventive->client != 0 && $preventive->shop != 0) {
                    // User who owns preventive now
                    $owningUser = User::where('shop', $preventive->shop)->first();
                }
                else {
                    // User who owns preventive now
                    $owningUser = User::find($preventive->user_created);
                }

                $preventiveController = new PreventiveController();
                $preventiveController->updatePreventive($request["preventive"], $owningUser);
            }
        }
        catch(Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante il tentativo di aggiungere il prodotto al carrello. Si prega di inserire dati validi!";
        }

        return json_encode($resp);
    }

    private function validateProduct(Request $request, $price_type){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il prodotto è stato aggiunto al carrello con successo!";

        try {
            switch($price_type->price_calculation_type){
                case 1:
                    switch($request["motion_id"]){
                        case 1:
                            $product = DB::table('systems')
                                ->select('curtain_systems.id')
                                ->join('system_color_rel','system_color_rel.system_id','=','systems.id')
                                ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
                                ->join('curtain_systems','systems.id','=','curtain_systems.system_id')
                                ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
                                ->join('curtain_color_rel', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
                                ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
                                ->join('matrix_calculation','matrix_calculation.curtain_system_id','=','curtain_systems.id')
                                ->join('system_chain_rel','system_chain_rel.system_id','=','systems.id')
                                ->join('type_chain','type_chain.id','=','system_chain_rel.chain_id')
                                ->where('systems.id', '=' ,$request["system_id"])
                                ->where('curtains.id', '=', $request["curtain_id"])
                                ->where('system_colors.id', '=', $request["system_color_id"])
                                ->where('curtain_colors.id', '=', $request["curtain_color_id"])
                                ->where('matrix_calculation.price', '=', $request["price"])
                                ->where('type_chain.id', '=', $request["chain_id"])
                                ->first();
                            break;
                        case 2:
                            $product = DB::table('systems')
                                ->select('curtain_systems.id')
                                ->join('system_color_rel','system_color_rel.system_id','=','systems.id')
                                ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
                                ->join('curtain_systems','systems.id','=','curtain_systems.system_id')
                                ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
                                ->join('curtain_color_rel', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
                                ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
                                ->join('matrix_calculation','matrix_calculation.curtain_system_id','=','curtain_systems.id')
                                ->join('system_motor_rel','system_motor_rel.system_id','=','systems.id')
                                ->join('type_motor','type_motor.id','=','system_motor_rel.motor_id')
                                ->join('motor_telecomand_rel','motor_telecomand_rel.motor_id','=','type_motor.id')
                                ->join('telecomand','telecomand.id','=','motor_telecomand_rel.telecomand_id')
                                ->select('telecomand.id')
                                ->where('systems.id', '=' ,$request["system_id"])
                                ->where('curtains.id', '=', $request["curtain_id"])
                                ->where('system_colors.id', '=', $request["system_color_id"])
                                ->where('curtain_colors.id', '=', $request["curtain_color_id"])
                                ->where('matrix_calculation.price', '=', $request["price"])
                                ->where('telecomand.id', '=', $request["telecomand_id"])
                                ->where('type_motor.id', '=', $request["motor_id"])
                                ->first();
                            break;
                    }
                    break;
                case 2:
                    switch($request["motion_id"]){
                        case 1:
                            $product = DB::table('systems')
                                ->select('curtain_systems.id')
                                ->join('system_color_rel','system_color_rel.system_id','=','systems.id')
                                ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
                                ->join('curtain_systems','systems.id','=','curtain_systems.system_id')
                                ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
                                ->join('curtain_color_rel', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
                                ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
                                ->join('interval_calculation','interval_calculation.curtain_system_id','=','curtain_systems.id')
                                ->join('system_chain_rel','system_chain_rel.system_id','=','systems.id')
                                ->join('type_chain','type_chain.id','=','system_chain_rel.chain_id')
                                ->where('systems.id', '=' ,$request["system_id"])
                                ->where('curtains.id', '=', $request["curtain_id"])
                                ->where('system_colors.id', '=', $request["system_color_id"])
                                ->where('curtain_colors.id', '=', $request["curtain_color_id"])
                                ->where('interval_calculation.price', '=', $request["price"])
                                ->where('type_chain.id', '=', $request["chain_id"])
                                ->first();
                            break;
                        case 2:
                            $product = DB::table('systems')
                                ->select('curtain_systems.id')
                                ->join('system_color_rel','system_color_rel.system_id','=','systems.id')
                                ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
                                ->join('curtain_systems','systems.id','=','curtain_systems.system_id')
                                ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
                                ->join('curtain_color_rel', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
                                ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
                                ->join('interval_calculation','interval_calculation.curtain_system_id','=','curtain_systems.id')
                                ->join('system_motor_rel','system_motor_rel.system_id','=','systems.id')
                                ->join('type_motor','type_motor.id','=','system_motor_rel.motor_id')
                                ->join('motor_telecomand_rel','motor_telecomand_rel.motor_id','=','type_motor.id')
                                ->join('telecomand','telecomand.id','=','motor_telecomand_rel.telecomand_id')
                                ->select('telecomand.id')
                                ->where('systems.id', '=', $request["system_id"])
                                ->where('curtains.id', '=', $request["curtain_id"])
                                ->where('system_colors.id', '=', $request["system_color_id"])
                                ->where('curtain_colors.id', '=', $request["curtain_color_id"])
                                ->where('interval_calculation.price', '=', $request["price"])
                                ->where('telecomand.id', '=', $request["telecomand_id"])
                                ->where('type_motor.id', '=', $request["motor_id"])
                                ->first();
                            break;
                    }
                    break;
                case 3:
                    switch($request["motion_id"]){
                        case 1:
                            $product = DB::table('systems')
                                ->select('curtain_systems.id')
                                ->join('system_color_rel','system_color_rel.system_id','=','systems.id')
                                ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
                                ->join('curtain_systems','systems.id','=','curtain_systems.system_id')
                                ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
                                ->join('curtain_color_rel', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
                                ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
                                ->join('meter_calculation','meter_calculation.curtain_system_id','=','curtain_systems.id')
                                ->join('system_chain_rel','system_chain_rel.system_id','=','systems.id')
                                ->join('type_chain','type_chain.id','=','system_chain_rel.chain_id')
                                ->where('systems.id', '=' ,$request["system_id"])
                                ->where('curtains.id', '=', $request["curtain_id"])
                                ->where('system_colors.id', '=', $request["system_color_id"])
                                ->where('curtain_colors.id', '=', $request["curtain_color_id"])
                                ->where('meter_calculation.price', '=', $request["price"])
                                ->where('type_chain.id', '=', $request["chain_id"])
                                ->first();
                            break;
                        case 2:
                            $product = DB::table('systems')
                                ->select('curtain_systems.id')
                                ->join('system_color_rel','system_color_rel.system_id','=','systems.id')
                                ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
                                ->join('curtain_systems','systems.id','=','curtain_systems.system_id')
                                ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
                                ->join('curtain_color_rel', 'curtain_color_rel.curtain_id', '=', 'curtains.id')
                                ->join('curtain_colors', 'curtain_colors.id', '=', 'curtain_color_rel.color_id')
                                ->join('meter_calculation','meter_calculation.curtain_system_id','=','curtain_systems.id')
                                ->join('system_motor_rel','system_motor_rel.system_id','=','systems.id')
                                ->join('type_motor','type_motor.id','=','system_motor_rel.motor_id')
                                ->join('motor_telecomand_rel','motor_telecomand_rel.motor_id','=','type_motor.id')
                                ->join('telecomand','telecomand.id','=','motor_telecomand_rel.telecomand_id')
                                ->select('telecomand.id')
                                ->where('systems.id', '=' ,$request["system_id"])
                                ->where('curtains.id', '=', $request["curtain_id"])
                                ->where('system_colors.id', '=', $request["system_color_id"])
                                ->where('curtain_colors.id', '=', $request["curtain_color_id"])
                                ->where('meter_calculation.price', '=', $request["price"])
                                ->where('telecomand.id', '=', $request["telecomand_id"])
                                ->where('type_motor.id', '=', $request["motor_id"])
                                ->first();
                            break;
                    }
                    break;
            }

            if(!$product){
                throw new Exception("");
            }
        } catch(Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante il tentativo di aggiungere il prodotto al carrello. Si prega di inserire dati validi!";
        }

        return $product;
    }

    public function getProductData($productId) {
        return json_encode(DB::table('products')
            ->select(
                'products.id', 'systems.image as systemImage', 'systems.name as system', 'products.width', 'products.height',
                'products.price as totalPrice', 'curtains.name as curtain', 'curtains.description as desc',
                'curtains.image as curtainImage', 'type_motor.name as motor', 'type_chain.name as chain',
                'telecomand.name as telecomand', 'curtain_colors.name as curtainColor', 'system_colors.name as systemColor',
                'products.quantity', 'preventives.discount', 'preventives.shopDiscount', 'preventives.shipping', 'preventives.totalAmount', 'preventives.amount',
                'preventives.service_on_home', 'products.preventive', 'preventives.markup'
            )
            ->join('preventives', 'preventives.id', '=', 'products.preventive')
            ->join('systems', 'systems.id', '=', 'products.system_id')
            ->join('system_colors', 'system_colors.id', '=', 'products.system_color_id')
            ->join('curtains', 'curtains.id', '=', 'products.curtain_id')
            ->join('curtain_colors', 'curtain_colors.id', '=', 'products.curtain_color_id')
            ->leftJoin('type_chain', 'type_chain.id', '=', 'products.chain_id')
            ->leftJoin('type_motor', 'type_motor.id', '=', 'products.motor_id')
            ->leftJoin('telecomand', 'telecomand.id', '=', 'products.telecomand_id')
            ->where('products.id', '=', $productId)
            ->first());
    }

    public function getNonPreventivedProductData($productId){
        return json_encode(DB::table('products')
            ->select(
                'products.id', 'systems.image as systemImage', 'systems.name as system', 'products.width', 'products.height',
                'products.price as totalPrice', 'curtains.name as curtain', 'curtains.description as desc',
                'curtains.image as curtainImage', 'type_motor.name as motor', 'type_chain.name as chain',
                'telecomand.name as telecomand', 'curtain_colors.name as curtainColor', 'system_colors.name as systemColor',
                'products.quantity', 'products.preventive'
            )
            ->join('systems', 'systems.id', '=', 'products.system_id')
            ->join('system_colors', 'system_colors.id', '=', 'products.system_color_id')
            ->join('curtains', 'curtains.id', '=', 'products.curtain_id')
            ->join('curtain_colors', 'curtain_colors.id', '=', 'products.curtain_color_id')
            ->leftJoin('type_chain', 'type_chain.id', '=', 'products.chain_id')
            ->leftJoin('type_motor', 'type_motor.id', '=', 'products.motor_id')
            ->leftJoin('telecomand', 'telecomand.id', '=', 'products.telecomand_id')
            ->where('products.id', '=', $productId)
            ->first());
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
        //
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
    public function update($id)
    {
        //
    }

    public function updateByUserId(Request $request, $userId)
    {
        $product = DB::table('products')
        ->join('cart','products.cart_id','=','cart.id')
        ->select('cart.user_id','products.*')
        ->where('cart.user_id','=',$userId)
        ->where('products.state','=','draft')
        ->get();

        if($product and sizeof($product)){
            if($request->_method){
                $inputs = $request->except(['_method']);
            }else{
                $inputs = $request->all();
            }

            $update = DB::table('products')
                ->join('cart','products.cart_id','=','cart.id')
                ->where('cart.user_id','=',$userId)
                ->where('products.state','=','draft')
                ->update($inputs);
            if($update){
                return response()->json($update);
            }
            return response()->json(
                ['error'=>'Error on update']
            );

        }else{
            $cart = DB::table('cart')
                ->where('user_id','=',$userId)
                ->get();
            if($cart and sizeof($cart)){
                $cartId = $cart[0]->id;
                $insert= DB::table('products')
                    ->insert(
                        ['cart_id'=>$cartId]
                    );
                if($insert){
                    return response()->json($insert);
                }

                return response()->json(
                    ['error'=>'Error on insert']
                );

            }else{
                return response()->json(
                    ['error'=>'Error on update']
                );
            }

        }
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
