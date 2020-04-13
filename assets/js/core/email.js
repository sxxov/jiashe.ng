import { WindowUtility } from '../resources/utilities.js';
export class Email {
    constructor() {
        this.mWindowUtility = new WindowUtility();
    }
    create(options) {
        const { domContent, dpr, resolutionMultiplier, } = options;
        const resolutionModifier = dpr * resolutionMultiplier;
        let isClickable = false;
        domContent.on('mousemove touchmove', (event) => {
            const { clientX, clientY, } = event;
            if (!clientX
                || !clientY) {
                return;
            }
            const canvas = domContent;
            const canvasCtx = canvas.getContext('2d');
            const innerCenterOffset = domContent
                .parentElement // container div
                .parentElement // containersWrapper div
                .classList
                .contains('innerCenter')
                ? 24
                : 0;
            const x = (((((clientX
                * resolutionModifier)
                - (canvas.width
                    / 2))
                / dpr)
                + (canvas.width
                    / 2)));
            const y = (((((clientY
                * resolutionModifier)
                - (canvas.height
                    / 2))
                / dpr)
                + (canvas.height
                    / 2))
                + innerCenterOffset);
            const rgba = canvasCtx
                .getImageData(x - 10, y - 10, 20, 20)
                .data;
            if (rgba.some((value) => value > 0)) {
                isClickable = true;
                if (!this.mWindowUtility.isMobile) {
                    domContent.css({
                        filter: 'brightness(0.5)',
                        cursor: 'pointer',
                    });
                }
                return;
            }
            isClickable = false;
            domContent.css({
                filter: 'brightness(1)',
                cursor: '',
            });
        });
        domContent.on('click', () => isClickable && window.open('mailto:_@jiashe.ng'));
    }
}
//# sourceMappingURL=email.js.map