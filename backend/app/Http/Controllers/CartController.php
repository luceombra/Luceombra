<?php

namespace App\Http\Controllers;

use App\preventive;
use App\Products;
use App\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use JWTAuth;
use stdClass;

class CartController extends Controller
{
     /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        $carts = DB::table('cart')
            ->get();

        return $carts;
    }

    public function listProducts(Request $request){
        $products = Array();

        try {
            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);

            $products = DB::table('products')
                ->select('products.id', 'systems.image as systemImage', 'systems.name as system', 'products.width', 'products.height',
                    'products.price as totalPrice', 'curtains.name as curtain', 'curtains.description as desc',
                    'type_motor.name as motor', 'type_chain.name as chain', 'telecomand.name as telecomand',
                    'curtain_colors.name as curtainColor', 'system_colors.name as systemColor', 'products.quantity')
                ->join("cart", "products.cart_id", "=", "cart.id")
                ->join('systems','systems.id','=','products.system_id')
                ->join('system_colors','system_colors.id','=','products.system_color_id')
                ->join('curtains','curtains.id','=','products.curtain_id')
                ->join('curtain_colors', 'curtain_colors.id', '=', 'products.curtain_color_id')
                ->leftJoin('type_chain','type_chain.id','=','products.chain_id')
                ->leftJoin('type_motor','type_motor.id','=','products.motor_id')
                ->leftJoin('telecomand','telecomand.id','=','products.telecomand_id')
                ->where('cart.user_id', '=', $user->id)
                ->where('products.state', '=', "draft")
                ->get();
        }
        catch(Exception $ex){

        }

        return json_encode($products);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create(Request $request)
    {
        $create = DB::table('cart')
            ->insert(
                ['user_id'=>$request->user_id]
            );
        if($create){
            return response()->json($systems);
        }
        return response()->json(
            ['error'=>'Error on create']
        );
    }

    public function removeFromCart(Request $request){
        $response = new stdClass();
        $response->code = 0;
        $response->message = "Il prodotto è stato rimosso con successo!";

        try{
            $product= Products::where('id', $request->id)->select("state", "preventive")->first();
            Products::where('id', $request->id)
                ->delete();

            if($product->state == "preventive" && $product->preventive != 0){
                $preventiveId = $product->preventive;
                $preventive = Preventive::find($preventiveId);

                if ($preventive->client != 0 && $preventive->shop != 0) {
                    // User who owns preventive now
                    $owningUser = User::where('shop', $preventive->shop)->first();
                }
                else {
                    // User who owns preventive now
                    $owningUser = User::find($preventive->user_created);
                }

                $preventiveController = new PreventiveController();
                $preventiveController->updatePreventive($preventiveId, $owningUser);
            }
        }
        catch(Exception $ex){
            $response->code = 1;
            $response->message = "Si è verificato un errore durante il tentativo di eliminare il record!";
        }

        return json_encode($response);
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
