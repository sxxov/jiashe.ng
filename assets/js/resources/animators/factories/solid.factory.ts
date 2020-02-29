import { CoreAnimator } from '../../animators.js';
import { $ } from '../../utilities.js';
import {
	SolidObject,
	AnimationObject,
} from '../../animator.types.js';
import { $Object } from '../../utilities.types.js';

export class SolidFactory {
	private ctx: CoreAnimator;

	public constructor(thisArg: CoreAnimator) {
		this.ctx = thisArg;
	}

	async create(animationObject: AnimationObject): Promise<SolidObject> {
		const {
			uid,
			__container,
		} = animationObject.items;

		const className = uid;
		const domContent = this.createAndReturnDomContent(className);

		__container.appendChild(domContent);

		const solidObject: SolidObject = {
			domContent,
		};

		return solidObject;
	}

	createAndReturnDomContent(className: string): $Object {
		const domContent = $(document.createElement('div'));

		domContent.css({
			width: '100vw',
			height: '100vh',
			background: 'white',
			position: 'fixed',
		});

		domContent.addClass([
			this.ctx.animatorClassPrefix,
			'solid',
			className,
			'hidden',
		]);

		return domContent;
	}
}
