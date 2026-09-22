<?php

namespace App\Http\Controllers;

use PDF;
use File;
use JWTAuth;
use App\Shop;
use App\User;
use stdClass;
use App\Order;
use Exception;
use App\client;
use App\Helpers;
use App\Products;
use App\preventive;
use App\AgentMatrix;
use App\Configurations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;

class PreventiveController extends Controller
{
    function addPreventive(Request $request)
    {
        $response = new stdClass();
        $response->code = 0;
        $response->message = "Success";

        try {
            $shopData = new stdClass();
            $clientData = new stdClass();
            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
            $configs = Configurations::first();
            $admin = User::where("role", "=", "admin")->first();
            $admin['p_iva'] = $configs->p_iva;
            $admin['address'] = $configs->address;
            $admin['website'] = $configs->website;
            if ($user->role == "shop") {
                $validator = Validator::make(
                    array(
                        'markup' => $request->markup
                    ),
                    array(
                        'markup' => 'required|numeric'
                    ),
                    array(
                        'markup.not_in' => 'Markup non può essere nullo!'
                    )
                );

                if (count($validator->errors()->messages()) > 0) {
                    $response->code = 1;
                    $response->message = $validator->errors()->first();

                    return json_encode($response);
                }
            }

            $preventive = new preventive();
            $preventive->date = date("Y/m/d");
            $preventive->status = "Preventivo";
            $shipping = 0;
            if ($user->role == "shop") {
                $preventive->discount = 0;
                $requestShopPreventiveIvaShipping = $request->iva_shipping;
                $requestShopPreventiveIvaHomeService = $request->iva_home_service;
                $preventive->shopDiscount = $request->discount;
                $preventive->shopShipping = $request->shipping;
                $preventive->shipping = $user->shipping;
                $preventive->client = $request->client;
                $preventive->shop = 0;
                $shipping = $request->shipping;
            } else {
                $preventive->discount = $request->discount;
                $requestAdminPreventiveIvaShipping = $request->iva_shipping;
                $preventive->shopDiscount = 0;
                $preventive->shipping = $request->shipping;
                $preventive->shopShipping = 0;
                $preventive->shop = $request->shop;
                $preventive->client = 0;
                $shipping = $request->shipping;
            }


            if ($user->role == 'admin' && $admin->iva !== $request->iva) {
                $adminIva = $request->iva;
            } else {
                $adminIva = $admin->iva;
            }

            $preventive->markup = $request->markup ? $request->markup : 0;
            $preventive->reference = $request->reference;
            $preventive->user_created = $user->id;
            $preventive->pdf = "";
            $preventive->pdfShop = "";
            $preventive->base_price = $request->amount;

            $preventive->amount = $request->amount * (1 - $request->discount / 100) * (1 + $adminIva  / 100) + $request->shipping * (1 + $request->iva_shipping  / 100);

            $preventive->totalAmount = $request->totalAmount;
            $preventive->service_on_home = $request->service_on_home;
            $preventive->save();


            if ($preventive->shop != 0) {
                $shopObj = Shop::find($preventive->shop);
            } else {
                $shopObj = Shop::find($user->shop);
            }

            $shopUsr =  User::where("shop", "=", $shopObj->id)->first();
            $userIva = $request->iva;
            $clientObj = client::find($preventive->client);
            $shopData->name = $shopUsr->name;
            $shopData->email = $shopUsr->email;
            $shopData->phone = $shopUsr->phone_number;
            $shopData->shipping = $shopUsr->shipping;
            $shopData->address = $shopObj->address;
            $shopData->iva = $shopObj->iva;
            $shopData->iva_shipping = $shopUsr->iva_shipping;
            $shopData->iva_home_service = $shopObj->iva_home_service;
            $shopData->pdfFooter = $shopObj->pdfFooter;
            $shopData->confirmation_order_note = $shopObj->confirmation_order_note;

            if ($user->role == 'shop') {
                // if ($shopUsr->iva !== $request->iva) {
                //     $userIva = $request->iva;
                // } else {
                //     $userIva = $shopUsr->iva;
                // }
                if ($requestShopPreventiveIvaShipping !== 0 && $requestShopPreventiveIvaShipping !== $shopData->iva_shipping) {
                    $shopData->iva_shipping = $requestShopPreventiveIvaShipping;
                }

                if ($requestShopPreventiveIvaHomeService !== 0 && $requestShopPreventiveIvaHomeService !== $shopData->iva_home_service) {
                    $shopData->iva_home_service = $requestShopPreventiveIvaHomeService;
                }
            } else {
                if ($requestAdminPreventiveIvaShipping !== 0 && $requestAdminPreventiveIvaShipping !== $shopUsr->iva_shipping) {
                    $shopData->iva_shipping = $requestAdminPreventiveIvaShipping;
                }
            }

            $preventive->iva_shipping = $shopData->iva_shipping;
            $preventive->iva_home_service = $shopData->iva_home_service;
            $preventive->save();

            if ($clientObj) {
                $clientData->name = $clientObj->name;
                $clientData->email = $clientObj->email;
                $clientData->phone = $clientObj->phone;
                $clientData->address = $clientObj->address;
            }

            $cart = DB::table('cart')->where('user_id', $user->id)->first();

            Products::where('cart_id', $cart->id)
                ->where('state', 'draft')
                ->where('preventive', 0)
                ->update([
                    'state'      => 'preventive',
                    'preventive' => $preventive->id
                ]);

            $preventiveCreated = User::where('id', $preventive->user_created)->first();

            $prev = new preventive();
            $products = $prev->preventiveData($preventive->id);

            $data = [
                'products' => $products,
                'shop' => $shopData,
                'client' => $clientData,
                'admin' => $admin,
                'iva' => $admin->iva,
                'adminIva' => $adminIva,
                'userIva' => $userIva,
                'preventiveCreated' => $preventiveCreated,
                'preventiveReference' => $preventive->reference,
                'date' => date_format($preventive->created_at, "d/m/Y"),
                'markup' => $preventive->markup,
                'discount' => $request->discount,
                'image' => $user->image,
                'shipping' => $shipping,
                'footer' => Configurations::first()->admin_footer,
                'confirmation_order_note' => Configurations::first()->confirmation_order_note,
            ];

            $path1 = '/documents/preventives/preventive_' . $preventive->id . 'token' . uniqid() . '.pdf';
            $pdf = PDF::loadView('preventive', $data);

            $pdf->save(public_path($path1));

            $preventiveEdit = preventive::find($preventive->id);
            $preventiveEdit->pdf = $path1;


            if ($user->role == "shop") {
                $path2 = '/documents/preventives/preventive_shop_' . $preventive->id . 'token' . uniqid() . '.pdf';
                $pdf = PDF::loadView('shopPreventive', $data);
                $pdf->save(public_path($path2));

                $preventiveEdit->pdfShop = $path2;
            }

            $preventiveEdit->save();
        } catch (Exception $ex) {
            $response->code = 1;
            $response->message = "Si è verificato un problema durante l'aggiunta di un preventivo!";
        }

        return json_encode($response);
    }

    function getPreventives(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];

        if ($sortBy == "formatedDate") {
            $sortBy = "date";
        }

        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        if ($user->role == "admin") {
            $shopPreventives = DB::table("preventives")
                ->select(
                    "preventives.shop as shopId",
                    "preventives.client as clientId",
                    "preventives.id",
                    'preventives.date',
                    DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                    "preventives.status",
                    "assigned.name as from",
                    "preventives.amount",
                    "users.name as client",
                    DB::raw("'shop' as assignedType"),
                    "preventives.pdf",
                    "preventives.discount",
                    "preventives.shipping",
                    "shops.id as assignedId",
                    "shops.discount_id as discountId",
                    "preventives.service_on_home"
                )
                ->join("shops", "preventives.shop", "=", "shops.id")
                ->join("users", "shops.id", "=", "users.shop")
                ->join("users as assigned", "preventives.user_created", "=", "assigned.id");

            $clientPreventives = DB::table("preventives")
                ->select(
                    "preventives.shop as shopId",
                    "preventives.client as clientId",
                    "preventives.id",
                    'preventives.date',
                    DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                    "preventives.status",
                    "assigned.name as from",
                    "preventives.amount",
                    "users.name as client",
                    DB::raw("'client' as assignedType"),
                    "preventives.pdf",
                    "preventives.discount",
                    "preventives.shipping",
                    "clients.id as assignedId",
                    "shops.discount_id as discountId",
                    "preventives.service_on_home"
                )
                ->join("clients", "preventives.client", "=", "clients.id")
                ->join("shops", "clients.shop", "=", "shops.id")
                ->join("users", "shops.id", "=", "users.shop")
                ->join("users as assigned", "preventives.user_created", "=", "assigned.id");
            //->union($shopPreventives, true);

            $total = DB::table(DB::raw("((" . $clientPreventives->toSql() . " WHERE `preventives`.`shop` = 0) UNION (" . $shopPreventives->toSql() . ")) as x"))
                ->select(['shopId', 'clientId', 'id', 'from', 'date', 'formatedDate', 'status', 'amount', 'client', 'pdf', 'discount', 'shipping', 'assignedId', 'assignedType', 'service_on_home', 'discountId'])
                ->where("status", "!=", "Confermato")
                ->where(function ($q) use ($filter) {
                    $q->where('from', 'like', '%' . $filter . '%')
                        ->orWhere('formatedDate', 'like', '%' . $filter . '%')
                        ->orWhere('status', 'like', '%' . $filter . '%')
                        ->orWhere('amount', 'like', '%' . $filter . '%')
                        ->orWhere('discount', 'like', '%' . $filter . '%')
                        ->orWhere('shipping', 'like', '%' . $filter . '%')
                        ->orWhere('client', 'like', '%' . $filter . '%');
                })
                ->count('id');

            //            throw new Exception("(" . $clientPreventives->toSql() . " WHERE `preventives`.`shop` = 0) UNION ( " . $shopPreventives->toSql() . ")");
            $preventives = DB::table(DB::raw("((" . $clientPreventives->toSql() . " WHERE `preventives`.`shop` = 0) UNION (" . $shopPreventives->toSql() . ")) as x"))
                ->select(['id', 'from', 'date', 'formatedDate', 'status', 'amount', 'client', 'pdf', 'discount', 'shipping', 'assignedId', 'assignedType', 'service_on_home', 'discountId'])
                ->where("status", "!=", "Confermato")
                ->where(function ($q) use ($filter) {
                    $q->where('from', 'like', '%' . $filter . '%')
                        ->orWhere('formatedDate', 'like', '%' . $filter . '%')
                        ->orWhere('status', 'like', '%' . $filter . '%')
                        ->orWhere('amount', 'like', '%' . $filter . '%')
                        ->orWhere('discount', 'like', '%' . $filter . '%')
                        ->orWhere('shipping', 'like', '%' . $filter . '%')
                        ->orWhere('client', 'like', '%' . $filter . '%');
                })
                ->limit($pageSize)
                ->offset($pageNumber * $pageSize)
                ->orderBy($sortBy, $sortType)
                ->get();
        } else if ($user->role == "manager") {
            if ($request->selfPreventives == true) {
                $total = DB::table("preventives")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->join("users as user_assigned", "shops.user_assigned", "=", "user_assigned.id")
                    //                    ->where("preventives.user_created", "=", $user->id)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - preventives.shipping * (1 + user_assigned.iva / 100)) / (1 + user_assigned.iva / 100) * (user_assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('users.name', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $preventives = DB::table("preventives")
                    ->select(
                        "preventives.id",
                        'preventives.date',
                        DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status",
                        "assigned.name as from",
                        "preventives.amount",
                        "users.name as client",
                        "preventives.service_on_home",
                        DB::raw('((preventives.amount - preventives.shipping * (1 + user_assigned.iva / 100)) / (1 + user_assigned.iva / 100) * (user_assigned.commision / 100)) as commision'),
                        "preventives.pdf",
                        "preventives.discount",
                        "preventives.shipping",
                        "shops.id as assignedId",
                        "shops.discount_id as discountId",
                        DB::raw("'shop' as assignedType")
                    )
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->join("users as user_assigned", "shops.user_assigned", "=", "user_assigned.id")
                    //                    ->where("preventives.user_created", "=", $user->id)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - preventives.shipping * (1 + user_assigned.iva / 100)) / (1 + user_assigned.iva / 100) * (user_assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('users.name', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            } else {
                $total = DB::table("preventives")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "shops.user_assigned", "=", "assigned.id")
                    ->where("preventives.shop", "=", 0)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - users.shipping * (1 + assigned.iva / 100)) / (1 + assigned.iva / 100) * (assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('users.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $preventives = DB::table("preventives")
                    ->select(
                        "preventives.id",
                        'preventives.date',
                        DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status",
                        "users.name as from",
                        "preventives.amount",
                        "users.name as client",
                        "clients.id as assignedId",
                        "preventives.pdf",
                        "preventives.discount",
                        "users.shipping",
                        "preventives.service_on_home",
                        DB::raw("'client' as assignedType"),
                        DB::raw('((preventives.amount - users.shipping * (1 + assigned.iva / 100)) / (1 + assigned.iva / 100) * (assigned.commision / 100)) as commision')
                    )
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "shops.user_assigned", "=", "assigned.id")
                    ->where("preventives.shop", "=", 0)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - users.shipping * (1 + assigned.iva / 100)) / (1 + assigned.iva / 100) * (assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('users.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            }
        } else if ($user->role == "shop") {
            if ($request->selfPreventives == true) {
                $total = DB::table("preventives")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.totalAmount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopShipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $preventives = DB::table("preventives")
                    ->select(
                        "preventives.id",
                        'preventives.date',
                        DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status",
                        "users.name as from",
                        "preventives.amount",
                        "clients.name as client",
                        "preventives.totalAmount",
                        "preventives.pdfShop as pdf",
                        "preventives.discount",
                        "preventives.shopDiscount",
                        "preventives.markup",
                        "preventives.shopShipping as shipping",
                        "preventives.service_on_home",
                        "clients.id as assignedId",
                        DB::raw("'client' as assignedType")
                    )
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.totalAmount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopShipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            } else {
                $total = DB::table("preventives")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->where("preventives.client", "=", '0')
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where('assigned.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $preventives = DB::table("preventives")
                    ->select(
                        "preventives.id",
                        'preventives.date',
                        DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status",
                        "assigned.name as from",
                        "preventives.amount",
                        "preventives.pdf",
                        "preventives.discount",
                        "preventives.shopDiscount",
                        "preventives.shipping",
                        "shops.id as assignedId",
                        DB::raw("'shop' as assignedType")
                    )
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->where("preventives.client", "=", '0')
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "!=", "Confermato")
                    ->where(function ($q) use ($filter) {
                        $q->where('assigned.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('preventives.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            }
        }

        $response = Datatables::of($preventives)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode($response);
    }

    function checkPreventive(Request $request)
    {

        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        if ($user->role == "admin") {
            $preventive = DB::table("preventives")
                ->where('preventives.id', '=', $request->id)
                ->first();
        } else if ($user->role == "manager") {

            $preventive = DB::table("preventives")
                ->select("preventives.id")
                ->join("shops", "preventives.shop", "=", "shops.id")
                ->join("users", "shops.user_assigned", "=", "users.id")
                ->where("users.id", "=", $user->id)
                ->where("preventives.id", "=", $request->id)
                ->first();

            if (!$preventive) {
                $preventive = DB::table("preventives")
                    ->select("preventives.id")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.user_assigned", "=", "users.id")
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.id", "=", $request->id)
                    ->first();
            }
        } else if ($user->role == "shop") {
            $preventive = DB::table("preventives")
                ->select("preventives.id")
                ->join("clients", "preventives.client", "=", "clients.id")
                ->join("shops", "clients.shop", "=", "shops.id")
                ->join("users", "shops.id", "=", "users.shop")
                ->where("users.id", "=", $user->id)
                ->where("preventives.id", "=", $request->id)
                ->first();

            if (!$preventive) {
                $preventive = DB::table("preventives")
                    ->select("preventives.id")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.id", "=", $request->id)
                    ->first();
            }
        }

        if ($preventive) {
            return json_encode(true);
        } else {
            return json_encode(false);
        }
    }

    function checkAvailability(Request $request)
    {
        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        if ($user->role != "shop") {
            $preventive = DB::table("preventives")
                ->where('preventives.id', '=', $request->id)
                ->first();

            if ($preventive->client != 0) { // && $preventive->shop == 0
                return json_encode(false);
            }
        }

        return json_encode(true);
    }

    function getPreventiveData($id)
    {
        $preventive = new preventive();
        $products = $preventive->preventiveData($id);

        return json_encode($products);
    }

    function managePreventivesStatus(Request $request)
    {
        $resp = new stdClass();
        $resp->message = "Stato preventivo cambiato con successo!";
        $resp->code = 0;

        try {
            $shopData = new stdClass();
            $clientData = new stdClass();
            $admin = User::where("role", "=", "admin")->first();
            $configs = Configurations::first();
            $admin['p_iva'] = $configs->p_iva;
            $admin['address'] = $configs->address;
            $admin['website'] = $configs->website;

            if (Order::where("invoiceNo", $request->invoice)->first()) {
                $resp->message = "Questo numero di conferma d’ordine esiste già!";
                $resp->code = 1;

                return json_encode($resp);
            }

            $preventive = Preventive::find($request->id);

            if ($preventive->client == 0) {
                $resp->message = "Si prega di selezionare il cliente";
                $resp->code = 1;

                return json_encode($resp);
            }

            $preventive->status = $request->status;
            $preventive->save();

            if ($request->status == "Confermato") {
                $order = new Order;
                $order->invoiced = false;
                $order->invoiceNo = $request->invoice;
                $order->iva = $request->iva != null ? $request->iva : "";
                $order->status = $request->status;
                $order->pdf = "";
                $order->pdfShop = "";
                $order->notes = $request->notes != null ? $request->notes : "";
                $order->preventive_id = $request->id;
                $order->save();
                $shipping = 0;

                if ($preventive->client != 0 && $preventive->shop != 0) {
                    $user = User::where('shop', $preventive->shop)->first();
                } else {
                    $user = User::find($preventive->user_created);
                }

                $prev = new preventive();
                $products = $prev->preventiveData($preventive->id);

                if ($preventive->shop != 0) {
                    $shopObj = Shop::find($preventive->shop);
                } else {
                    $shopObj = Shop::find($user->shop);
                }

                $shopUsr =  User::where("shop", "=", $shopObj->id)->first();
                $userIva = $shopUsr->iva;
                $clientObj = client::find($preventive->client);
                $shopData->name = $shopUsr->name;
                $shopData->email = $shopUsr->email;
                $shopData->phone = $shopUsr->phone_number;
                $shopData->shipping = $shopUsr->shipping;
                $shopData->address = $shopObj->address;
                $shopData->iva = $shopObj->iva;
                $shopData->iva_shipping = $preventive->iva_shipping;
                $shopData->iva_home_service = $preventive->iva_home_service;
                $shopData->pdfFooter = $shopObj->pdfFooter;
                $shopData->confirmation_order_note = $shopObj->confirmation_order_note;

                if ($clientObj) {
                    $clientData->name = $clientObj->name;
                    $clientData->email = $clientObj->email;
                    $clientData->phone = $clientObj->phone;
                    $clientData->address = $clientObj->address;
                }

                if ($user->role == "shop") {
                    $shipping = $preventive->shopShipping;
                } else {
                    $shipping = $preventive->shipping;
                }

                $preventiveCreated = User::where('id', $preventive->user_created)->first();

                $trimDiscount = (int)$products[0]->discount + 0;
                if ($trimDiscount == 0) {
                    $discount = $products[0]->shopDiscount;
                } else {
                    $discount = $products[0]->discount;
                }

                $data = [
                    'products' => $products,
                    'shop' => $shopData,
                    'admin' => $admin,
                    'client' => $clientData,
                    'preventiveCreated' => $preventiveCreated,
                    'preventiveReference' => $preventive->reference,
                    'iva' => $admin->iva,
                    'userIva' => $userIva,
                    'invoiceNo' => $request->invoice,
                    'date' => date_format($preventive->created_at, "d/m/Y"),
                    'markup' => $preventive->markup,
                    'discount' => $discount,
                    'notes' => $request->notes,
                    'image' => $user->image,
                    'shipping' => $shipping,
                    'footer' => Configurations::first(),
                ];

                $path1 = '/documents/orders/order_' . $order->id . 'token' . uniqid() . '.pdf';
                $pdf = PDF::loadView('order', $data)->save(public_path($path1));

                $orderEdit = Order::find($order->id);
                $orderEdit->pdf = $path1;
                $authUser = $request->user();

                if ($authUser->role == "shop") {
                    $path2 = '/documents/orders/order_shop_' . $order->id . 'token' . uniqid() . '.pdf';
                    $pdf = PDF::loadView('shopOrder', $data)->save(public_path($path2));

                    $orderEdit->pdfShop = $path2;
                    $doc_path2 = public_path($preventive->pdfShop);

                    if (File::exists($doc_path2)) {
                        File::delete($doc_path2);
                    }

                    if ($preventive->shop !== 0) {
                        $shop = Shop::findOrFail($preventive->shop);
                        $preventiveDiscount = $preventive->discount + 0;
                    } else {
                        $shop = Shop::findOrFail($shopUsr->shop);
                        $preventiveDiscount = $preventive->shopDiscount + 0;
                    }

                    $agentMatrices = AgentMatrix::findOrFail($shop->discount_id);

                    if ($agentMatrices->discount !== $preventiveDiscount) {
                        $agentMatrices = AgentMatrix::where('discount', $preventiveDiscount)->first();
                    }

                    $agentResponsible = User::find($shop->user_assigned);

                    $commision = Helpers::calculateCommision($preventive->base_price, $agentMatrices->discount, $agentMatrices->agent_fee);

                    if($agentResponsible->role == "manager") {
                        $agentResponsible->unpaidCommision += round($commision, 2);
                        $agentResponsible->total_commision += round($commision, 2);

                        Order::where('id', $order->id)
                            ->update([
                                'agent_fee' => $commision,
                                'responsible_user' => $agentResponsible->id,
                            ]);
                    }

                    $agentResponsible->save();

                    // $shopAssigned = Shop::findOrFail($user->shop)->user_assigned;

                    // $agentResponsible = User::findOrFail($shopAssigned);

                    // $agentFee = $this->getAgentFee($discount, $request->discount_id);

                    // $commision = Helpers::calculateCommision($agentFee, $preventive->amount, $shipping, $admin->iva);
                    // $agentResponsible->total_commision += $commision;
                    // $agentResponsible->unpaidCommision += $commision;
                    // $agentResponsible->save();
                }

                // else if ($user->role == "manager") {
                //     $agentFee = $this->getAgentFee($preventive->discount, $request->discount_id);
                //     $commision = Helpers::calculateCommision($agentFee, $preventive->amount, $shipping, $user->iva);
                //     $user->total_commision += $commision;
                //     $user->unpaidCommision += $commision;
                //     $user->save();
                // } else {
                //     $user_responsible = User::find(Shop::find($preventive->shop)->user_assigned);
                //     $agentFee = $this->getAgentFee($preventive->discount, $request->discount_id);

                //     if ($user_responsible->role == "manager") {
                //         $agentFee = $this->getAgentFee($preventive->discount, $request->discount_id);
                //         $commision = Helpers::calculateCommision($agentFee, $preventive->amount, $shipping, $user->iva);

                //         $user_responsible->total_commision += $commision;
                //         $user_responsible->unpaidCommision += $commision;
                //         $user_responsible->save();
                //     }
                // }

                $orderEdit->save();
                $doc_path1 = public_path($preventive->pdf);

                if (File::exists($doc_path1)) {
                    File::delete($doc_path1);
                }
            }
        } catch (Exception $ex) {
            $resp->message = "Si è verificato un errore durante l'aggiornamento dello stato di prevenzione!";
            $resp->code = 1;
        }

        return json_encode($resp);
    }

    protected function getAgentFee($preventiDiscount, $requestDiscount)
    {
        if ($preventiDiscount) {
            $agentFee = AgentMatrix::where('discount',  $preventiDiscount)->first()->agent_fee;
        } else {
            $agentFee = AgentMatrix::where('id', $requestDiscount)->first()->agent_fee;
            if ($agentFee == null) {
                $agentFee = 0;
            }
        }

        return $agentFee;
    }

    function updatePreventiveData(Request $request)
    {
        $resp = new stdClass();
        $resp->message = "I dati di preventivo sono stati aggiornati con successo!";
        $resp->code = 0;

        try {

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
            $preventive = Preventive::find($request->id);

            if ($user->role == "shop") {
                $preventive->client = $request->assigned;
                $preventive->shopDiscount = $request->shopDiscount;
                $preventive->shopShipping = $request->shipping;
                $preventive->markup = $request->markup ? $request->markup : 0;
                $preventive->iva_shipping = $request->iva_shipping;
                $preventive->iva_home_service = $request->iva_home_service;
                $preventive->service_on_home = $request->service_on_home == null ? 0 : $request->service_on_home;
                $preventive->reference = $request->reference;
            } else {
                $preventive->shop = $request->assigned;
                $preventive->discount = $request->discount;
                $preventive->shipping = $request->shipping;
                $preventive->iva_shipping = $request->iva_shipping;
                $preventive->reference = $request->reference;
            }

            $preventive->save();
            $preventive = Preventive::find($request->id);

            if ($preventive->client != 0 && $preventive->shop != 0) {
                // User who owns preventive now
                $owningUser = User::where('shop', $preventive->shop)->first();
            } else {
                // User who owns preventive now
                $owningUser = User::find($preventive->user_created);
            }

            $this->updatePreventive($request->id, $owningUser, $request->iva);
        } catch (Exception $ex) {
            $resp->message = "I dati di Preventive non sono stati aggiornati con successo!";
            $resp->code = 1;
        }

        return json_encode($resp);
    }

    function updatePreventive($preventiveId, $user, $requestedUserIva)
    {
        try {
            $shopData = new stdClass();
            $clientData = new stdClass();
            $prev = new preventive();
            $preventive = preventive::find($preventiveId);

            if ($preventive->shop != 0) {
                $shopObj = Shop::find($preventive->shop);
            } else {
                $shopObj = Shop::find($user->shop);
            }

            $shopUsr =  User::where("shop", "=", $shopObj->id)->first();
            $userIva = $shopUsr->iva;
            $clientObj = client::find($preventive->client);
            $shopData->name = $shopUsr->name;
            $shopData->email = $shopUsr->email;
            $shopData->phone = $shopUsr->phone_number;
            $shopData->shipping = $shopUsr->shipping;
            $shopData->address = $shopObj->address;
            $shopData->iva = $shopObj->iva;
            $shopData->iva_shipping = $preventive->iva_shipping;
            $shopData->iva_home_service = $preventive->iva_home_service;
            $shopData->pdfFooter = $shopObj->pdfFooter;
            $shopData->confirmation_order_note = $shopObj->confirmation_order_note;

            if ($clientObj) {
                $clientData->name = $clientObj->name;
                $clientData->email = $clientObj->email;
                $clientData->phone = $clientObj->phone;
                $clientData->address = $clientObj->address;
            }

            $products = Products::where('preventive', $preventiveId)
                ->where('state', 'preventive')
                ->select('price', 'quantity')
                ->get();

            $configs = Configurations::first();
            $admin = User::where("role", "=", "admin")->first();
            $admin['p_iva'] = $configs->p_iva;
            $admin['address'] = $configs->address;
            $admin['website'] = $configs->website;

            $baseAmount = 0;
            $amount = 0;
            $totalAmount = 0;
            $shipping = 0;

            foreach ($products as $product) {
                $baseAmount += $product->price * $product->quantity;
            }

            if ($user->role == "shop") {
                $shipping = $preventive->shopShipping;


                // (((preventive.amount * (1 - preventiveForm.value.discountWhenUserIsShop / 100) * (1 + preventiveForm.value.markup / 100) * (1 + user.iva  / 100) + preventiveForm.value.shipping * (1 + preventiveForm.value.iva_shipping  / 100) + preventiveForm.value.service_on_home * (1 + preventiveForm.value.iva_home_service  / 100)))
                // {"id":"751","assigned":19,"shopDiscount":0,"shipping":100,"markup":20,"iva_shipping":20,"iva_home_service":11,"service_on_home":20,"reference":"Rubik"}

                // {{((preventive.amount * (1 - preventiveForm.value.discount?.discount / 100) * (1 + user.iva / 100) + preventiveForm.value.shipping * (1 + preventiveForm.value.iva_shipping  / 100)) | number : '1.0-2')}}€

                $amount = $preventive->amount;
                // $amount = ($baseAmount * (1 - $preventive->discount / 100) + $preventive->shipping) * (1 + $user->iva / 100);
                // this.preventive.totalAmount = (this.preventive.amount * (1 + this.preventive.markup / 100) * (1 - this.preventive.discount / 100) * (1 + this.preventive.iva / 100) + this.preventive.shipping * (1 + this.preventive.iva_shipping  / 100) + this.preventive.service_on_home * (1 + this.preventive.iva_home_service  / 100));


                $totalAmount = ($baseAmount * (1 + $preventive->markup / 100) * (1 - $preventive->discount / 100) * (1 + $user->iva / 100) + $preventive->shipping * (1 + $preventive->iva_shipping / 100) + $preventive->service_on_home * (1 + $preventive->iva_home_service / 100));


                // $totalAmount = ($baseAmount * (1 - $preventive->discount / 100) * (1 + $preventive->markup / 100) * (1 - $preventive->shopDiscount / 100) + $preventive->shopShipping) * (1 + $user->iva / 100) + $preventive->service_on_home;


            } else {
                $shipping = $preventive->shipping;

                $amount = ($baseAmount * (1 - $preventive->discount / 100) * (1 + $admin->iva / 100) + $preventive->shipping * (1 + $preventive->iva_shipping / 100));
                $totalAmount = $amount;
            }

            preventive::where('id', $preventiveId)
                ->update([
                    'amount' => $amount,
                    'totalAmount' => $totalAmount
                ]);

            $preventiveCreated = User::where('id', $preventive->user_created)->first();
            $products = $prev->preventiveData($preventiveId);

            if (count($products) > 0) {
                $data = [
                    'products' => $products,
                    'shop' => $shopData,
                    'client' => $clientData,
                    'admin' => $admin,
                    // 'iva' => $admin->iva,
                    'userIva' => $userIva,
                    'adminIva' => $admin->iva,
                    'preventiveCreated' => $preventiveCreated,
                    'preventiveReference' => $preventive->reference,
                    'date' => date_format($preventive->created_at, "d/m/Y"),
                    'markup' => $preventive->markup,
                    'discount' => $preventive->discount,
                    'image' => $user->image,
                    'shipping' => $shipping,
                    'footer' => Configurations::first()->admin_footer,
                    'confirmation_order_note' => Configurations::first()->confirmation_order_note,
                ];

                $path1 = '/documents/preventives/preventive_' . $preventiveId . 'token' . uniqid() . '.pdf';
                $pdf = PDF::loadView('preventive', $data);
                $pdf->save(public_path($path1));

                $preventiveEdit = preventive::find($preventiveId);
                $preventiveEdit->pdf = $path1;

                if ($user->role == "shop") {
                    $path2 = '/documents/preventives/preventive_shop_' . $preventiveId . 'token' . uniqid() . '.pdf';
                    $pdf = PDF::loadView('shopPreventive', $data);
                    $pdf->save(public_path($path2));

                    $preventiveEdit->pdfShop = $path2;
                }

                $preventiveEdit->save();
            }
        } catch (Exception $ex) {
            throw new Exception($ex->getMessage());
        }
    }

    function deletePreventives(Request $request)
    {
        $response = new stdClass();
        $response->code = 0;
        $response->message = "Il preventivo è stato cancellato con successo!";

        try {
            $preventive = preventive::find($request->id);
            $doc_path = public_path($preventive->pdf);

            DB::table('products')
                ->where('products.preventive', '=', $request->id)
                ->delete();

            DB::table('preventives')
                ->where('preventives.id', '=', $request->id)
                ->delete();

            if (File::exists($doc_path)) {
                File::delete($doc_path);
            }
        } catch (Exception $ex) {
            $response->code = 1;
            $response->message = "Il preventivo non è stato cancellato con successo!";
        }

        return json_encode($response);
    }
}
