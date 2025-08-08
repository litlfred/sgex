import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ElementRef, OnInit } from '@angular/core';
import { BaseModalContainerComponent } from './modal-container.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
export declare class NzModalContainerComponent extends BaseModalContainerComponent implements OnInit {
    set _portalOutlet(portalOutlet: CdkPortalOutlet);
    set _modalElementRef(elementRef: ElementRef<HTMLDivElement>);
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzModalContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzModalContainerComponent, "nz-modal-container", ["nzModalContainer"], {}, {}, never, never, true, [{ directive: typeof i1.CdkScrollable; inputs: {}; outputs: {}; }]>;
}
