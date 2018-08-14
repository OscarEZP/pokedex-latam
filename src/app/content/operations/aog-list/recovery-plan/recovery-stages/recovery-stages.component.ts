import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as Konva from 'konva';
import {MAT_DIALOG_DATA, MatMenuTrigger} from '@angular/material';
import {Stage} from '../../../../../shared/_models/aog/Stage';
import {ShapeDraw} from '../util/shapeDraw';
import {Subscription} from 'rxjs/Subscription';
import {Vector2d} from 'konva';
import {DialogService} from '../../../../_services/dialog.service';
import {AddStageFormComponent, InjectAddStageInterface} from './add-stage-form/add-stage-form.component';
import {RecoveryPlanInterface, RecoveryPlanService, StageInterface} from '../_services/recovery-plan.service';
import {TimeConverter} from '../util/timeConverter';

export interface StyleInterface {
    top: string;
    left: string;
    position: string;
}

export interface LayerInterface {
    base: Konva.Layer;
    lines: Konva.Layer;
    labels?: Konva.Layer;
    circles: Konva.Layer;
}

export interface MenuInterface {
    addGroup: boolean;
    delGroup: boolean;
}

@Component({
    selector: 'lsl-recovery-stages',
    templateUrl: './recovery-stages.component.html',
    styleUrls: ['./recovery-stages.component.scss']
})
export class RecoveryStagesComponent implements OnInit, OnDestroy, AfterViewInit {

    private static TIMELINE_MENU_CLASS = '.timeline-menu';

    @ViewChild('stages') public stages: ElementRef;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    private _stagesSub: Subscription;
    private _menuStyle: StyleInterface;

    private _canvasHeight: number;
    private _lastValidPosition: number;
    private _stagesObjects: StageInterface[];
    private _recoveryPlanSubscription: Subscription;
    private _recoveryPlanInterface: RecoveryPlanInterface;

    private _konvaStage: Konva.Stage;
    private _konvaLayers: LayerInterface;

    private _menuInterface: MenuInterface;
    private _stagesList: Stage[];

    constructor(
        private _recoveryPlanService: RecoveryPlanService,
        private _dialogService: DialogService,
        @Inject(MAT_DIALOG_DATA) private _data: object
    ) {
        this._recoveryPlanSubscription = this._recoveryPlanService.recoveryPlanBehavior$.subscribe(x => this._recoveryPlanInterface = x);
        this._canvasHeight = 50;
        this._lastValidPosition = 0;
        this._stagesObjects = [];
        this._menuStyle = { top: '-20px', left: '', position: 'absolute'};
        this._stagesSub = new Subscription();
        this._menuInterface = {addGroup: true, delGroup: true };
    }

    ngOnInit() {
        this.stagesSub = this.getStagesSub();
        this.lastValidPosition = 0;
        this.konvaStage = new Konva.Stage({
            container: 'container',
            width: this.activeViewInPixels,
            height: this.canvasHeight
        });
    }

    ngOnDestroy() {
        this.stagesSub.unsubscribe();
    }

    ngAfterViewInit() {
        const baseLayer = new Konva.Layer();
        baseLayer.add(ShapeDraw.drawLines('GRAY', 0, this.activeViewInPixels));
        const lineLayer = new Konva.Layer();
        const circleLayer = new Konva.Layer();
        this.stagesObjects.forEach((value, index) => {
            const stageInterface = this.getGroupStage(value, index);
            lineLayer.add(stageInterface.line);
            circleLayer.add(stageInterface.circle);
        });
        this.konvaLayers = {
            base: baseLayer,
            lines: lineLayer,
            circles: circleLayer
        };
        Object.keys(this.konvaLayers).forEach(key => this.konvaStage.add(this.konvaLayers[key]));
    }

    private getStagesSub(): Subscription {
        return this._recoveryPlanService.stages$.subscribe(res => {
            this.stagesList = res.map(v => v);
            const endRange = res[res.length - 1].range;
            res.push(new Stage('GRAY', 1, endRange));
            this.stagesObjects = res.map(v => ({stage: v, line: null, circle: null}));
        });
    }

    private getGroupStage(stageInterface: StageInterface, index: number): StageInterface {
        let initPosition = 0;
        const interfaceStage = stageInterface.stage;
        const isLastItem = index + 1 === this.stagesObjects.length;
        this.lastValidPosition = 0;
        const startPos = TimeConverter.epochTimeToPixelPosition(stageInterface.stage.fromEpochtime, this.absoluteStartTime, this.activeViewInHours, this.activeViewInPixels);
        const endPos = TimeConverter.epochTimeToPixelPosition(stageInterface.stage.toEpochtime, this.absoluteStartTime, this.activeViewInHours, this.activeViewInPixels);
        stageInterface.line = ShapeDraw.drawLines(interfaceStage.code, startPos, endPos);
        stageInterface.circle = ShapeDraw.drawCircle(interfaceStage.code, startPos, index > 0);
        stageInterface.circle.dragBoundFunc(pos => this.dragBound(pos, stageInterface, index, isLastItem ? this.activeViewInPixels : endPos));
        stageInterface.circle.on('mouseover', () => document.body.style.cursor = 'pointer');
        stageInterface.circle.on('mouseout', () => document.body.style.cursor = 'default');
        stageInterface.circle.on('dblclick', () => this.triggerMenu(stageInterface.circle.getAbsolutePosition().x, index));
        stageInterface.circle.on('dragstart', () => {
            initPosition = stageInterface.circle.getAbsolutePosition().x;
            this.konvaLayers.circles.draw();
            this.konvaLayers.lines.draw();
        });
        stageInterface.circle.on('dragmove', () => {
            document.body.style.cursor = 'pointer';
            this.stagesObjects.forEach(v => v.line.points([v.circle.getAbsolutePosition().x, 25, this.activeViewInPixels, 25]));
            this.konvaLayers.circles.draw();
            this.konvaLayers.lines.draw();
        });
        stageInterface.circle.on('dragend', () => {
            this.resizeLines(stageInterface.circle.getAbsolutePosition().x, index, initPosition);
            document.body.style.cursor = 'default';
            this.konvaLayers.circles.draw();
            this.konvaLayers.lines.draw();
        });
        return stageInterface;
    }

    private resizeLines(circlePosX: number, index: number, initPosition: number) {
        const diff = circlePosX - initPosition;
        this.stagesObjects
            .filter((v, i) => i > index)
            .forEach(v => {
                v.line.points([v.circle.getAbsolutePosition().x + diff, 25, this.activeViewInPixels, 25]);
                v.circle.x(v.circle.getAbsolutePosition().x + diff);
            });
    }

    private dragBound(pos: Vector2d, value: StageInterface, index: number, endPos: number): Vector2d {
        const prevCircleItemPos = this.stagesObjects[index - 1] ? this.stagesObjects[index - 1].circle.getAbsolutePosition().x : 0;
        const nextCircleItemPos = this.stagesObjects[index + 1] ? this.stagesObjects[index + 1].circle.getAbsolutePosition().x : endPos;
        const result = {x: 0, y: value.circle.getAbsolutePosition().y};
        if (pos.x > (prevCircleItemPos + value.circle.radius() * 2) && (nextCircleItemPos - value.circle.radius() * 2) > pos.x) {
            this.lastValidPosition = pos.x;
            result.x = pos.x;
        } else {
            result.x = this.lastValidPosition;
        }
        return result;
    }

    private triggerMenu(position: number, index: number) {
        this.trigger.openMenu();
        this.menuInterface.addGroup = index > 0;
        this.menuInterface.delGroup = index > 0 && index < this.stagesObjects.length - 1;
        const el = document.querySelector(RecoveryStagesComponent.TIMELINE_MENU_CLASS);
        if (el) {
            this.menuStyle.left = position.toString().concat('px');
            const style = el['style'];
            Object.keys(this.menuStyle).forEach(key => style[key] = this.menuStyle[key]);
        }
    }

    public addGroup() {
        const injectData: InjectAddStageInterface = { stagesList: this.stagesList };
        this._dialogService.openDialog(AddStageFormComponent, {
            data: injectData,
            hasBackdrop: true,
            disableClose: true,
            height: '220px',
            width: '400px'
        }, AddStageFormComponent.ADD_STAGE_DIALOG_TAG);
    }

    public deleteGroup() {
        console.log('del group');
    }

    get canvasHeight(): number {
        return this._canvasHeight;
    }

    set canvasHeight(value: number) {
        this._canvasHeight = value;
    }

    get lastValidPosition(): number {
        return this._lastValidPosition;
    }

    set lastValidPosition(value: number) {
        this._lastValidPosition = value;
    }

    get activeViewInHours(): number {
        return this._recoveryPlanInterface.activeViewInHours;
    }

    get activeViewInPixels(): number {
        return this._recoveryPlanInterface.activeViewInPixels;
    }

    get absoluteStartTime(): number {
        return this._recoveryPlanInterface.absoluteStartTime;
    }

    get stagesObjects(): StageInterface[] {
        return this._stagesObjects;
    }

    set stagesObjects(value: StageInterface[]) {
        this._stagesObjects = value;
    }

    get stagesSub(): Subscription {
        return this._stagesSub;
    }

    set stagesSub(value: Subscription) {
        this._stagesSub = value;
    }

    get menuStyle(): StyleInterface {
        return this._menuStyle;
    }

    get konvaStage(): Konva.Stage {
        return this._konvaStage;
    }

    set konvaStage(value: Konva.Stage) {
        this._konvaStage = value;
    }

    get konvaLayers(): LayerInterface {
        return this._konvaLayers;
    }

    set konvaLayers(value: LayerInterface) {
        this._konvaLayers = value;
    }

    get menuInterface(): MenuInterface {
        return this._menuInterface;
    }

    set menuInterface(value: MenuInterface) {
        this._menuInterface = value;
    }

    get stagesList(): Stage[] {
        return this._stagesList;
    }

    set stagesList(value: Stage[]) {
        this._stagesList = value;
    }
}
