import * as i0 from '@angular/core';
import { EventEmitter, booleanAttribute, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { presetColors, statusColors, isPresetColor, isStatusColor } from 'ng-zorro-antd/core/color';
import * as i2 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i1 from '@angular/cdk/bidi';

class NzTagComponent {
    cdr;
    renderer;
    elementRef;
    directionality;
    isPresetColor = false;
    nzMode = 'default';
    nzColor;
    nzChecked = false;
    nzBordered = true;
    nzOnClose = new EventEmitter();
    nzCheckedChange = new EventEmitter();
    dir = 'ltr';
    destroy$ = new Subject();
    constructor(cdr, renderer, elementRef, directionality) {
        this.cdr = cdr;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.directionality = directionality;
    }
    updateCheckedStatus() {
        if (this.nzMode === 'checkable') {
            this.nzChecked = !this.nzChecked;
            this.nzCheckedChange.emit(this.nzChecked);
        }
    }
    closeTag(e) {
        this.nzOnClose.emit(e);
        if (!e.defaultPrevented) {
            this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement), this.elementRef.nativeElement);
        }
    }
    clearPresetColor() {
        const hostElement = this.elementRef.nativeElement;
        // /(ant-tag-(?:pink|red|...))/g
        const regexp = new RegExp(`(ant-tag-(?:${[...presetColors, ...statusColors].join('|')}))`, 'g');
        const classname = hostElement.classList.toString();
        const matches = [];
        let match = regexp.exec(classname);
        while (match !== null) {
            matches.push(match[1]);
            match = regexp.exec(classname);
        }
        hostElement.classList.remove(...matches);
    }
    setPresetColor() {
        const hostElement = this.elementRef.nativeElement;
        this.clearPresetColor();
        if (!this.nzColor) {
            this.isPresetColor = false;
        }
        else {
            this.isPresetColor = isPresetColor(this.nzColor) || isStatusColor(this.nzColor);
        }
        if (this.isPresetColor) {
            hostElement.classList.add(`ant-tag-${this.nzColor}`);
        }
    }
    ngOnInit() {
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
            this.cdr.detectChanges();
        });
        this.dir = this.directionality.value;
    }
    ngOnChanges(changes) {
        const { nzColor } = changes;
        if (nzColor) {
            this.setPresetColor();
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTagComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i1.Directionality }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzTagComponent, isStandalone: true, selector: "nz-tag", inputs: { nzMode: "nzMode", nzColor: "nzColor", nzChecked: ["nzChecked", "nzChecked", booleanAttribute], nzBordered: ["nzBordered", "nzBordered", booleanAttribute] }, outputs: { nzOnClose: "nzOnClose", nzCheckedChange: "nzCheckedChange" }, host: { listeners: { "click": "updateCheckedStatus()" }, properties: { "style.background-color": "isPresetColor ? '' : nzColor", "class.ant-tag-has-color": "nzColor && !isPresetColor", "class.ant-tag-checkable": "nzMode === 'checkable'", "class.ant-tag-checkable-checked": "nzChecked", "class.ant-tag-rtl": "dir === 'rtl'", "class.ant-tag-borderless": "!nzBordered" }, classAttribute: "ant-tag" }, exportAs: ["nzTag"], usesOnChanges: true, ngImport: i0, template: `
    <ng-content></ng-content>
    @if (nzMode === 'closeable') {
      <nz-icon nzType="close" class="ant-tag-close-icon" tabindex="-1" (click)="closeTag($event)" />
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i2.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTagComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-tag',
                    exportAs: 'nzTag',
                    preserveWhitespaces: false,
                    template: `
    <ng-content></ng-content>
    @if (nzMode === 'closeable') {
      <nz-icon nzType="close" class="ant-tag-close-icon" tabindex="-1" (click)="closeTag($event)" />
    }
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    host: {
                        class: 'ant-tag',
                        '[style.background-color]': `isPresetColor ? '' : nzColor`,
                        '[class.ant-tag-has-color]': `nzColor && !isPresetColor`,
                        '[class.ant-tag-checkable]': `nzMode === 'checkable'`,
                        '[class.ant-tag-checkable-checked]': `nzChecked`,
                        '[class.ant-tag-rtl]': `dir === 'rtl'`,
                        '[class.ant-tag-borderless]': `!nzBordered`,
                        '(click)': 'updateCheckedStatus()'
                    },
                    imports: [NzIconModule]
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i1.Directionality }], propDecorators: { nzMode: [{
                type: Input
            }], nzColor: [{
                type: Input
            }], nzChecked: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzBordered: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzOnClose: [{
                type: Output
            }], nzCheckedChange: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzTagModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTagModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzTagModule, imports: [NzTagComponent], exports: [NzTagComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTagModule, imports: [NzTagComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzTagModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzTagComponent],
                    exports: [NzTagComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzTagComponent, NzTagModule };
//# sourceMappingURL=ng-zorro-antd-tag.mjs.map
