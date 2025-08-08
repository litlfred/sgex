import { EventEmitter, OnDestroy } from '@angular/core';
import { NzMNComponent } from 'ng-zorro-antd/message';
import { NzNotificationData } from './typings';
import * as i0 from "@angular/core";
export declare class NzNotificationComponent extends NzMNComponent implements OnDestroy {
    instance: Required<NzNotificationData>;
    index: number;
    placement?: string;
    readonly destroyed: EventEmitter<{
        id: string;
        userAction: boolean;
    }>;
    ngOnDestroy(): void;
    onClick(event: MouseEvent): void;
    close(): void;
    get state(): string | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzNotificationComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzNotificationComponent, "nz-notification", ["nzNotification"], { "instance": { "alias": "instance"; "required": false; }; "index": { "alias": "index"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; }, { "destroyed": "destroyed"; }, never, never, true, never>;
}
