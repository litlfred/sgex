import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { inject, Injectable, EventEmitter, forwardRef, booleanAttribute, Output, Input, ViewEncapsulation, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ReplaySubject, BehaviorSubject, of, Subject, combineLatest } from 'rxjs';
import { tap, map, takeUntil, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';
import { warn, PREFIX } from 'ng-zorro-antd/core/logger';
import { inNextTick, fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import * as i1 from 'ng-zorro-antd/core/config';
import * as i2 from '@angular/cdk/platform';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_CONFIG_MODULE_NAME = 'codeEditor';
function tryTriggerFunc(fn) {
    return (...args) => {
        if (fn) {
            fn(...args);
        }
    };
}
// Caretaker note: previously, these were `NzCodeEditorService` properties.
// They're kept as static variables because this will allow loading Monaco only once.
// This applies to micro frontend apps with multiple Angular apps or a single Angular app
// that can be bootstrapped and destroyed multiple times (e.g. using Webpack module federation).
// Root providers are re-initialized each time the app is bootstrapped. Platform providers aren't.
// We can't make the `NzCodeEditorService` to be a platform provider (`@Injectable({ providedIn: 'platform' })`)
// since it depends on other root providers.
const loaded$ = new ReplaySubject(1);
let loadingStatus = "unload" /* NzCodeEditorLoadingStatus.UNLOAD */;
class NzCodeEditorService {
    nzConfigService;
    document = inject(DOCUMENT);
    firstEditorInitialized = false;
    option = {};
    config;
    subscription;
    option$ = new BehaviorSubject(this.option);
    constructor(nzConfigService) {
        this.nzConfigService = nzConfigService;
        const globalConfig = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME);
        this.config = { ...globalConfig };
        if (this.config.monacoEnvironment) {
            window.MonacoEnvironment = { ...this.config.monacoEnvironment };
        }
        this.option = this.config.defaultEditorOption || {};
        this.subscription = this.nzConfigService.getConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME).subscribe(() => {
            const newGlobalConfig = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME);
            if (newGlobalConfig) {
                this._updateDefaultOption(newGlobalConfig.defaultEditorOption);
            }
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.subscription = null;
    }
    _updateDefaultOption(option) {
        this.option = { ...this.option, ...option };
        this.option$.next(this.option);
        if ('theme' in option && option.theme) {
            monaco.editor.setTheme(option.theme);
        }
    }
    requestToInit() {
        if (loadingStatus === "LOADED" /* NzCodeEditorLoadingStatus.LOADED */) {
            this.onInit();
            return of(this.getLatestOption());
        }
        if (loadingStatus === "unload" /* NzCodeEditorLoadingStatus.UNLOAD */) {
            if (this.config.useStaticLoading && typeof monaco === 'undefined') {
                warn('You choose to use static loading but it seems that you forget ' +
                    'to config webpack plugin correctly. Please refer to our official website' +
                    'for more details about static loading.');
            }
            else {
                this.loadMonacoScript();
            }
        }
        return loaded$.pipe(tap(() => this.onInit()), map(() => this.getLatestOption()));
    }
    loadMonacoScript() {
        if (this.config.useStaticLoading) {
            Promise.resolve().then(() => this.onLoad());
            return;
        }
        if (loadingStatus === "loading" /* NzCodeEditorLoadingStatus.LOADING */) {
            return;
        }
        loadingStatus = "loading" /* NzCodeEditorLoadingStatus.LOADING */;
        const assetsRoot = this.config.assetsRoot;
        const vs = assetsRoot ? `${assetsRoot}/vs` : 'assets/vs';
        const windowAsAny = window;
        const loadScript = this.document.createElement('script');
        loadScript.type = 'text/javascript';
        loadScript.src = `${vs}/loader.js`;
        const onLoad = () => {
            cleanup();
            windowAsAny.require.config({
                paths: { vs },
                ...this.config.extraConfig
            });
            windowAsAny.require(['vs/editor/editor.main'], () => {
                this.onLoad();
            });
        };
        const onError = () => {
            cleanup();
            throw new Error(`${PREFIX} cannot load assets of monaco editor from source "${vs}".`);
        };
        const cleanup = () => {
            // Caretaker note: we have to remove these listeners once the `<script>` is loaded successfully
            // or not since the `onLoad` listener captures `this`, which will prevent the `NzCodeEditorService`
            // from being garbage collected.
            loadScript.removeEventListener('load', onLoad);
            loadScript.removeEventListener('error', onError);
            // We don't need to keep the `<script>` element within the `<body>` since JavaScript has
            // been executed and Monaco is available globally. E.g. Webpack, always removes `<script>`
            // elements after loading chunks (see its `LoadScriptRuntimeModule`).
            this.document.documentElement.removeChild(loadScript);
        };
        loadScript.addEventListener('load', onLoad);
        loadScript.addEventListener('error', onError);
        this.document.documentElement.appendChild(loadScript);
    }
    onLoad() {
        loadingStatus = "LOADED" /* NzCodeEditorLoadingStatus.LOADED */;
        loaded$.next(true);
        loaded$.complete();
        tryTriggerFunc(this.config.onLoad)();
    }
    onInit() {
        if (!this.firstEditorInitialized) {
            this.firstEditorInitialized = true;
            tryTriggerFunc(this.config.onFirstEditorInit)();
        }
        tryTriggerFunc(this.config.onInit)();
    }
    getLatestOption() {
        return { ...this.option };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorService, deps: [{ token: i1.NzConfigService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.NzConfigService }] });

class NzCodeEditorComponent {
    nzCodeEditorService;
    ngZone;
    platform;
    nzEditorMode = 'normal';
    nzOriginalText = '';
    nzLoading = false;
    nzFullControl = false;
    nzToolkit;
    set nzEditorOption(value) {
        this.editorOption$.next(value);
    }
    nzEditorInitialized = new EventEmitter();
    editorOptionCached = {};
    el;
    destroy$ = new Subject();
    resize$ = new Subject();
    editorOption$ = new BehaviorSubject({});
    editorInstance = null;
    value = '';
    modelSet = false;
    onDidChangeContentDisposable = null;
    constructor(nzCodeEditorService, ngZone, elementRef, platform) {
        this.nzCodeEditorService = nzCodeEditorService;
        this.ngZone = ngZone;
        this.platform = platform;
        this.el = elementRef.nativeElement;
        this.el.classList.add('ant-code-editor');
    }
    /**
     * Initialize a monaco editor instance.
     */
    ngAfterViewInit() {
        if (!this.platform.isBrowser) {
            return;
        }
        this.nzCodeEditorService
            .requestToInit()
            .pipe(takeUntil(this.destroy$))
            .subscribe(option => this.setup(option));
    }
    ngOnDestroy() {
        if (this.onDidChangeContentDisposable) {
            this.onDidChangeContentDisposable.dispose();
            this.onDidChangeContentDisposable = null;
        }
        if (this.editorInstance) {
            this.editorInstance.dispose();
            this.editorInstance = null;
        }
        this.destroy$.next();
        this.destroy$.complete();
    }
    writeValue(value) {
        this.value = value;
        this.setValue();
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouch = fn;
    }
    onChange = (_value) => { };
    onTouch = () => { };
    layout() {
        this.resize$.next();
    }
    setup(option) {
        // The `setup()` is invoked when the Monaco editor is loaded. This may happen asynchronously for the first
        // time, and it'll always happen synchronously afterwards. The first `setup()` invokation is outside the Angular
        // zone, but further invokations will happen within the Angular zone. We call the `setModel()` on the editor
        // instance, which tells Monaco to add event listeners lazily internally (`mousemove`, `mouseout`, etc.).
        // We should avoid adding them within the Angular zone since this will drastically affect the performance.
        this.ngZone.runOutsideAngular(() => inNextTick()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
            this.editorOptionCached = option;
            this.registerOptionChanges();
            this.initMonacoEditorInstance();
            this.registerResizeChange();
            this.setValue();
            if (!this.nzFullControl) {
                this.setValueEmitter();
            }
            if (this.nzEditorInitialized.observers.length) {
                this.ngZone.run(() => this.nzEditorInitialized.emit(this.editorInstance));
            }
        }));
    }
    registerOptionChanges() {
        combineLatest([this.editorOption$, this.nzCodeEditorService.option$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([selfOpt, defaultOpt]) => {
            this.editorOptionCached = {
                ...this.editorOptionCached,
                ...defaultOpt,
                ...selfOpt
            };
            this.updateOptionToMonaco();
        });
    }
    initMonacoEditorInstance() {
        this.ngZone.runOutsideAngular(() => {
            this.editorInstance =
                this.nzEditorMode === 'normal'
                    ? monaco.editor.create(this.el, { ...this.editorOptionCached })
                    : monaco.editor.createDiffEditor(this.el, {
                        ...this.editorOptionCached
                    });
        });
    }
    registerResizeChange() {
        fromEventOutsideAngular(window, 'resize')
            .pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe(() => {
            this.layout();
        });
        this.resize$
            .pipe(takeUntil(this.destroy$), filter(() => !!this.editorInstance), map(() => ({
            width: this.el.clientWidth,
            height: this.el.clientHeight
        })), distinctUntilChanged((a, b) => a.width === b.width && a.height === b.height), debounceTime(50))
            .subscribe(() => {
            this.editorInstance.layout();
        });
    }
    setValue() {
        if (!this.editorInstance) {
            return;
        }
        if (this.nzFullControl && this.value) {
            warn(`should not set value when you are using full control mode! It would result in ambiguous data flow!`);
            return;
        }
        if (this.nzEditorMode === 'normal') {
            if (this.modelSet) {
                const model = this.editorInstance.getModel();
                this.preservePositionAndSelections(() => model.setValue(this.value));
            }
            else {
                this.editorInstance.setModel(monaco.editor.createModel(this.value, this.editorOptionCached.language));
                this.modelSet = true;
            }
        }
        else {
            if (this.modelSet) {
                const model = this.editorInstance.getModel();
                this.preservePositionAndSelections(() => {
                    model.modified.setValue(this.value);
                    model.original.setValue(this.nzOriginalText);
                });
            }
            else {
                const language = this.editorOptionCached.language;
                this.editorInstance.setModel({
                    original: monaco.editor.createModel(this.nzOriginalText, language),
                    modified: monaco.editor.createModel(this.value, language)
                });
                this.modelSet = true;
            }
        }
    }
    /**
     * {@link editor.ICodeEditor}#setValue resets the cursor position to the start of the document.
     * This helper memorizes the cursor position and selections and restores them after the given
     * function has been called.
     */
    preservePositionAndSelections(fn) {
        if (!this.editorInstance) {
            fn();
            return;
        }
        const position = this.editorInstance.getPosition();
        const selections = this.editorInstance.getSelections();
        fn();
        if (position) {
            this.editorInstance.setPosition(position);
        }
        if (selections) {
            this.editorInstance.setSelections(selections);
        }
    }
    setValueEmitter() {
        const model = (this.nzEditorMode === 'normal'
            ? this.editorInstance.getModel()
            : this.editorInstance.getModel().modified);
        // The `onDidChangeContent` returns a disposable object (an object with `dispose()` method) which will cleanup
        // the listener. The callback, that we pass to `onDidChangeContent`, captures `this`. This leads to a circular reference
        // (`nz-code-editor -> monaco -> nz-code-editor`) and prevents the `nz-code-editor` from being GC'd.
        this.onDidChangeContentDisposable = model.onDidChangeContent(() => {
            this.emitValue(model.getValue());
        });
    }
    emitValue(value) {
        if (this.value === value) {
            // If the value didn't change there's no reason to send an update.
            // Specifically this may happen during an update from the model (writeValue) where sending an update to the model would actually be incorrect.
            return;
        }
        this.value = value;
        // We're re-entering the Angular zone only if the value has been changed since there's a `return` expression previously.
        // This won't cause "dead" change detections (basically when the `tick()` has been run, but there's nothing to update).
        this.ngZone.run(() => {
            this.onChange(value);
        });
    }
    updateOptionToMonaco() {
        if (this.editorInstance) {
            this.editorInstance.updateOptions({ ...this.editorOptionCached });
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorComponent, deps: [{ token: NzCodeEditorService }, { token: i0.NgZone }, { token: i0.ElementRef }, { token: i2.Platform }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzCodeEditorComponent, isStandalone: true, selector: "nz-code-editor", inputs: { nzEditorMode: "nzEditorMode", nzOriginalText: "nzOriginalText", nzLoading: ["nzLoading", "nzLoading", booleanAttribute], nzFullControl: ["nzFullControl", "nzFullControl", booleanAttribute], nzToolkit: "nzToolkit", nzEditorOption: "nzEditorOption" }, outputs: { nzEditorInitialized: "nzEditorInitialized" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NzCodeEditorComponent),
                multi: true
            }
        ], exportAs: ["nzCodeEditor"], ngImport: i0, template: `
    @if (nzLoading) {
      <div class="ant-code-editor-loading">
        <nz-spin />
      </div>
    }
    @if (nzToolkit) {
      <div class="ant-code-editor-toolkit">
        <ng-template [ngTemplateOutlet]="nzToolkit" />
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "component", type: NzSpinComponent, selector: "nz-spin", inputs: ["nzIndicator", "nzSize", "nzTip", "nzDelay", "nzSimple", "nzSpinning"], exportAs: ["nzSpin"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorComponent, decorators: [{
            type: Component,
            args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'nz-code-editor',
                    exportAs: 'nzCodeEditor',
                    template: `
    @if (nzLoading) {
      <div class="ant-code-editor-loading">
        <nz-spin />
      </div>
    }
    @if (nzToolkit) {
      <div class="ant-code-editor-toolkit">
        <ng-template [ngTemplateOutlet]="nzToolkit" />
      </div>
    }
  `,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NzCodeEditorComponent),
                            multi: true
                        }
                    ],
                    imports: [NzSpinComponent, NgTemplateOutlet]
                }]
        }], ctorParameters: () => [{ type: NzCodeEditorService }, { type: i0.NgZone }, { type: i0.ElementRef }, { type: i2.Platform }], propDecorators: { nzEditorMode: [{
                type: Input
            }], nzOriginalText: [{
                type: Input
            }], nzLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzFullControl: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzToolkit: [{
                type: Input
            }], nzEditorOption: [{
                type: Input
            }], nzEditorInitialized: [{
                type: Output
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzCodeEditorModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorModule, imports: [NzCodeEditorComponent], exports: [NzCodeEditorComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorModule, imports: [NzCodeEditorComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzCodeEditorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NzCodeEditorComponent],
                    exports: [NzCodeEditorComponent]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NzCodeEditorComponent, NzCodeEditorModule, NzCodeEditorService };
//# sourceMappingURL=ng-zorro-antd-code-editor.mjs.map
