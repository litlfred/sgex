import { OnDestroy, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class NzTbodyComponent implements OnDestroy {
    isInsideTable: boolean;
    showEmpty$: BehaviorSubject<boolean>;
    noResult$: BehaviorSubject<string | TemplateRef<any> | undefined>;
    listOfMeasureColumn$: BehaviorSubject<readonly string[]>;
    private destroy$;
    private nzTableStyleService;
    constructor();
    onListOfAutoWidthChange(listOfAutoWidth: number[]): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTbodyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTbodyComponent, "tbody", never, {}, {}, never, ["*"], true, never>;
}
