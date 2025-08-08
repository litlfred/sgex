import * as i0 from '@angular/core';
import { isDevMode, InjectionToken, SecurityContext, Injectable, Optional, Inject, inject, ElementRef, Renderer2, Directive, Input, NgModule, makeEnvironmentProviders } from '@angular/core';
import { generate } from '@ant-design/colors';
import { DOCUMENT } from '@angular/common';
import * as i1 from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Subject, of, Observable } from 'rxjs';
import { map, tap, finalize, catchError, share, filter, take } from 'rxjs/operators';
import * as i2 from '@angular/platform-browser';

const ANT_ICON_ANGULAR_CONSOLE_PREFIX = '[@ant-design/icons-angular]:';
function error(message) {
    console.error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX} ${message}.`);
}
function warn(message) {
    if (isDevMode()) {
        console.warn(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX} ${message}.`);
    }
}
function getSecondaryColor(primaryColor) {
    return generate(primaryColor)[0];
}
function withSuffix(name, theme) {
    switch (theme) {
        case 'fill': return `${name}-fill`;
        case 'outline': return `${name}-o`;
        case 'twotone': return `${name}-twotone`;
        case undefined: return name;
        default: throw new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}Theme "${theme}" is not a recognized theme!`);
    }
}
function withSuffixAndColor(name, theme, pri, sec) {
    return `${withSuffix(name, theme)}-${pri}-${sec}`;
}
function mapAbbrToTheme(abbr) {
    return abbr === 'o' ? 'outline' : abbr;
}
function alreadyHasAThemeSuffix(name) {
    return name.endsWith('-fill') || name.endsWith('-o') || name.endsWith('-twotone');
}
function isIconDefinition(target) {
    return (typeof target === 'object' &&
        typeof target.name === 'string' &&
        (typeof target.theme === 'string' || target.theme === undefined) &&
        typeof target.icon === 'string');
}
/**
 * Get an `IconDefinition` object from abbreviation type, like `account-book-fill`.
 * @param str
 */
function getIconDefinitionFromAbbr(str) {
    const arr = str.split('-');
    const theme = mapAbbrToTheme(arr.splice(arr.length - 1, 1)[0]);
    const name = arr.join('-');
    return {
        name,
        theme,
        icon: ''
    };
}
function cloneSVG(svg) {
    return svg.cloneNode(true);
}
/**
 * Parse inline SVG string and replace colors with placeholders. For twotone icons only.
 */
function replaceFillColor(raw) {
    return raw
        .replace(/['"]#333['"]/g, '"primaryColor"')
        .replace(/['"]#E6E6E6['"]/g, '"secondaryColor"')
        .replace(/['"]#D9D9D9['"]/g, '"secondaryColor"')
        .replace(/['"]#D8D8D8['"]/g, '"secondaryColor"');
}
/**
 * Split a name with namespace in it into a tuple like [ name, namespace ].
 */
function getNameAndNamespace(type) {
    const split = type.split(':');
    switch (split.length) {
        case 1: return [type, ''];
        case 2: return [split[1], split[0]];
        default: throw new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}The icon type ${type} is not valid!`);
    }
}
function hasNamespace(type) {
    return getNameAndNamespace(type)[1] !== '';
}

function NameSpaceIsNotSpecifyError() {
    return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}Type should have a namespace. Try "namespace:${name}".`);
}
function IconNotFoundError(icon) {
    return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}the icon ${icon} does not exist or is not registered.`);
}
function HttpModuleNotImport() {
    error(`you need to import "HttpClientModule" to use dynamic importing.`);
    return null;
}
function UrlNotSafeError(url) {
    return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}The url "${url}" is unsafe.`);
}
function SVGTagNotFoundError() {
    return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}<svg> tag not found.`);
}
function DynamicLoadingTimeoutError() {
    return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}Importing timeout error.`);
}

const JSONP_HANDLER_NAME = '__ant_icon_load';
const ANT_ICONS = new InjectionToken('ant_icons');
class IconService {
    set twoToneColor({ primaryColor, secondaryColor }) {
        this._twoToneColorPalette.primaryColor = primaryColor;
        this._twoToneColorPalette.secondaryColor =
            secondaryColor || getSecondaryColor(primaryColor);
    }
    get twoToneColor() {
        // Make a copy to avoid unexpected changes.
        return { ...this._twoToneColorPalette };
    }
    /**
     * Disable dynamic loading (support static loading only).
     */
    get _disableDynamicLoading() {
        return false;
    }
    constructor(_rendererFactory, _handler, _document, sanitizer, _antIcons) {
        this._rendererFactory = _rendererFactory;
        this._handler = _handler;
        this._document = _document;
        this.sanitizer = sanitizer;
        this._antIcons = _antIcons;
        this.defaultTheme = 'outline';
        /**
         * All icon definitions would be registered here.
         */
        this._svgDefinitions = new Map();
        /**
         * Cache all rendered icons. Icons are identified by name, theme,
         * and for twotone icons, primary color and secondary color.
         */
        this._svgRenderedDefinitions = new Map();
        this._inProgressFetches = new Map();
        /**
         * Url prefix for fetching inline SVG by dynamic importing.
         */
        this._assetsUrlRoot = '';
        this._twoToneColorPalette = {
            primaryColor: '#333333',
            secondaryColor: '#E6E6E6'
        };
        /** A flag indicates whether jsonp loading is enabled. */
        this._enableJsonpLoading = false;
        this._jsonpIconLoad$ = new Subject();
        this._renderer = this._rendererFactory.createRenderer(null, null);
        if (this._handler) {
            this._http = new HttpClient(this._handler);
        }
        if (this._antIcons) {
            this.addIcon(...this._antIcons);
        }
    }
    /**
     * Call this method to switch to jsonp like loading.
     */
    useJsonpLoading() {
        if (!this._enableJsonpLoading) {
            this._enableJsonpLoading = true;
            window[JSONP_HANDLER_NAME] = (icon) => {
                this._jsonpIconLoad$.next(icon);
            };
        }
        else {
            warn('You are already using jsonp loading.');
        }
    }
    /**
     * Change the prefix of the inline svg resources, so they could be deployed elsewhere, like CDN.
     * @param prefix
     */
    changeAssetsSource(prefix) {
        this._assetsUrlRoot = prefix.endsWith('/') ? prefix : prefix + '/';
    }
    /**
     * Add icons provided by ant design.
     * @param icons
     */
    addIcon(...icons) {
        icons.forEach(icon => {
            this._svgDefinitions.set(withSuffix(icon.name, icon.theme), icon);
        });
    }
    /**
     * Register an icon. Namespace is required.
     * @param type
     * @param literal
     */
    addIconLiteral(type, literal) {
        const [_, namespace] = getNameAndNamespace(type);
        if (!namespace) {
            throw NameSpaceIsNotSpecifyError();
        }
        this.addIcon({ name: type, icon: literal });
    }
    /**
     * Remove all cache.
     */
    clear() {
        this._svgDefinitions.clear();
        this._svgRenderedDefinitions.clear();
    }
    /**
     * Get a rendered `SVGElement`.
     * @param icon
     * @param twoToneColor
     */
    getRenderedContent(icon, twoToneColor) {
        // If `icon` is a `IconDefinition`, go to the next step. If not, try to fetch it from cache.
        const definition = isIconDefinition(icon)
            ? icon
            : this._svgDefinitions.get(icon) || null;
        if (!definition && this._disableDynamicLoading) {
            throw IconNotFoundError(icon);
        }
        // If `icon` is a `IconDefinition` of successfully fetch, wrap it in an `Observable`.
        // Otherwise try to fetch it from remote.
        const $iconDefinition = definition
            ? of(definition)
            : this._loadIconDynamically(icon);
        // If finally get an `IconDefinition`, render and return it. Otherwise throw an error.
        return $iconDefinition.pipe(map(i => {
            if (!i) {
                throw IconNotFoundError(icon);
            }
            return this._loadSVGFromCacheOrCreateNew(i, twoToneColor);
        }));
    }
    getCachedIcons() {
        return this._svgDefinitions;
    }
    /**
     * Get raw svg and assemble a `IconDefinition` object.
     * @param type
     */
    _loadIconDynamically(type) {
        // If developer doesn't provide HTTP module nor enable jsonp loading, just throw an error.
        if (!this._http && !this._enableJsonpLoading) {
            return of(HttpModuleNotImport());
        }
        // If multi directive ask for the same icon at the same time,
        // request should only be fired once.
        let inProgress = this._inProgressFetches.get(type);
        if (!inProgress) {
            const [name, namespace] = getNameAndNamespace(type);
            // If the string has a namespace within, create a simple `IconDefinition`.
            const icon = namespace
                ? { name: type, icon: '' }
                : getIconDefinitionFromAbbr(name);
            const suffix = this._enableJsonpLoading ? '.js' : '.svg';
            const url = (namespace
                ? `${this._assetsUrlRoot}assets/${namespace}/${name}`
                : `${this._assetsUrlRoot}assets/${icon.theme}/${icon.name}`) + suffix;
            const safeUrl = this.sanitizer.sanitize(SecurityContext.URL, url);
            if (!safeUrl) {
                throw UrlNotSafeError(url);
            }
            const source = !this._enableJsonpLoading
                ? this._http
                    .get(safeUrl, { responseType: 'text' })
                    .pipe(map(literal => ({ ...icon, icon: literal })))
                : this._loadIconDynamicallyWithJsonp(icon, safeUrl);
            inProgress = source.pipe(tap(definition => this.addIcon(definition)), finalize(() => this._inProgressFetches.delete(type)), catchError(() => of(null)), share());
            this._inProgressFetches.set(type, inProgress);
        }
        return inProgress;
    }
    _loadIconDynamicallyWithJsonp(icon, url) {
        return new Observable(subscriber => {
            const loader = this._document.createElement('script');
            const timer = setTimeout(() => {
                clean();
                subscriber.error(DynamicLoadingTimeoutError());
            }, 6000);
            loader.src = url;
            function clean() {
                loader.parentNode.removeChild(loader);
                clearTimeout(timer);
            }
            this._document.body.appendChild(loader);
            this._jsonpIconLoad$
                .pipe(filter(i => i.name === icon.name && i.theme === icon.theme), take(1))
                .subscribe(i => {
                subscriber.next(i);
                clean();
            });
        });
    }
    /**
     * Render a new `SVGElement` for a given `IconDefinition`, or make a copy from cache.
     * @param icon
     * @param twoToneColor
     */
    _loadSVGFromCacheOrCreateNew(icon, twoToneColor) {
        let svg;
        const pri = twoToneColor || this._twoToneColorPalette.primaryColor;
        const sec = getSecondaryColor(pri) || this._twoToneColorPalette.secondaryColor;
        const key = icon.theme === 'twotone'
            ? withSuffixAndColor(icon.name, icon.theme, pri, sec)
            : icon.theme === undefined
                ? icon.name
                : withSuffix(icon.name, icon.theme);
        // Try to make a copy from cache.
        const cached = this._svgRenderedDefinitions.get(key);
        if (cached) {
            svg = cached.icon;
        }
        else {
            svg = this._setSVGAttribute(this._colorizeSVGIcon(
            // Icons provided by ant design should be refined to remove preset colors.
            this._createSVGElementFromString(hasNamespace(icon.name) ? icon.icon : replaceFillColor(icon.icon)), icon.theme === 'twotone', pri, sec));
            // Cache it.
            this._svgRenderedDefinitions.set(key, {
                ...icon,
                icon: svg
            });
        }
        return cloneSVG(svg);
    }
    _createSVGElementFromString(str) {
        const div = this._document.createElement('div');
        div.innerHTML = str;
        const svg = div.querySelector('svg');
        if (!svg) {
            throw SVGTagNotFoundError;
        }
        return svg;
    }
    _setSVGAttribute(svg) {
        this._renderer.setAttribute(svg, 'width', '1em');
        this._renderer.setAttribute(svg, 'height', '1em');
        return svg;
    }
    _colorizeSVGIcon(svg, twotone, pri, sec) {
        if (twotone) {
            const children = svg.childNodes;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const child = children[i];
                if (child.getAttribute('fill') === 'secondaryColor') {
                    this._renderer.setAttribute(child, 'fill', sec);
                }
                else {
                    this._renderer.setAttribute(child, 'fill', pri);
                }
            }
        }
        this._renderer.setAttribute(svg, 'fill', 'currentColor');
        return svg;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconService, deps: [{ token: i0.RendererFactory2 }, { token: i1.HttpBackend, optional: true }, { token: DOCUMENT, optional: true }, { token: i2.DomSanitizer }, { token: ANT_ICONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i0.RendererFactory2 }, { type: i1.HttpBackend, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i2.DomSanitizer }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANT_ICONS]
                }] }] });

function checkMeta(prev, after) {
    return prev.type === after.type && prev.theme === after.theme && prev.twoToneColor === after.twoToneColor;
}
class IconDirective {
    constructor(_iconService) {
        this._iconService = _iconService;
        this._elementRef = inject(ElementRef);
        this._renderer = inject(Renderer2);
    }
    ngOnChanges(changes) {
        if (changes.type || changes.theme || changes.twoToneColor) {
            this._changeIcon();
        }
    }
    /**
     * Render a new icon in the current element. Remove the icon when `type` is falsy.
     */
    _changeIcon() {
        return new Promise(resolve => {
            if (!this.type) {
                this._clearSVGElement();
                resolve(null);
                return;
            }
            const beforeMeta = this._getSelfRenderMeta();
            this._iconService.getRenderedContent(this._parseIconType(this.type, this.theme), this.twoToneColor).subscribe(svg => {
                // avoid race condition
                // see https://github.com/ant-design/ant-design-icons/issues/315
                const afterMeta = this._getSelfRenderMeta();
                if (checkMeta(beforeMeta, afterMeta)) {
                    this._setSVGElement(svg);
                    resolve(svg);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    _getSelfRenderMeta() {
        return {
            type: this.type,
            theme: this.theme,
            twoToneColor: this.twoToneColor
        };
    }
    /**
     * Parse a icon to the standard form, an `IconDefinition` or a string like 'account-book-fill` (with a theme suffixed).
     * If namespace is specified, ignore theme because it meaningless for users' icons.
     *
     * @param type
     * @param theme
     */
    _parseIconType(type, theme) {
        if (isIconDefinition(type)) {
            return type;
        }
        else {
            const [name, namespace] = getNameAndNamespace(type);
            if (namespace) {
                return type;
            }
            if (alreadyHasAThemeSuffix(name)) {
                if (!!theme) {
                    warn(`'type' ${name} already gets a theme inside so 'theme' ${theme} would be ignored`);
                }
                return name;
            }
            else {
                return withSuffix(name, theme || this._iconService.defaultTheme);
            }
        }
    }
    _setSVGElement(svg) {
        this._clearSVGElement();
        this._renderer.appendChild(this._elementRef.nativeElement, svg);
    }
    _clearSVGElement() {
        const el = this._elementRef.nativeElement;
        const children = el.childNodes;
        const length = children.length;
        for (let i = length - 1; i >= 0; i--) {
            const child = children[i];
            if (child.tagName?.toLowerCase() === 'svg') {
                this._renderer.removeChild(el, child);
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconDirective, deps: [{ token: IconService }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.0.0", type: IconDirective, isStandalone: true, selector: "[antIcon]", inputs: { type: "type", theme: "theme", twoToneColor: "twoToneColor" }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[antIcon]'
                }]
        }], ctorParameters: () => [{ type: IconService }], propDecorators: { type: [{
                type: Input
            }], theme: [{
                type: Input
            }], twoToneColor: [{
                type: Input
            }] } });

/**
 * @deprecated Please use `IconDirective` instead, will be removed in v20.
 */
class IconModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.0", ngImport: i0, type: IconModule, imports: [IconDirective], exports: [IconDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.0", ngImport: i0, type: IconModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [IconDirective],
                    exports: [IconDirective]
                }]
        }] });

/**
 * Provide icon definitions in root
 *
 * @param icons Icon definitions
 */
function provideAntIcons(icons) {
    return makeEnvironmentProviders([
        {
            provide: ANT_ICONS,
            useValue: icons
        }
    ]);
}

const manifest = {
    fill: [
        'alipay-square', 'aliwangwang', 'alipay-circle', 'alert', 'amazon-circle', 'android', 'apple', 'amazon-square', 'appstore', 'api', 'bank', 'behance-circle', 'behance-square', 'bell', 'bilibili', 'audio', 'book', 'account-book', 'box-plot', 'bug', 'backward', 'build', 'calculator', 'calendar', 'bulb', 'camera', 'caret-down', 'caret-right', 'caret-left', 'carry-out', 'car', 'caret-up', 'chrome', 'ci-circle', 'check-square', 'clock-circle', 'close-circle', 'close-square', 'cloud', 'code-sandbox-circle', 'code', 'codepen-square', 'code-sandbox-square', 'codepen-circle', 'compass', 'check-circle', 'contacts', 'container', 'credit-card', 'control', 'crown', 'copy', 'copyright-circle', 'customer-service', 'dashboard', 'database', 'delete', 'diff', 'dingtalk-circle', 'dingtalk-square', 'discord', 'dislike', 'dollar-circle', 'down-circle', 'down-square', 'dribbble-square', 'dribbble-circle', 'edit', 'environment', 'euro-circle', 'experiment', 'eye', 'eye-invisible', 'exclamation-circle', 'dropbox-circle', 'fast-backward', 'facebook', 'file-excel', 'file-exclamation', 'file', 'file-image', 'file-markdown', 'file-pdf', 'file-ppt', 'fast-forward', 'dropbox-square', 'file-text', 'file-zip', 'file-unknown', 'file-word', 'filter', 'fire', 'flag', 'folder-add', 'folder', 'folder-open', 'file-add', 'frown', 'fund', 'forward', 'funnel-plot', 'gift', 'gitlab', 'gold', 'github', 'golden', 'google-plus-square', 'google-plus-circle', 'google-square', 'heart', 'format-painter', 'highlight', 'home', 'hourglass', 'hdd', 'html5', 'idcard', 'google-circle', 'ie-square', 'insurance', 'instagram', 'ie-circle', 'layout', 'left-circle', 'interaction', 'left-square', 'linkedin', 'like', 'mail', 'mac-command', 'medicine-box', 'medium-circle', 'medium-square', 'meh', 'lock', 'merge', 'message', 'minus-circle', 'minus-square', 'mobile', 'moon', 'muted', 'notification', 'pay-circle', 'phone', 'pinterest', 'play-circle', 'pie-chart', 'pause-circle', 'picture', 'play-square', 'pound-circle', 'plus-circle', 'plus-square', 'printer', 'product', 'profile', 'property-safety', 'project', 'qq-circle', 'question-circle', 'qq-square', 'reconciliation', 'red-envelope', 'reddit-circle', 'read', 'reddit-square', 'right-circle', 'right-square', 'rest', 'money-collect', 'safety-certificate', 'rocket', 'schedule', 'security-scan', 'pushpin', 'setting', 'save', 'shopping', 'shop', 'signal', 'open-a-i', 'signature', 'sketch-circle', 'skype', 'slack-circle', 'sketch-square', 'slack-square', 'skin', 'sliders', 'smile', 'snippets', 'sound', 'spotify', 'star', 'step-backward', 'step-forward', 'stop', 'sun', 'info-circle', 'tablet', 'tag', 'taobao-circle', 'tags', 'thunderbolt', 'taobao-square', 'tik-tok', 'tool', 'trademark-circle', 'trophy', 'twitch', 'robot', 'truck', 'twitter-square', 'twitter-circle', 'unlock', 'up-circle', 'switcher', 'up-square', 'usb', 'video-camera', 'wallet', 'wechat', 'weibo-circle', 'windows', 'yahoo', 'youtube', 'yuque', 'zhihu-circle', 'zhihu-square', 'wechat-work', 'weibo-square', 'x', 'warning'
    ],
    outline: [
        'aim', 'alert', 'align-right', 'align-center', 'aliwangwang', 'amazon', 'ant-design', 'api', 'ant-cloud', 'align-left', 'apple', 'alipay-circle', 'appstore-add', 'alipay', 'arrow-down', 'arrows-alt', 'apartment', 'audio', 'audio-muted', 'arrow-up', 'android', 'aliyun', 'area-chart', 'arrow-left', 'backward', 'bank', 'baidu', 'barcode', 'bars', 'behance-square', 'behance', 'bell', 'bilibili', 'bg-colors', 'block', 'bold', 'border-bottom', 'border-horizontal', 'border-left', 'border', 'border-inner', 'bar-chart', 'border-right', 'border-verticle', 'account-book', 'alibaba', 'branches', 'border-top', 'arrow-right', 'bug', 'audit', 'calendar', 'calculator', 'camera', 'box-plot', 'car', 'bulb', 'book', 'caret-right', 'carry-out', 'caret-left', 'caret-down', 'check', 'check-square', 'chrome', 'caret-up', 'clock-circle', 'ci', 'ci-circle', 'close', 'close-circle', 'close-square', 'cloud-download', 'cloud', 'cloud-server', 'cloud-sync', 'code', 'check-circle', 'codepen-circle', 'code-sandbox', 'codepen', 'cluster', 'column-height', 'cloud-upload', 'column-width', 'compress', 'compass', 'console-sql', 'appstore', 'contacts', 'coffee', 'container', 'copy', 'control', 'copyright-circle', 'clear', 'build', 'dash', 'database', 'border-outer', 'delete', 'dashboard', 'delete-row', 'delivered-procedure', 'deployment-unit', 'delete-column', 'desktop', 'diff', 'dingtalk', 'dingding', 'dislike', 'disconnect', 'comment', 'docker', 'dollar-circle', 'double-left', 'dollar', 'dot-chart', 'dot-net', 'double-right', 'down-circle', 'down', 'borderless-table', 'drag', 'dribbble-square', 'dribbble', 'down-square', 'ellipsis', 'dropbox', 'enter', 'euro-circle', 'environment', 'exception', 'euro', 'customer-service', 'exclamation-circle', 'expand-alt', 'exclamation', 'expand', 'export', 'experiment', 'eye-invisible', 'eye', 'facebook', 'fast-forward', 'fall', 'download', 'field-binary', 'field-number', 'credit-card', 'field-string', 'field-time', 'file-excel', 'file-exclamation', 'file-add', 'file-done', 'crown', 'discord', 'file-markdown', 'file', 'file-pdf', 'file-jpg', 'file-gif', 'file-sync', 'file-protect', 'file-search', 'file-unknown', 'file-word', 'file-text', 'file-zip', 'filter', 'flag', 'fire', 'folder-add', 'folder-open', 'folder', 'font-size', 'edit', 'file-ppt', 'form', 'folder-view', 'copyright', 'fork', 'forward', 'function', 'fullscreen-exit', 'fund', 'fund-projection-screen', 'funnel-plot', 'gateway', 'gift', 'gif', 'font-colors', 'frown', 'global', 'gitlab', 'gold', 'google', 'google-plus', 'group', 'hdd', 'harmony-o-s', 'heart', 'heat-map', 'highlight', 'home', 'html5', 'format-painter', 'ie', 'idcard', 'github', 'hourglass', 'holder', 'fullscreen', 'info-circle', 'fund-view', 'inbox', 'insert-row-left', 'info', 'import', 'insert-row-above', 'insert-row-right', 'interaction', 'italic', 'java', 'issues-close', 'java-script', 'kubernetes', 'instagram', 'laptop', 'layout', 'insurance', 'left-square', 'line-chart', 'left-circle', 'line', 'like', 'loading', 'loading-3-quarters', 'linux', 'line-height', 'left', 'lock', 'mac-command', 'mail', 'link', 'man', 'medicine-box', 'medium-workmark', 'medium', 'meh', 'logout', 'menu-fold', 'login', 'linkedin', 'message', 'menu', 'minus-circle', 'key', 'minus-square', 'mobile', 'money-collect', 'fast-backward', 'monitor', 'moon', 'more', 'node-index', 'node-collapse', 'node-expand', 'merge', 'menu-unfold', 'number', 'merge-cells', 'notification', 'ordered-list', 'paper-clip', 'partition', 'muted', 'pause', 'one-to-one', 'pay-circle', 'percentage', 'pic-center', 'pic-right', 'pic-left', 'pause-circle', 'pie-chart', 'picture', 'play-circle', 'play-square', 'plus', 'plus-square', 'plus-circle', 'pound-circle', 'pound', 'poweroff', 'profile', 'printer', 'project', 'product', 'phone', 'property-safety', 'python', 'pinterest', 'pushpin', 'qrcode', 'question-circle', 'radius-bottomleft', 'radius-bottomright', 'pull-request', 'question', 'radius-setting', 'radar-chart', 'radius-upleft', 'radius-upright', 'read', 'reconciliation', 'red-envelope', 'reddit', 'redo', 'reload', 'retweet', 'rest', 'right-circle', 'right-square', 'right', 'robot', 'rise', 'rocket', 'rollback', 'rotate-right', 'safety-certificate', 'rotate-left', 'qq', 'ruby', 'save', 'scan', 'security-scan', 'scissor', 'schedule', 'select', 'send', 'minus', 'shake', 'setting', 'shop', 'shopping', 'shopping-cart', 'shrink', 'sisternode', 'sketch', 'skin', 'skype', 'slack', 'slack-square', 'sliders', 'small-dash', 'smile', 'snippets', 'file-image', 'solution', 'sort-ascending', 'split-cells', 'sort-descending', 'signature', 'spotify', 'search', 'star', 'step-forward', 'stock', 'sound', 'step-backward', 'share-alt', 'stop', 'sun', 'strikethrough', 'swap-left', 'swap', 'switcher', 'sync', 'table', 'tag', 'tablet', 'taobao-circle', 'taobao', 'team', 'subnode', 'thunderbolt', 'tags', 'tool', 'trademark-circle', 'tik-tok', 'to-top', 'swap-right', 'translation', 'safety', 'truck', 'twitch', 'underline', 'undo', 'unlock', 'ungroup', 'trademark', 'twitter', 'open-a-i', 'up', 'up-square', 'upload', 'usb', 'trophy', 'user', 'user-delete', 'usergroup-add', 'usergroup-delete', 'unordered-list', 'verified', 'vertical-left', 'vertical-right', 'video-camera', 'video-camera-add', 'vertical-align-top', 'user-add', 'history', 'insert-row-below', 'wechat', 'wechat-work', 'warning', 'weibo-circle', 'weibo', 'wifi', 'weibo-square', 'windows', 'whats-app', 'woman', 'user-switch', 'yahoo', 'x', 'yuque', 'zhihu', 'youtube', 'vertical-align-middle', 'up-circle', 'transaction', 'zoom-out', 'zoom-in', 'vertical-align-bottom', 'wallet'
    ],
    twotone: [
        'account-book', 'alert', 'api', 'audio', 'bank', 'bell', 'book', 'appstore', 'bug', 'bulb', 'calendar', 'calculator', 'car', 'camera', 'box-plot', 'carry-out', 'ci-circle', 'ci', 'check-square', 'clock-circle', 'close-circle', 'close-square', 'check-circle', 'cloud', 'code', 'compass', 'contacts', 'container', 'copy', 'build', 'credit-card', 'copyright', 'customer-service', 'crown', 'dashboard', 'delete', 'diff', 'database', 'dollar-circle', 'dollar', 'down-circle', 'dislike', 'copyright-circle', 'down-square', 'edit', 'euro-circle', 'environment', 'euro', 'exclamation-circle', 'experiment', 'eye-invisible', 'eye', 'file-add', 'file-excel', 'file-exclamation', 'control', 'file-image', 'file-markdown', 'file', 'file-text', 'file-unknown', 'file-zip', 'filter', 'fire', 'file-ppt', 'flag', 'folder-open', 'folder-add', 'folder', 'frown', 'fund', 'funnel-plot', 'gift', 'gold', 'file-word', 'hdd', 'heart', 'file-pdf', 'home', 'hourglass', 'html5', 'idcard', 'highlight', 'info-circle', 'insurance', 'layout', 'interaction', 'left-square', 'like', 'left-circle', 'lock', 'mail', 'medicine-box', 'meh', 'minus-square', 'minus-circle', 'mobile', 'money-collect', 'notification', 'message', 'pause-circle', 'phone', 'picture', 'play-circle', 'play-square', 'pie-chart', 'plus-circle', 'pound-circle', 'plus-square', 'printer', 'project', 'profile', 'property-safety', 'pushpin', 'question-circle', 'reconciliation', 'red-envelope', 'rest', 'right-circle', 'right-square', 'rocket', 'safety-certificate', 'save', 'security-scan', 'schedule', 'setting', 'shop', 'shopping', 'skin', 'sliders', 'snippets', 'star', 'stop', 'switcher', 'tablet', 'tag', 'tags', 'sound', 'tool', 'trophy', 'thunderbolt', 'unlock', 'up-square', 'usb', 'smile', 'video-camera', 'wallet', 'warning', 'trademark-circle', 'up-circle'
    ]
};

/**
 * Generated bundle index. Do not edit.
 */

export { ANT_ICONS, ANT_ICON_ANGULAR_CONSOLE_PREFIX, DynamicLoadingTimeoutError, HttpModuleNotImport, IconDirective, IconModule, IconNotFoundError, IconService, NameSpaceIsNotSpecifyError, SVGTagNotFoundError, UrlNotSafeError, alreadyHasAThemeSuffix, cloneSVG, error, getIconDefinitionFromAbbr, getNameAndNamespace, getSecondaryColor, hasNamespace, isIconDefinition, manifest, mapAbbrToTheme, provideAntIcons, replaceFillColor, warn, withSuffix, withSuffixAndColor };
//# sourceMappingURL=ant-design-icons-angular.mjs.map
