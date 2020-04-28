import { MarkedNamespace } from '../raw/libraries/marked/types/marked.js';

const {
	marked,
}: {
	marked: MarkedNamespace['marked'];
} = window as any;

export class OhHiMark {
	private static PREPROCESSORS = {
		x(md: string): string {
			const parts = md
				.trim()
				.split('\n');
			const processedParts = parts.getAll((part) => {
				if (part[0] !== '/') {
					return false;
				}

				return true;
			});

			const tag = 'x';

			if (processedParts.length === 1) {
				return md;
			}

			let parsed = '';

			parts.fastEach((part, i) => {
				let processedTag = tag;
				let processedPart = part;

				if (processedPart[0] === '!'
					&& processedPart[1] === '/') {
					parsed += `\n</${tag}>`;
					parsed += '\n';

					return;
				}

				if (processedPart[0] !== '/') {
					parsed += part;
					parsed += '\n';

					return;
				}

				if (processedPart[1] === '{') {
					const classes = processedPart
						.split('}')[0]
						.substr(2);
					processedTag += ` class="${classes}"`;
					processedPart = processedPart.substr(processedPart.indexOf('}') + 1);
				}

				switch (true) {
				case parsed === '': {
					parsed += `<${processedTag}>\n`;
					break;
				}
				case i === parts.length - 1: {
					parsed += `\n</${tag}>`;
					break;
				}
				default: {
					parsed += `\n</${tag}>\n<${processedTag}>\n`;
					break;
				}
				}

				parsed += '\n';
			});

			return parsed;
		},
		br(md: string): string {
			const parts = md
				.trim()
				.split('\n');
			const processedParts = parts.getAll((part) => {
				if (part[0] !== '_') {
					return false;
				}

				return true;
			});

			const tag = 'bruh';

			if (processedParts.length === 1) {
				return md;
			}

			let parsed = '';

			parts.fastEach((part) => {
				const processedTag = tag;
				const processedPart = part;

				if (processedPart[0] !== '_') {
					parsed += part;
					parsed += '\n';

					return;
				}

				parsed += `<${processedTag}></${tag}>`;
				parsed += '\n';
			});

			return parsed;
		},
	}

	public static preprocess(md: string): string {
		let processedMd = md;

		Object.keys(OhHiMark.PREPROCESSORS).forEach((key) => {
			const preprocessor = OhHiMark.PREPROCESSORS[key];

			processedMd = preprocessor(processedMd);
		});

		return processedMd;
	}

	public static create(md: string): string {
		return marked(OhHiMark.preprocess(md));
	}

	public static async createFromUrl(url: string): Promise<string> {
		const fetched = await fetch(url);

		let md = `
/
# This is awkward...
/
Something went wrong!
One of these could've happened:
* the url is invalid
* I did something wrong in the code
* you are offline
* the world is ending
/
[You can use me as a button to go back to safety!](javascript:history.back())
		`;

		if (fetched?.ok) {
			md = await fetched.text();
		}

		return OhHiMark.create(md);
	}
}
