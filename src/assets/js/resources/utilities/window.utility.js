import { $ } from './$.utility';
export class WindowUtility {
    static invalidateCache() {
        this.cache = {};
    }
    static refresh() {
        this.invalidateCache();
        this.cache = {
            inner: this.inner,
            viewport: this.viewport,
            client: this.client,
            isMobile: this.isMobile,
        };
    }
    static vh(amount) {
        return (this.viewport.height / 100) * amount;
    }
    static vw(amount) {
        return (this.viewport.width / 100) * amount;
    }
    static px(amount) {
        return amount * window.devicePixelRatio;
    }
    static get client() {
        if (this.cache?.client?.height
            || this.cache?.client?.width) {
            return this.cache.client;
        }
        return {
            height: document.documentElement.clientHeight,
            width: document.documentElement.clientWidth,
        };
    }
    static get inner() {
        if (this.cache?.inner?.height
            || this.cache?.inner?.width) {
            return this.cache.inner;
        }
        return {
            height: window.innerHeight,
            width: window.innerWidth,
        };
    }
    static get viewport() {
        if (this.cache?.viewport?.height
            || this.cache?.viewport?.width) {
            return this.cache.viewport;
        }
        const viewportCalibrator = $('.__windowUtility.viewportCalibrator');
        const height = viewportCalibrator.offsetHeight;
        const width = viewportCalibrator.offsetWidth;
        return {
            height,
            width,
        };
    }
    static get isMobile() {
        if (this.cache?.isMobile) {
            return this.cache.isMobile;
        }
        const isMobile = window.matchMedia('(pointer: coarse)').matches
            || window.matchMedia('(pointer: cnone)').matches;
        this.cache.isMobile = isMobile;
        return isMobile;
    }
}
WindowUtility.cache = {};
$(window).on('resize', () => WindowUtility.refresh());
//# sourceMappingURL=window.utility.js.map