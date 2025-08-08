/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Platform } from '@angular/cdk/platform';
import { NgZone } from '@angular/core';
export declare class NzWaveRenderer {
    private triggerElement;
    private ngZone;
    private insertExtraNode;
    private platform;
    private cspNonce?;
    private waveTransitionDuration;
    private styleForPseudo;
    private extraNode;
    private lastTime;
    clickHandler: (event: MouseEvent) => void;
    get waveAttributeName(): string;
    constructor(triggerElement: HTMLElement, ngZone: NgZone, insertExtraNode: boolean, platform: Platform, cspNonce?: string | null | undefined);
    onClick: (event: MouseEvent) => void;
    bindTriggerEvent(): void;
    removeTriggerEvent(): void;
    removeStyleAndExtraNode(): void;
    destroy(): void;
    private fadeOutWave;
    private isValidColor;
    private isNotGrey;
    private getWaveColor;
    private runTimeoutOutsideZone;
}
