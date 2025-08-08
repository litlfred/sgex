/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { AfterContentChecked, ChangeDetectorRef, NgZone, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { IconDirective, ThemeType } from '@ant-design/icons-angular';
import { NzIconService } from './icon.service';
import * as i0 from "@angular/core";
export declare class NzIconDirective extends IconDirective implements OnChanges, AfterContentChecked, OnDestroy {
    private readonly ngZone;
    private readonly changeDetectorRef;
    readonly iconService: NzIconService;
    readonly renderer: Renderer2;
    cacheClassName: string | null;
    set nzSpin(value: boolean);
    nzRotate: number;
    set nzType(value: string);
    set nzTheme(value: ThemeType);
    set nzTwotoneColor(value: string);
    set nzIconfont(value: string);
    hostClass?: string;
    private readonly el;
    private iconfont?;
    private spin;
    private destroy$;
    constructor(ngZone: NgZone, changeDetectorRef: ChangeDetectorRef, iconService: NzIconService, renderer: Renderer2);
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * If custom content is provided, try to normalize SVG elements.
     */
    ngAfterContentChecked(): void;
    ngOnDestroy(): void;
    /**
     * Replacement of `changeIcon` for more modifications.
     */
    private changeIcon2;
    private handleSpin;
    private handleRotate;
    private setClassName;
    private setSVGData;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzIconDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzIconDirective, "nz-icon,[nz-icon]", ["nzIcon"], { "nzSpin": { "alias": "nzSpin"; "required": false; }; "nzRotate": { "alias": "nzRotate"; "required": false; }; "nzType": { "alias": "nzType"; "required": false; }; "nzTheme": { "alias": "nzTheme"; "required": false; }; "nzTwotoneColor": { "alias": "nzTwotoneColor"; "required": false; }; "nzIconfont": { "alias": "nzIconfont"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzSpin: unknown;
    static ngAcceptInputType_nzRotate: unknown;
}
