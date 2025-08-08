import { OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzTableSummaryFixedType } from '../table.types';
import * as i0 from "@angular/core";
import * as i1 from "../table.types";
export declare class NzTfootSummaryComponent implements OnInit, OnChanges {
    nzFixed: NzTableSummaryFixedType | null;
    templateRef: TemplateRef<NzSafeAny>;
    private nzTableStyleService;
    isInsideTable: boolean;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTfootSummaryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTfootSummaryComponent, "tfoot[nzSummary]", never, { "nzFixed": { "alias": "nzFixed"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzFixed: i1.NzTableSummaryFixedType | boolean | unknown;
}
