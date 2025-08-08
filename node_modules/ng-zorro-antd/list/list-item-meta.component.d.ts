import { ElementRef, TemplateRef } from '@angular/core';
import { NzListItemMetaDescriptionComponent as DescriptionComponent, NzListItemMetaTitleComponent as TitleComponent } from './list-item-meta-cell';
import * as i0 from "@angular/core";
export declare class NzListItemMetaComponent {
    elementRef: ElementRef;
    avatarStr: string;
    avatarTpl?: TemplateRef<void>;
    set nzAvatar(value: string | TemplateRef<void>);
    nzTitle?: string | TemplateRef<void>;
    nzDescription?: string | TemplateRef<void>;
    descriptionComponent?: DescriptionComponent;
    titleComponent?: TitleComponent;
    constructor(elementRef: ElementRef);
    static ɵfac: i0.ɵɵFactoryDeclaration<NzListItemMetaComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzListItemMetaComponent, "nz-list-item-meta, [nz-list-item-meta]", ["nzListItemMeta"], { "nzAvatar": { "alias": "nzAvatar"; "required": false; }; "nzTitle": { "alias": "nzTitle"; "required": false; }; "nzDescription": { "alias": "nzDescription"; "required": false; }; }, {}, ["descriptionComponent", "titleComponent"], ["nz-list-item-meta-avatar", "nz-list-item-meta-title", "nz-list-item-meta-description"], true, never>;
}
