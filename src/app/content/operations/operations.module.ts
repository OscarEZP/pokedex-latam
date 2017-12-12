import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { ApiRestService } from '../../shared/_services/apiRest.service';
import {SharedModule} from '../../shared/shared.module';
import { ContingencySimplifiedListComponent } from './contingency-simplified-list.component/contingency-simplified-list.component';

import {OperationsComponent} from './operations.component';
import {ContingencyListComponent} from './contingency-list.component/contingency-list.component';
import {ContingencyFormComponent} from './contingency-form/contingency-form.component';
import {DialogService} from '../_services/dialog.service';
import {ContingencyService} from './_services/contingency.service';
import {LogService} from './_services/log.service';
import {ClockService} from '../../shared/_services/clock.service';
import {CancelComponent} from './cancel/cancel.component';
import { CloseContingencyComponent } from './close-contingency/close-contingency.component';

@NgModule({
    imports: [
        BrowserModule,
        SharedModule
    ],
    declarations: [
        OperationsComponent,
        ContingencyListComponent,
        ContingencySimplifiedListComponent,
        ContingencyFormComponent,
        CancelComponent,
        CloseContingencyComponent
    ],
    exports: [],
    providers: [
        DialogService,
        ContingencyService,
        LogService,
        ClockService,
        ApiRestService
    ],
    entryComponents: [
        CancelComponent,
        CloseContingencyComponent
    ]
})

export class OperationsModule {
}
