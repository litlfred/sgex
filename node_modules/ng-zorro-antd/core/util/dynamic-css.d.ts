/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
interface Options {
    attachTo?: Element;
    cspNonce?: string | null;
    prepend?: boolean;
    mark?: string;
}
export declare function injectCSS(css: string, options?: Options): HTMLStyleElement | null;
export declare function removeCSS(key: string, option?: Options): void;
export declare function updateCSS(css: string, key: string, options?: Options): HTMLStyleElement | null;
export {};
