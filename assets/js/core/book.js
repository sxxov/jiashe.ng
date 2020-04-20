var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, WindowUtility, BezierUtility } from '../resources/utilities.js';
const { marked } = window;
export class Book {
    constructor() {
        this.domContent = null;
        this.scrollAmount = null;
        this.mWindowUtility = new WindowUtility();
        this.mBezierUtility = new BezierUtility(0.075, 0.82, 0.165, 1);
        this.cachedScrollLeft = 0;
        this.scrollRafId = null;
        this.expectedScrollLeft = 0;
        this.cachedBodyDomHeight = null;
        this.isOpen = false;
    }
    create(url, container) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.domContent) {
                throw new Error('Book has already been created');
            }
            const bookContainerWrapperDom = $(document.createElement('div'));
            bookContainerWrapperDom.addClass([
                'book',
                'containerWrapper',
            ]);
            const bookContainerDom = $(document.createElement('div'));
            bookContainerDom.addClass([
                'book',
                'container',
            ]);
            bookContainerDom.innerHTML = marked(yield (yield fetch(url.substr(url.indexOf('jiashe.ng') + 9))).text());
            $(container).insertBefore(bookContainerWrapperDom, $(container).firstChild);
            bookContainerWrapperDom.appendChild(bookContainerDom);
            const bookContainerHeight = Math.ceil(parseFloat(bookContainerDom.css('height', { computed: true }))
                + parseFloat(bookContainerDom.css('padding', { computed: true })) * 2);
            bookContainerDom.css({
                columns: Math.ceil(bookContainerHeight / this.mWindowUtility.viewport.height),
                width: bookContainerHeight,
                height: '100%',
            });
            this.scrollAmount = bookContainerHeight;
            this.domContent = bookContainerWrapperDom;
            if (!window.horizontalScrollingEnabled) {
                $(document.scrollingElement || document.documentElement)
                    .addEventListener('wheel', (event) => this.onVerticalScroll.call(this, event));
                window.horizontalScrollingEnabled = true;
            }
            return bookContainerWrapperDom;
        });
    }
    open() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        this.domContent.css({
            transform: 'translateX(0px)',
            visibility: 'visible',
            width: this.scrollAmount,
        });
        $('.swiper-button-next').css({
            right: 'calc(0px - (var(--swiper-navigation-size)/ 44 * 27))',
        });
        $('.swiper-button-prev').css({
            left: 'calc(0px - (var(--swiper-navigation-size)/ 44 * 27))',
        });
        $('.swiper-pagination-bullets').css({
            bottom: -16,
        });
        $($('.__animate.scrollToContinue').parentElement).removeClass('active');
        this.cachedBodyDomHeight = parseInt($(document.body).css('height'), 10);
        $(document.body).css({
            overflowY: 'hidden',
            width: this.scrollAmount,
            height: '100%',
        });
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto',
        });
    }
    close() {
        if (!this.isOpen) {
            return;
        }
        this.isOpen = false;
        this.domContent.css({
            transform: 'translateX(-200vw)',
            visibility: 'visible',
        });
        $('.swiper-button-next').css({
            right: '',
        });
        $('.swiper-button-prev').css({
            left: '',
        });
        $('.swiper-pagination-bullets').css({
            bottom: '',
        });
        $($('.__animate.scrollToContinue').parentElement).addClass('active');
        $(document.body).css({
            overflowY: 'visible',
            width: '',
            height: this.cachedBodyDomHeight,
        });
        $(document.scrollingElement || document.documentElement)
            .removeEventListener('wheel', (event) => this.onVerticalScroll.call(this, event));
    }
    onVerticalScroll(event) {
        if (!event.deltaY) {
            return;
        }
        const delta = event.deltaY + event.deltaX;
        cancelAnimationFrame(this.scrollRafId);
        const currentTarget = this.domContent;
        $(currentTarget).css({
            transform: `translateX(${this.expectedScrollLeft}px)`,
        });
        if (parseFloat($(currentTarget).css('transform').replace('translateX(', '').replace('px)', '')) !== this.expectedScrollLeft) {
            this.expectedScrollLeft = Number(currentTarget.scrollLeft);
            return;
        }
        this.cachedScrollLeft = this.expectedScrollLeft;
        this.expectedScrollLeft += delta;
        let i = 0;
        const handler = () => {
            const magic = this.mBezierUtility.getValue((Math.abs(i))
                / Math.abs(delta)) * delta;
            switch (true) {
                case delta < 0: {
                    if (i < delta) {
                        return;
                    }
                    i -= 2;
                    break;
                }
                case delta > 0: {
                    if (i > delta) {
                        return;
                    }
                    i += 2;
                    break;
                }
                default: {
                    return;
                }
            }
            $(currentTarget).css({
                transform: `translateX(${magic + this.cachedScrollLeft}px)`,
            });
            this.scrollRafId = requestAnimationFrame(() => handler());
        };
        this.scrollRafId = requestAnimationFrame(() => handler());
    }
}
//# sourceMappingURL=book.js.map