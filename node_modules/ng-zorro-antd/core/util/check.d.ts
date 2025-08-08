/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { TemplateRef } from '@angular/core';
import { IndexableObject, NzSafeAny } from 'ng-zorro-antd/core/types';
export declare function isNotNil<T>(value: T): value is NonNullable<T>;
export declare function isNil(value: unknown): value is null | undefined;
/**
 * Examine if two objects are shallowly equaled.
 */
export declare function shallowEqual(objA?: IndexableObject, objB?: IndexableObject): boolean;
export declare function isNonEmptyString(value: NzSafeAny): boolean;
export declare function isTemplateRef<T>(value: TemplateRef<T> | NzSafeAny): value is TemplateRef<T>;
