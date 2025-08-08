/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
interface PreloadOption {
    src: string;
    srcset?: string;
}
export type PreloadDisposeHandle = () => void;
export declare class ImagePreloadService {
    private platform;
    private counter;
    private linkRefs;
    private document;
    constructor(platform: Platform);
    addPreload(option: PreloadOption): PreloadDisposeHandle;
    private appendPreloadLink;
    private removePreloadLink;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImagePreloadService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ImagePreloadService>;
}
export {};
