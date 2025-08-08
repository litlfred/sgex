import { Observable } from 'rxjs';
import { NzConfig, NzConfigKey } from './config';
import * as i0 from "@angular/core";
export declare class NzConfigService {
    private configUpdated$;
    /** Global config holding property. */
    private readonly config;
    private readonly cspNonce;
    constructor();
    getConfig(): NzConfig;
    getConfigForComponent<T extends NzConfigKey>(componentName: T): NzConfig[T];
    getConfigChangeEventForComponent(componentName: NzConfigKey): Observable<void>;
    set<T extends NzConfigKey>(componentName: T, value: NzConfig[T]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NzConfigService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NzConfigService>;
}
/**
 * This decorator is used to decorate class field. If a class field is decorated and unassigned, it would try to load default value from `NZ_CONFIG`
 *
 * @note that the class must have `_nzModuleName`({@link NzConfigKey}) property.
 * @example
 * ```ts
 * class ExampleComponent {
 *   private readonly _nzModuleName: NzConfigKey = 'button';
 *   @WithConfig() size: string = 'default';
 * }
 * ```
 */
export declare function WithConfig<This, Value>(): (_value: undefined, context: ClassFieldDecoratorContext<This, Value>) => void;
