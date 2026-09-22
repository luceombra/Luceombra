<?php

namespace App\Http\Controllers;

use File;
use Image;
use JWTAuth;
use App\Cart;
use App\Shop;
use App\User;
use stdClass;
use App\Order;
use Exception;
use App\Invoice;
use App\Products;
use App\preventive;
use App\AgentMatrix;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;

class ShopController extends Controller
{
    // Retrieve shops
    public function retrieveShops($userId)
    {
        try {
            $user = User::find($userId);

            if ($user->role == "admin") {
                $shop = DB::table('shops')
                    ->select("shops.id", "users.name", "agent_matrices.discount as discount", "shops.responsible as responsiblePerson", "users.email", "users.phone_number", "shops.address", "shops.discount_id", "shops.description as note", "users.iva", "users.shipping")
                    ->join("users", "users.shop", "=", "shops.id")
                    ->leftJoin("agent_matrices", "agent_matrices.id", "=", "shops.discount_id")
                    ->where('users.role', '=', "shop")
                    ->get();
            } else {
                $shop = DB::table('shops')
                    ->select("shops.id", "users.name",  "agent_matrices.discount as discount", "shops.responsible as responsiblePerson", "users.email", "users.phone_number", "shops.address", "shops.discount_id", "shops.description as note", "users.iva", "users.shipping")
                    ->join("users", "users.shop", "=", "shops.id")
                    ->leftJoin("agent_matrices", "agent_matrices.id", "=", "shops.discount_id")
                    ->where('users.role', '=', "shop")
                    ->where('shops.user_assigned', '=', $userId)
                    ->get();
            }
        } catch (Exception $ex) {
            $shop = null;
        }

        return $shop;
    }

    public function getShops(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];
        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        $total = DB::table("shops")
            ->join("users", "users.shop", "=", "shops.id")
            ->join("users as assigned", "assigned.id", "=", "shops.user_assigned")
            ->where("users.role", "=", "shop")
            ->where(function ($query) use ($user) {
                $query->where('assigned.id', '=', $user->id)
                    ->orWhereRaw('"admin" = "' . $user->role . '"');
            })
            ->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%' . $filter . '%')
                    ->orWhere('users.email', 'like', '%' . $filter . '%')
                    ->orWhere('shops.address', 'like', '%' . $filter . '%')
                    ->orWhere('users.phone_number', 'like', '%' . $filter . '%')
                    ->orWhere('shops.description', 'like', '%' . $filter . '%')
                    ->orWhere('assigned.name', 'like', '%' . $filter . '%');
            })
            ->count('users.id');


        $clients = DB::table("shops")
            ->select(
                "users.id", 'users.name', "users.email", "users.phone_number", "users.image", "assigned.id as assignedID",
                "shops.address", "shops.status", "shops.description", "shops.iva", "shops.discount_id", "assigned.name as assignee", "users.shipping"
            )
            ->join("users", "users.shop", "=", "shops.id")
            ->join("users as assigned", "assigned.id", "=", "shops.user_assigned")
            ->where("users.role", "=", "shop")
            ->where(function ($query) use ($user) {
                $query->where('assigned.id', '=', $user->id)
                    ->orWhereRaw('"admin" = "' . $user->role . '"');
            })
            ->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%' . $filter . '%')
                    ->orWhere('users.email', 'like', '%' . $filter . '%')
                    ->orWhere('shops.address', 'like', '%' . $filter . '%')
                    ->orWhere('shops.iva', 'like', '%' . $filter . '%')
                    ->orWhere('users.phone_number', 'like', '%' . $filter . '%')
                    ->orWhere('shops.description', 'like', '%' . $filter . '%')
                    ->orWhere('assigned.name', 'like', '%' . $filter . '%');
            })
            ->limit($pageSize)
            ->offset($pageNumber * $pageSize)
            ->orderBy($sortBy, $sortType)
            ->get();


        $response = Datatables::of($clients)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode($response);
    }

    public function getShopsDiscount() {
        return json_encode(AgentMatrix::get());
    }

    public function addShop(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il negozio è stato creato con successo!";

        try {

            $token = $request->bearerToken();
            $currentUser = JWTAuth::toUser($token);

            $validator = Validator::make(
                array(
                    'name' => $request->name,
                    'email' => $request->email
                ),
                array(
                    'name' => 'required',
                    'email' => 'required|email'

                ),
                array(
                    'name.required' => 'Il nome non può essere nullo!',
                    'email.required' => 'Il email non può essere nullo!',
                    'email.email' => 'Il formato email non è valido!'
                )
            );

            if (User::where("email", $request->email)->first()) {
                $resp->code = 1;
                $resp->message = "Questa e-mail è già in uso!";

                return json_encode($resp);
            }

            if (count($validator->errors()->messages()) > 0) {
                $resp->code = 1;
                $resp->message = $validator->errors()->first();

                return json_encode($resp);
            }

            $usrClass = new User();
            $password = $usrClass->random_str(6, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*_-");

            $shop = new Shop;
            $shop->responsible = "";
            $shop->image = "";
            $shop->pdfFooter = "";
            $shop->address = $request->address == null ? "" : $request->address;
            $shop->description = $request->description == null ? "" : $request->description;
            $shop->iva =  $request->iva == null ? "" : $request->iva;
            $shop->user_assigned = $currentUser->role == "admin" ? $request->assignee : $currentUser->id;
            $shop->save();

            $user = new User;
            $user->name = $request->name;
            $user->email = $request->email;
            $user->password = Hash::make($password);
            $user->token = "";
            $user->role = "shop";
            $user->zone_covered = "";
            $user->image = "/images/users/user.jpg";
            $user->iva = $currentUser->iva;
            $user->phone_number = $request->phone_number == null ? "" : $request->phone_number;
            $user->commision = 0;
            $user->total_commision = 0;
            $user->shop = $shop->id;
            $user->shipping = $request->shipping == 0 ? 0 : $request->shipping;
            $user->save();

            $data = [
                "name" => $request->name,
                "password" => $password
            ];

            $email = $request->email;
            $name = $request->name;

            Mail::send('mail', $data, function($message) use ($email, $name) {
                $message->to($email, $name)
                    ->subject("Password Preventivatore");
            });

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "Il negozio non è stato aggiornato con successo!";
        }

        return json_encode($resp);
    }

    public function updateShop(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il negozio è stato aggiornato con successo!";

        try {

            $token = $request->bearerToken();
            $currentUser = JWTAuth::toUser($token);

            $validator = Validator::make(
                array(
                    'name' => $request->name,
                    'email' => $request->email
                ),
                array(
                    'name' => 'required',
                    'email' => 'required|email'

                ),
                array(
                    'name.required' => 'Il nome non può essere nullo!',
                    'email.required' => 'Il email non può essere nullo!',
                    'email.email' => 'Il formato email non è valido!'
                )
            );

            if (
            User::where("email", "=", $request->email)
                ->where("id", "!=", $request->id)
                ->first()
            ) {
                $resp->code = 1;
                $resp->message = "Questa e-mail è già in uso!";

                return json_encode($resp);
            }

            if (count($validator->errors()->messages()) > 0) {
                $resp->code = 1;
                $resp->message = $validator->errors()->first();

                return json_encode($resp);
            }

            $user = User::find($request->id);
            $user->name = $request->name;
            $user->email = $request->email;
            $user->phone_number = $request->phone_number == null ? "" : $request->phone_number;
            $user->shipping = $request->shipping == null ? 0 : $request->shipping;
            $user->save();

            $shop = Shop::find($user->shop);
            $shop->iva = $request->iva;
            $shop->address = $request->address == null ? "" : $request->address;
            $shop->discount_id = $request->discount_id == null ? "" : $request->discount_id;
            $shop->description = $request->description == null ? "" : $request->description;
            $shop->user_assigned = $currentUser->role == "admin" ? $request->assignee : $currentUser->id;
            $shop->save();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "Il negozio non è stato aggiornato con successo!";
        }

        return json_encode($resp);
    }

    public function deleteShop(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il negozio è stato cancellato con successo!";

        try {
            $user = User::find($request->id);

            $preventives = Preventive::where("user_created", "=", $user->id)
                ->orWhere("shop", "=", $user->shop)
                ->get();

            foreach($preventives as $preventive){

                Products::where("preventive", $preventive->id)
                    ->delete();

                $orders = Order::where("preventive_id", $preventive->id)
                    ->get();

                foreach($orders as $order){
                    Invoice::where("order_id", $order->id)
                        ->delete();

                    Order::find($order->id)->delete();
                }

                Preventive::find($preventive->id)->delete();
            }

            $image_path = public_path($user->image);

            if (File::exists($image_path) && ($user->image != "/images/users/user.jpg")) {
                File::delete($image_path);
            }

            DB::table("clients")
                ->where("shop", $user->shop)
                ->delete();

            Cart::where("user_id", $user->id)->delete();
            Shop::where("id", $user->shop)->delete();
            User::find($request->id)->delete();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "Il negozio non è stato cancellato con successo!";
        }

        return json_encode($resp);
    }

    public function changeStatusOfShop(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Lo stato del negozio è stato modificato con successo!";

        try {
                $token = $request->bearerToken();
                $currentUser = JWTAuth::toUser($token);
                $user = User::find($request->id);

                $shop = Shop::find($user->shop);
                $shop->status = $request->status;
                $shop->save();

                if ($request->status == false) {
                    JWTAuth::setToken($user->token)->invalidate(true);
                }

            } catch (Exception $ex) {
                $resp->code = 1;
                $resp->message = "Lo stato del negozio non è stato modificato con successo!";
            }

            return json_encode($resp);
    }

    public function getIvaHomeService(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;

          try {
                $shop = Shop::findOrFail($request->shopId);
            } catch (Exception $ex) {
                $resp->code = 1;
                $resp->message = "Error";
            }

            return json_encode($shop);
    }
}
