/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
export type NzSegmentedOption = {
    value: string | number;
    disabled?: boolean;
} & (NzSegmentedWithLabel | NzSegmentedWithIcon);
export interface NzSegmentedWithLabel {
    label: string;
    icon?: string;
}
export interface NzSegmentedWithIcon {
    icon: string;
    label?: string;
}
export type NzSegmentedOptions = Array<NzSegmentedOption | string | number>;
export declare function normalizeOptions(unnormalized: NzSegmentedOptions): NzSegmentedOption[];
