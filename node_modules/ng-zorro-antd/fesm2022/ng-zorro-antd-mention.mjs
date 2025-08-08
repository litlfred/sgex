import * as i0 from '@angular/core';
import { Directive, Injectable, forwardRef, EventEmitter, Output, inject, TemplateRef, ElementRef, booleanAttribute, ContentChild, ViewChildren, ViewChild, Input, ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, distinctUntilChanged, withLatestFrom, map, startWith, switchMap } from 'rxjs/operators';
import * as i1 from 'ng-zorro-antd/core/services';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { fromEventOutsideAngular, getMentions, getCaretCoordinates, getStatusClassNames } from 'ng-zorro-antd/core/util';
import { Subject, of, merge, Subscription } from 'rxjs';
import { ENTER, LEFT_ARROW, RIGHT_ARROW, TAB, ESCAPE, UP_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import * as i2 from '@angular/cdk/overlay';
import { OverlayConfig, ConnectionPositionPair } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { NzFormStatusService, NzFormNoStatusService, NzFormItemFeedbackIconComponent } from 'ng-zorro-antd/core/form';
import { DEFAULT_MENTION_BOTTOM_POSITIONS, DEFAULT_MENTION_TOP_POSITIONS } from 'ng-zorro-antd/core/overlay';
import * as i6 from 'ng-zorro-antd/empty';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import * as i5 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as i1$1 from '@angular/cdk/bidi';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMentionSuggestionDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionSuggestionDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzMentionSuggestionDirective, isStandalone: true, selector: "[nzMentionSuggestion]", exportAs: ["nzMentionSuggestion"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionSuggestionDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[nzMentionSuggestion]',
                    exportAs: 'nzMentionSuggestion'
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_MENTION_CONFIG = {
    split: ' '
};

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
class NzMentionService {
    trigger;
    triggerChange$ = new Subject();
    triggerChanged() {
        return this.triggerChange$.asObservable();
    }
    registerTrigger(trigger) {
        if (this.trigger !== trigger) {
            this.trigger = trigger;
            this.triggerChange$.next(trigger);
        }
    }
    ngOnDestroy() {
        this.triggerChange$.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionService, decorators: [{
            type: Injectable
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const NZ_MENTION_TRIGGER_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NzMentionTriggerDirective),
    multi: true
};
class NzMentionTriggerDirective {
    el;
    ngZone;
    ref;
    destroy$;
    nzMentionService;
    onChange = () => { };
    onTouched = () => { };
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onFocusin = new EventEmitter();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onBlur = new EventEmitter();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onInput = new EventEmitter();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onKeydown = new EventEmitter();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onClick = new EventEmitter();
    value;
    constructor(el, ngZone, ref, destroy$, nzMentionService) {
        this.el = el;
        this.ngZone = ngZone;
        this.ref = ref;
        this.destroy$ = destroy$;
        this.nzMentionService = nzMentionService;
    }
    completeEvents() {
        this.onFocusin.complete();
        this.onBlur.complete();
        this.onInput.complete();
        this.onKeydown.complete();
        this.onClick.complete();
    }
    focus(caretPos = null) {
        this.el.nativeElement.focus();
        this.el.nativeElement.setSelectionRange(caretPos, caretPos);
    }
    insertMention(mention) {
        const value = this.el.nativeElement.value;
        const insertValue = `${mention.mention}${NZ_MENTION_CONFIG.split}`;
        const newValue = [
            value.slice(0, mention.startPos + 1),
            insertValue,
            value.slice(mention.endPos, value.length)
        ].join('');
        this.el.nativeElement.value = newValue;
        this.focus(mention.startPos + insertValue.length + 1);
        this.onChange(newValue);
        this.value = newValue;
    }
    writeValue(value) {
        this.value = value;
        if (typeof value === 'string') {
            this.el.nativeElement.value = value;
        }
        else {
            this.el.nativeElement.value = '';
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    ngAfterViewInit() {
        this.nzMentionService.registerTrigger(this);
        this.setupEventListener('blur', this.onBlur);
        this.setupEventListener('focusin', this.onFocusin);
        this.setupEventListener('input', this.onInput);
        this.setupEventListener('click', this.onClick);
        this.setupEventListener('keydown', this.onKeydown);
    }
    ngOnDestroy() {
        this.completeEvents();
    }
    setupEventListener(eventName, eventEmitter) {
        fromEventOutsideAngular(this.el.nativeElement, eventName)
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
            if (eventEmitter.observers.length) {
                this.ngZone.run(() => {
                    eventEmitter.emit(event);
                    this.ref.markForCheck();
                });
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionTriggerDirective, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }, { token: i1.NzDestroyService }, { token: NzMentionService }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.2.2", type: NzMentionTriggerDirective, isStandalone: true, selector: "input[nzMentionTrigger], textarea[nzMentionTrigger]", outputs: { onFocusin: "onFocusin", onBlur: "onBlur", onInput: "onInput", onKeydown: "onKeydown", onClick: "onClick" }, host: { attributes: { "autocomplete": "off" } }, providers: [NzDestroyService, NZ_MENTION_TRIGGER_ACCESSOR], exportAs: ["nzMentionTrigger"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionTriggerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[nzMentionTrigger], textarea[nzMentionTrigger]',
                    exportAs: 'nzMentionTrigger',
                    providers: [NzDestroyService, NZ_MENTION_TRIGGER_ACCESSOR],
                    host: {
                        autocomplete: 'off'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }, { type: i1.NzDestroyService }, { type: NzMentionService }], propDecorators: { onFocusin: [{
                type: Output
            }], onBlur: [{
                type: Output
            }], onInput: [{
                type: Output
            }], onKeydown: [{
                type: Output
            }], onClick: [{
                type: Output
            }] } });

class NzMentionComponent {
    ngZone;
    directionality;
    cdr;
    overlay;
    viewContainerRef;
    elementRef;
    renderer;
    nzMentionService;
    destroy$;
    nzValueWith = value => value;
    nzPrefix = '@';
    nzLoading = false;
    nzNotFoundContent = '无匹配结果，轻敲空格完成输入';
    nzPlacement = 'bottom';
    nzSuggestions = [];
    nzStatus = '';
    nzOnSelect = new EventEmitter();
    nzOnSearchChange = new EventEmitter();
    trigger;
    suggestionsTemp;
    items;
    set suggestionChild(value) {
        if (value) {
            this.suggestionTemplate = value;
        }
    }
    isOpen = false;
    filteredSuggestions = [];
    suggestionTemplate = null;
    activeIndex = -1;
    dir = 'ltr';
    // status
    prefixCls = 'ant-mentions';
    statusCls = {};
    status = '';
    hasFeedback = false;
    previousValue = null;
    cursorMention = null;
    cursorMentionStart;
    cursorMentionEnd;
    overlayRef = null;
    portal;
    positionStrategy;
    overlayOutsideClickSubscription;
    document = inject(DOCUMENT);
    get triggerNativeElement() {
        return this.trigger.el.nativeElement;
    }
    get focusItemElement() {
        const itemArr = this.items?.toArray();
        if (itemArr && itemArr[this.activeIndex]) {
            return itemArr[this.activeIndex].nativeElement;
        }
        return null;
    }
    nzFormStatusService = inject(NzFormStatusService, { optional: true });
    nzFormNoStatusService = inject(NzFormNoStatusService, { optional: true });
    constructor(ngZone, directionality, cdr, overlay, viewContainerRef, elementRef, renderer, nzMentionService, destroy$) {
        this.ngZone = ngZone;
        this.directionality = directionality;
        this.cdr = cdr;
        this.overlay = overlay;
        this.viewContainerRef = viewContainerRef;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.nzMentionService = nzMentionService;
        this.destroy$ = destroy$;
    }
    ngOnInit() {
        this.nzFormStatusService?.formStatusChanges
            .pipe(distinctUntilChanged((pre, cur) => {
            return pre.status === cur.status && pre.hasFeedback === cur.hasFeedback;
        }), withLatestFrom(this.nzFormNoStatusService ? this.nzFormNoStatusService.noFormStatus : of(false)), map(([{ status, hasFeedback }, noStatus]) => ({ status: noStatus ? '' : status, hasFeedback })), takeUntil(this.destroy$))
            .subscribe(({ status, hasFeedback }) => {
            this.setStatusStyles(status, hasFeedback);
        });
        this.nzMentionService.triggerChanged().subscribe(trigger => {
            this.trigger = trigger;
            this.bindTriggerEvents();
            this.closeDropdown();
            this.overlayRef = null;
        });
        this.dir = this.directionality.value;
        this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction) => {
            this.dir = direction;
        });
    }
    ngOnChanges(changes) {
        const { nzSuggestions, nzStatus } = changes;
        if (nzSuggestions) {
            if (this.isOpen) {
                this.previousValue = null;
                this.activeIndex = -1;
                this.resetDropdown(false);
            }
        }
        if (nzStatus) {
            this.setStatusStyles(this.nzStatus, this.hasFeedback);
        }
    }
    ngAfterViewInit() {
        this.items.changes
            .pipe(startWith(this.items), switchMap(() => {
            const items = this.items.toArray();
            return merge(...items.map(item => fromEventOutsideAngular(item.nativeElement, 'mousedown')));
        }))
            .subscribe(event => {
            event.preventDefault();
        });
    }
    ngOnDestroy() {
        this.closeDropdown();
    }
    closeDropdown() {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
            this.overlayOutsideClickSubscription.unsubscribe();
            this.isOpen = false;
            this.cdr.markForCheck();
        }
    }
    openDropdown() {
        this.attachOverlay();
        this.isOpen = true;
        this.cdr.markForCheck();
    }
    getMentions() {
        return this.trigger ? getMentions(this.trigger.value, this.nzPrefix) : [];
    }
    selectSuggestion(suggestion) {
        const value = this.nzValueWith(suggestion);
        this.trigger.insertMention({
            mention: value,
            startPos: this.cursorMentionStart,
            endPos: this.cursorMentionEnd
        });
        this.nzOnSelect.emit(suggestion);
        this.closeDropdown();
        this.activeIndex = -1;
    }
    handleInput(event) {
        const target = event.target;
        this.trigger.onChange(target.value);
        this.trigger.value = target.value;
        this.resetDropdown();
    }
    handleKeydown(event) {
        const keyCode = event.keyCode;
        if (this.isOpen && keyCode === ENTER && this.activeIndex !== -1 && this.filteredSuggestions.length) {
            this.selectSuggestion(this.filteredSuggestions[this.activeIndex]);
            event.preventDefault();
        }
        else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
            this.resetDropdown();
            event.stopPropagation();
        }
        else {
            if (this.isOpen && (keyCode === TAB || keyCode === ESCAPE)) {
                this.closeDropdown();
                return;
            }
            if (this.isOpen && keyCode === UP_ARROW) {
                this.setPreviousItemActive();
                event.preventDefault();
                event.stopPropagation();
            }
            if (this.isOpen && keyCode === DOWN_ARROW) {
                this.setNextItemActive();
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
    handleClick() {
        this.resetDropdown();
    }
    bindTriggerEvents() {
        this.trigger.onInput.subscribe((e) => this.handleInput(e));
        this.trigger.onKeydown.subscribe((e) => this.handleKeydown(e));
        this.trigger.onClick.subscribe(() => this.handleClick());
    }
    suggestionsFilter(value, emit) {
        const suggestions = value.substring(1);
        /**
         * Should always emit (nzOnSearchChange) when value empty
         *
         * @[something]... @[empty]... @[empty]
         *     ^             ^           ^
         * preValue        preValue  (should emit)
         */
        if (this.previousValue === value && value !== this.cursorMention[0]) {
            return;
        }
        this.previousValue = value;
        if (emit) {
            this.nzOnSearchChange.emit({
                value: this.cursorMention.substring(1),
                prefix: this.cursorMention[0]
            });
        }
        const searchValue = suggestions.toLowerCase();
        this.filteredSuggestions = this.nzSuggestions.filter(suggestion => this.nzValueWith(suggestion).toLowerCase().includes(searchValue));
    }
    resetDropdown(emit = true) {
        this.resetCursorMention();
        if (typeof this.cursorMention !== 'string' || !this.canOpen()) {
            this.closeDropdown();
            return;
        }
        this.suggestionsFilter(this.cursorMention, emit);
        const activeIndex = this.filteredSuggestions.indexOf(this.cursorMention.substring(1));
        this.activeIndex = activeIndex >= 0 ? activeIndex : 0;
        this.openDropdown();
    }
    setNextItemActive() {
        this.activeIndex = this.activeIndex + 1 <= this.filteredSuggestions.length - 1 ? this.activeIndex + 1 : 0;
        this.cdr.markForCheck();
        this.scrollToFocusItem();
    }
    setPreviousItemActive() {
        this.activeIndex = this.activeIndex - 1 < 0 ? this.filteredSuggestions.length - 1 : this.activeIndex - 1;
        this.cdr.markForCheck();
        this.scrollToFocusItem();
    }
    scrollToFocusItem() {
        if (this.focusItemElement) {
            this.focusItemElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    }
    canOpen() {
        const element = this.triggerNativeElement;
        return !element.readOnly && !element.disabled;
    }
    resetCursorMention() {
        const value = this.triggerNativeElement.value.replace(/[\r\n]/g, NZ_MENTION_CONFIG.split) || '';
        const selectionStart = this.triggerNativeElement.selectionStart;
        const prefix = typeof this.nzPrefix === 'string' ? [this.nzPrefix] : this.nzPrefix;
        let i = prefix.length;
        while (i >= 0) {
            const startPos = value.lastIndexOf(prefix[i], selectionStart);
            const endPos = value.indexOf(NZ_MENTION_CONFIG.split, selectionStart) > -1
                ? value.indexOf(NZ_MENTION_CONFIG.split, selectionStart)
                : value.length;
            const mention = value.substring(startPos, endPos);
            if ((startPos > 0 && value[startPos - 1] !== NZ_MENTION_CONFIG.split) ||
                startPos < 0 ||
                mention.includes(prefix[i], 1) ||
                mention.includes(NZ_MENTION_CONFIG.split)) {
                this.cursorMention = null;
                this.cursorMentionStart = -1;
                this.cursorMentionEnd = -1;
            }
            else {
                this.cursorMention = mention;
                this.cursorMentionStart = startPos;
                this.cursorMentionEnd = endPos;
                return;
            }
            i--;
        }
    }
    updatePositions() {
        const coordinates = getCaretCoordinates(this.triggerNativeElement, this.cursorMentionStart);
        const top = coordinates.top -
            this.triggerNativeElement.getBoundingClientRect().height -
            this.triggerNativeElement.scrollTop +
            (this.nzPlacement === 'bottom' ? coordinates.height - 6 : -6);
        const left = coordinates.left - this.triggerNativeElement.scrollLeft;
        this.positionStrategy.withDefaultOffsetX(left).withDefaultOffsetY(top);
        if (this.nzPlacement === 'bottom') {
            this.positionStrategy.withPositions([...DEFAULT_MENTION_BOTTOM_POSITIONS]);
        }
        if (this.nzPlacement === 'top') {
            this.positionStrategy.withPositions([...DEFAULT_MENTION_TOP_POSITIONS]);
        }
        this.positionStrategy.apply();
    }
    subscribeOverlayOutsideClick() {
        const canCloseDropdown = (event) => {
            const clickTarget = event.target;
            return (this.isOpen &&
                clickTarget !== this.trigger.el.nativeElement &&
                !this.overlayRef?.overlayElement.contains(clickTarget));
        };
        const subscription = new Subscription();
        subscription.add(this.overlayRef.outsidePointerEvents().subscribe(event => canCloseDropdown(event) && this.closeDropdown()));
        subscription.add(fromEventOutsideAngular(this.document, 'touchend').subscribe(event => canCloseDropdown(event) && this.ngZone.run(() => this.closeDropdown())));
        return subscription;
    }
    attachOverlay() {
        if (!this.overlayRef) {
            this.portal = new TemplatePortal(this.suggestionsTemp, this.viewContainerRef);
            this.overlayRef = this.overlay.create(this.getOverlayConfig());
        }
        if (this.overlayRef && !this.overlayRef.hasAttached()) {
            this.overlayRef.attach(this.portal);
            this.overlayOutsideClickSubscription = this.subscribeOverlayOutsideClick();
        }
        this.updatePositions();
    }
    getOverlayConfig() {
        return new OverlayConfig({
            positionStrategy: this.getOverlayPosition(),
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            disposeOnNavigation: true
        });
    }
    getOverlayPosition() {
        const positions = [
            new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }),
            new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' })
        ];
        this.positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.trigger.el)
            .withPositions(positions)
            .withFlexibleDimensions(false)
            .withPush(false);
        return this.positionStrategy;
    }
    setStatusStyles(status, hasFeedback) {
        // set inner status
        this.status = status;
        this.hasFeedback = hasFeedback;
        this.cdr.markForCheck();
        // render status if nzStatus is set
        this.statusCls = getStatusClassNames(this.prefixCls, status, hasFeedback);
        Object.keys(this.statusCls).forEach(status => {
            if (this.statusCls[status]) {
                this.renderer.addClass(this.elementRef.nativeElement, status);
            }
            else {
                this.renderer.removeClass(this.elementRef.nativeElement, status);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionComponent, deps: [{ token: i0.NgZone }, { token: i1$1.Directionality }, { token: i0.ChangeDetectorRef }, { token: i2.Overlay }, { token: i0.ViewContainerRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: NzMentionService }, { token: i1.NzDestroyService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.2", type: NzMentionComponent, isStandalone: true, selector: "nz-mention", inputs: { nzValueWith: "nzValueWith", nzPrefix: "nzPrefix", nzLoading: ["nzLoading", "nzLoading", booleanAttribute], nzNotFoundContent: "nzNotFoundContent", nzPlacement: "nzPlacement", nzSuggestions: "nzSuggestions", nzStatus: "nzStatus" }, outputs: { nzOnSelect: "nzOnSelect", nzOnSearchChange: "nzOnSearchChange" }, host: { properties: { "class.ant-mentions-rtl": "dir === 'rtl'" }, classAttribute: "ant-mentions" }, providers: [NzMentionService, NzDestroyService], queries: [{ propertyName: "suggestionChild", first: true, predicate: NzMentionSuggestionDirective, descendants: true, read: TemplateRef }], viewQueries: [{ propertyName: "suggestionsTemp", first: true, predicate: TemplateRef, descendants: true }, { propertyName: "items", predicate: ["items"], descendants: true, read: ElementRef }], exportAs: ["nzMention"], usesOnChanges: true, ngImport: i0, template: `
    <ng-content></ng-content>
    <ng-template #suggestions>
      <div class="ant-mentions-dropdown">
        <ul class="ant-mentions-dropdown-menu" role="menu" tabindex="0">
          @for (suggestion of filteredSuggestions; track suggestion) {
            <li
              #items
              class="ant-mentions-dropdown-menu-item"
              role="menuitem"
              tabindex="-1"
              [class.ant-mentions-dropdown-menu-item-active]="$index === activeIndex"
              [class.ant-mentions-dropdown-menu-item-selected]="$index === activeIndex"
              (click)="selectSuggestion(suggestion)"
            >
              @if (suggestionTemplate) {
                <ng-container *ngTemplateOutlet="suggestionTemplate; context: { $implicit: suggestion }" />
              } @else {
                {{ nzValueWith(suggestion) }}
              }
            </li>
          }

          @if (filteredSuggestions.length === 0) {
            <li class="ant-mentions-dropdown-menu-item ant-mentions-dropdown-menu-item-disabled">
              @if (nzLoading) {
                <span><nz-icon nzType="loading" /></span>
              } @else {
                <span>
                  <nz-embed-empty nzComponentName="select" [specificContent]="nzNotFoundContent!" />
                </span>
              }
            </li>
          }
        </ul>
      </div>
    </ng-template>
    @if (hasFeedback && !!status) {
      <nz-form-item-feedback-icon class="ant-mentions-suffix" [status]="status" />
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i5.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: NzEmptyModule }, { kind: "component", type: i6.NzEmbedEmptyComponent, selector: "nz-embed-empty", inputs: ["nzComponentName", "specificContent"], exportAs: ["nzEmbedEmpty"] }, { kind: "component", type: NzFormItemFeedbackIconComponent, selector: "nz-form-item-feedback-icon", inputs: ["status"], exportAs: ["nzFormFeedbackIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nz-mention',
                    exportAs: 'nzMention',
                    template: `
    <ng-content></ng-content>
    <ng-template #suggestions>
      <div class="ant-mentions-dropdown">
        <ul class="ant-mentions-dropdown-menu" role="menu" tabindex="0">
          @for (suggestion of filteredSuggestions; track suggestion) {
            <li
              #items
              class="ant-mentions-dropdown-menu-item"
              role="menuitem"
              tabindex="-1"
              [class.ant-mentions-dropdown-menu-item-active]="$index === activeIndex"
              [class.ant-mentions-dropdown-menu-item-selected]="$index === activeIndex"
              (click)="selectSuggestion(suggestion)"
            >
              @if (suggestionTemplate) {
                <ng-container *ngTemplateOutlet="suggestionTemplate; context: { $implicit: suggestion }" />
              } @else {
                {{ nzValueWith(suggestion) }}
              }
            </li>
          }

          @if (filteredSuggestions.length === 0) {
            <li class="ant-mentions-dropdown-menu-item ant-mentions-dropdown-menu-item-disabled">
              @if (nzLoading) {
                <span><nz-icon nzType="loading" /></span>
              } @else {
                <span>
                  <nz-embed-empty nzComponentName="select" [specificContent]="nzNotFoundContent!" />
                </span>
              }
            </li>
          }
        </ul>
      </div>
    </ng-template>
    @if (hasFeedback && !!status) {
      <nz-form-item-feedback-icon class="ant-mentions-suffix" [status]="status" />
    }
  `,
                    preserveWhitespaces: false,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [NzMentionService, NzDestroyService],
                    host: {
                        class: 'ant-mentions',
                        '[class.ant-mentions-rtl]': `dir === 'rtl'`
                    },
                    imports: [NgTemplateOutlet, NzIconModule, NzEmptyModule, NzFormItemFeedbackIconComponent]
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i1$1.Directionality }, { type: i0.ChangeDetectorRef }, { type: i2.Overlay }, { type: i0.ViewContainerRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: NzMentionService }, { type: i1.NzDestroyService }], propDecorators: { nzValueWith: [{
                type: Input
            }], nzPrefix: [{
                type: Input
            }], nzLoading: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], nzNotFoundContent: [{
                type: Input
            }], nzPlacement: [{
                type: Input
            }], nzSuggestions: [{
                type: Input
            }], nzStatus: [{
                type: Input
            }], nzOnSelect: [{
                type: Output
            }], nzOnSearchChange: [{
                type: Output
            }], suggestionsTemp: [{
                type: ViewChild,
                args: [TemplateRef, { static: false }]
            }], items: [{
                type: ViewChildren,
                args: ['items', { read: ElementRef }]
            }], suggestionChild: [{
                type: ContentChild,
                args: [NzMentionSuggestionDirective, { static: false, read: TemplateRef }]
            }] } });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const COMPONENTS = [NzMentionComponent, NzMentionTriggerDirective, NzMentionSuggestionDirective];
class NzMentionModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.2", ngImport: i0, type: NzMentionModule, imports: [NzMentionComponent, NzMentionTriggerDirective, NzMentionSuggestionDirective], exports: [NzMentionComponent, NzMentionTriggerDirective, NzMentionSuggestionDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionModule, imports: [NzMentionComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.2", ngImport: i0, type: NzMentionModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [...COMPONENTS],
                    exports: [...COMPONENTS]
                }]
        }] });

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NZ_MENTION_TRIGGER_ACCESSOR, NzMentionComponent, NzMentionModule, NzMentionService, NzMentionSuggestionDirective, NzMentionTriggerDirective };
//# sourceMappingURL=ng-zorro-antd-mention.mjs.map
