import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ElementRef, EventEmitter, OnInit } from '@angular/core';
import { NzModalI18nInterface } from 'ng-zorro-antd/i18n';
import { BaseModalContainerComponent } from './modal-container.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
export declare class NzModalConfirmContainerComponent extends BaseModalContainerComponent implements OnInit {
    set _portalOutlet(portalOutlet: CdkPortalOutlet);
    set _modalElementRef(elementRef: ElementRef<HTMLDivElement>);
    readonly cancelTriggered: EventEmitter<void>;
    readonly okTriggered: EventEmitter<void>;
    locale: NzModalI18nInterface;
    private i18n;
    constructor();
    ngOnInit(): void;
    onCancel(): void;
    onOk(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzModalConfirmContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzModalConfirmContainerComponent, "nz-modal-confirm-container", ["nzModalConfirmContainer"], {}, { "cancelTriggered": "cancelTriggered"; "okTriggered": "okTriggered"; }, never, never, true, [{ directive: typeof i1.CdkScrollable; inputs: {}; outputs: {}; }]>;
}
