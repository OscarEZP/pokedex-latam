import {AogFormComponent} from './aog-form.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DialogService} from '../../_services/dialog.service';
import {DatetimeService} from '../../../shared/_services/datetime.service';
import {ApiRestService} from '../../../shared/_services/apiRest.service';
import {MessageService} from '../../../shared/_services/message.service';
import {ClockService} from '../../../shared/_services/clock.service';
import {StorageService} from '../../../shared/_services/storage.service';
import {DataService} from '../../../shared/_services/data.service';
import {ContingencyService} from '../../_services/contingency.service';
import {LogService} from '../../_services/log.service';
import {TranslationService} from '../../../shared/_services/translation.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {MatSnackBarRef} from '@angular/material';
import {CancelComponent} from '../cancel/cancel.component';
import {Contingency} from '../../../shared/_models/contingency/contingency';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {AogService} from '../../_services/aog.service';
import {Aircraft} from '../../../shared/_models/aircraft';
import {TimeInstant} from '../../../shared/_models/timeInstant';
import {Types} from '../../../shared/_models/configuration/types';
import {TimeService} from '../../../shared/_services/timeService';

jest.mock('../../../shared/_services/datetime.service');
jest.mock('../../../shared/_services/apiRest.service');
jest.mock('../../../shared/_services/message.service');
jest.mock('../../../shared/_services/clock.service');
jest.mock('../../../shared/_services/storage.service');
jest.mock('../../../shared/_services/data.service');

jest.mock('../../_services/aog.service');
jest.mock('../../_services/contingency.service');
jest.mock('../../_services/log.service');
jest.mock('../../../shared/_services/translation.service');

describe('AOG form test', () => {

    let aogFormComponent: AogFormComponent;
    let fixture: ComponentFixture<AogFormComponent>;

    const MockTranslationService = {
        translateAndShow: () => {},
        translate: () => new Promise(() => {})
    };

    const MockApiRestService = {
        getAll: () => new Observable(s => s.next([])),
        search: () => new Observable(s => s.next([])),
    };

    const MockStorageService = {
        getCurrentUser: () => ({ username: 'USERNAME' })
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                SharedModule,
                RouterTestingModule,
                HttpClientTestingModule,
                BrowserAnimationsModule
            ],
            providers: [
                DialogService,
                DatetimeService,
                {provide: ApiRestService, useValue: MockApiRestService},
                MessageService,
                ClockService,
                {provide: StorageService, useValue: MockStorageService},
                DataService,
                ContingencyService,
                LogService,
                AogService,
                TimeService,
                {provide: TranslationService, useValue: MockTranslationService},
            ],
            declarations: [AogFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AogFormComponent);
        aogFormComponent = fixture.componentInstance;
    });

    afterEach(() => {
        aogFormComponent.ngOnDestroy();
    });

    it('Component should be load', () => {
        expect(aogFormComponent).toBeDefined();
    });

    it('AOG form should be defined', () => {
        expect(aogFormComponent.aogForm.controls['tail']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['fleet']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['operator']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['station']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['safety']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['barcode']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['safetyEventCode']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['aogType']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['observation']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['reason']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['duration']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['tipology']).toBeDefined();
        expect(aogFormComponent.aogForm.controls['closeObservation']).toBeDefined();
    });

    // it('Duration min limit is set', () => {
    //     const minLimit = aogFormComponent.getDurationIntervals().shift();
    //     expect(minLimit).toEqual(30);
    // });
    //
    // it('Duration max limit is set', () => {
    //     const maxLimit = aogFormComponent.getDurationIntervals().pop();
    //     expect(maxLimit).toEqual(1440);
    // });

    describe('Safety event validator', () => {
        it('Check and value', () => {
            aogFormComponent.isSafety = true;
            const result = aogFormComponent.safetyEventValidator({value: 'test'} as FormControl);
            expect(result).toBeNull();
        });

        it('No check and value', () => {
            aogFormComponent.isSafety = false;
            const result = aogFormComponent.safetyEventValidator({value: 'test'} as FormControl);
            expect(result).toBeNull();
        });

        it('Checked and no value', () => {
            aogFormComponent.isSafety = true;
            const result = aogFormComponent.safetyEventValidator({value: ''} as FormControl);
            expect(result).toEqual({ isSafety: true });
        });

        it('No check and no value', () => {
            aogFormComponent.isSafety = false;
            const result = aogFormComponent.safetyEventValidator({value: ''} as FormControl);
            expect(result).toBeNull();
        });
    });

    it('On select aircraft should complete tail, fleet & operator', () => {
        aogFormComponent.aircraftList = [new Aircraft('TAIL1', 'FLEET1', 'OPERATOR1' )];
        aogFormComponent.operatorList = [new Types('OPERATOR1', 'OPERATOR', TimeInstant.getInstance())];
        aogFormComponent.completeAircraft('TAIL1');
        expect(aogFormComponent.aog.tail).toEqual('TAIL1');
        expect(aogFormComponent.aog.fleet).toEqual('FLEET1');
        expect(aogFormComponent.aog.operator).toEqual('OPERATOR1');
        aogFormComponent.aircraftList = [];
        aogFormComponent.operatorList = [];
    });

    it('Contingency data should be full filled after ACCEPT', () => {
        const MockMatSnackBarRef = {
            afterDismissed: () => new Observable(s => { s.next(); s.complete(); }),
            instance: {
                response: CancelComponent.ACCEPT
            }
        };
        const contingency = new Contingency();
        contingency.barcode = 'BARCODE';
        contingency.flight.origin = 'STATION';
        contingency.safetyEvent.code = 'SAFETY_EVENT_CODE';
        contingency.type = 'AOG_TYPE';
        contingency.failure = 'FAILURE';
        contingency.reason = 'REASON';
        aogFormComponent.contingency = contingency;
        expect.assertions(7);
        aogFormComponent.handleContingencyConfirm(MockMatSnackBarRef as MatSnackBarRef).then(() => {
            const aogForm = aogFormComponent.aogForm;
            expect(aogForm.controls['barcode'].value).toEqual('BARCODE');
            expect(aogForm.controls['station'].value).toEqual('STATION');
            expect(aogForm.controls['safety'].value).toBeTruthy();
            expect(aogForm.controls['safetyEventCode'].value).toEqual('SAFETY_EVENT_CODE');
            expect(aogForm.controls['aogType'].value).toEqual('AOG_TYPE');
            expect(aogForm.controls['failure'].value).toEqual('FAILURE');
            expect(aogForm.controls['reason'].value).toEqual('REASON');
        }).catch(e => console.error(e));
    });

    // it('Duration label should have format xh ym', () => {
    //     aogFormComponent.minuteAbbreviation = 'm';
    //     aogFormComponent.hourAbbreviation = 'h';
    //     expect(aogFormComponent.getDurationLabel(90)).toEqual('1h 30m');
    // });
});
