import { EventEmitter, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzTdAddOnComponent implements OnChanges {
    nzChecked: boolean;
    nzDisabled: boolean;
    nzIndeterminate: boolean;
    nzLabel: string | null;
    nzIndentSize: number;
    nzShowExpand: boolean;
    nzShowCheckbox: boolean;
    nzExpand: boolean;
    nzExpandIcon: TemplateRef<void> | null;
    readonly nzCheckedChange: EventEmitter<boolean>;
    readonly nzExpandChange: EventEmitter<boolean>;
    private isNzShowExpandChanged;
    private isNzShowCheckboxChanged;
    onCheckedChange(checked: boolean): void;
    onExpandChange(expand: boolean): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTdAddOnComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTdAddOnComponent, "td[nzChecked], td[nzDisabled], td[nzIndeterminate], td[nzIndentSize], td[nzExpand], td[nzShowExpand], td[nzShowCheckbox]", never, { "nzChecked": { "alias": "nzChecked"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzIndeterminate": { "alias": "nzIndeterminate"; "required": false; }; "nzLabel": { "alias": "nzLabel"; "required": false; }; "nzIndentSize": { "alias": "nzIndentSize"; "required": false; }; "nzShowExpand": { "alias": "nzShowExpand"; "required": false; }; "nzShowCheckbox": { "alias": "nzShowCheckbox"; "required": false; }; "nzExpand": { "alias": "nzExpand"; "required": false; }; "nzExpandIcon": { "alias": "nzExpandIcon"; "required": false; }; }, { "nzCheckedChange": "nzCheckedChange"; "nzExpandChange": "nzExpandChange"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzShowExpand: unknown;
    static ngAcceptInputType_nzShowCheckbox: unknown;
    static ngAcceptInputType_nzExpand: unknown;
}
