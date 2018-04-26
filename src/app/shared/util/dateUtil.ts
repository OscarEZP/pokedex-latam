import {Injectable} from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class DateUtil {

    constructor() {
    }

    /**
     * Return hour:minutes from epochDate as string
     * @param {number} epochDate
     * @return {string}
     */
    public static getFormatedTime(epochDate: number): string {
        const utcDate = this.getUTCDate(epochDate);
        return this.addZero(utcDate.getHours()) + ':' + this.addZero(utcDate.getMinutes());
    }

    /**
     * Return UTC epoch time from to inputs: 1) Date without time, 2) Time string with format hh:mm
     * @param {Date} dateObj
     * @param {string} timeString
     * @return {number}
     */
    public static createEpochFromTwoStrings(dateObj: Date, timeString: string): number {
        const timeStr = timeString.toString().split(':');
        return Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), parseInt(timeStr[0], 10), parseInt(timeStr[1], 10), 0);
    }

    /**
     * Return UTC epoch time as number from date input, and date can be modify by optional second parameter which must be in hours
     * @param {Date} dateObj
     * @param {number} modifier
     * @return {number}
     */
    public static getUTCEpoch(dateObj: Date, modifier?: number): number {
        return Number(new Date((dateObj.getTime() + this.modifyHourToMillis(modifier)) + dateObj.getTimezoneOffset() * 60000));
    }

    /**
     * Return UTC Date object from epochDate, and date can be modify by optional second parameter which must be in hours
     * @param {number} epochDate
     * @param {number} modifier
     * @return {Date}
     */
    public static getUTCDate(epochDate: number, modifier?: number): Date {
        const date = new Date(epochDate);
        return new Date((date.getTime() + this.modifyHourToMillis(modifier)) + date.getTimezoneOffset() * 60000);
    }

    /**
     * Return UTC ISO String date from epochaDate, and date can be modify by optional second parameter which must be in hours
     * @param {number} epochDate
     * @param {number} modifier
     * @return {Date}
     */
    public static getStringDate(epochDate: number, modifier?: number): string {
        const date = new Date(epochDate);
        return new Date((date.getTime() + this.modifyHourToMillis(modifier)) + date.getTimezoneOffset() * 60000).toISOString();
    }

    /**
     * Add zero string in time string when the number is less than two digits
     * @param {number} time
     * @return {string}
     */
    private static addZero(time: number): string {
        let stringHour = String(time);

        if (time < 10) {
            stringHour = '0' + time;
        }

        return stringHour;
    }

    /**
     * Convert hours to milliseconds
     * @param {number} hour
     * @return {number}
     */
    private static modifyHourToMillis (hour: number): number {
        return hour !== undefined ? hour * 60 * 60 * 1000 : 0;
    }


    public static formatDate(epochTime: number, format: string): string {
        return moment(epochTime).utc().format(format);
    }

    /**
     * Return the modified time accordingly method arguments
     * @param {number} epochDate
     * @param {number} diff
     * @param {string} scale
     * @param {string} action
     * @returns {number}
     */
    public static changeTime(epochDate: number, diff: number, scale: string, action: string): number {
        const scaleValue = DateUtil.scaleTimeToLong(scale, diff);

        const math_operation = {
            'add': (x, y) => x + y,
            'minus': (x, y) => x - y
        };

        return math_operation[action](epochDate, scaleValue);
    }

    /**
     * Return scale of time accordingly the string value in argument
     * @param {string} scale
     * @param {number} value
     * @returns {number}
     */
    private static scaleTimeToLong(scale: string, value: number): number {
        let scaleValue;

        switch (scale) {
            case 'year':
                scaleValue = 31536000000;
                break;
            case 'month':
                scaleValue = 2628000000;
                break;
            case 'week':
                scaleValue = 604800000;
                break;
            case 'day':
                scaleValue = 86400000;
                break;
            case 'hour':
                scaleValue = 3600000;
                break;
            case 'minute':
                scaleValue = 60000;
                break;
            case 'second':
                scaleValue = 1000;
                break;
            default:
                scaleValue = 1000;
                break;
        }

        return scaleValue * value;
    }
}
