/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Observable } from 'rxjs';
/**
 * This function replaces `runOutsideAngular` with `fromEvent`, introducing a
 * lot of boilerplate where we need to inject the `NgZone` service and then subscribe
 * to `fromEvent` within the `runOutsideAngular` callback.
 */
export declare function fromEventOutsideAngular<TEvent extends Event>(target: EventTarget | null | undefined, name: string, options?: boolean | AddEventListenerOptions): Observable<TEvent>;
