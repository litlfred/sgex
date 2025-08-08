/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AnimationEvent } from '@angular/animations';
import { OnDestroy } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class NzSegmentedService implements OnDestroy {
    readonly selected$: ReplaySubject<string | number>;
    readonly activated$: ReplaySubject<HTMLElement>;
    readonly change$: Subject<string | number>;
    readonly disabled$: ReplaySubject<boolean>;
    readonly animationDone$: Subject<AnimationEvent>;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSegmentedService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzSegmentedService>;
}
