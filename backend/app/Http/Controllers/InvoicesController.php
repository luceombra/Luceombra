<?php

namespace App\Http\Controllers;

use App\Cart;
use App\Invoice;
use App\Order;
use App\preventive;
use App\Products;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use JWTAuth;
use File;
use stdClass;
use Yajra\DataTables\Facades\DataTables;

class InvoicesController extends Controller
{
    function getInvoices(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];

        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        $total = DB::table("preventives")
            ->join("orders", "preventives.id", "=", "orders.preventive_id")
            ->join("invoices", "invoices.order_id", "=", "orders.id")
            ->join("clients", "preventives.client", "=", "clients.id")
            ->join("shops", "clients.shop", "=", "shops.id")
            ->join("users", "shops.id", "=", "users.shop")
            ->where("users.id", "=", $user->id)
            ->where("preventives.status", "=", "Confermato")
           ->where("orders.status", "=", "Conferma")
            ->where("orders.invoiced", "=", true)
            ->where(function ($q) use ($filter) {
                $q->where('invoices.invoiceNo', 'like', '%' . $filter . '%')
                    ->orWhere('clients.name', 'like', '%' . $filter . '%');
            })
            ->count('invoices.id');

        $preventives = DB::table("preventives")
            ->select(
                "invoices.id", 'invoices.invoiceNo', "clients.name as client", "preventives.id as preventive_id", "invoices.pdf", "orders.pdf as adminPdf"
            )
            ->join("orders", "preventives.id", "=", "orders.preventive_id")
            ->join("invoices", "invoices.order_id", "=", "orders.id")
            ->join("clients", "preventives.client", "=", "clients.id")
            ->join("shops", "clients.shop", "=", "shops.id")
            ->join("users", "shops.id", "=", "users.shop")
            ->where("users.id", "=", $user->id)
            ->where("preventives.status", "=", "Confermato")
           ->where("orders.status", "=", "Conferma")
            ->where("orders.invoiced", "=", true)
            ->where(function ($q) use ($filter) {
                $q->where('invoices.invoiceNo', 'like', '%' . $filter . '%')
                    ->orWhere('clients.name', 'like', '%' . $filter . '%');
            })
            ->limit($pageSize)
            ->offset($pageNumber * $pageSize)
            ->orderBy($sortBy, $sortType)
            ->get();

        $response = Datatables::of($preventives)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode($response);
    }

    public function getAdminInvoices(Request $request)
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
                    "preventives.id", "orders.status as orderStatus", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                    "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                    "preventives.discount", "preventives.shipping", "orders.invoiced", "orders.status_from_admin as adminStatus", "orders.admin_invoice_no as adminInvoiceNo", "orders.admin_invoice_pdf as adminInvoicePdf", "orders.admin_invoice_notes as adminInvoiceNotes"
                )
                ->join("orders", "preventives.id", "=", "orders.preventive_id")
                ->join("shops", "preventives.shop", "=", "shops.id")
                ->join("users", "shops.id", "=", "users.shop")
                ->join("users as assigned", "preventives.user_created", "=", "assigned.id");

            $clientOrders = DB::table("preventives")
                ->select(
                    "preventives.id", "orders.status as orderStatus", 'preventives.date', DB::raw('DATE_FORMAT(preventives.date, "%d-%m-%Y") as formatedDate'),
                    "preventives.status", "assigned.name as from", "preventives.amount", "users.name as client", "orders.pdf", "orders.invoiceNo",
                    "preventives.discount", "preventives.shipping", "orders.invoiced", 'orders.status_from_admin as adminStatus', "orders.admin_invoice_no as adminInvoiceNo", "orders.admin_invoice_pdf as adminInvoicePdf", "orders.admin_invoice_notes as adminInvoiceNotes"
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
                    'amount', 'client', 'pdf', 'discount', 'shipping', 'invoiceNo', 'adminInvoiceNo', 'adminInvoicePdf', 'adminInvoiceNotes'
                ])
                ->where("status", "=", "Confermato")
                ->where("adminStatus", "=", 1)
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
                    'amount', 'client', 'pdf', 'discount', 'shipping', 'invoiceNo', 'adminInvoiceNo', 'adminInvoicePdf', 'adminInvoiceNotes'
                ])
                ->where("status", "=", "Confermato")
                ->where("adminStatus", "=", 1)
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
        }

        $response = Datatables::of($orders)
            ->setTotalRecords($total)
            ->make(true);

        return json_encode($response);
    }


    function deleteInvoice(Request $request) {

        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "La conferma d’ordine è stata cancellata con successo!";

        try {

            $order = Order::where('preventive_id', $request->id)->first();
            if ($order) {
                $order->delete();
            }

            $invoice = DB::table("invoices")
                ->select("orders.id as orderId", "preventives.id as preventiveId", "invoices.pdf as invoicePdf")
                ->join("orders", "orders.id", "=", "invoices.order_id")
                ->join("preventives", "preventives.id", "=", "orders.preventive_id")
                ->where("invoices.id", "=", $request->id)
                ->first();

            if($invoice){
                $doc_path = public_path($invoice->invoicePdf);
                $order = $invoice->orderId;
                $preventive = $invoice->preventiveId;

                DB::table('invoices')
                    ->where('invoices.id', '=', $request->id)
                    ->delete();

                DB::table('orders')
                    ->where('orders.id', '=', $order)
                    ->delete();

                DB::table('products')
                    ->where('products.preventive', '=', $preventive)
                    ->delete();

                DB::table('preventives')
                    ->where('preventives.id', '=', $preventive)
                    ->delete();

                if (File::exists($doc_path)) {
                    File::delete($doc_path);
                }
            }
        }
        catch(Exception $ex){
            $resp->code = 1;
            $resp->message = "La conferma d’ordine non è stata cancellata con successo!";
        }

        return json_encode($resp);
    }
}
