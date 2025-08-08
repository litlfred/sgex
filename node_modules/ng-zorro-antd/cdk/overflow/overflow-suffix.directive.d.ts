/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ChangeDetectorRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzOverflowSuffixDirective {
    private cdr;
    private nzResizeObserver;
    private elementRef;
    suffixStyle: {};
    suffixWidth$: import("rxjs").Observable<number>;
    suffixWidth: number;
    constructor(cdr: ChangeDetectorRef);
    setSuffixStyle(start: number | null, order: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzOverflowSuffixDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzOverflowSuffixDirective, "[nzOverflowSuffix]", never, {}, {}, never, never, true, never>;
}
