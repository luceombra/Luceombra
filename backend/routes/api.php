<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

//Route::middleware('auth:api')->get('/user', function (Request $request) {
//    return $request->user();
//});

Route::post('register', 'UserController@register');
Route::post('login', 'UserController@authenticate');
Route::post('/reset', 'UserController@recover');
Route::post('/generate', 'UserController@generate');
Route::post('/password/reset', 'UserController@recover')->name('password.reset');
Route::get('open', 'DataController@open');




Route::group(['middleware' => ['jwt.verify']], function() {
    Route::get('user', 'UserController@getAuthenticatedUser');
    Route::post('updatePass', 'UserController@updatePassword');
    Route::post('updateProfile', 'UserController@updateProfile');
    Route::get('getShopData', 'UserController@getShopData');
    Route::get('retrieveAssignees', 'UserController@retrieveAssignees');
    Route::get('getCurrentUser', 'UserController@getCurrentUserData');
    Route::get('getConfigurations', 'UserController@getConfigurations');

    Route::get('closed', 'DataController@closed');

    //get all systems avaiable
    Route::get('systems', 'SystemController@index');
    Route::get('system/{id}', 'SystemController@show');
    Route::post('createSystem/', 'SystemController@create');
    Route::post('getSystems', 'SystemController@getAllSystems');
    Route::post('deleteSystem', 'SystemController@deleteSystem');
    Route::post('updateSystem', 'SystemController@update');
    Route::get('getSystemLines/{id}', 'SystemController@getSystemLines');

    //get all system colors avaible
    Route::get('system_colors/{SystemId}', 'SystemColorController@indexBySystemId');
    Route::get('system_color/{id}', 'SystemColorController@show');
    Route::get('allSystemColors/', 'SystemColorController@index');
    Route::post('system_color/', 'SystemColorController@create');
    Route::post('updateSystemColor/', 'SystemColorController@update');
    Route::post('deleteSystemColor/', 'SystemColorController@delete');

    //get all curtains from system
    Route::get('system_curtains/{SystemId}', 'CurtainController@indexBySystemId');
    Route::post('getCurtains', 'CurtainController@getAllSystems');
    Route::post('getMatrixFiltered', 'CurtainController@getMatrixFiltered');
    Route::get('system_curtain/{id}', 'CurtainController@show');
    Route::get('system_curtain_data/{id}', 'CurtainController@show_data');
    Route::post('createCurtain', 'CurtainController@create');
    Route::post('deleteCurtain', 'CurtainController@deleteSystem');
    Route::post('updateCurtain', 'CurtainController@update');
    Route::post('curtain/uploadOrMarkup', 'CurtainController@uploadOrMarkup');
    Route::get('getCurtainLines/{id}', 'CurtainController@getSystemLines');
    Route::get('markup', 'CurtainController@getMarkup');

    //get all curtain colors
    Route::get('curtain_colors/{CurtainId}', 'CurtainColorController@indexByCurtainId');
    Route::get('curtain_color/{id}', 'CurtainColorController@show');
    Route::get('allCurtainColors/', 'CurtainColorController@index');
    Route::post('curtain_color/', 'CurtainColorController@create');
    Route::post('updateCurtainColor/', 'CurtainColorController@update');
    Route::post('deleteCurtainColor/', 'CurtainColorController@delete');

    //get draft products
    Route::get('product/{UserId}', 'ProductController@indexByUserId');
    Route::get('getProductData/{productId}', 'ProductController@getProductData');
    Route::get('getNonPreventivedProduct/{productId}', 'ProductController@getNonPreventivedProductData');

    //update draft products
    Route::put('product/{UserId}', 'ProductController@updateByUserId');

    // Dimensions
    Route::post('dimensions', 'DimensionsController@getPriceType');
    Route::post('getHeight', 'DimensionsController@getCorrespondingHeight');
    Route::post('getWidth', 'DimensionsController@getCorrespondingWidth');
    Route::post('getPrice', 'DimensionsController@getPrice');

    //Type Motion
    Route::get('typeMotion/{systemId}', 'SystemMotionTypeController@indexBySystemId');

    //Type Motor
    Route::get('typeMotor/{systemId}', 'SystemMotorTypeController@indexBySystemId');
    Route::get('typeMotor/', 'SystemMotorTypeController@index');
    Route::post('typeMotor/', 'SystemMotorTypeController@create');
    Route::post('updateTypeMotor/', 'SystemMotorTypeController@update');
    Route::post('deleteTypeMotor/', 'SystemMotorTypeController@delete');

    //Type Chain
    Route::get('typeChain/{systemId}', 'SystemChainTypeController@indexBySystemId');
    Route::get('typeChain/', 'SystemChainTypeController@index');
    Route::post('typeChain/', 'SystemChainTypeController@create');
    Route::post('updateTypeChain/', 'SystemChainTypeController@update');
    Route::post('deleteTypeChain/', 'SystemChainTypeController@delete');

    //Type Telecomand
    Route::get('typeTelecomand/{motorId}', 'TelecomandController@indexBymotorId');
    Route::get('typeTelecomand/', 'TelecomandController@index');
    Route::post('typeTelecomand/', 'TelecomandController@create');
    Route::post('updateTelecomand/', 'TelecomandController@update');
    Route::post('deleteTelecomand/', 'TelecomandController@delete');
    Route::get('getTelecomandLines/{id}', 'TelecomandController@getSystemLines');

    Route::get('retrieveClients/{shop}', 'ClientsController@retrieveClients');
    Route::get('retrieveShops/{user}', 'ShopController@retrieveShops');
    Route::post('getIvaHomeService', 'ShopController@getIvaHomeService');

    Route::post('addToCart', 'ProductController@create');
    Route::post('updateProduct', 'ProductController@updateProduct');

    Route::post('addPreventive', 'PreventiveController@addPreventive');
    Route::post('getPreventives', 'PreventiveController@getPreventives');
    Route::post('checkPreventive', 'PreventiveController@checkPreventive');
    Route::post('checkAvailability', 'PreventiveController@checkAvailability');
    Route::get('getPreventiveData/{id}', 'PreventiveController@getPreventiveData');
    Route::post('managePreventivesStatus', 'PreventiveController@managePreventivesStatus');
    Route::post('updatePreventiveData', 'PreventiveController@updatePreventiveData');
    Route::post('deletePreventive', 'PreventiveController@deletePreventives');

    Route::post('getOrders', 'OrdersController@getOrders');
    Route::post('retrieveFilteredOrders', 'OrdersController@retrieveFilteredOrders');
    Route::post('updateOrderStatusFromAdmin', 'OrdersController@updateOrderStatusFromAdmin');
    Route::post('updateInvoiceShop', 'OrdersController@updateInvoiceShop');
    Route::post('updateOrderStatus', 'OrdersController@updateOrderStatus');
    Route::post('createInvoice', 'OrdersController@createInvoice');
    Route::post('deleteOrder', 'OrdersController@deleteOrder');

    Route::post('getInvoices', 'InvoicesController@getInvoices');
    Route::post('getAdminInvoices', 'InvoicesController@getAdminInvoices');
    Route::post('deleteInvoice', 'InvoicesController@deleteInvoice');

    Route::get('listProducts', 'CartController@listProducts');
    Route::post('updateQuantity', 'ProductController@updateQuantity');
    Route::post('deleteProductFromCart', 'CartController@removeFromCart');

    Route::post('getClients', 'ClientsController@getClients');
    Route::post('addClients', 'ClientsController@addClients');
    Route::post('updateClient', 'ClientsController@updateClient');
    Route::post('deleteClient', 'ClientsController@deleteClient');

    Route::post('getAgents', 'AgentsController@getAgents');
    Route::get('retrieveAgents', 'AgentsController@retrieveAgents');
    Route::post('getAgentsMatrix', 'AgentsController@getAgentsMatrix');
    Route::post('addAgent', 'AgentsController@addAgent');
    Route::post('addAgentMatrix', 'AgentsController@addAgentMatrix');
    Route::post('updateAgentMatrix', 'AgentsController@updateAgentMatrix');
    Route::post('updateAgent', 'AgentsController@updateAgent');
    Route::post('deleteAgent', 'AgentsController@deleteAgent');
    Route::post('deleteAgentMatrix', 'AgentsController@deleteAgentMatrix');

    Route::get('retrieveMatrices', 'AgentsController@retrieveMatrices');

    Route::get('getShopsDiscount', 'ShopController@getShopsDiscount');
    Route::post('getShops', 'ShopController@getShops');
    Route::post('addShop', 'ShopController@addShop');
    Route::post('updateShop', 'ShopController@updateShop');
    Route::post('deleteShop', 'ShopController@deleteShop');
    Route::post('changeStatusOfShop', 'ShopController@changeStatusOfShop');

    Route::get('getAdmin', 'UserController@getAdmin');
    Route::post('getUsers', 'UserController@getUsers');
    Route::post('deleteAdmin', 'UserController@deleteUser');
    Route::post('addUser', 'UserController@create');
    Route::post('updateUser', 'UserController@updateUser');

});
