import { NzAlign, NzFlex, NzGap, NzJustify, NzWrap } from './typings';
import * as i0 from "@angular/core";
export declare class NzFlexDirective {
    nzVertical: boolean;
    nzJustify: NzJustify;
    nzAlign: NzAlign;
    nzGap: NzGap;
    nzWrap: NzWrap;
    nzFlex: NzFlex;
    protected get gap(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzFlexDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NzFlexDirective, "[nz-flex],nz-flex", ["nzFlex"], { "nzVertical": { "alias": "nzVertical"; "required": false; }; "nzJustify": { "alias": "nzJustify"; "required": false; }; "nzAlign": { "alias": "nzAlign"; "required": false; }; "nzGap": { "alias": "nzGap"; "required": false; }; "nzWrap": { "alias": "nzWrap"; "required": false; }; "nzFlex": { "alias": "nzFlex"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_nzVertical: unknown;
}
