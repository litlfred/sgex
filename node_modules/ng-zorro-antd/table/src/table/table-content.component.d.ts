import { TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzTableLayout } from '../table.types';
import * as i0 from "@angular/core";
export declare class NzTableContentComponent {
    tableLayout: NzTableLayout;
    theadTemplate: TemplateRef<NzSafeAny> | null;
    contentTemplate: TemplateRef<NzSafeAny> | null;
    tfootTemplate: TemplateRef<NzSafeAny> | null;
    listOfColWidth: ReadonlyArray<string | null>;
    scrollX: string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTableContentComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTableContentComponent, "table[nz-table-content]", never, { "tableLayout": { "alias": "tableLayout"; "required": false; }; "theadTemplate": { "alias": "theadTemplate"; "required": false; }; "contentTemplate": { "alias": "contentTemplate"; "required": false; }; "tfootTemplate": { "alias": "tfootTemplate"; "required": false; }; "listOfColWidth": { "alias": "listOfColWidth"; "required": false; }; "scrollX": { "alias": "scrollX"; "required": false; }; }, {}, never, ["*"], true, never>;
}
