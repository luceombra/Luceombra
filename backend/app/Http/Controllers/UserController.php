<?php

namespace App\Http\Controllers;

use File;
use Mail;
use Image;
use JWTAuth;
use stdClass;
use App\User;
use DateTime;
use Carbon\Carbon;
use PHPUnit\Exception;
use App\Configurations;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\PasswordReset;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UserController extends Controller
{
    use ResetsPasswords;

    public function authenticate(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'invalid_credentials'], 400);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }

        $token = compact('token');

        DB::table('users')
            ->where('email', '=', $request->email)
            ->update(
                [
                    'token' => $token['token'],
                ]
            );

        $user = DB::table('users')
            ->where('email', '=', $request->email)
            ->get();

        $userShopId = json_decode(trim($user, '[]'))->shop;

        if ($userShopId > 0) {
            $userShop = DB::table('shops')
                ->where('id', $userShopId)
                ->where('status', true)
                ->get();

            if (count($userShop) == 0) {
                return response()->json(['error' => 'your_shop_is_disabled']);
            } else {
                return response()->json($user[0], 200);
            }
        }
            return response()->json($user[0], 200);

        // return response()->json(compact('token'));
    }

    public function getUsers(Request $request)
    {
        $filter = $request->tableConfigs["filter"];
        $pageSize = $request->tableConfigs["pageSize"];
        $pageNumber = $request->tableConfigs["pageNumber"];
        $sortBy = $request->tableConfigs["field"];
        $sortType = $request->tableConfigs["sortOrder"];

        $total = DB::table("users")
            ->where("users.role", "=", "admin")
            ->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%' . $filter . '%')
                    ->orWhere('users.email', 'like', '%' . $filter . '%')
                    ->orWhere('users.iva', 'like', '%' . $filter . '%')
                    ->orWhere('users.phone_number', 'like', '%' . $filter . '%');
            })
            ->count('users.id');

        $clients = DB::table("users")
            ->select(
                "users.id", 'users.name', "users.email", "users.phone_number", "users.image",
                "users.iva", "superAdmin"
            )
            ->where("users.role", "=", "admin")
            ->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%' . $filter . '%')
                    ->orWhere('users.email', 'like', '%' . $filter . '%')
                    ->orWhere('users.iva', 'like', '%' . $filter . '%')
                    ->orWhere('users.phone_number', 'like', '%' . $filter . '%');
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

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }


        $user = User::create([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'password' => Hash::make($request->get('password')),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json(compact('user', 'token'), 201);
    }

    public function getAuthenticatedUser()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['user_not_found'], 404);
            }

        } catch (Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {

            return response()->json(['token_expired'], $e->getStatusCode());

        } catch (Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {

            return response()->json(['token_invalid'], $e->getStatusCode());

        } catch (Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['token_absent'], $e->getStatusCode());
        }

        return response()->json(compact('user'));
    }

    public function recover(Request $request)
    {
        $email = $request->email;

        $user = User::where('email', $email)->first();
        if ($user == null) {
            $error_message = "Your email address was not found.";
            return response()->json(['success' => false, 'error' => $error_message]);
        }
        try {

            $name = $user->name;

            do{
                $token = str_random(60);
            } while(DB::table('password_resets')->where('token', '=', $token)->first() != null);

            DB::table('password_resets')->insert([
                'email' => $email,
                'token' => $token,
                'created_at' => Carbon::now()
            ]);

            $url = env('APP_URL','http://tende.rtechno-labs.com:8080');
            $fullUrl = "http://tende.rtechno-labs.com:8080/#/newPass/" . $token;

            $data = [
                "name" => $user->name,
                "link" => $fullUrl
            ];

            Mail::send('reset', $data, function($message) use ($email, $name){
                $message->to($email, $name)
                    ->subject("Reimpostazione della password");
            });

        } catch (\Exception $e) {
            $error_message = $e->getMessage();
            return response()->json(['success' => false, 'error' => $error_message]);
        }
        return response()->json([
            'success' => true, 'message' => 'È stata inviata un\'email di reset! Si prega di controllare la tua email.'
        ]);
    }

    public function generate(Request $request)
    {
        $response = new stdClass();
        $response->success = true;
        $response->message = "Una email viene inviata nel tuo account con la nuova password generata!";

        try{

            $tokenData = DB::table('password_resets')
                ->where('token', $request->token)
                ->orderBy("created_at", "desc")
                ->first();

            if($tokenData == null){
                $response->success = false;
                $response->message = "Token non trovato!";

                return json_encode($response);
            }

            $start_date = $tokenData->created_at;
            $now = Carbon::now();

            $from = Carbon::createFromFormat('Y-m-d H:s:i', $start_date);
            $to = Carbon::createFromFormat('Y-m-d H:s:i', $now);

            $minutes = $to->diffInMinutes($from);

            if($minutes > 60){
                $response->success = false;
                $response->message = "Token è scaduto!";

                return json_encode($response);
            }

            $usrClass = new User();
            $password = $usrClass->random_str(6, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*_-");

            $user = User::where("email", $tokenData->email)->first();
            $user->password = Hash::make($password);
            $user->token = "";
            $user->save();

            $data = [
                "name" => $user->name,
                "password" => $password
            ];

            $email = $tokenData->email;
            $name = $user->name;

            Mail::send('generate', $data, function($message) use ($email, $name){
                $message->to($email, $name)
                    ->subject("Reimpostazione della password");
            });
        }
        catch(Exception $ex){
            $response->success = false;
            $response->message = $ex->getMessage();//"si è verificato un errore durante il tentativo di generare la nuova password"
        }

        return json_encode($response);
    }

    public function getShopData(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);

            $shop = DB::table("shops")
                ->select("assigned.name", "shops.address", "shops.pdfFooter", "shops.confirmation_order_note", "shops.iva", 'shops.iva_home_service', "shops.discount_id", "matrix.discount")
                ->join("users", "users.shop", "=", "shops.id")
                ->join("users as assigned", "assigned.id", "=", "shops.user_assigned")
                ->leftJoin("agent_matrices as matrix", "matrix.id", "=", "shops.discount_id")
                ->where("users.id", "=", $user->id)
                ->first();
        } catch (Exception $ex) {
            $shop = null;
        }

        return json_encode($shop);
    }

    public function updateProfile(Request $request)
    {
        $response = new stdClass();
        $response->code = 0;
        $response->message = "Il profilo dell'utente è stato aggiornato correttamente!";

        try {
            $validator = Validator::make(
                array(
                    'image' => $request->image,
                    'fullName' => $request->fullName,
                    'email' => $request->email,
                    'iva' => $request->iva,
                    'iva_shipping' => $request->iva_shipping,
                    'piva' => $request->piva,
                    // 'markup' => $request->markup
                ),
                array(
                    'image' => 'nullable|mimes:jpeg,jpg,png,gif|max:100000',
                    'fullName' => 'required',
                    'email' => 'required|email',
                    'iva' => 'required',
                    'iva_shipping' => 'required',
                    // 'markup' => 'required'
                ),
                array(
                    'image.image' => 'Il file deve essere un\'immagine!',
                    'fullName.required' => 'Il nome non può essere nullo!',
                    'email.required' => 'Il email non può essere nullo!',
                    'email.email' => 'Il formato email non è valido!',
                    'iva' => 'Iva non può essere nullo!',
                    'iva_shipping' => 'Iva spedizione non può essere nullo!',
                    'piva' => 'P.Iva non può essere nullo!',
                    // 'markup' => 'Markup non può essere nullo!'
                )
            );

            if($request->address == null){
                $request->address = "";
            }

            if($request->pdfFooter == null){
                $request->pdfFooter = "";
            }

            if($request->confirmation_order_note == null){
                $request->confirmation_order_note = "";
            }

            if($request->phone == null){
                $request->phone = "";
            }

            if($request->zone_covered == null){
                $request->zone_covered = "";
            }

            if (count($validator->errors()->messages()) > 0) {
                $response->code = 1;
                $response->message = $validator->errors()->first();

                return json_encode($response);
            }

            $image = "";

            if ($request->hasFile('image')) {
                $fileUpload = $request->image;
                $image = time() . '.' . $fileUpload->getClientOriginalExtension();
                $path = public_path('/images/users/' . $image);
                Image::make($fileUpload)->resize(400, 400, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })->save($path);

                $image = '/images/users/' . $image;
            }

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);

            if(User::where("email", $request->email)->where("id", "!=", $user->id)->first()){
                $response->code = 1;
                $response->message = "Questa e-mail è già in uso!";

                return json_encode($response);
            }

            if ($user->role == "admin") {
                DB::table("users")
                    ->where('id', $user->id)
                    ->update([
                        "iva" => $request->iva,
                        "iva_shipping" => $request->iva_shipping,
                    ]);

                DB::table("configurations")
                    ->update([
                        "admin_footer" => $request->pdfFooter,
                        "confirmation_order_note" => $request->confirmation_order_note,
                        "p_iva" => $request->piva,
                        "address" => $request->address,
                        "website" => $request->website,
                    ]);

                if ($image == "") {
                    DB::table("users")
                        ->where("id", "=", $user->id)
                        ->update([
                            'name' => $request->fullName,
                            'email' => $request->email,
                            'phone_number' => $request->phone
                        ]);
                } else {
                    $image_path = public_path($user->image);

                    if (File::exists($image_path) && ($user->image != "/images/users/user.jpg")) {
                        File::delete($image_path);
                    }

                    DB::table("users")
                        ->where("id", "=", $user->id)
                        ->update([
                            'name' => $request->fullName,
                            'email' => $request->email,
                            'phone_number' => $request->phone,
                            'image' => $image
                        ]);
                }

            } else if ($user->role == "manager") {
                if ($image == "") {
                    DB::table("users")
                        ->where("id", "=", $user->id)
                        ->update([
                            'name' => $request->fullName,
                            'email' => $request->email,
                            'phone_number' => $request->phone,
                            'zone_covered' => $request->zone_covered
                        ]);
                } else {
                    $image_path = public_path($user->image);

                    if (File::exists($image_path) && ($user->image != "/images/users/user.jpg")) {
                        File::delete($image_path);
                    }

                    DB::table("users")
                        ->where("id", "=", $user->id)
                        ->update([
                            'name' => $request->fullName,
                            'email' => $request->email,
                            'phone_number' => $request->phone,
                            'image' => $image,
                            'zone_covered' => $request->zone_covered
                        ]);
                }
            } else if ($user->role == "shop") {
                if ($image == "") {
                    DB::table("users")
                        ->where("id", "=", $user->id)
                        ->update([
                            'name' => $request->fullName,
                            'email' => $request->email,
                            'phone_number' => $request->phone,
                            'commision' => $request->markup,
                            'iva' => $request->iva,
                            'iva_shipping' => $request->iva_shipping
                        ]);
                } else {
                    $image_path = public_path($user->image);

                    if (File::exists($image_path) && ($user->image != "/images/users/user.jpg")) {
                        File::delete($image_path);
                    }

                    DB::table("users")
                        ->where("id", "=", $user->id)
                        ->update([
                            'name' => $request->fullName,
                            'email' => $request->email,
                            'phone_number' => $request->phone,
                            'image' => $image,
                            'commision' => $request->markup,
                            'iva' => $request->iva,
                            'iva_shipping' => $request->iva_shipping,
                        ]);
                }

                DB::table("shops")
                    ->where("id", "=", $user->shop)
                    ->update([
                        "address" => $request->address,
                        "iva" => $request->piva,
                        'iva_home_service' => $request->iva_home_service,
                        "pdfFooter" => $request->pdfFooter,
                        "confirmation_order_note" => $request->confirmation_order_note
                    ]);
            }


            $response->user = User::find($user->id);
            $response->address = $request->address;
            $response->iva = $request->piva;
            $response->iva_shipping = $request->iva_shipping;
            $response->iva_home_service = $request->iva_home_service;
            $response->pdfFooter = $request->pdfFooter;
            $response->confirmation_order_note = $request->confirmation_order_note;
        } catch (Exception $ex) {
            $response->code = 1;
            $response->message = "Il profilo dell'utente non è stato aggiornato correttamente!";
        }

        return json_encode($response);
    }

    public function updatePassword(Request $request)
    {
        $response = new stdClass();
        $response->code = 0;
        $response->message = "La password è stata aggiornata correttamente!";

        try {
            $validator = Validator::make(
                array('pass' => $request->newPassword),
                array('pass' => 'required|string|min:6|regex:/^.*(?=.{3,})(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\d\X])(?=.*[!$#%@]).*$/'),
                array('pass' => 'Si prega di inserire un formato di password valido!')
            );

            if (count($validator->errors()->messages()) > 0) {
                $response->code = 1;
                $response->message = "Si prega di inserire un formato di password valido!";
                return json_encode($response);
            }

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);

            $credentials = array(
                "email" => $user->email,
                "password" => $request->oldPassword
            );

            if (JWTAuth::attempt($credentials)) {
                User::where('id', $user->id)
                    ->update([
                        "password" => Hash::make($request->newPassword)
                    ]);

                $response->data = User::find($user->id);
            } else {
                $response->code = 1;
                $response->message = "La vecchia password non è corretta!";
            }
        } catch (Exception $ex) {
            $response->code = 1;
            $response->message = "La password non è stata aggiornata correttamente!";
        }

        return json_encode($response);
    }

    public function retrieveAssignees() {
        return json_encode(DB::table("users")->select("id", "name")
            ->where("role", "=", "admin")
            ->orWhere("role", "=", "manager")
            ->get());
    }

    public function forgotPassword(Request $request)
    {
        if (!User::query()->where('email', $request->email)->first()) {
            throw new BadRequestHttpException('This E-mail is not valid !');
        }
        $this->broker()->sendResetLink($request->only('email'));

        return json_encode('Please, check your e-mail ! ');
    }

    public function getCurrentUserData(Request $request){
        $token = $request->bearerToken();
        $user = JWTAuth::toUser($token);

        return json_encode(User::find($user->id));
    }

    public function getConfigurations(Request $request){
        return json_encode(Configurations::first());
    }

    public function doReset(Request $request)
    {
        return json_encode($request);
    }

    protected function resetPassword($user, $password)
    {
        $user->password = Hash::make($password);
        $user->setRememberToken(Str::random(60));
        $user->save();
        $user->notify(new PasswordResetNotification($password));
        Event(new PasswordReset($user));

    }

    protected function sendResetResponse($response)
    {
        return json_encode('Password reset successful');
    }

    /**
     * @param Request $request
     * @param $response
     * @return mixed
     */
    protected function sendResetFailedResponse(Request $request, $response)
    {
        return json_encode('Token invalid');
    }

    public function create(Request $request)
    {
        $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
            if (!$user->superAdmin){
                $resp = new stdClass();
                $resp->code = 1;
                $resp->message = "SuperAdmin prevale per questa azione!";
                return json_encode($resp);
            }

        $check = DB::table('users')
        ->select('id')
        ->where('email', $request->email)
        ->first();
    if ($check){
        $resp = new stdClass();
        $resp->code = 1;
        $resp->message = "L'email deve essere unica!";
        return json_encode($resp);
    }
        $image = $request->url;  // your base64 encoded
        // $image = str_replace('data:image/png;base64,', '', $image);
        $imageName = "user.jpg";
        if ($image){
            $image = str_replace(' ', '+', $image);
            $imageName = $request->image;
            \Image::make($image)->save(public_path('images')."/".$imageName);
        }
        $usrClass = new User();
        $password = $usrClass->random_str(6, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*_-");

        $insert = DB::table('users')->insertGetId(
            [
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number ? $request->phone_number: "",
                'iva' => $request->iva,
                'role' => 'admin',
                'password' => Hash::make($password),
                'token' => "",
                'shipping' => 0,
                'total_commision' => 0,
                'shop' => 0,
                'zone_covered' => "",
                'commision' => 0,
                'image' => "/images/".$imageName,
            ]
        );
        $data = [
            "name" => $request->name,
            "password" => $password
        ];

        $email = $request->email;
        $name = $request->name;

        Mail::send('mail', $data, function($message) use ($email, $name){
            $message->to($email, $name)
                ->subject("Password Preventivatore");
        });
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Admin creato con successo";
        return json_encode($resp);
    }

    function updateUser(Request $request){
        $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
        if (!$user->superAdmin){
            $resp = new stdClass();
            $resp->code = 1;
            $resp->message = "SuperAdmin prevale per questa azione!";

            return json_encode($resp);
        }
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Admin aggiornato correttamente!";
            try{
                $check = DB::table('users')
                    ->select('id')
                    ->where('email', $request->email)
                    ->where('id','!=', $request->id)
                    ->first();
                if ($check){

                    $resp = new stdClass();
                    $resp->code = 1;
                    $resp->message = "L'email deve essere unica!";
                    return json_encode($resp);
                }
                $image = $request->url;  // your base64 encoded
                // $image = str_replace('data:image/png;base64,', '', $image);
                $imageName = "";
                if ($image){
                    $image = str_replace(' ', '+', $image);
                    $imageName = $request->image;
                    \Image::make($image)->save(public_path('images')."/".$imageName);
                DB::table('users')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'email' => $request->email,
                        'phone_number' => $request->phone_number ? $request->phone_number: "",
                        'iva' => $request->iva,
                        'image' => "/images/".$imageName,
                    ]);
                } else {
                    DB::table('users')
                    ->where('id', '=', $request->id)
                    ->update([
                        'name' => $request->name,
                        'email' => $request->email,
                        'phone_number' => $request->phone_number ? $request->phone_number: "",
                        'iva' => $request->iva,
                    ]);
                }

            }
            catch(\Exception $ex){
                $resp->code = 1;
                $resp->message = "Si è verificato un errore durante l'aggiornamento dei dati";
            }
        return json_encode($resp);
    }

    public function deleteUser(Request $request)
    {
        $resp = new stdClass();
        $resp->code = 0;
        $resp->message = "Admin è stato cancellato con successo!";

        try {

            $token = $request->bearerToken();
            $user = JWTAuth::toUser($token);
            if (!$user->superAdmin){
                $resp->code = 1;
                $resp->message = "SuperAdmin prevale per questa azione!";

                return json_encode($resp);
            }

            $userToDelete = User::find($request->id);
            if ($userToDelete->superAdmin){
                $resp->code = 1;
                $resp->message = "Non puoi cancellare un amministratore!";

                return json_encode($resp);
            }

            $userToDelete->delete();

        } catch (Exception $ex) {
            $resp->code = 1;
            $resp->message = "L'agente non è stato cancellato con successo!";
        }

        return json_encode($resp);
    }

    public function getAdmin()
    {
        return response()
            ->json(User::where(['superAdmin' => 1, 'role' => 'admin'])->first());
    }
}
