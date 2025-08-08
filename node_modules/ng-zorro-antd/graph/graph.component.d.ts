import { AfterContentChecked, ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, TemplateRef } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzGraphData } from './data-source/graph-data-source';
import { NzGraph } from './graph';
import { NzGraphNodeComponent } from './graph-node.component';
import { NzGraphZoomDirective } from './graph-zoom.directive';
import { NzGraphDataDef, NzGraphEdge, NzGraphEdgeDef, NzGraphGroupNode, NzGraphLayoutConfig, NzGraphNode, NzGraphNodeDef, NzGraphOption, NzRankDirection } from './interface';
import * as i0 from "@angular/core";
/** Checks whether an object is a data source. */
export declare function isDataSource(value: NzSafeAny): value is NzGraphData;
export declare class NzGraphComponent implements OnInit, OnChanges, AfterContentChecked, OnDestroy, NzGraph {
    private cdr;
    private elementRef;
    listOfNodeElement: QueryList<ElementRef>;
    listOfNodeComponent: QueryList<NzGraphNodeComponent>;
    nodeTemplate?: TemplateRef<{
        $implicit: NzGraphNode;
    }>;
    groupNodeTemplate?: TemplateRef<{
        $implicit: NzGraphGroupNode;
    }>;
    customGraphEdgeTemplate?: TemplateRef<{
        $implicit: NzGraphEdge;
    }>;
    /**
     * Provides a stream containing the latest data array to render.
     * Data source can be an observable of NzGraphData, or a NzGraphData to render.
     */
    nzGraphData: NzGraphData;
    nzRankDirection: NzRankDirection;
    nzGraphLayoutConfig?: NzGraphLayoutConfig;
    nzAutoSize: boolean;
    readonly nzGraphInitialized: EventEmitter<NzGraphComponent>;
    readonly nzGraphRendered: EventEmitter<NzGraphComponent>;
    readonly nzNodeClick: EventEmitter<NzGraphGroupNode | NzGraphNode>;
    requestId: number;
    transformStyle: string;
    graphRenderedSubject$: ReplaySubject<void>;
    renderInfo: NzGraphGroupNode;
    mapOfNodeAttr: Record<string, NzGraphNodeDef>;
    mapOfEdgeAttr: Record<string, NzGraphEdgeDef>;
    zoom: number;
    readonly typedNodes: (item: unknown) => (NzGraphGroupNode | NzGraphNode)[];
    private dataSource?;
    private layoutSetting;
    /** Data subscription */
    private _dataSubscription?;
    private destroy$;
    edgeTrackByFun: (edge: NzGraphEdge) => string;
    subGraphTransform: (node: NzGraphGroupNode) => string;
    $asNzGraphEdges: (data: unknown) => NzGraphEdge[];
    coreTransform: (node: NzGraphGroupNode) => string;
    noAnimation: NzNoAnimationDirective | null;
    nzGraphZoom: NzGraphZoomDirective | null;
    constructor(cdr: ChangeDetectorRef, elementRef: ElementRef);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterContentChecked(): void;
    ngOnDestroy(): void;
    /**
     * Move graph to center and scale automatically
     */
    fitCenter(): void;
    /**
     * re-Draw graph
     *
     * @param data
     * @param options
     * @param needResize
     */
    drawGraph(data: NzGraphDataDef, options: NzGraphOption, needResize?: boolean): Promise<void>;
    /**
     * Redraw all nodes
     *
     * @param animate
     */
    drawNodes(animate?: boolean): Promise<void>;
    private resizeNodeSize;
    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the node outlet. Otherwise start listening for new data.
     */
    private _switchDataSource;
    /** Set up a subscription for the data provided by the data source. */
    private observeRenderChanges;
    /**
     * Get renderInfo and prepare some data
     *
     * @param data
     * @param options
     * @private
     */
    private buildGraphInfo;
    /**
     * Play with animation
     *
     * @private
     */
    private makeNodesAnimation;
    private parseInfo;
    /**
     * Merge config with user inputs
     *
     * @param config
     * @private
     */
    private mergeConfig;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzGraphComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzGraphComponent, "nz-graph", ["nzGraph"], { "nzGraphData": { "alias": "nzGraphData"; "required": false; }; "nzRankDirection": { "alias": "nzRankDirection"; "required": false; }; "nzGraphLayoutConfig": { "alias": "nzGraphLayoutConfig"; "required": false; }; "nzAutoSize": { "alias": "nzAutoSize"; "required": false; }; }, { "nzGraphInitialized": "nzGraphInitialized"; "nzGraphRendered": "nzGraphRendered"; "nzNodeClick": "nzNodeClick"; }, ["nodeTemplate", "groupNodeTemplate", "customGraphEdgeTemplate"], ["*"], true, never>;
    static ngAcceptInputType_nzAutoSize: unknown;
}
