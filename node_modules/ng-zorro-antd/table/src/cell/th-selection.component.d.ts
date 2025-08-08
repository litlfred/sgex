/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export declare class NzThSelectionComponent implements OnChanges {
    nzSelections: Array<{
        text: string;
        onSelect(...args: NzSafeAny[]): NzSafeAny;
    }>;
    nzChecked: boolean;
    nzDisabled: boolean;
    nzIndeterminate: boolean;
    nzLabel: string | null;
    nzShowCheckbox: boolean;
    nzShowRowSelection: boolean;
    readonly nzCheckedChange: EventEmitter<boolean>;
    private isNzShowExpandChanged;
    private isNzShowCheckboxChanged;
    onCheckedChange(checked: boolean): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzThSelectionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzThSelectionComponent, "th[nzSelections],th[nzChecked],th[nzShowCheckbox],th[nzShowRowSelection]", never, { "nzSelections": { "alias": "nzSelections"; "required": false; }; "nzChecked": { "alias": "nzChecked"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; "nzIndeterminate": { "alias": "nzIndeterminate"; "required": false; }; "nzLabel": { "alias": "nzLabel"; "required": false; }; "nzShowCheckbox": { "alias": "nzShowCheckbox"; "required": false; }; "nzShowRowSelection": { "alias": "nzShowRowSelection"; "required": false; }; }, { "nzCheckedChange": "nzCheckedChange"; }, never, ["*"], true, never>;
    static ngAcceptInputType_nzChecked: unknown;
    static ngAcceptInputType_nzDisabled: unknown;
    static ngAcceptInputType_nzShowCheckbox: unknown;
    static ngAcceptInputType_nzShowRowSelection: unknown;
}
