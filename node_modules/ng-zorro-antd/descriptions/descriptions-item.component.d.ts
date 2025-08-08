/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { OnChanges, OnDestroy, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class NzDescriptionsItemComponent implements OnChanges, OnDestroy {
    content: TemplateRef<void>;
    nzSpan: number;
    nzTitle: string | TemplateRef<void>;
    readonly inputChange$: Subject<void>;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzDescriptionsItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzDescriptionsItemComponent, "nz-descriptions-item", ["nzDescriptionsItem"], { "nzSpan": { "alias": "nzSpan"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_nzSpan: unknown;
}
