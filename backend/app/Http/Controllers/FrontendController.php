<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FrontendController extends Controller
{
    //return all systems
    function getSystems(){
        $systems = DB::table('systems')->get();
        if($systems){
            return response()->json($systems);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }

    function getSystemColors($system_id){
        $systemColors = DB::table('system_color_rel')
            ->join('systems','system_color_rel.system_id','=','systems.id')
            ->join('system_colors','system_colors.id','=','system_color_rel.color_id')
            ->select('systems.name','system_colors.value','system_color_rel.id','system_color_rel.system_id','system_color_rel.color_id')
            ->where('system_color_rel.system_id','=',$system_id)
            ->get();
        if($systemColors){
            return response()->json($systemColors);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }

    function getSystemCurtains($systemId){
        $systemCurtains = DB::table('curtain_systems')
            ->join('curtains','curtains.id','=','curtain_systems.curtain_id')
            ->select('curtains.*','curtain_systems.system_id','curtain_systems.id as curtain_system_id')
            ->where('system_id','=',$systemId)
            ->get();
        if($systemCurtains){
            return response()->json($systemCurtains);
        }
        return response()->json(
            ['error'=>'There is no data']
        );
    }

    function getCurtainColors($curtainId){
        $curtainColors = DB::table('curtain_color_rel')
            ->join('curtains','curtain_color_rel.curtain_id','=','curtains.id')
            ->join('curtain_colors','curtain_colors.id','=','curtain_color_rel.color_id')
            ->select('curtains.name','curtain_colors.value','curtain_color_rel.id','curtain_color_rel.curtain_id','curtain_color_rel.color_id')
            ->where('curtain_color_rel.curtain_id','=',$curtainId)
            ->get();
        if($curtainColors){
            return response()->json($curtainColors);
        }

        return response()->json(
            ['error'=>'There is no data']
        );

        
    }

    function getproduct($userId){
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


    function updateProduct(Request $request, $userId){

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
}
