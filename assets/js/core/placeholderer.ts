import { $Object } from '../resources/utilities.types.js';
import {
	$,
	$$,
} from '../resources/utilities.js';

export class Placeholderer {
	public placeholders = {};

	private descriptionDomCache: [{
		domContent: $Object;
		textContent: string;
	}?] = [];

	public async create(): Promise<void> {
		if (document.readyState === 'loading') {
			await new Promise((resolve) => $(window).on('domcontentloaded', resolve));
		}

		this.cacheDescriptionPlaceholders();
		this.updateDescriptionPlaceholders();
	}

	private cacheDescriptionPlaceholders(): void {
		const descriptionDoms = $$('.replaceable');

		descriptionDoms.fastEach((descriptionDom: $Object) => {
			(descriptionDom as unknown as HTMLParagraphElement)
				.childNodes
				.forEach((node) => {
					const {
						textContent,
					} = node as HTMLElement;

					if (textContent === '') {
						return;
					}

					// +2 is to shift over '{{' & '}}' itself
					const indexOfKeyword = textContent.indexOf('{{') + 2;
					const indexOfRest = textContent.indexOf('}}') + 2;

					// compare to 1 instead of -1 because of the +2 offset
					if (indexOfKeyword === 1
						|| indexOfRest === 1) {
						return;
					}

					this.descriptionDomCache.push({
						domContent: $(node),
						textContent,
					});
				});
		});
	}

	public updateDescriptionPlaceholders(): void {
		this.descriptionDomCache.fastEach((descriptionDomCache: {
			domContent: $Object;
			textContent: string;
		}) => {
			const {
				domContent,
				textContent,
			} = descriptionDomCache;

			// +2 is to shift over '{{' & '}}' itself
			const indexOfKeyword = textContent.indexOf('{{') + 2;
			const indexOfRest = textContent.indexOf('}}') + 2;

			if (indexOfKeyword === -1) {
				return;
			}

			// substr is faster https://www.measurethat.net/Benchmarks/Show/2335/1/slice-vs-substr-vs-substring-with-no-end-index
			const keyword = textContent
				.substr(
					indexOfKeyword,
					indexOfRest - 2 - indexOfKeyword,
				);
			let result = null;

			Object.keys(this.placeholders)
				.fastEach((key: string) => {
					if (key !== keyword) {
						return;
					}

					const value = this.placeholders[key];

					if (value
						&& value.constructor === Function) {
						result = value();

						return;
					}

					result = value;
				});

			domContent.textContent = `${textContent.substr(0, indexOfKeyword - 2)}${result}${textContent.substr(indexOfRest)}`;
		});
	}
}
