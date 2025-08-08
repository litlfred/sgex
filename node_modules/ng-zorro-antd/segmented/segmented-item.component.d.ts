import { ChangeDetectorRef, DestroyRef, ElementRef, OnInit } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzSegmentedItemComponent implements OnInit {
    private cdr;
    private elementRef;
    private destroyRef;
    nzIcon?: string;
    nzValue: string | number;
    nzDisabled?: boolean;
    protected isChecked: boolean;
    private readonly service;
    readonly parentDisabled: import("@angular/core").Signal<boolean>;
    constructor(cdr: ChangeDetectorRef, elementRef: ElementRef, destroyRef: DestroyRef);
    ngOnInit(): void;
    handleClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSegmentedItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzSegmentedItemComponent, "label[nz-segmented-item],label[nzSegmentedItem]", ["nzSegmentedItem"], { "nzIcon": { "alias": "nzIcon"; "required": false; }; "nzValue": { "alias": "nzValue"; "required": false; }; "nzDisabled": { "alias": "nzDisabled"; "required": false; }; }, {}, never, ["*"], true, never>;
}
