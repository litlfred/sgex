import { EventEmitter, TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzSelectItemComponent {
    disabled: boolean;
    label: string | number | null | undefined;
    deletable: boolean;
    removeIcon: TemplateRef<NzSafeAny> | null;
    contentTemplateOutletContext: NzSafeAny | null;
    contentTemplateOutlet: string | TemplateRef<NzSafeAny> | null;
    readonly delete: EventEmitter<MouseEvent>;
    protected get templateOutletContext(): NzSafeAny;
    onDelete(e: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSelectItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSelectItemComponent, "nz-select-item", never, { "disabled": { "alias": "disabled"; "required": false; }; "label": { "alias": "label"; "required": false; }; "deletable": { "alias": "deletable"; "required": false; }; "removeIcon": { "alias": "removeIcon"; "required": false; }; "contentTemplateOutletContext": { "alias": "contentTemplateOutletContext"; "required": false; }; "contentTemplateOutlet": { "alias": "contentTemplateOutlet"; "required": false; }; }, { "delete": "delete"; }, never, never, true, never>;
}
