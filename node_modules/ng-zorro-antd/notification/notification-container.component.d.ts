/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Direction } from '@angular/cdk/bidi';
import { NotificationConfig } from 'ng-zorro-antd/core/config';
import { NzMNContainerComponent } from 'ng-zorro-antd/message';
import { NzNotificationData, NzNotificationDataOptions } from './typings';
import * as i0 from "@angular/core";
export declare class NzNotificationContainerComponent extends NzMNContainerComponent<NotificationConfig, NzNotificationData> {
    dir: Direction;
    bottom?: string | null;
    top?: string | null;
    topLeftInstances: Array<Required<NzNotificationData>>;
    topRightInstances: Array<Required<NzNotificationData>>;
    bottomLeftInstances: Array<Required<NzNotificationData>>;
    bottomRightInstances: Array<Required<NzNotificationData>>;
    topInstances: Array<Required<NzNotificationData>>;
    bottomInstances: Array<Required<NzNotificationData>>;
    constructor();
    create(notification: NzNotificationData): Required<NzNotificationData>;
    protected onCreate(instance: NzNotificationData): Required<NzNotificationData>;
    protected subscribeConfigChange(): void;
    protected updateConfig(): void;
    private replaceNotification;
    protected readyInstances(): void;
    protected mergeOptions(options?: NzNotificationDataOptions): NzNotificationDataOptions;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzNotificationContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzNotificationContainerComponent, "nz-notification-container", ["nzNotificationContainer"], {}, {}, never, never, true, never>;
}
