import { ControlValueAccessor } from '@angular/forms';
import { OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import * as i0 from "@angular/core";
export interface NzCheckboxOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}
/**
 * @deprecated Deprecated in v19.0.0. Please use {@link NzCheckboxOption} to instead.
 */
export type NzCheckBoxOptionInterface = NzCheckboxOption;
export declare class NzCheckboxGroupComponent implements ControlValueAccessor {
    private onChange;
    private onTouched;
    private isDisabledFirstChange;
    private readonly directionality;
    readonly nzName: import("@angular/core").InputSignal<string | null>;
    readonly nzDisabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    readonly nzOptions: import("@angular/core").InputSignal<NzCheckboxOption[] | string[] | number[]>;
    readonly value: import("@angular/core").WritableSignal<(string | number)[] | null>;
    readonly finalDisabled: import("@angular/core").WritableSignal<boolean>;
    protected readonly dir: import("@angular/core").Signal<import("@angular/cdk/bidi").Direction>;
    protected readonly normalizedOptions: import("@angular/core").Signal<NzCheckboxOption[]>;
    constructor();
    writeValue(value: Array<string | number> | null): void;
    registerOnChange(fn: OnChangeType): void;
    registerOnTouched(fn: OnTouchedType): void;
    setDisabledState(disabled: boolean): void;
    onCheckedChange(optionValue: NzCheckboxOption['value'], checked: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCheckboxGroupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCheckboxGroupComponent, "nz-checkbox-group", ["nzCheckboxGroup"], { "nzName": { "alias": "nzName"; "required": false; "isSignal": true; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; "isSignal": true; }; "nzOptions": { "alias": "nzOptions"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}
