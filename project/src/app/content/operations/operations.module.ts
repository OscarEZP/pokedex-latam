import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CommonsModule } from "../../commons/commons.module";
import { SharedModule } from "../../shared/shared.module";

import { OperationsComponent } from "./operations.component";
import { ContingenceListComponent } from './contingenceList.component/contingenceList.component';
import { ContingenceFormComponent } from './contingence-form/contingence-form.component';
import { DialogService } from '../../content/_services/dialog.service';


@NgModule({
    imports: [
        BrowserModule,
        CommonsModule,
        SharedModule
    ],
    declarations: [
        OperationsComponent,
        ContingenceListComponent,
        ContingenceFormComponent
    ],
    exports: [
        OperationsComponent,
        ContingenceListComponent,
        ContingenceFormComponent
    ],
    providers:[
        DialogService
    ]
})

export class OperationsModule { }