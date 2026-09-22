import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { HomeComponent } from '../app/home';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { ResetComponent } from './reset/reset.component';
import { ClientLayoutComponent } from './client-layout/client-layout.component';
import { SystemColorComponent} from './system-color/system-color.component';
import { CurtainsComponent} from './curtains/curtains.component';
import { CurtainColorComponent} from './curtain-color/curtain-color.component';
import { DimensionsComponent} from './dimensions/dimensions.component';
import { SystemComponent } from '../app/system/system.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TypeMotionComponent } from  './type-motion/type-motion.component';
import { TableListComponent } from './table-list/table-list.component';
import { AuthGuard } from './_guards';
import { from } from 'rxjs';
import { CartComponent } from './cart/cart.component';
import { ProcessCartComponent } from './process-cart/process-cart.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PreventiveComponent } from './preventive/preventive.component';
import { MotorComponentAdminComponent } from './motor-component-admin/motor-component-admin.component';
import { ChainsComponent } from './chains/chains.component';
import { TelecomandsComponent } from './telecomands/telecomands.component';
import { ViewProductsComponent } from './view-products/view-products.component';
import { OrdersComponent } from './orders/orders.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { AdminInvoicesComponent } from './admin-invoices/admin-invoices.component';
import { ClientsComponent } from './clients/clients.component';
import { ProfileComponent } from './profile/profile.component';
import { MaterialColorsComponent } from './material-colors/material-colors.component';
import { SystemColorsComponent } from './system-colors/system-colors.component';
import { AgentsComponent } from './agents/agents.component';
import { AgentMatricesComponent } from './agent-matrices/agent-matrices.component';
import { ShopsComponent } from './shops/shops.component';
import { SystemComponentComponent } from './system-component/system-component.component';
import { MaterialComponentComponent, DialogMaterialComponent } from './material-component/material-component.component';
import { PasswordResetEmailComponent } from './password-reset-email/password-reset-email.component';
import { SendPasswordComponent } from './send-password/send-password.component';

import { AdminComponentComponent} from './admin-component/admin-component.component';

import { EditProductsComponent } from './edit-products/edit-products.component';


const appRoutes: Routes = [
    {
        path: '',
        component: ClientLayoutComponent,
        children: [
            { path: '', component: SystemComponent, canActivate: [AuthGuard]},
            { path: 'editPreventive', component: SystemComponent, canActivate: [AuthGuard]},
            { path: 'systemcolor', component: SystemColorComponent, canActivate: [AuthGuard]},
            { path: 'curtaincolor/:id', component: CurtainColorComponent, canActivate: [AuthGuard]},
            { path: 'curtains', component: CurtainsComponent, canActivate: [AuthGuard]},
            { path: 'dimensions', component: DimensionsComponent, canActivate: [AuthGuard]},
            { path: 'typemotion', component: TypeMotionComponent, canActivate: [AuthGuard]},
            { path: 'cart', component: CartComponent, canActivate: [AuthGuard]},
            { path: 'processcart', component: ProcessCartComponent, canActivate: [AuthGuard]},
            { path: 'reset', component: ResetComponent },
            { path: 'newPass/:token', component: SendPasswordComponent },
            { path: 'passwordReset', component: PasswordResetEmailComponent },
            { path: 'update', component: UpdatePasswordComponent },
            { path: 'login', component: LoginComponent },
        ]
    },
    {
        path: 'admin', canActivate: [AuthGuard],
        component: AdminLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'system', component: SystemComponentComponent },
            { path: 'users', component: AdminComponentComponent },
            { path: 'shops', component: ShopsComponent },
            { path: 'agent', component: AgentsComponent },
            { path: 'agent-matrices', component: AgentMatricesComponent },
            { path: 'preventive', component: PreventiveComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'orders/:id', component: OrdersComponent },
            { path: 'invoices', component: InvoicesComponent },
            { path: 'admin-invoices', component: AdminInvoicesComponent },
            { path: 'clients', component: ClientsComponent },
            { path: 'curtain', component: MaterialComponentComponent },
            { path: 'newCurtain', component: DialogMaterialComponent },
            { path: 'updateCurtain/:id', component: DialogMaterialComponent },
            { path: 'motori', component: MotorComponentAdminComponent },
            { path: 'chains', component: ChainsComponent },
            { path: 'telecomands', component: TelecomandsComponent },
            { path: 'curtain-colors', component: MaterialColorsComponent},
            { path: 'system-colors', component: SystemColorsComponent},
            { path: 'view/:id', component: ViewProductsComponent},
            { path: 'edit/:id', component: EditProductsComponent },
            { path: 'viewPreventive/:id', component: ViewProductsComponent},
        ]
    },
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes, { useHash: true });
