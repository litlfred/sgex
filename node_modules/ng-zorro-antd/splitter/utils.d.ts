/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { NzSplitterCollapseOption, NzSplitterCollapsible } from './typings';
/**
 * Get the percentage value of the string. (e.g. '50%' => 0.5)
 * @param str
 */
export declare function getPercentValue(str: string): number;
/**
 * Check if the size is percentage.
 * @param size
 */
export declare function isPercent(size: string | number | undefined): size is string;
/**
 * Coerce the panel collapsible option to the NzSplitterCollapseOption type.
 */
export declare function coerceCollapsible(collapsible: NzSplitterCollapsible): NzSplitterCollapseOption;
