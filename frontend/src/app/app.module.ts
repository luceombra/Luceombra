import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from "./material/material.module";
// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// used to create fake backend
// import { fakeBackendProvider } from './_helpers';
import { routing } from './app.routing';
import { AlertComponent } from './_components';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { SystemComponent } from './system/system.component';
import { SystemColorComponent } from './system-color/system-color.component';
import { ClientLayoutComponent } from './client-layout/client-layout.component';
// import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CurtainsComponent } from './curtains/curtains.component';
import { CurtainColorComponent } from './curtain-color/curtain-color.component';
import { DimensionsComponent } from './dimensions/dimensions.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { ProductComponent } from './product/product.component';
import { TypeMotionComponent } from './type-motion/type-motion.component';

// import {NgxPaginationModule} from 'ngx-pagination';
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ComponentsModule } from './components/components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TableListComponent } from './table-list/table-list.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CommonModule } from '@angular/common';

import { CartComponent } from './cart/cart.component';

import {
    MatButtonModule,
    MatInputModule,
    MatRippleModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MAT_DATE_LOCALE
} from '@angular/material';
import { MotorComponentAdminComponent } from './motor-component-admin/motor-component-admin.component';
import { ProcessCartComponent } from './process-cart/process-cart.component';
import { PreventiveComponent } from './preventive/preventive.component';
import { ViewProductsComponent } from './view-products/view-products.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmUpdateDialogComponent } from './confirm-update-dialog/confirm-update-dialog.component';
import { ProcessPreventiveComponent } from './process-preventive/process-preventive.component';
import { AdminProcessOrderComponent } from './admin-process-order/admin-process-order.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';
import { OrdersComponent } from './orders/orders.component';
import { ProcessOrdersComponent } from './process-orders/process-orders.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { AdminInvoicesComponent } from './admin-invoices/admin-invoices.component';
import { ClientsComponent } from './clients/clients.component';
import { UpdateClientComponent } from './update-client/update-client.component';
import { ProfileComponent } from './profile/profile.component';
import { MotorComponenttAddComponent } from './motor-componentt-add/motor-componentt-add.component';
import { DialogMotorComponent } from './motor-component-admin/motor-component-admin.component';
import { ChainsComponent } from './chains/chains.component';
import { DialogChainsComponent } from './chains/chains.component';
import { TelecomandsComponent } from './telecomands/telecomands.component';
import { DialogTelecomandsComponent } from './telecomands/telecomands.component';
import { DialogMaterialComponent } from './material-component/material-component.component';
import { DialogPriceComponent } from './material-component/material-component.component';
import { MaterialColorsComponent } from './material-colors/material-colors.component';
import { DialogMaterialColorsComponent } from './material-colors/material-colors.component';
import { AdminComponentModal } from './admin-component/admin-component.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { SystemColorsComponent } from './system-colors/system-colors.component';
import { DialogSystemColorsComponent } from './system-colors/system-colors.component';
import { DialogSystemsComponent } from './system-component/system-component.component';

import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { UpdatePasswordProfileComponent } from './update-password-profile/update-password-profile.component';
import { AddClientComponent } from './add-client/add-client.component';
import { AgentsComponent } from './agents/agents.component';
import { AgentMatricesComponent } from './agent-matrices/agent-matrices.component';
import { AddAgentComponent } from './add-agent/add-agent.component';
import { AddAgentMatrixComponent } from './add-agent-matrix/add-agent-matrix.component';
import { EditAgentMatrixComponent } from './edit-agent-matrix/edit-agent-matrix.component';
import { ModifyAgentComponent } from './modify-agent/modify-agent.component';
import { ShopsComponent } from './shops/shops.component';
import { AddShopComponent } from './add-shop/add-shop.component';
import { ModifyShopComponent } from './modify-shop/modify-shop.component';
import { LoaderComponent } from './loader/loader.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SystemComponentComponent } from './system-component/system-component.component';
import { MaterialComponentComponent } from './material-component/material-component.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { PasswordResetEmailComponent } from './password-reset-email/password-reset-email.component';
import { SendPasswordComponent } from './send-password/send-password.component';

import { AdminComponentComponent } from './admin-component/admin-component.component';

import { UpdatePreventiveComponent } from './update-preventive/update-preventive.component';
import { EditProductsComponent } from './edit-products/edit-products.component';
import { ProductLegendComponent } from './product-legend/product-legend.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@NgModule({
    imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ComponentsModule,
    RouterModule.forRoot([]),
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    AngularFontAwesomeModule,
    NgxPaginationModule,
    routing,
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatDialogModule,
    ColorPickerModule,
    MatCardModule,
    MatIconModule,
    ToastrModule.forRoot(),
    BrowserModule,
    EditorModule,
    MatSlideToggleModule,
    ],
    declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent,
    RegisterComponent,
    ResetComponent,
    AppComponent,
    AlertComponent,
    HomeComponent,
    SystemComponent,
    SystemColorComponent,
    ClientLayoutComponent,
    CurtainsComponent,
    CurtainColorComponent,
    DimensionsComponent,
    UpdatePasswordComponent,
    ProductComponent,
    TypeMotionComponent,
    TableListComponent,
    CartComponent,
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    MotorComponentAdminComponent,
    ProcessCartComponent,
    PreventiveComponent,
    ViewProductsComponent,
    ConfirmDialogComponent,
    ConfirmUpdateDialogComponent,
    ProcessPreventiveComponent,
    AdminProcessOrderComponent,
    EditInvoiceComponent,
    OrdersComponent,
    ProcessOrdersComponent,
    CreateInvoiceComponent,
    InvoicesComponent,
    AdminInvoicesComponent,
    ClientsComponent,
    UpdateClientComponent,
    ProfileComponent,
    MotorComponenttAddComponent,
    DialogMotorComponent,
    ChainsComponent,
    DialogChainsComponent,
    TelecomandsComponent,
    DialogTelecomandsComponent,
    // DialogMaterialComponent,
    DialogPriceComponent,
    DialogMaterialColorsComponent,
    AdminComponentModal,
    MaterialColorsComponent,
    SystemColorsComponent,
    DialogSystemColorsComponent,
    DialogSystemsComponent,
    UpdateProfileComponent,
    UpdatePasswordProfileComponent,
    AddClientComponent,
    AgentsComponent,
    AgentMatricesComponent,
    AddAgentComponent,
    AddAgentMatrixComponent,
    EditAgentMatrixComponent,
    ModifyAgentComponent,
    ShopsComponent,
    AddShopComponent,
    ModifyShopComponent,
    LoaderComponent,
    SystemComponentComponent,
    MaterialComponentComponent,
    DialogMaterialComponent,
    PasswordResetEmailComponent,
    SendPasswordComponent,
    AdminComponentComponent,
    UpdatePreventiveComponent,
    EditProductsComponent,
    ProductLegendComponent,
    ],
    entryComponents: [
    ConfirmDialogComponent,
    ConfirmUpdateDialogComponent,
    ProcessPreventiveComponent,
    AdminProcessOrderComponent,
    EditInvoiceComponent,
    ProcessOrdersComponent,
    CreateInvoiceComponent,
    UpdateClientComponent,
    MotorComponentAdminComponent,
    DialogMotorComponent,
    DialogChainsComponent,
    DialogTelecomandsComponent,
    // DialogMaterialComponent,
    DialogPriceComponent,
    DialogMaterialColorsComponent,
    AdminComponentModal,
    DialogSystemColorsComponent,
    DialogSystemsComponent,
    AddClientComponent,
    UpdateClientComponent,
    UpdatePasswordProfileComponent,
    UpdateProfileComponent,
    AddAgentComponent,
    AddAgentMatrixComponent,
    EditAgentMatrixComponent,
    ModifyAgentComponent,
    AddShopComponent,
    ModifyShopComponent,
    UpdatePreventiveComponent
    ],


    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }

    // provider used to create fake backend

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
