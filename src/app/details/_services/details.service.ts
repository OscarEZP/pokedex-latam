import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { ScrollService } from '../../shared/_services/scrolling.service';

@Injectable()
export class DetailsService {

    private _sidenav: MatSidenav;
    private _opened: boolean;
    private _active: string;
    private _activeTitle: string;

    constructor(private _scrollService: ScrollService){
    }

    public getActiveTitle(): string {
        return this._activeTitle;
    }

    public getActive() {
        return this._active;
    }

    public setActive(value) {
        switch (value) {
            case 'information': this._activeTitle = 'Information'; break;
            case 'comments': this._activeTitle = 'Comments'; break;
            case 'timeline': this._activeTitle = 'Timeline'; break;
            case 'follow-up': this._activeTitle = 'Follow up'; break;
        }
        this._active = value;
    }

    public setSidenav(sidenav: MatSidenav) {
        this._sidenav = sidenav;
    }

    public openSidenav(): Promise<void> {
        return this._sidenav.open();
    }

    public closeSidenav(): Promise<void> {
        return this._sidenav.close();
    }

    public toggleSidenav(isOpen?: boolean): Promise<void> {
        return this._sidenav.toggle(isOpen);
    }

    public getOpened(): boolean {
        return this._opened;
    }

    public setOpened(value: boolean) {
        this._opened = value;
    }

    public openDetails(section: string = 'information') {
        this.setActive(section);
        if (!this.getOpened()) {
            this.openSidenav().then(() => {
                this._scrollService.scrollTo(section);
                this.setOpened(true);
            });
        } else {
            this._scrollService.scrollTo(section);
        }
    }

}
