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
            loop: 1,
            autoplay: 1,
            autohide: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
        };
        this.mWindowUtility = new WindowUtility();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (navigator.onLine === false) {
                return;
            }
            yield this.loadApi();
            new Promise((resolve) => {
                this.api = new window.YT.Player(this.screenElementId, {
                    events: {
                        onReady: (event) => {
                            this.onPlayerReady(event);
                            resolve();
                        },
                        onStateChange: (event) => this.onPlayerStateChange.call(this, event),
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
            screenDom.addClass('viewport');
            screenDom.removeClass('innerCenter');
            tvDom.addClass('viewport');
            tvDom.removeClass('innerCenter');
        }
        else {
            screenDom.addClass('innerCenter');
            screenDom.removeClass('viewport');
            tvDom.addClass('innerCenter');
            tvDom.removeClass('viewport');
        }
    }
    onPlayerStateChange(event) {
        // non-standard, used by youtube embed api
        switch (event.data) {
            case window.YT.PlayerState.PLAYING:
                $(this.screenElementSelector).addClass('active');
                return;
            case window.YT.PlayerState.ENDED:
                $(this.screenElementSelector).css({
                    display: 'none',
                });
                // non-standard, used by youtube embed api
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
        // non-standard, used by youtube embed api
        target.loadVideoById(this.videoId);
        target.mute();
    }
    loadApi() {
        return new Promise((resolve) => {
            // non-standard, used by youtube embed api
            window.onYouTubePlayerAPIReady = resolve;
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        });
    }
}
//# sourceMappingURL=tv.js.map