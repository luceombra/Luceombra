<?php

namespace App\Http\Controllers;

use JWTAuth;
use App\Cart;
use App\User;
use stdClass;
use Exception;
use App\Products;
use App\preventive;
use App\AgentMatrix;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;

class AgentsController extends Controller
{
    public function getAgents(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];

        $total = DB::table("users")
            ->where("users.role", "=", "manager")
            ->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%' . $filter . '%')
                    ->orWhere('users.email', 'like', '%' . $filter . '%')
                    ->orWhere('users.zone_covered', 'like', '%' . $filter . '%')
                    ->orWhere('users.phone_number', 'like', '%' . $filter . '%')
                    ->orWhere('users.commision', 'like', '%' . $filter . '%')
                    ->orWhere('users.unpaidCommision', 'like', '%' . $filter . '%')
                    ->orWhere('users.total_commision', 'like', '%' . $filter . '%');
            })
            ->count('users.id');

        $clients = DB::table("users")
            ->select(
                "users.id", 'users.name', "users.email", "users.phone_number", "users.image",
                "users.zone_covered", "users.commision", "users.total_commision", "users.unpaidCommision"
            )
            ->where("users.role", "=", "manager")
            ->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%' . $filter . '%')
                    ->orWhere('users.email', 'like', '%' . $filter . '%')
                    ->orWhere('users.zone_covered', 'like', '%' . $filter . '%')
                    ->orWhere('users.phone_number', 'like', '%' . $filter . '%')
                    ->orWhere('users.commision', 'like', '%' . $filter . '%')
                    ->orWhere('users.unpaidCommision', 'like', '%' . $filter . '%')
                    ->orWhere('users.total_commision', 'like', '%' . $filter . '%');
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

    public function retrieveAgents()
    {
        $agents = DB::table("users")
            ->select('*')
            ->where("users.role", "=", "manager")
            ->get();


        return response($agents);
    }

    public function getAgentsMatrix(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];

        $total = DB::table("agent_matrices")->count('agent_matrices.id');

        $agentMatrices = DB::table("agent_matrices")
            ->limit($pageSize)
            ->offset($pageNumber * $pageSize)
            ->get();

        $response = Datatables::of($agentMatrices)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode($response);
    }

    public function addAgent(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L’agente è stato creato con successo!";

        try {

            $token = $request->bearerToken();
            $admin = JWTAuth::toUser($token);

            $validator = Validator::make(
                array(
                    'name' => $request->name,
                    'email' => $request->email,
                    // 'commision' => $request->commision
                ),
                array(
                    'name' => 'required',
                    'email' => 'required|email',
                    // 'commision' => 'required'
                ),
                array(
                    'name.required' => 'Il nome non può essere nullo!',
                    'email.required' => 'Il email non può essere nullo!',
                    'email.email' => 'Il formato email non è valido!',
                    // 'commision.required' => 'Commissione non può essere nullo!'
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

            $user = new User;
            $user->name = $request->name;
            $user->email = $request->email;
            // $user->commision = $request->commision;
            $user->zone_covered = $request->zone_covered == null ? "" : $request->zone_covered;
            $user->phone_number = $request->phone_number == null ? "" : $request->phone_number;
            $user->iva = $admin->iva;
            $user->image = "/images/users/user.jpg";
            $user->role = "manager";
            // $user->total_commision = 0;
            $user->shop = 0;
            $user->shipping = 0;
            $user->password = Hash::make($password);
            $user->token = "";
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
            $resp->message = "L’agente non è stato creato con successo!";
        }

        return json_encode($resp);
    }

    public function addAgentMatrix(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L’matruce è stato creato con successo!";

        try {

            $token = $request->bearerToken();
            $admin = JWTAuth::toUser($token);

            $validator = Validator::make(
                array(
                    'discount' => $request->discount,
                    'fee' => $request->fee,
                ),
                array(
                    'discount' => 'required',
                    'fee' => 'required',
                ),
                array(
                    'discount.required' => 'Il sconto non può essere nullo!',
                    'fee.required' => 'Il provvigione non può essere nullo!',
                )
            );

            if (count($validator->errors()->messages()) > 0) {
                $resp->code = 1;
                $resp->message = $validator->errors()->first();

                return json_encode($resp);
            }

            $matrix = new AgentMatrix();
            $matrix->discount = $request->discount;
            $matrix->agent_fee = $request->fee;

            $matrix->save();


        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "L’agente non è stato creato con successo!";
        }

        return json_encode($resp);
    }

    public function updateAgent(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L’agente è stato aggiornato con successo!";

        try {

            $validator = Validator::make(
                array(
                    'name' => $request->name,
                    'email' => $request->email,
                ),
                array(
                    'name' => 'required',
                    'email' => 'required|email',
                ),
                array(
                    'name.required' => 'Il nome non può essere nullo!',
                    'email.required' => 'Il email non può essere nullo!',
                    'email.email' => 'Il formato email non è valido!',
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
            $user->zone_covered = $request->zone_covered == null ? "" : $request->zone_covered;
            $user->phone_number = $request->phone_number == null ? "" : $request->phone_number;
            $user->unpaidCommision = $request->unpaidCommision;
            $user->save();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "L'agente non è stato aggiornato con successo!";
        }

        return json_encode($resp);
    }

    public function updateAgentMatrix(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L’matrice è stato aggiornato con successo!";

         try {

            $token = $request->bearerToken();
            $admin = JWTAuth::toUser($token);

            $validator = Validator::make(
                array(
                    'discount' => $request->discount,
                    'agent_fee' => $request->agent_fee,
                ),
                array(
                    'discount' => 'required',
                    'agent_fee' => 'required',
                ),
                array(
                    'discount.required' => 'Il sconto non può essere nullo!',
                    'agent_fee.required' => 'Il provvigione non può essere nullo!',
                )
            );

            if (count($validator->errors()->messages()) > 0) {
                $resp->code = 1;
                $resp->message = $validator->errors()->first();

                return json_encode($resp);
            }

            $matrix = AgentMatrix::find($request->id);
            $matrix->discount = $request->discount;
            $matrix->agent_fee = $request->agent_fee;

            $matrix->save();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "L'matrice non è stato aggiornato con successo!";
        }

        return json_encode($resp);
    }

    public function deleteAgent(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'agente è stato cancellato con successo!";

        try {

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
            $admin_cart = Cart::where("user_id", $user->id)->first();
            $manager_cart = Cart::where("user_id", $request->id)->first();

            if($manager_cart){
                 Products::where("cart_id", $manager_cart->id)
                    ->update([
                        "cart_id" => $admin_cart->id
                    ]);

                Cart::where("user_id", $request->id)->delete();
            }


            Preventive::where("user_created", "=", $request->id)
                ->update([
                    "user_created" => $user->id
                ]);

            DB::table("shops")
                ->where("user_assigned", "=", $request->id)
                ->update([
                    "user_assigned" => $user->id
                ]);

            User::find($request->id)->delete();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "L'agente non è stato cancellato con successo!";
        }

        return json_encode($resp);
    }

    public function deleteAgentMatrix(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'matrice è stato cancellato con successo!";

        try {

            $token = $request->bearerToken();
            $admin = JWTAuth::toUser($token);

            AgentMatrix::find($request->id)->delete();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "L'matrice non è stato cancellato con successo!";
        }

        return json_encode($resp);
    }

    public function retrieveMatrices()
    {
        try {
            $matrices = AgentMatrix::get();
        } catch (Exception $ex) {
            $matrices = null;
        }

        return $matrices;
    }
}
