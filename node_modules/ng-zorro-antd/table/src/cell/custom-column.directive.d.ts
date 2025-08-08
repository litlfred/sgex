/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NzTableDataService } from '../table-data.service';
import * as i0 from "@angular/core";
export declare class NzCustomColumnDirective<T> implements OnInit, OnDestroy {
    private el;
    private renderer;
    private nzTableDataService;
    nzCellControl: string | null;
    private destroy$;
    constructor(el: ElementRef, renderer: Renderer2, nzTableDataService: NzTableDataService<T>);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCustomColumnDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzCustomColumnDirective<any>, "td[nzCellControl],th[nzCellControl]", never, { "nzCellControl": { "alias": "nzCellControl"; "required": false; }; }, {}, never, never, true, never>;
}
