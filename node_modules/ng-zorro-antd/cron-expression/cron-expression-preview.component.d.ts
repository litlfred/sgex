import { ChangeDetectorRef, EventEmitter, TemplateRef } from '@angular/core';
import { NzCronExpressionCronErrorI18n } from 'ng-zorro-antd/i18n';
import * as i0 from "@angular/core";
export declare class NzCronExpressionPreviewComponent {
    private cdr;
    TimeList: Date[];
    visible: boolean;
    locale: NzCronExpressionCronErrorI18n;
    nzSemantic: TemplateRef<void> | null;
    readonly loadMorePreview: EventEmitter<void>;
    isExpand: boolean;
    constructor(cdr: ChangeDetectorRef);
    setExpand(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCronExpressionPreviewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCronExpressionPreviewComponent, "nz-cron-expression-preview", ["nzCronExpressionPreview"], { "TimeList": { "alias": "TimeList"; "required": false; }; "visible": { "alias": "visible"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "nzSemantic": { "alias": "nzSemantic"; "required": false; }; }, { "loadMorePreview": "loadMorePreview"; }, never, never, true, never>;
    static ngAcceptInputType_visible: unknown;
}
