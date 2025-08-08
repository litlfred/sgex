/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Overlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { NzMNService } from './base';
import { NzMessageContainerComponent } from './message-container.component';
import { NzMessageContentType, NzMessageDataOptions, NzMessageRef, NzMessageType } from './typings';
import * as i0 from "@angular/core";
export declare class NzMessageService extends NzMNService<NzMessageContainerComponent> {
    protected componentPrefix: string;
    constructor(overlay: Overlay, injector: Injector);
    success(content: NzMessageContentType, options?: NzMessageDataOptions): NzMessageRef;
    error(content: NzMessageContentType, options?: NzMessageDataOptions): NzMessageRef;
    info(content: NzMessageContentType, options?: NzMessageDataOptions): NzMessageRef;
    warning(content: NzMessageContentType, options?: NzMessageDataOptions): NzMessageRef;
    loading(content: NzMessageContentType, options?: NzMessageDataOptions): NzMessageRef;
    create(type: NzMessageType | string, content: NzMessageContentType, options?: NzMessageDataOptions): NzMessageRef;
    private createInstance;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzMessageService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzMessageService>;
}
