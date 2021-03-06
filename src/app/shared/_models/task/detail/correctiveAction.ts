import {TimeInstant} from '../../timeInstant';
import {Name} from '../../common/name';


export class CorrectiveAction {
    private _id: number;
    private _barcode: string;
    private _name: Name;
    private _description: string;
    private _actionDate: TimeInstant;
    private _updateDate: TimeInstant;


   private constructor() {
        this._id = null;
        this._barcode = '';
        this._name = Name.getInstance();
        this._description = '';
        this._actionDate = TimeInstant.getInstance();
        this._updateDate = TimeInstant.getInstance();
    }

    public static getInstance() {
        return new CorrectiveAction();
    }


    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get barcode(): string {
        return this._barcode;
    }

    set barcode(value: string) {
        this._barcode = value;
    }

    get name(): Name {
        return this._name;
    }

    set name(value: Name) {
        this._name = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }


    get actionDate(): TimeInstant {
        return this._actionDate;
    }

    set actionDate(value: TimeInstant) {
        this._actionDate = value;
    }

    get updateDate(): TimeInstant {
        return this._updateDate;
    }

    set updateDate(value: TimeInstant) {
        this._updateDate = value;
    }
}
