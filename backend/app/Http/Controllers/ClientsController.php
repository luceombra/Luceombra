<?php

namespace App\Http\Controllers;

use JWTAuth;
use stdClass;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Yajra\DataTables\Facades\DataTables;

class ClientsController extends Controller
{
    // Retrieve clients
    public function retrieveClients($shop)
    {
        try {
            $clients = DB::table('clients')
                ->select("clients.*", "users.shipping", "shops.discount_id", "agent_matrices.discount as discount")
                ->join("shops", "clients.shop", "=", "shops.id")
                ->join("users", "users.shop", "=", "shops.id")
                ->leftJoin("agent_matrices", "agent_matrices.id", "=", "shops.discount_id")
                ->where('users.id', '=', $shop)
                ->get();
        } catch (Exception $ex) {
            $clients = null;
        }

        return $clients;
    }

    // Clients datatable
    public function getClients(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];
        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        $total = DB::table("clients")
            ->join("shops", "clients.shop", "=", "shops.id")
            ->join("users", "users.shop", "=", "shops.id")
            ->where("users.id", "=", $user->id)
            ->where(function ($q) use ($filter) {
                $q->where('clients.name', 'like', '%' . $filter . '%')
                    ->orWhere('clients.email', 'like', '%' . $filter . '%')
                    ->orWhere('clients.address', 'like', '%' . $filter . '%')
                    ->orWhere('clients.phone', 'like', '%' . $filter . '%');
            })
            ->count('clients.id');

        $clients = DB::table("clients")
            ->select(
                "clients.id", 'clients.name', "clients.email", "clients.phone", "clients.address", "clients.p_iva"
            )
            ->join("shops", "clients.shop", "=", "shops.id")
            ->join("users", "users.shop", "=", "shops.id")
            ->where("users.id", "=", $user->id)
            ->where(function ($q) use ($filter) {
                $q->where('clients.name', 'like', '%' . $filter . '%')
                    ->orWhere('clients.email', 'like', '%' . $filter . '%')
                    ->orWhere('clients.address', 'like', '%' . $filter . '%')
                    ->orWhere('clients.phone', 'like', '%' . $filter . '%')
                    ->orWhere('clients.p_iva', 'like', '%' . $filter . '%');
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

    public function addClients(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il cliente è stato creato con successo!";

        try {
            $validator = Validator::make(
                array(
                    'name' => $request->name, 'email' => $request->email
                ),
                array(
                    'name' => 'required', 'email' => 'required|email'
                ),
                array(
                    'name.required' => 'Il nome non può essere nullo!',
                    'email.required' => 'Il email non può essere nullo!',
                    'email.email' => 'Il formato email non è valido!'
                )
            );

            if (DB::table('clients')->where("email", $request->email)->first()) {
                $resp->code = 1;
                $resp->message = "Questa e-mail è già in uso!";
                return json_encode($resp);
            }

            if (count($validator->errors()->messages()) > 0) {
                $resp->code = 1;
                $resp->message = $validator->errors()->first();

                return json_encode($resp);
            }

            if ($request->address == null) {
                $request->address = "";
            }

            if ($request->phone == null) {
                $request->phone = "";
            }

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);

            DB::table('clients')
                ->insert([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'p_iva' => $request->p_iva,
                    'shop' => $user->shop
                ]);
        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "Il cliente non è stato creato con successo!";
        }

        return json_encode($resp);
    }

    public function updateClient(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il cliente è stato aggiornato con successo!";

        try {
            $validator = Validator::make(
                array(
                    'name' => $request->name, 'email' => $request->email
                ),
                array(
                    'name' => 'required', 'email' => 'required|email'
                ),
                array(
                    'name.required' => 'Il nome non può essere vuoto!',
                    'email.required' => 'L\'email non può essere vuota!',
                    'email.email' => 'Il formato email non è valido!'
                )
            );

            if (count($validator->errors()) > 0) {
                foreach ($validator->errors()->getMessages() as $error_message) {
                    $resp->code = 1;
                    $resp->message = $error_message[0];

                    return json_encode($resp);
                }
            }

            if ($request->address == null) {
                $request->address = "";
            }

            if ($request->phone == null) {
                $request->phone = "";
            }

            $client = DB::table("clients")
                ->where("clients.email", "=", $request->email)
                ->where("clients.id", "!=", $request->id)
                ->first();

            if ($client) {
                $resp->code = 1;
                $resp->message = "Questa email è già utilizzata da un altro client!";
                return json_encode($resp);
            }

            DB::table("clients")
                ->where("clients.id", "=", $request->id)
                ->update([
                    "name" => $request->name,
                    "phone" => $request->phone,
                    "address" => $request->address,
                    "p_iva" => $request->p_iva,
                    "email" => $request->email
                ]);
        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "Il cliente non è stato aggiornato con successo!";
        }

        return json_encode($resp);
    }

    public function deleteClient(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Il cliente è stato cancellato con successo!";

        try {
            $clientPreventives = DB::table('preventives')
                ->where('preventives.client', '=', $request->id)
                ->get();

            if (count($clientPreventives) > 0) {
                $resp->code = 1;
                $resp->message = "Non posso cancellare questo client in quanto vi sono già altri dati relativi a lui!";
            } else {
                DB::table('clients')
                    ->where('clients.id', '=', $request->id)
                    ->delete();
            }
        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "Il cliente non è stato cancellato con successo!";
        }

        return json_encode($resp);
    }

}
