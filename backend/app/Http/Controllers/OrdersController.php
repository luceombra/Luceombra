<?php

namespace App\Http\Controllers;

use PDF;
use PDO;
use File;
use JWTAuth;
use App\Cart;
use App\Shop;
use App\User;
use stdClass;
use App\Order;
use Exception;
use App\client;
use App\Helpers;
use App\Invoice;
use App\Products;
use Carbon\Carbon;
use App\preventive;
use App\AgentMatrix;
use App\Configurations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class OrdersController extends Controller
{
    function getOrders(Request $request)
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
            $shopOrders= DB::table("preventives")
                ->select(
                    "preventives.id", "orders.status as orderStatus", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                    "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                    "preventives.discount", "preventives.shipping", "orders.invoiced", 'orders.status_from_admin as adminStatus'
                )
                ->join("orders", "preventives.id", "=", "orders.preventive_id")
                ->join("shops", "preventives.shop", "=", "shops.id")
                ->join("users", "shops.id", "=", "users.shop")
                ->join("users as assigned", "preventives.user_created", "=", "assigned.id");

            $clientOrders = DB::table("preventives")
                ->select(
                    "preventives.id", "orders.status as orderStatus", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                    "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                    "preventives.discount", "preventives.shipping", "orders.invoiced", 'orders.status_from_admin as adminStatus'
                )
                ->join("orders", "preventives.id", "=", "orders.preventive_id")
                ->join("clients", "preventives.client", "=", "clients.id")
                ->join("shops", "clients.shop", "=", "shops.id")
                ->join("users", "shops.id", "=", "users.shop")
                ->join("users as assigned", "preventives.user_created", "=", "assigned.id");
//                ->union($shopOrders);

            $total = DB::table(DB::raw("((" . $clientOrders->toSql() . " WHERE `preventives`.`shop` = 0) UNION (" . $shopOrders->toSql() . ")) as x"))

//            DB::table(DB::raw("({$clientOrders->toSql()}) as x"))
                ->select([
                    'id', 'from', 'date', 'formatedDate', 'status', 'orderStatus', 'adminStatus', 'invoiced',
                    'amount', 'client', 'pdf', 'discount', 'shipping', 'fee', 'invoiceNo'
                ])
                ->where("status", "=", "Confermato")
                ->where("adminStatus", "=", 0)
                ->where(function ($q) use ($filter) {
                    $q->where('from', 'like', '%' . $filter . '%')
                        ->orWhere('formatedDate', 'like', '%' . $filter . '%')
                        ->orWhere('orderStatus', 'like', '%' . $filter . '%')
                        ->orWhere('amount', 'like', '%' . $filter . '%')
                        ->orWhere('discount', 'like', '%' . $filter . '%')
                        ->orWhere('shipping', 'like', '%' . $filter . '%')
                        ->orWhere('invoiceNo', 'like', '%' . $filter . '%')
                        ->orWhere('client', 'like', '%' . $filter . '%');
                })
                ->count('id');

            $orders = DB::table(DB::raw("((" . $clientOrders->toSql() . " WHERE `preventives`.`shop` = 0) UNION (" . $shopOrders->toSql() . ")) as x"))

// DB::table(DB::raw("({$clientOrders->toSql()}) as x"))
                ->select([
                    'id', 'from', 'date', 'formatedDate', 'status', 'orderStatus', 'adminStatus', 'invoiced',
                    'amount', 'client', 'pdf', 'discount', 'fee', 'shipping', 'invoiceNo'
                ])
                ->where("status", "=", "Confermato")
                ->where("adminStatus", "=", 0)
                ->where(function ($q) use ($filter) {
                    $q->where('from', 'like', '%' . $filter . '%')
                        ->orWhere('formatedDate', 'like', '%' . $filter . '%')
                        ->orWhere('orderStatus', 'like', '%' . $filter . '%')
                        ->orWhere('amount', 'like', '%' . $filter . '%')
                        ->orWhere('discount', 'like', '%' . $filter . '%')
                        ->orWhere('shipping', 'like', '%' . $filter . '%')
                        ->orWhere('invoiceNo', 'like', '%' . $filter . '%')
                        ->orWhere('client', 'like', '%' . $filter . '%');
                })
                ->limit($pageSize)
                ->offset($pageNumber * $pageSize)
                ->orderBy($sortBy, $sortType)
                ->get();
        } else if ($user->role == "manager") {
            if($request->selfOrders == true) {
                $total = DB::table("preventives")
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->join("users as user_assigned", "shops.user_assigned", "=", "user_assigned.id")
                    //->where("preventives.user_created", "=", $user->id)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "!=", "Annulato")
                    ->where(function ($q) use ($filter) {
                        $q->where(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - preventives.shipping * (1 + user_assigned.iva / 100)) / (1 + user_assigned.iva / 100) * (user_assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
//                            ->orWhere('assigned.commision', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%')
                            ->orWhere('users.name', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $orders = DB::table("preventives")
                    ->select(
                        "preventives.id", "orders.status as orderStatus", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client",
                        DB::raw('((preventives.amount - preventives.shipping * (1 + user_assigned.iva / 100)) / (1 + user_assigned.iva / 100) * (user_assigned.commision / 100)) as commision'), "orders.pdf", "orders.invoiceNo",
                        "preventives.discount", "preventives.shipping", "orders.invoiced"
                    )
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->join("users as user_assigned", "shops.user_assigned", "=", "user_assigned.id")
//                    ->where("preventives.user_created", "=", $user->id)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "!=", "Annulato")
                    ->where(function ($q) use ($filter) {
                        $q->where(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - preventives.shipping * (1 + user_assigned.iva / 100)) / (1 + user_assigned.iva / 100) * (user_assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
//                            ->orWhere('assigned.commision', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%')
                            ->orWhere('users.name', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            } else {
                $total = DB::table("preventives")
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "shops.user_assigned", "=", "assigned.id")
                    ->where("preventives.shop", "=", 0)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "!=", "Annulato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - preventives.shipping * (1 + assigned.iva / 100)) / (1 + assigned.iva / 100) * (assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $orders = DB::table("preventives")
                    ->select(
                        "preventives.id", "orders.status as orderStatus", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status", "users.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                        DB::raw('((preventives.amount - preventives.shipping * (1 + assigned.iva / 100)) / (1 + assigned.iva / 100) * (assigned.commision / 100)) as commision'),
                        "preventives.discount", "preventives.shipping", "preventives.service_on_home", "orders.invoiced"
                    )
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "shops.user_assigned", "=", "assigned.id")
                    ->where("preventives.shop", "=", 0)
                    ->where("shops.user_assigned", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "!=", "Annulato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('((preventives.amount - preventives.shipping * (1 + assigned.iva / 100)) / (1 + assigned.iva / 100) * (assigned.commision / 100))'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            }
        } else if ($user->role == "shop") {
            if($request->selfOrders == true) {
                $total = DB::table("preventives")
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "=", "Confermato")
                    ->where("orders.invoiced", "=", false)
//                    ->where("orders.status", "!=", "Fatturato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.totalAmount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopShipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $orders = DB::table("preventives")
                    ->select(
                        "preventives.id", "orders.status as orderStatus", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status", "users.name as from", "preventives.amount", "clients.name as client", "preventives.totalAmount", "orders.pdfShop as pdf", "orders.pdf as adminPdf", "orders.invoiceNo", "orders.status_from_admin as adminStatus",
                        "preventives.discount", "preventives.shopDiscount", "preventives.shopShipping as shipping", "preventives.service_on_home", "orders.invoiced"
                    )
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("clients", "preventives.client", "=", "clients.id")
                    ->join("shops", "clients.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "=", "Confermato")
                    ->where("orders.invoiced", "=", false)
//                    ->where("orders.status", "!=", "Fatturato")
                    ->where(function ($q) use ($filter) {
                        $q->where('users.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.totalAmount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopShipping', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.service_on_home', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%')
                            ->orWhere('clients.name', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            } else {
                $total = DB::table("preventives")
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->where("preventives.client", "=", '0')
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "=", "Confermato")
//                    ->where("orders.status", "!=", "Fatturato")
                    ->where("orders.invoiced", "=", false)
                    ->where(function ($q) use ($filter) {
                        $q->where('assigned.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%');
                    })
                    ->count('preventives.id');

                $orders = DB::table("preventives")
                    ->select(
                        "preventives.id", "orders.status as orderStatus", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                        "preventives.status", "assigned.name as from", "preventives.amount", "orders.pdf", "orders.invoiceNo",
                        "preventives.discount", "preventives.shopDiscount", "preventives.shipping", "orders.invoiced"
                    )
                    ->join("orders", "preventives.id", "=", "orders.preventive_id")
                    ->join("shops", "preventives.shop", "=", "shops.id")
                    ->join("users", "shops.id", "=", "users.shop")
                    ->join("users as assigned", "preventives.user_created", "=", "assigned.id")
                    ->where("preventives.client", "=", '0')
                    ->where("users.id", "=", $user->id)
                    ->where("preventives.status", "=", "Confermato")
                    ->where("orders.status", "=", "Confermato")
//                    ->where("orders.status", "!=", "Fatturato")
                    ->where("orders.invoiced", "=", false)
                    ->where(function ($q) use ($filter) {
                        $q->where('assigned.name', 'like', '%' . $filter . '%')
                            ->orWhere(DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y")'), 'like', '%' . $filter . '%')
                            ->orWhere('orders.status', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.amount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.discount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shopDiscount', 'like', '%' . $filter . '%')
                            ->orWhere('preventives.shipping', 'like', '%' . $filter . '%')
                            ->orWhere('orders.invoiceNo', 'like', '%' . $filter . '%');
                    })
                    ->limit($pageSize)
                    ->offset($pageNumber * $pageSize)
                    ->orderBy($sortBy, $sortType)
                    ->get();
            }
        }

        $response = Datatables::of($orders)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode($response);
    }

    public function retrieveFilteredOrders(Request $request)
    {
        $agentName = $request->agentName;
        $agentId = $request->agentId;

        if ($request->startDate && $request->endDate) {
            $startDate = Carbon::parse($request->startDate)->format('Y-m-d');
            $endDate = Carbon::parse($request->endDate)->format('Y-m-d');
        }

        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];

          $shopOrders= DB::table("preventives")
            ->select(
                "preventives.id", "orders.status as orderStatus", "orders.responsible_user as responsible", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                "preventives.discount", "preventives.shipping", "orders.invoiced"
            )
            ->join("orders", "preventives.id", "=", "orders.preventive_id")
            ->join("shops", "preventives.shop", "=", "shops.id")
            ->join("users", "shops.id", "=", "users.shop")
            ->join("users as assigned", "preventives.user_created", "=", "assigned.id");

        $clientOrders = DB::table("preventives")
            ->select(
                "preventives.id", "orders.status as orderStatus", "orders.responsible_user as responsible", "orders.agent_fee as fee", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                "preventives.discount", "preventives.shipping", "orders.invoiced"
            )
            ->join("orders", "preventives.id", "=", "orders.preventive_id")
            ->join("clients", "preventives.client", "=", "clients.id")
            ->join("shops", "clients.shop", "=", "shops.id")
            ->join("users", "shops.id", "=", "users.shop")
            ->join("users as assigned", "preventives.user_created", "=", "assigned.id");

        $total = DB::table(DB::raw("((" . $clientOrders->toSql() . " WHERE `preventives`.`shop` = 0) UNION (" . $shopOrders->toSql() . ")) as x"))

             ->select([
                'id', 'from', 'date', 'responsible', 'fee', 'formatedDate', 'status', 'orderStatus', 'invoiced',
                'amount', 'client', 'pdf', 'discount', 'shipping', 'invoiceNo'
            ])
            ->where("status", "=", "Confermato");
            if (strtotime($startDate) && strtotime($endDate)) {
                $total = $total
                    ->where(function ($q) use ($agentName, $startDate, $endDate, $agentId) {
                        $q->where('responsible', $agentId)
                            ->where('date', '>=', $startDate)
                            ->where('date', '<=', $endDate);
                })->count('id');
            } else {
                $total = $total
                    ->where(function ($q) use ($agentName, $agentId) {
                        $q->where('responsible', $agentId);
                })->count('id');
            }

         $orders = DB::table(DB::raw("((" . $clientOrders->toSql() . " WHERE `preventives`.`shop` = 0) UNION (" . $shopOrders->toSql() . ")) as x"))

            ->select([
                'id', 'from', 'date', 'responsible', 'fee', 'formatedDate', 'status', 'orderStatus', 'invoiced',
                'amount', 'client', 'pdf', 'discount', 'shipping', 'invoiceNo'
            ])
            ->where("status", "=", "Confermato");
              if (strtotime($startDate) && strtotime($endDate)) {
                $orders = $orders
                    ->where(function ($q) use ($agentName, $startDate, $endDate, $agentId) {
                        $q->where('responsible', $agentId)
                            ->where('date', '>=', $startDate)
                            ->where('date', '<=', $endDate);
                });
            } else {
                $orders = $orders
                    ->where(function ($q) use ($agentName, $agentId) {
                        $q->where('responsible', $agentId);
                });
            }

            $orders
            ->limit($pageSize)
            ->offset($pageNumber * $pageSize)
            ->orderBy($sortBy, $sortType)
            ->get();

            $response = Datatables::of($orders)
                ->setTotalRecords($total)
                ->make(true);

        return json_encode([
            'data' => $response,
            'commissions' => $orders->sum('fee'),
        ]);
    }

    function updateOrderStatus(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Lo stato dell'ordine è stato aggiornato correttamente";

        try {
            $preventive = preventive::find($request->id);
            $order = Order::where("preventive_id", "=", $request->id)->first();
            $user = User::find($preventive->user_created);
            $agent = null;

            if($request->status == "Annulato" && $order->status == "Spedito"){
                $resp->code = 1;
                $resp->message = "L'ordine è già stato spedito, quindi non può essere cancellato.";

                return json_encode($resp);
            }

            if($user->role == "shop") {
                $agentResponsible = User::find(Shop::find($user->shop)->user_assigned);

                if($agentResponsible->role == "manager"){
                    $commision = Helpers::calculateCommision($agentResponsible->commision, $preventive->amount, $preventive->shipping, $user->iva);
//                    $commision = ($agentResponsible->commision / 100) * (($preventive->amount - $user->shipping * (1 + $user->iva / 100)) / (1 + $user->iva / 100));
                    $agent = $agentResponsible;
                }
            }
            else if($user->role == "manager"){
                $commision = Helpers::calculateCommision($user->commision, $preventive->amount, $preventive->shipping, $user->iva);
//                $commision = ($user->commision / 100) * (($preventive->amount - $preventive->shipping * (1 + $user->iva / 100)) / (1 + $user->iva / 100));
                $agent = $user;
            } else {
                $agentResponsible = User::find(Shop::find($preventive->shop)->user_assigned);

                if($agentResponsible->role == "manager") {
                    $commision = Helpers::calculateCommision($agentResponsible->commision, $preventive->amount, $preventive->shipping, $user->iva);
//                    $commision = ($agentResponsible->commision / 100) * (($preventive->amount - $preventive->shipping * (1 + $user->iva / 100)) / (1 + $user->iva / 100));
                    $agent = $agentResponsible;
                }
            }

            if($request->status == "Annulato") {
                $agent->total_commision -= $commision;
                $agent->unpaidCommision -= $commision;

                Order::where('id', $order->id)
                    ->update([
                        'invoiced' => false
                    ]);

                Invoice::where('order_id', $order->id)
                    ->delete();
            }
            else if(($request->status == "Spedito" || $request->status == "Confermato") && $order->status == "Annulato"){
                $agent->total_commision += $commision;
                $agent->unpaidCommision += $commision;
            }

            if($agent != null)
                $agent->save();

            DB::table("orders")
                ->where("preventive_id", "=", $request->id)
                ->update(["status" => $request->status]);
        }
        catch(Exception $ex) {
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'aggiornamento dello stato dell'ordine";
        }

        return json_encode($resp);
    }

    public function updateOrderStatusFromAdmin(Request $request)
    {
        $orderData = (array) $request->status;
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Lo stato dell'ordine è stato aggiornato correttamente";

        try {
            $preventive = preventive::find($request->id);
            $order = Order::where("preventive_id", "=", $request->id)->first();
            $user = User::find($preventive->user_created);
            $agent = null;

            // if ($order->status == "Anullato" && $orderData['orderState'] == "Confermato") {

            // }

            // if ($orderData['orderState'] == 'Confermato') {
            //     DB::table("orders")
            //         ->where("preventive_id", "=", $request->id)
            //         ->update([
            //             "status_from_admin" => 1,
            //             "admin_invoice_no" => $orderData['invoice'],
            //         ]);

            //         Order::where('id', $order->id)
            //             ->update([
            //                 'status' => 'Conferma',
            //                 'invoiced' => true
            //             ]);

            //     $invoice = new Invoice;
            //     $invoice->invoiceNo = $orderData['invoice'];
            //     $invoice->order_id = $order->id;
            //     $invoice->pdf = "";
            //     $invoice->notes = $orderData["notes"] != null ? $orderData["notes"] : "";
            //     $invoice->save();
            // }

            if ($preventive->shop !== 0) {
                $shop = Shop::findOrFail($preventive->shop);
                $preventiveDiscount = $preventive->discount + 0;
            } else {
                $shop = Shop::findOrFail($user->shop);
                $preventiveDiscount = $preventive->shopDiscount + 0;
            }
                $agentMatrices = AgentMatrix::findOrFail($shop->discount_id);

                if ($agentMatrices->discount !== $preventiveDiscount) {
                    $agentMatrices = AgentMatrix::where('discount', $preventiveDiscount)->first();
                }

                $agentResponsible = User::find($shop->user_assigned);

                $commision = Helpers::calculateCommision($preventive->base_price, $agentMatrices->discount, $agentMatrices->agent_fee);

                $order = Order::where('preventive_id', $request->id)->first();

                if($orderData['orderState'] == "Anullato" && $order->status == "Confermato") {
                    if($agentResponsible->role == "manager") {
                        $agentResponsible->total_commision -= round($commision, 2);
                        $agentResponsible->unpaidCommision -= round($commision, 2);

                        Order::where('id', $order->id)
                            ->update([
                                'status' => 'Anullato',
                                'agent_fee' => 0,
                            ]);

                        $agentResponsible->save();
                    }


                    $resp->message = "Questo ordine è stato annullato";
                    $resp->code = 0;

                    return json_encode($resp);
                }

            if ($order->status == "Anullato" && $orderData['orderState'] == "Confermato") {
                if($agentResponsible->role == "manager") {
                    $agentResponsible->total_commision += round($commision, 2);
                    $agentResponsible->unpaidCommision += round($commision, 2);

                    Order::where('id', $order->id)
                        ->update([
                            'status' => 'Conferma',
                            'agent_fee' => 0,
                        ]);

                    $agentResponsible->save();
                }
            }

            if ($orderData['orderState'] == 'Confermato') {
                DB::table("orders")
                    ->where("preventive_id", "=", $request->id)
                    ->update([
                        "status_from_admin" => 1,
                        "admin_invoice_no" => $orderData['invoice'],
                    ]);

                    Order::where('id', $order->id)
                        ->update([
                            'status' => 'Conferma',
                            'invoiced' => true
                        ]);

                $invoice = new Invoice;
                $invoice->invoiceNo = $orderData['invoice'];
                $invoice->order_id = $order->id;
                $invoice->pdf = "";
                $invoice->notes = $orderData["notes"] != null ? $orderData["notes"] : "";
                $invoice->save();
            }


            $shopData = new stdClass();
            $clientData = new stdClass();
            $admin = User::where("role", "=", "admin")->first();
            $configs = Configurations::first();
            $admin['p_iva'] = $configs->p_iva;
            $admin['address'] = $configs->address;
            $admin['website'] = $configs->website;

            if(Order::where("invoiceNo", $orderData['invoice'])->first()) {
                $resp->message = "Questo numero di conferma d’ordine esiste già!";
                $resp->code = 1;

                return json_encode($resp);
            }

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
                $clientData->p_iva = $clientObj->p_iva;
            }

            $shipping = $preventive->shipping;

            $preventiveCreated = User::where('id', $preventive->user_created)->first();

            $data = [
                'products' => $products,
                'shop' => $shopData,
                'admin' => $admin,
                'client' => $clientData,
                'clientPiva' => $clientData->p_iva ? $clientData->p_iva : 'Indefinito',
                'preventiveCreated' => $preventiveCreated,
                'preventiveReference' => $preventive->reference,
                'iva' => $admin->iva,
                'userIva' => $userIva,
                'invoiceNo' => $orderData['invoice'],
                'date' => date_format($preventive->created_at, "d/m/Y"),
                'markup' => $preventive->markup,
                'discount' => $products[0]->shopDiscount,
                'notes' => $orderData['notes'],
                'image' => $user->image,
                'shipping' => $shipping,
                'footer' => Configurations::first(),
            ];

            $path = '/documents/invoices/invoice_' . $invoice->id . 'token'.uniqid().'.pdf';
            PDF::loadView('invoice', $data)->save(public_path($path));
            $invoiceEdit = Invoice::find($invoice->id);
            $invoiceEdit->pdf = $path;
            $invoiceEdit->save();


            $path1 = '/documents/invoices/admin_invoice_' . $order->id . 'token'.uniqid().'.pdf';
            $pdf = PDF::loadView('order', $data)->save(public_path($path1));

            $orderEdit = Order::find($order->id);
            $orderEdit->admin_invoice_pdf = $path1;
            $orderEdit->admin_invoice_notes = $orderData['notes'];

            $orderEdit->save();
            $doc_path1 = public_path($preventive->pdf);

            if (File::exists($doc_path1)) {
                File::delete($doc_path1);
            }

        } catch(Exception $ex) {
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'aggiornamento dello stato dell'ordine";
        }

        return json_encode($resp);
    }

    function createInvoice(Request $request) {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Lo stato dell'ordine è stato aggiornato correttamente";

        try {
            $shopData = new stdClass();
            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
            $shop = Shop::where('id', $user->shop)->first();

            $shopUsr =  User::where("shop", "=", $shop->id)->first();
            $userIva = $shopUsr->iva;

            $shopData->name = $user->name;
            $shopData->email = $user->email;
            $shopData->phone = $user->phone_number;
            $shopData->address = $shop->address;
            $shopData->iva = $shop->iva;
            $confirmationOrderNote = $shop->confirmation_order_note;

            if(Invoice::where("invoiceNo", $request->data["invoice"])->first()) {
                $resp->message = "Questo numero di conferma d’ordine esiste già!";
                $resp->code = 1;

                return json_encode($resp);
            }

            $order = Order::where('preventive_id', $request->id)
                ->first();

            DB::table("orders")
                ->where("preventive_id", "=", $request->id)
                ->update(["invoiced" => true]);
//            ->update(["status" => "Fatturato"]);

            $invoice = new Invoice;
            $invoice->invoiceNo = $request->data["invoice"];
            $invoice->order_id = $order->id;
            $invoice->pdf = "";
            $invoice->notes = $request->data["notes"] != null ? $request->data["notes"] : "";
            $invoice->save();

            $prev = new preventive();
            $preventive = preventive::find($request->id);

            $shopData->iva_shipping = $preventive->iva_shipping;
            $shopData->iva_home_service = $preventive->iva_home_service;

            $products = $prev->preventiveData($request->id);
            $client = client::find(preventive::find($request->id)->client);
            $preventiveCreated = User::where('id', $preventive->user_created)->first();

            $data = [
                'products' => $products,
                'name' => $client->name,
                'phone' => $client->phone,
                'email' => $client->email,
                'clientPiva' => $client->p_iva ? $client->p_iva : 'Indefinito',
                'address' => $client->address,
                'iva' => $user->iva,
                'image' => $user->image,
                'userIva' => $userIva,
                'shipping' => $preventive->shopShipping,
                'markup' => $preventive->markup,
                'discount' => $products[0]->shopDiscount,
                'invoiceNo' => $request->data["invoice"],
                'preventiveCreated' => $preventiveCreated,
                'preventiveReference' => $preventive->reference,
                'date' => date_format($invoice->created_at, "d/m/Y"),
                'pdfFooter' => $shop->pdfFooter,
                'notes' => $invoice->notes,
                'image' => $user->image,
                'shop' => $shopData,
                'confirmation_order_note' => $confirmationOrderNote,
            ];
            // return $data;
            $path = '/documents/invoices/invoice_' . $invoice->id . 'token'.uniqid().'.pdf';
            PDF::loadView('invoice', $data)->save(public_path($path));
            $invoiceEdit = Invoice::find($invoice->id);
            $invoiceEdit->pdf = $path;
            $invoiceEdit->save();
        }
        catch(Exception $ex){
            $resp->code = 1;
            $resp->message = "Si è verificato un errore durante l'aggiornamento dello stato dell'ordine";
        }

        return json_encode($resp);
    }

    function deleteOrder(Request $request){
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "L'ordine è stato cancellato con successo";

        try{
            $order = Order::where('orders.preventive_id', '=', $request->id)->first();
            $doc_path = public_path($order->pdf);

            DB::table('orders')
                ->where('orders.preventive_id', '=', $request->id)
                ->delete();

            DB::table('products')
                ->where('products.preventive', '=', $request->id)
                ->delete();

            DB::table('preventives')
                ->where('preventives.id', '=', $request->id)
                ->delete();

            if (File::exists($doc_path)) {
                File::delete($doc_path);
            }
        }
        catch(Exception $ex){
            $resp->code = 1;
            $resp->message = $ex->getMessage();//"Si è verificato un errore durante l'eliminazione dell'ordine";
        }

        return json_encode($resp);
    }

    function updateInvoiceShop(Request $request)
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
            $preventive->status = $request->status;
            $preventive->save();
            Order::where('preventive_id', $request->id)->delete();

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

                // $path1 = '/documents/orders/order_' . $order->id . 'token' . uniqid() . '.pdf';
                // $pdf = PDF::loadView('order', $data)->save(public_path($path1));

                $orderEdit = Order::find($order->id);
                // $orderEdit->pdf = $path1;

                if ($user->role == "shop") {
                    $path2 = '/documents/orders/order_shop_' . $order->id . 'token' . uniqid() . '.pdf';
                    $pdf = PDF::loadView('shopOrder', $data)->save(public_path($path2));

                    $orderEdit->pdfShop = $path2;
                    $doc_path2 = public_path($preventive->pdfShop);

                    if (File::exists($doc_path2)) {
                        File::delete($doc_path2);
                    }

                }

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

}
