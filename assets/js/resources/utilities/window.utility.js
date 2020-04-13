import { $ } from '../utilities.js';
export class WindowUtility {
    constructor() {
        this.resetCache();
        $(window).on('resize', () => {
            this.resetCache();
            this.cache = {
                inner: this.inner,
                viewport: this.viewport,
                client: this.client,
                isMobile: this.isMobile,
            };
        });
    }
    resetCache() {
        this.cache = {
            inner: {
                height: null,
                width: null,
            },
            viewport: {
                height: null,
                width: null,
            },
            client: {
                height: null,
                width: null,
            },
            isMobile: null,
        };
    }
    vh(amount) {
        return (this.viewport.height / 100) * amount;
    }
    vw(amount) {
        return (this.viewport.width / 100) * amount;
    }
    px(amount) {
        return amount * window.devicePixelRatio;
    }
    get client() {
        if (this.cache.client.height
            || this.cache.client.width) {
            return this.cache.client;
        }
        return {
            height: document.documentElement.clientHeight,
            width: document.documentElement.clientWidth,
        };
    }
    get inner() {
        if (this.cache.inner.height
            || this.cache.inner.width) {
            return this.cache.inner;
        }
        return {
            height: window.innerHeight,
            width: window.innerWidth,
        };
    }
    get viewport() {
        if (this.cache.viewport.height
            || this.cache.viewport.width) {
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
    get isMobile() {
        if (this.cache.isMobile) {
            return this.cache.isMobile;
        }
        const isMobile = window.matchMedia('(pointer: coarse)').matches
            || window.matchMedia('(pointer: cnone)').matches;
        this.cache.isMobile = isMobile;
        return isMobile;
    }
}
//# sourceMappingURL=window.utility.js.map