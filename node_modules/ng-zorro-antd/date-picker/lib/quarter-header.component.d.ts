import { DateHelperService } from 'ng-zorro-antd/i18n';
import { NzDateMode } from '../standard-types';
import { AbstractPanelHeader } from './abstract-panel-header';
import { PanelSelector } from './interface';
import * as i0 from "@angular/core";
export declare class QuarterHeaderComponent extends AbstractPanelHeader {
    private dateHelper;
    mode: NzDateMode;
    constructor(dateHelper: DateHelperService);
    getSelectors(): PanelSelector[];
    static ɵfac: i0.ɵɵFactoryDeclaration<QuarterHeaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<QuarterHeaderComponent, "quarter-header", ["quarterHeader"], {}, {}, never, never, true, never>;
}
