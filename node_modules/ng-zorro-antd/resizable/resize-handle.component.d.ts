import { ElementRef, EventEmitter, OnInit, Renderer2 } from '@angular/core';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzResizableService } from './resizable.service';
import * as i0 from "@angular/core";
export type NzCursorType = 'window' | 'grid';
export type NzResizeDirection = 'top' | 'right' | 'bottom' | 'left' | 'topRight' | 'bottomRight' | 'bottomLeft' | 'topLeft';
export declare class NzResizeHandleMouseDownEvent {
    direction: NzResizeDirection;
    mouseEvent: MouseEvent | TouchEvent;
    constructor(direction: NzResizeDirection, mouseEvent: MouseEvent | TouchEvent);
}
export declare class NzResizeHandleComponent implements OnInit {
    private nzResizableService;
    private renderer;
    private host;
    private destroy$;
    nzDirection: NzResizeDirection;
    nzCursorType: NzCursorType;
    readonly nzMouseDown: EventEmitter<NzResizeHandleMouseDownEvent>;
    constructor(nzResizableService: NzResizableService, renderer: Renderer2, host: ElementRef<HTMLElement>, destroy$: NzDestroyService);
    ngOnInit(): void;
    onPointerDown(event: PointerEvent): void;
    onPointerUp(event: PointerEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzResizeHandleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzResizeHandleComponent, "nz-resize-handle, [nz-resize-handle]", ["nzResizeHandle"], { "nzDirection": { "alias": "nzDirection"; "required": false; }; "nzCursorType": { "alias": "nzCursorType"; "required": false; }; }, { "nzMouseDown": "nzMouseDown"; }, never, ["*"], true, never>;
}
