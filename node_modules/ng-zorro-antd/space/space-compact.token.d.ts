/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { InjectionToken, Signal, WritableSignal } from '@angular/core';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import type { NzSpaceCompactItemDirective } from './space-compact-item.directive';
export declare const NZ_SPACE_COMPACT_SIZE: InjectionToken<Signal<NzSizeLDSType>>;
export declare const NZ_SPACE_COMPACT_ITEMS: InjectionToken<WritableSignal<NzSpaceCompactItemDirective[]>>;
export declare const NZ_SPACE_COMPACT_ITEM_TYPE: InjectionToken<string>;
