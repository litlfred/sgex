import { TemplateRef } from '@angular/core';
import { NzCheckListI18nInterface } from 'ng-zorro-antd/i18n';
import { NzItemProps } from './typings';
import * as i0 from "@angular/core";
export declare class NzCheckListContentComponent {
    locale: import("@angular/core").InputSignal<NzCheckListI18nInterface>;
    items: import("@angular/core").InputSignal<NzItemProps[]>;
    index: import("@angular/core").InputSignal<number>;
    progress: import("@angular/core").InputSignal<boolean>;
    title: import("@angular/core").InputSignal<string | TemplateRef<void> | null>;
    footer: import("@angular/core").InputSignal<string | TemplateRef<void> | null>;
    readonly closePopover: import("@angular/core").OutputEmitterRef<boolean>;
    readonly hide: import("@angular/core").OutputEmitterRef<boolean>;
    protected checked: boolean;
    protected visible: import("@angular/core").WritableSignal<boolean>;
    protected progressPercent: import("@angular/core").Signal<number>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCheckListContentComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCheckListContentComponent, "nz-check-list-content", never, { "locale": { "alias": "locale"; "required": true; "isSignal": true; }; "items": { "alias": "items"; "required": false; "isSignal": true; }; "index": { "alias": "index"; "required": false; "isSignal": true; }; "progress": { "alias": "progress"; "required": false; "isSignal": true; }; "title": { "alias": "title"; "required": false; "isSignal": true; }; "footer": { "alias": "footer"; "required": false; "isSignal": true; }; }, { "closePopover": "closePopover"; "hide": "hide"; }, never, never, true, never>;
}
