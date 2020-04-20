import { MarkedNamespace } from './raw/libraries/marked/types/marked.js';
import { $ } from '../../../assets/js/resources/utilities.js';

const { marked }: { marked: MarkedNamespace['marked'] } = window as any;

class Main {
	private skinDom = $('.skin');

	public async create(): Promise<void> {
		this.skinDom.innerHTML = marked(await (await fetch(this.uri)).text());
	}

	private get uri(): string {
		let uri = String(window.location.href);

		uri = uri.substr(uri.indexOf('#') + 1);
		uri += uri.substr(-3) === '.md' ? '' : '.md';
		uri = `/assets/md/${uri}`;

		return uri;
	}
}

(async (): Promise<void> => {
	(new Main()).create();
})();
