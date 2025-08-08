/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, ElementRef, EventEmitter, NgZone, OnDestroy, TemplateRef } from '@angular/core';
import type { editor } from 'monaco-editor';
import { NzSafeAny, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import { NzCodeEditorService } from './code-editor.service';
import { JoinedEditorOptions, NzEditorMode } from './typings';
import * as i0 from "@angular/core";
export declare class NzCodeEditorComponent implements OnDestroy, AfterViewInit {
    private nzCodeEditorService;
    private ngZone;
    private platform;
    nzEditorMode: NzEditorMode;
    nzOriginalText: string;
    nzLoading: boolean;
    nzFullControl: boolean;
    nzToolkit?: TemplateRef<void>;
    set nzEditorOption(value: JoinedEditorOptions);
    readonly nzEditorInitialized: EventEmitter<editor.IStandaloneCodeEditor | editor.IStandaloneDiffEditor>;
    editorOptionCached: JoinedEditorOptions;
    private readonly el;
    private destroy$;
    private resize$;
    private editorOption$;
    private editorInstance;
    private value;
    private modelSet;
    private onDidChangeContentDisposable;
    constructor(nzCodeEditorService: NzCodeEditorService, ngZone: NgZone, elementRef: ElementRef, platform: Platform);
    /**
     * Initialize a monaco editor instance.
     */
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: string): void;
    registerOnChange(fn: OnChangeType): NzSafeAny;
    registerOnTouched(fn: OnTouchedType): void;
    onChange: OnChangeType;
    onTouch: OnTouchedType;
    layout(): void;
    private setup;
    private registerOptionChanges;
    private initMonacoEditorInstance;
    private registerResizeChange;
    private setValue;
    /**
     * {@link editor.ICodeEditor}#setValue resets the cursor position to the start of the document.
     * This helper memorizes the cursor position and selections and restores them after the given
     * function has been called.
     */
    private preservePositionAndSelections;
    private setValueEmitter;
    private emitValue;
    private updateOptionToMonaco;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzCodeEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NzCodeEditorComponent, "nz-code-editor", ["nzCodeEditor"], { "nzEditorMode": { "alias": "nzEditorMode"; "required": false; }; "nzOriginalText": { "alias": "nzOriginalText"; "required": false; }; "nzLoading": { "alias": "nzLoading"; "required": false; }; "nzFullControl": { "alias": "nzFullControl"; "required": false; }; "nzToolkit": { "alias": "nzToolkit"; "required": false; }; "nzEditorOption": { "alias": "nzEditorOption"; "required": false; }; }, { "nzEditorInitialized": "nzEditorInitialized"; }, never, never, true, never>;
    static ngAcceptInputType_nzLoading: unknown;
    static ngAcceptInputType_nzFullControl: unknown;
}
