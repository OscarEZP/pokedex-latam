import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './content/dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuardService } from './auth/_services/authGuard.service';
import { ContingencyFormComponent } from './content/operations/contingency-form/contingency-form.component';
import { FindAccountComponent } from './auth/find-account/find-account.component';
import { OperationsComponent } from './content/operations/operations.component';
import { RecoverPasswordComponent } from './auth/recover-password/recover-password.component';

const ROUTES: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                redirectTo: '/operations/contingencies',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'operations',
                redirectTo: '/operations/contingencies',
                pathMatch: 'full',
                canActivate: [AuthGuardService]
            },
            {
                path: 'operations/contingencies',
                component: OperationsComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'operations/contingency',
                component: ContingencyFormComponent,
            }
        ],
        canActivate: [AuthGuardService]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'logout',
        component: LoginComponent,
        data: { logout: true }
    },
    {
        path: 'findAccount',
        component: FindAccountComponent
    },
    {
        path: 'recoverPassword',
        component: RecoverPasswordComponent
    },
    {
        path: '**',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];


@NgModule({
    imports: [
        RouterModule.forRoot(ROUTES)
    ],
    exports: [
        RouterModule
    ],
    providers: []
})

export class AppRoutingModule {
}