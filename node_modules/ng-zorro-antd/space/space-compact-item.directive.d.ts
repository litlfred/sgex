import { OnDestroy } from '@angular/core';
import * as i0 from "@angular/core";
export declare class NzSpaceCompactItemDirective implements OnDestroy {
    /**
     * Ancestor component injected from the parent.
     * Note that it is not necessarily the direct parent component.
     */
    private readonly spaceCompactCmp;
    private readonly items;
    private readonly type;
    private readonly elementRef;
    private readonly directionality;
    private readonly dir;
    private get parentElement();
    protected class: import("@angular/core").Signal<string[] | null>;
    constructor();
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzSpaceCompactItemDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzSpaceCompactItemDirective, never, ["nzSpaceCompactItem"], {}, {}, never, never, true, never>;
}
