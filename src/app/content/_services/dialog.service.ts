import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';

@Injectable()
export class DialogService {

    private _refList: MatDialogRef<any>[];

    constructor(
        private dialog: MatDialog
    ) {
        this._refList = [];
    }

    public openDialog(dialogInstance, config, alias: string = 'active'): MatDialogRef<any> {
        this.refList[alias] = this.dialog.open(dialogInstance, config);
        return this.refList[alias];
    }

    public findDialogById(dialogId): void {
        this.dialog.getDialogById(dialogId);
    }

    public closeAllDialogs(): void {
        this.dialog.closeAll();
    }

    get refList(): MatDialogRef<any>[] {
        return this._refList;
    }

    set refList(value: MatDialogRef<any>[]) {
        this._refList = value;
    }
}
