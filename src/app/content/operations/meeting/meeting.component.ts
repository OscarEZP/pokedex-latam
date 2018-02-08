import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import { DialogService } from '../../_services/dialog.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TimeInstant } from '../../../shared/_models/timeInstant';
import { Contingency } from '../../../shared/_models/contingency/contingency';
import {ClockService} from '../../../shared/_services/clock.service';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {DatetimeService} from '../../../shared/_services/datetime.service';
import {DataService} from '../../../shared/_services/data.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ApiRestService} from '../../../shared/_services/apiRest.service';
import {GroupTypes} from '../../../shared/_models/configuration/groupTypes';
import {Types} from '../../../shared/_models/configuration/types';
import {Validation} from '../../../shared/_models/validation';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from '../../../shared/_services/message.service';
import { CancelComponent } from '../cancel/cancel.component';
import {Activity} from '../../../shared/_models/activity';
import {Meeting} from '../../../shared/_models/meeting';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'lsl-meeting-form',
    templateUrl: './meeting.component.html',
    styleUrls: ['./meeting.component.scss']
})

export class MeetingComponent implements OnInit, OnDestroy {

    private static MEETINGS_ENDPOINT = 'meetings';
    private static MEETINGS_CONFIG_TYPE = 'MEETING_ACTIVITIES';

    private _meetingForm: FormGroup;
    private _utcModel: TimeInstant;
    private _timeClock: Date;
    private _interval: number;
    private _alive: boolean;
    private _meetingActivitiesConf: Types[];
    private _meetingActivities: Activity[];
    private _validations: Validation;
    private _snackbarMessage: string;
    private _meetingActivitiesSubscription: Subscription;

    constructor(
        private _dialogService: DialogService,
        private _fb: FormBuilder,
        private _clockService: ClockService,
        private _datetimeService: DatetimeService,
        private _messageData: DataService,
        private _messageService: MessageService,
        private _apiRestService: ApiRestService,
        @Inject(MAT_DIALOG_DATA) private _contingency: Contingency,
        private _translate: TranslateService
    ) {
        this._interval = 1000 * 60;
        this._alive = true;
        const initFakeDate = new Date().getTime();
        this.utcModel = new TimeInstant(initFakeDate, null);
        this.meetingActivities = [];
        this.meetingForm = this.getFormValidators();
        this._meetingActivitiesSubscription = this.setMeetingActivitiesConf();
        this.validations = new Validation(false, true, true, false);
    }

    ngOnInit(): void {
        TimerObservable.create(0, this._interval)
        .takeWhile(() => this._alive)
        .subscribe(() => {
            this._datetimeService.getTime()
            .subscribe((data) => {
                this.utcModel = new TimeInstant(data.currentTimeLong, data.currentTime);
                this.newMessage();
                this._clockService.setClock(this.utcModel.epochTime);
            });
        });
        this._clockService.getClock().subscribe(time => this.timeClock = time);
    }

    ngOnDestroy(): void {
        this._meetingActivitiesSubscription.unsubscribe();
    }

    /**
     * Get form with validators
     * @return {FormGroup}
     */
    private getFormValidators(): FormGroup {
        this.meetingForm = this._fb.group({});
        const barcodeValidators = [Validators.pattern('^[a-zA-Z0-9]+\\S$'), Validators.maxLength(80)];
        if (this.contingency.safetyEvent.code !== null) {
            barcodeValidators.push(Validators.required);
        }
        this.meetingForm.addControl('barcode', new FormControl(this.contingency.barcode, barcodeValidators));
        return this.meetingForm;
    }

    /**
     * Get configuration for meeting activities
     */
    private setMeetingActivitiesConf(): Subscription {
        return this._apiRestService.getSingle('configTypes', MeetingComponent.MEETINGS_CONFIG_TYPE).subscribe(rs => {
            const res = rs as GroupTypes;
            this.meetingActivitiesConf = res.types;
            this.meetingActivities = MeetingComponent.setMeetingActivities(this.meetingActivitiesConf);
        });
    }

    /**
     * Get meeting activities by meeting activities configuration
     * @param meetingActivitiesConf
     * @return {Activity[]}
     */
    private static setMeetingActivities(meetingActivitiesConf: Types[]): Activity[] {
        const meetingActivities: Activity[] = [];
        for (const activityConf of meetingActivitiesConf) {
            meetingActivities.push(new Activity(activityConf.code, false, false));
        }
        return meetingActivities;
    }

    /**
     * Submit meeting form
     */
    public submitForm() {
        if (this.meetingForm.valid) {
            const signature = this.getSignature();
            this.validations.isSending = true;
            let res: Response;
            this._apiRestService
            .add<Response>(MeetingComponent.MEETINGS_ENDPOINT, signature)
            .subscribe(response => res = response,
                err => {
                    this.getTranslateString('OPERATIONS.MEETING_FORM.FAILURE_MESSAGE');
                    const message: string = err.error.message !== null ? err.error.message : this.snackbarMessage;
                    this._messageService.openSnackBar(message);
                    this.validations.isSending = false;
                }, () => {
                    this.getTranslateString('OPERATIONS.MEETING_FORM.SUCCESSFULLY_MESSAGE');
                    this._messageService.openSnackBar(this.snackbarMessage);
                    this._dialogService.closeAllDialogs();
                    this._messageData.stringMessage('reload');
                    this.validations.isSending = false;
                });
        } else {
            this.getTranslateString('OPERATIONS.VALIDATION_ERROR_MESSAGE');
            this._messageService.openSnackBar(this.snackbarMessage);
            this.validations.isSending = false;
        }
    }

    /**
     * Get a Meeting Object to sending data
     * @return {Meeting}
     */
    private getSignature(): Meeting {
        return new Meeting(null,
            this.contingency.id,
            this.meetingActivities,
            this.contingency.barcode,
            this.contingency.username,
            this.contingency.creationDate,
            this.contingency.safetyEvent.code
        );
    }

    /**
     * Get a translated message by code
     * @param toTranslate
     */
    private getTranslateString(toTranslate: string) {
        this._translate.get(toTranslate).subscribe((res: string) => {
            this.snackbarMessage = res;
        });
    }

    /**
     *
     */
    private newMessage(): void {
        this._messageData.changeTimeUTCMessage(this.utcModel.epochTime);
    }

    /**
     * Close form modal
     */
    public closeDialog(): void {
        if (this.validateFilledItems()) {
            this.getTranslateString('OPERATIONS.CANCEL_COMPONENT.MESSAGE');
            this._messageService.openFromComponent(CancelComponent, {
                data: {message: this.snackbarMessage},
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        } else {
            this._dialogService.closeAllDialogs();
        }
    }

    /**
     * Method to validate items touched by user
     * @return {boolean}
     */
    private validateFilledItems(): boolean {
        let counterPristine = 0;
        let counterItems = 0;
        Object.keys(this.meetingForm.controls).forEach(elem => {
            counterItems += 1;
            if (this.meetingForm.controls[elem].pristine) {
                counterPristine += 1;
            }
        });
        const activities = this.meetingActivities.filter(act => act.apply);
        return (counterPristine < counterItems) || (activities.length > 0);
    }

    /**
     * Change checkbox value to false if apply slider is false
     * @param meetingActivity
     */
    public checkApply(meetingActivity: Activity) {
        meetingActivity.done = !meetingActivity.apply ? false : meetingActivity.done;
        this.meetingActivities.forEach((elem, i) => {
            if (meetingActivity.code === elem['code']) {
                this.meetingActivities[i] = meetingActivity;
            }
        });
    }

    get timeClock(): Date {
        return this._timeClock;
    }

    set timeClock(value: Date) {
        this._timeClock = value;
    }

    get contingency(): Contingency {
        return this._contingency;
    }

    set contingency(value: Contingency) {
        this._contingency = value;
    }

    get utcModel(): TimeInstant {
        return this._utcModel;
    }

    set utcModel(value: TimeInstant) {
        this._utcModel = value;
    }

    get meetingForm(): FormGroup {
        return this._meetingForm;
    }

    set meetingForm(value: FormGroup) {
        this._meetingForm = value;
    }

    get meetingActivitiesConf(): Types[] {
        return this._meetingActivitiesConf;
    }

    set meetingActivitiesConf(value: Types[]) {
        this._meetingActivitiesConf = value;
    }

    get meetingActivities(): Activity[] {
        return this._meetingActivities;
    }

    set meetingActivities(value: Activity[]) {
        this._meetingActivities = value;
    }

    get validations(): Validation {
        return this._validations;
    }

    set validations(value: Validation) {
        this._validations = value;
    }

    get snackbarMessage(): string {
        return this._snackbarMessage;
    }

    set snackbarMessage(value: string) {
        this._snackbarMessage = value;
    }

}