import { OnChanges, TemplateRef } from '@angular/core';
import { NzStatisticValueType } from './typings';
import * as i0 from "@angular/core";
export declare class NzStatisticNumberComponent implements OnChanges {
    nzValue?: NzStatisticValueType;
    nzValueTemplate?: TemplateRef<{
        $implicit: NzStatisticValueType;
    }>;
    displayInt: string;
    displayDecimal: string;
    private locale_id;
    ngOnChanges(): void;
    private formatNumber;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzStatisticNumberComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzStatisticNumberComponent, "nz-statistic-number", ["nzStatisticNumber"], { "nzValue": { "alias": "nzValue"; "required": false; }; "nzValueTemplate": { "alias": "nzValueTemplate"; "required": false; }; }, {}, never, never, true, never>;
}
