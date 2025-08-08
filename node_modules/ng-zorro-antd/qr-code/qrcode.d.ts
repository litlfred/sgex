/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import qrcodegen from './qrcodegen';
export declare const ERROR_LEVEL_MAP: Record<'L' | 'M' | 'Q' | 'H', qrcodegen.QrCode.Ecc>;
export declare const plotQRCodeData: (value: string, level?: keyof typeof ERROR_LEVEL_MAP) => qrcodegen.QrCode | null;
export declare function drawCanvas(canvas: HTMLCanvasElement, value: qrcodegen.QrCode | null, size?: number, scale?: number, padding?: number | number[], color?: string, backgroundColor?: string, iconSize?: number, icon?: string): void;
export declare function drawCanvasColor(ctx: CanvasRenderingContext2D, value: qrcodegen.QrCode, scale: number, padding: number[], backgroundColor: string, color: string): void;
export declare function drawCanvasBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number, backgroundColor: string): void;
export declare function formatPadding(padding: number | number[]): number[];
