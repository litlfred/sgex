/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Overlay } from '@angular/cdk/overlay';
import { Injector, TemplateRef } from '@angular/core';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMNService } from 'ng-zorro-antd/message';
import { NzNotificationContainerComponent } from './notification-container.component';
import type { NzNotificationComponent } from './notification.component';
import { NzNotificationContentType, NzNotificationDataOptions, NzNotificationRef } from './typings';
import * as i0 from "@angular/core";
export declare class NzNotificationService extends NzMNService<NzNotificationContainerComponent> {
    protected componentPrefix: string;
    constructor(overlay: Overlay, injector: Injector);
    success(title: string | TemplateRef<void>, content: NzNotificationContentType, options?: NzNotificationDataOptions): NzNotificationRef;
    error(title: string | TemplateRef<void>, content: NzNotificationContentType, options?: NzNotificationDataOptions): NzNotificationRef;
    info(title: string | TemplateRef<void>, content: NzNotificationContentType, options?: NzNotificationDataOptions): NzNotificationRef;
    warning(title: string | TemplateRef<void>, content: NzNotificationContentType, options?: NzNotificationDataOptions): NzNotificationRef;
    blank(title: string | TemplateRef<void>, content: NzNotificationContentType, options?: NzNotificationDataOptions): NzNotificationRef;
    create(type: 'success' | 'info' | 'warning' | 'error' | 'blank' | string, title: string | TemplateRef<void>, content: NzNotificationContentType, options?: NzNotificationDataOptions): NzNotificationRef;
    template(template: TemplateRef<{
        $implicit: NzNotificationComponent;
        data: NzSafeAny;
    }>, options?: NzNotificationDataOptions): NzNotificationRef;
    protected generateMessageId(): string;
    private createInstance;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzNotificationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzNotificationService>;
}
