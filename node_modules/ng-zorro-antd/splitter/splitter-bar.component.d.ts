import { NzSplitterCollapseOption } from './typings';
import * as i0 from "@angular/core";
export declare class NzSplitterBarComponent {
    readonly ariaNow: import("@angular/core").InputSignal<number>;
    readonly ariaMin: import("@angular/core").InputSignal<number>;
    readonly ariaMax: import("@angular/core").InputSignal<number>;
    readonly active: import("@angular/core").InputSignal<boolean>;
    readonly resizable: import("@angular/core").InputSignal<boolean>;
    readonly vertical: import("@angular/core").InputSignal<boolean | undefined>;
    readonly lazy: import("@angular/core").InputSignal<boolean>;
    readonly collapsible: import("@angular/core").InputSignal<NzSplitterCollapseOption | undefined>;
    readonly constrainedOffset: import("@angular/core").InputSignal<number | undefined>;
    readonly offsetStart: import("@angular/core").OutputEmitterRef<[x: number, y: number]>;
    readonly collapse: import("@angular/core").OutputEmitterRef<"start" | "end">;
    protected readonly previewTransform: import("@angular/core").Signal<string>;
    protected resizeStartEvent(event: MouseEvent | TouchEvent): void;
    protected collapseEvent(type: 'start' | 'end'): void;
    protected getValidNumber(num: number | undefined): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSplitterBarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSplitterBarComponent, "[nz-splitter-bar]", never, { "ariaNow": { "alias": "ariaNow"; "required": true; "isSignal": true; }; "ariaMin": { "alias": "ariaMin"; "required": true; "isSignal": true; }; "ariaMax": { "alias": "ariaMax"; "required": true; "isSignal": true; }; "active": { "alias": "active"; "required": false; "isSignal": true; }; "resizable": { "alias": "resizable"; "required": false; "isSignal": true; }; "vertical": { "alias": "vertical"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "collapsible": { "alias": "collapsible"; "required": false; "isSignal": true; }; "constrainedOffset": { "alias": "constrainedOffset"; "required": false; "isSignal": true; }; }, { "offsetStart": "offsetStart"; "collapse": "collapse"; }, never, never, true, never>;
}
