/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ElementRef, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class NzThMeasureDirective implements OnChanges {
    private renderer;
    private elementRef;
    changes$: Subject<void>;
    nzWidth: string | null;
    colspan: string | number | null;
    colSpan: string | number | null;
    rowspan: string | number | null;
    rowSpan: string | number | null;
    constructor(renderer: Renderer2, elementRef: ElementRef);
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzThMeasureDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzThMeasureDirective, "th", never, { "nzWidth": { "alias": "nzWidth"; "required": false; }; "colspan": { "alias": "colspan"; "required": false; }; "colSpan": { "alias": "colSpan"; "required": false; }; "rowspan": { "alias": "rowspan"; "required": false; }; "rowSpan": { "alias": "rowSpan"; "required": false; }; }, {}, never, never, true, never>;
}
