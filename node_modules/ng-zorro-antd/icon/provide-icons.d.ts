/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { EnvironmentProviders, Provider } from '@angular/core';
import { IconDefinition } from '@ant-design/icons-angular';
/**
 * Provide icon definitions for NzIcon in root
 *
 * @param icons Icon definitions
 */
export declare const provideNzIcons: (icons: IconDefinition[]) => EnvironmentProviders;
/**
 * Provide icon definitions for NzIcon in feature module or standalone component
 *
 * @param icons Icon definitions
 */
export declare const provideNzIconsPatch: (icons: IconDefinition[]) => Provider[];
