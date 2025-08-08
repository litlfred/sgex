/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AfterContentInit, OnDestroy, QueryList } from '@angular/core';
import { Observable } from 'rxjs';
import { NzCellFixedDirective } from '../cell/cell-fixed.directive';
import { NzThMeasureDirective } from '../cell/th-measure.directive';
import * as i0 from "@angular/core";
export declare class NzTrDirective implements AfterContentInit, OnDestroy {
    listOfNzThDirective: QueryList<NzThMeasureDirective>;
    listOfCellFixedDirective: QueryList<NzCellFixedDirective>;
    private destroy$;
    private listOfFixedColumns$;
    private listOfColumns$;
    listOfFixedColumnsChanges$: Observable<NzCellFixedDirective[]>;
    listOfFixedLeftColumnChanges$: Observable<NzCellFixedDirective[]>;
    listOfFixedRightColumnChanges$: Observable<NzCellFixedDirective[]>;
    listOfColumnsChanges$: Observable<NzThMeasureDirective[]>;
    private nzTableStyleService;
    isInsideTable: boolean;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTrDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzTrDirective, "tr:not([mat-row]):not([mat-header-row]):not([nz-table-measure-row]):not([nzExpand]):not([nz-table-fixed-row])", never, {}, {}, ["listOfNzThDirective", "listOfCellFixedDirective"], never, true, never>;
}
