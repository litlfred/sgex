import { AfterContentInit, AfterViewInit, ElementRef, EventEmitter, OnDestroy, OnInit, QueryList, Renderer2, TemplateRef } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzThAddOnComponent } from '../cell/th-addon.component';
import { NzTrDirective } from './tr.directive';
import * as i0 from "@angular/core";
export declare class NzTheadComponent<T> implements AfterContentInit, OnDestroy, AfterViewInit, OnInit {
    private elementRef;
    private renderer;
    private destroy$;
    isInsideTable: boolean;
    templateRef: TemplateRef<NzSafeAny>;
    listOfNzTrDirective: QueryList<NzTrDirective>;
    listOfNzThAddOnComponent: QueryList<NzThAddOnComponent<T>>;
    readonly nzSortOrderChange: EventEmitter<{
        key: NzSafeAny;
        value: string | null;
    }>;
    private nzTableStyleService;
    private nzTableDataService;
    constructor(elementRef: ElementRef, renderer: Renderer2);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzTheadComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzTheadComponent<any>, "thead:not(.ant-table-thead)", never, {}, { "nzSortOrderChange": "nzSortOrderChange"; }, ["listOfNzTrDirective", "listOfNzThAddOnComponent"], ["*"], true, never>;
}
