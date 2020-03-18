var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, WindowUtility, } from '../resources/utilities.js';
export class TV {
    constructor() {
        this.api = null;
        this.videoId = 'vwKtPoE6Ppg';
        this.screenElementId = 'screen';
        this.screenElementSelector = `#${this.screenElementId}`;
        this.tvElementSelector = '.tv';
        this.playerVars = {
            loop: 1 /* Loop */,
            autoplay: 1 /* AutoPlay */,
            autohide: 1 /* HideAllControls */,
            modestbranding: 1 /* Modest */,
            rel: 0 /* Hide */,
            showinfo: 0 /* Hide */,
            controls: 0 /* Hide */,
            disablekb: 1 /* Disable */,
            enablejsapi: 1 /* Enable */,
        };
        this.mWindowUtility = new WindowUtility();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (navigator.onLine === false) {
                return;
            }
            yield this.loadApi();
            const ctx = this;
            new Promise((resolve) => {
                this.api = new YT.Player(this.screenElementId, {
                    events: {
                        onReady(event) {
                            ctx.onPlayerReady.call(ctx, event);
                            resolve();
                        },
                        onStateChange(event) {
                            ctx.onPlayerStateChange.call(ctx, event);
                        },
                    },
                    playerVars: this.playerVars,
                });
                $(window).on('load resize', () => {
                    this.onWindowResize();
                });
            });
        });
    }
    onWindowResize() {
        const windowWidth = this.mWindowUtility.viewport.width;
        const windowHeight = this.mWindowUtility.viewport.height;
        let playerWidth = 0;
        let playerHeight = 0;
        let top = 0;
        let left = 0;
        // if the window is wider than 16:9 aspect ratio
        if ((windowWidth / windowHeight) > 16 / 9) {
            // have the height follow the width, crop the top and bottom
            playerWidth = windowWidth;
            playerHeight = windowWidth * (9 / 16);
        }
        else {
            // have the width follow the height, crop the sides
            playerWidth = windowHeight * (16 / 9);
            playerHeight = windowHeight;
        }
        // the values between the window and player
        const heightOffset = windowHeight - playerHeight;
        const widthOffset = windowWidth - playerWidth;
        // divide by 2 to center them
        top = heightOffset / 2;
        left = widthOffset / 2;
        const screenDom = $(this.screenElementSelector);
        const tvDom = $(this.tvElementSelector);
        // apply the 16 / 9 values onto the screen
        screenDom.css({
            width: playerWidth,
            height: playerHeight,
            top,
            left,
        });
        // apply the window dimensions to the tv
        tvDom.css({
            width: playerWidth + widthOffset / 2,
            height: playerHeight + heightOffset / 2,
            top,
            left,
        });
        const viewportHeight = this.mWindowUtility.viewport.height;
        const innerHeight = this.mWindowUtility.inner.height;
        if (viewportHeight === innerHeight) {
            screenDom.removeClass('innerCenter');
            tvDom.removeClass('innerCenter');
        }
        else {
            screenDom.addClass('innerCenter');
            tvDom.addClass('innerCenter');
        }
    }
    onPlayerStateChange(event) {
        switch (event.data) {
            case 1 /* PLAYING */:
                $(this.screenElementSelector).addClass('active');
                return;
            case 0 /* ENDED */:
                $(this.screenElementSelector).css({
                    display: 'none',
                });
                event.target.loadVideoById(this.videoId);
                $(this.screenElementSelector).css({
                    display: '',
                });
                return;
            default:
                $(this.screenElementSelector).removeClass('active');
        }
    }
    onPlayerReady(event) {
        const { target, } = event;
        target.loadVideoById(this.videoId);
        target.mute();
    }
    loadApi() {
        return new Promise((resolve) => {
            window.onYouTubePlayerAPIReady = resolve;
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        });
    }
}
//# sourceMappingURL=tv.js.map