import { CoreAnimator } from '../../animators.js';
import { $ } from '../../utilities.js';
export class SolidFactory {
    constructor(thisArg) {
        this.ctx = thisArg;
    }
    async create(animationObject) {
        const { uid, __container, } = animationObject.items;
        const className = uid;
        const domContent = this.createAndReturnDomContent(className);
        __container.appendChild(domContent);
        const solidObject = {
            domContent,
        };
        return solidObject;
    }
    createAndReturnDomContent(className) {
        const domContent = $(document.createElement('div'));
        domContent.css({
            width: '100vw',
            height: '100vh',
            background: 'white',
            position: 'absolute',
        });
        domContent.addClass([
            CoreAnimator.PREFIX,
            'solid',
            className,
            'hidden',
        ]);
        return domContent;
    }
}
//# sourceMappingURL=solid.factory.js.map