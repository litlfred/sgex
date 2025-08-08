import { ElementRef, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { IconDefinition, ThemeType } from '../types';
import { IconService } from './icon.service';
import * as i0 from "@angular/core";
interface RenderMeta {
    type: string | IconDefinition;
    theme?: ThemeType;
    twoToneColor?: string;
}
export declare class IconDirective implements OnChanges {
    protected _iconService: IconService;
    type: string | IconDefinition;
    theme?: ThemeType;
    twoToneColor?: string;
    protected _elementRef: ElementRef<any>;
    protected _renderer: Renderer2;
    constructor(_iconService: IconService);
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * Render a new icon in the current element. Remove the icon when `type` is falsy.
     */
    protected _changeIcon(): Promise<SVGElement | null>;
    protected _getSelfRenderMeta(): RenderMeta;
    /**
     * Parse a icon to the standard form, an `IconDefinition` or a string like 'account-book-fill` (with a theme suffixed).
     * If namespace is specified, ignore theme because it meaningless for users' icons.
     *
     * @param type
     * @param theme
     */
    protected _parseIconType(type: string | IconDefinition, theme?: ThemeType): IconDefinition | string;
    protected _setSVGElement(svg: SVGElement): void;
    protected _clearSVGElement(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IconDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IconDirective, "[antIcon]", never, { "type": { "alias": "type"; "required": false; }; "theme": { "alias": "theme"; "required": false; }; "twoToneColor": { "alias": "twoToneColor"; "required": false; }; }, {}, never, never, true, never>;
}
export {};
