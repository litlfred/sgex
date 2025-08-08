import { EventEmitter, TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzSelectClearComponent {
    clearIcon: TemplateRef<NzSafeAny> | null;
    readonly clear: EventEmitter<MouseEvent>;
    onClick(e: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSelectClearComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSelectClearComponent, "nz-select-clear", never, { "clearIcon": { "alias": "clearIcon"; "required": false; }; }, { "clear": "clear"; }, never, never, true, never>;
}
