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
        });
        const height = parseFloat(documentDom.css('perspective', {
            computed: true,
        }));
        documentDom.css({
            perspective: '100vw',
        }, {
            computed: true,
        });
        const width = parseFloat(documentDom.css('perspective', {
            computed: true,
        }));
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