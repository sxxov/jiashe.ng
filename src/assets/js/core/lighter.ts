// quick and dirty stub

import { Database, Document } from 'firebase-firestore-lite';

export class Lighter {
	public docs: Document[] = null;
	private collection = (() => {
		// use the first subdomain to figure out which collection to browse to

		const {
			href,
		} = window.location;

		const urlParts = href.split('/');

		// remove the empty string at the end of array
		if (urlParts[urlParts.length - 1] === '') {
			urlParts.pop();
		}

		// remove the # items at the end of array
		if (/#|\?/.test(urlParts[urlParts.length - 1])) {
			urlParts.pop();
		}

		const collection = urlParts.pop();

		let domain = href;
		domain = domain.substr(domain.indexOf('//') + 2);
		domain = domain.substr(0, domain.indexOf('/'));

		if (collection.includes(domain)) {
			return 'portfolio';
		}

		return collection;
	})();

	public async create(): Promise<void> {
		const db = new Database({
			projectId: 'jiashe-ng',

		})

		this.docs = (await db.ref(this.collection).list()).documents;
	}
}
