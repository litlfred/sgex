import { OnChanges, OnInit, TemplateRef } from '@angular/core';
import { NzBreakpointKey } from 'ng-zorro-antd/core/services';
import * as i0 from "@angular/core";
export declare class NzSiderTriggerComponent implements OnChanges, OnInit {
    nzCollapsed: boolean;
    nzReverseArrow: boolean;
    nzZeroTrigger: TemplateRef<void> | null;
    nzTrigger: TemplateRef<void> | undefined | null;
    matchBreakPoint: boolean;
    nzCollapsedWidth: number | null;
    siderWidth: string | null;
    nzBreakpoint: NzBreakpointKey | null;
    isZeroTrigger: boolean;
    isNormalTrigger: boolean;
    updateTriggerType(): void;
    ngOnInit(): void;
    ngOnChanges(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSiderTriggerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSiderTriggerComponent, "[nz-sider-trigger]", ["nzSiderTrigger"], { "nzCollapsed": { "alias": "nzCollapsed"; "required": false; }; "nzReverseArrow": { "alias": "nzReverseArrow"; "required": false; }; "nzZeroTrigger": { "alias": "nzZeroTrigger"; "required": false; }; "nzTrigger": { "alias": "nzTrigger"; "required": false; }; "matchBreakPoint": { "alias": "matchBreakPoint"; "required": false; }; "nzCollapsedWidth": { "alias": "nzCollapsedWidth"; "required": false; }; "siderWidth": { "alias": "siderWidth"; "required": false; }; "nzBreakpoint": { "alias": "nzBreakpoint"; "required": false; }; }, {}, never, never, true, never>;
}
