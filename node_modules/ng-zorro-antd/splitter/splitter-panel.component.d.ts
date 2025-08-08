/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { TemplateRef } from '@angular/core';
import { NzSplitterCollapsible } from './typings';
import * as i0 from "@angular/core";
export declare class NzSplitterPanelComponent {
    readonly nzDefaultSize: import("@angular/core").InputSignal<string | number | undefined>;
    readonly nzMin: import("@angular/core").InputSignal<string | number | undefined>;
    readonly nzMax: import("@angular/core").InputSignal<string | number | undefined>;
    readonly nzSize: import("@angular/core").InputSignal<string | number | undefined>;
    readonly nzCollapsible: import("@angular/core").InputSignal<NzSplitterCollapsible>;
    readonly nzResizable: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    readonly contentTemplate: import("@angular/core").Signal<TemplateRef<void>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSplitterPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSplitterPanelComponent, "nz-splitter-panel", ["nzSplitterPanel"], { "nzDefaultSize": { "alias": "nzDefaultSize"; "required": false; "isSignal": true; }; "nzMin": { "alias": "nzMin"; "required": false; "isSignal": true; }; "nzMax": { "alias": "nzMax"; "required": false; "isSignal": true; }; "nzSize": { "alias": "nzSize"; "required": false; "isSignal": true; }; "nzCollapsible": { "alias": "nzCollapsible"; "required": false; "isSignal": true; }; "nzResizable": { "alias": "nzResizable"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}
