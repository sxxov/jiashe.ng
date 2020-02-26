import { $ } from '../utilities.js';
export class WindowUtility {
    get inner() {
        return {
            // height: document.documentElement.clientHeight,
            // width: document.documentElement.clientWidth,
            height: window.innerHeight,
            width: window.innerWidth,
        };
    }
    get viewport() {
        const documentDom = $(document.documentElement);
        documentDom.css({
            perspective: '100vh',
        }, {
            computed: true,
        });
        const height = parseFloat(getComputedStyle(documentDom).perspective);
        documentDom.css({
            perspective: '100vw',
        }, {
            computed: true,
        });
        const width = parseFloat(getComputedStyle(documentDom).perspective);
        documentDom.css({
            perspective: '',
        });
        return {
            height,
            width,
        };
    }
}
//# sourceMappingURL=window.utility.js.map