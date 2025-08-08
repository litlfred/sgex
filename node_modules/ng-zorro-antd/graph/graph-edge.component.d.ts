import { ChangeDetectorRef, ElementRef, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { NzGraphEdge, NzGraphEdgeType } from './interface';
import * as i0 from "@angular/core";
export declare class NzGraphEdgeComponent implements OnInit, OnChanges {
    private elementRef;
    private cdr;
    edge: NzGraphEdge;
    edgeType?: NzGraphEdgeType | string;
    customTemplate?: TemplateRef<{
        $implicit: NzGraphEdge;
    }>;
    get id(): string;
    private el;
    private path;
    private line;
    private injector;
    constructor(elementRef: ElementRef<SVGGElement>, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    initElementStyle(): void;
    setLine(): void;
    setPath(d: string): void;
    setElementData(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzGraphEdgeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzGraphEdgeComponent, "[nz-graph-edge]", never, { "edge": { "alias": "edge"; "required": false; }; "edgeType": { "alias": "edgeType"; "required": false; }; "customTemplate": { "alias": "customTemplate"; "required": false; }; }, {}, never, never, true, never>;
}
