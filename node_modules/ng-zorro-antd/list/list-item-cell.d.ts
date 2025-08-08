import { AfterContentInit, ChangeDetectorRef, OnChanges, QueryList, TemplateRef } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import * as i0 from "@angular/core";
export declare class NzListItemExtraComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<NzListItemExtraComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzListItemExtraComponent, "nz-list-item-extra, [nz-list-item-extra]", ["nzListItemExtra"], {}, {}, never, ["*"], true, never>;
}
export declare class NzListItemActionComponent {
    templateRef?: TemplateRef<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzListItemActionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzListItemActionComponent, "nz-list-item-action", ["nzListItemAction"], {}, {}, never, ["*"], true, never>;
}
export declare class NzListItemActionsComponent implements OnChanges, AfterContentInit {
    nzActions: Array<TemplateRef<void>>;
    nzListItemActions: QueryList<NzListItemActionComponent>;
    actions: Array<TemplateRef<void>>;
    private inputActionChanges$;
    private contentChildrenChanges$;
    private initialized;
    constructor(cdr: ChangeDetectorRef, destroy$: NzDestroyService);
    ngOnChanges(): void;
    ngAfterContentInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzListItemActionsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzListItemActionsComponent, "ul[nz-list-item-actions]", ["nzListItemActions"], { "nzActions": { "alias": "nzActions"; "required": false; }; }, {}, ["nzListItemActions"], never, true, never>;
}
