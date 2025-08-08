import { ElementRef, EnvironmentProviders, InjectionToken, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NzWaveRenderer } from './nz-wave-renderer';
import * as i0 from "@angular/core";
export interface NzWaveConfig {
    disabled?: boolean;
}
export declare const NZ_WAVE_GLOBAL_DEFAULT_CONFIG: NzWaveConfig;
export declare const NZ_WAVE_GLOBAL_CONFIG: InjectionToken<NzWaveConfig>;
export declare function provideNzWave(config: NzWaveConfig): EnvironmentProviders;
export declare class NzWaveDirective implements OnInit, OnDestroy {
    private ngZone;
    private elementRef;
    nzWaveExtraNode: boolean;
    private waveRenderer?;
    private waveDisabled;
    get disabled(): boolean;
    get rendererRef(): NzWaveRenderer | undefined;
    private cspNonce;
    private platform;
    private config;
    private animationType;
    constructor(ngZone: NgZone, elementRef: ElementRef);
    isConfigDisabled(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    renderWaveIfEnabled(): void;
    disable(): void;
    enable(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzWaveDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzWaveDirective, "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", ["nzWave"], { "nzWaveExtraNode": { "alias": "nzWaveExtraNode"; "required": false; }; }, {}, never, never, true, never>;
}
