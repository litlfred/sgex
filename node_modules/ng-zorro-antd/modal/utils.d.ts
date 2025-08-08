/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ModalOptions } from './modal-types';
export declare function applyConfigDefaults(config: ModalOptions, defaultOptions: ModalOptions): ModalOptions;
export declare function getValueWithConfig<T>(userValue: T | undefined, configValue: T | undefined, defaultValue: T): T | undefined;
export declare function getConfigFromComponent<T extends ModalOptions>(component: T): ModalOptions;
