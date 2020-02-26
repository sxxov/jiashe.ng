import { $Factory } from '../utilities.factories.js';
import { $Object } from '../utilities.types.js';

class NotJQuery {
	// the object that is applied to can be just some random object
	$(objectToCreateFrom: any = {}): $Object {
		const m$Factory = new $Factory();

		switch (true) {
		case objectToCreateFrom === undefined:
			return m$Factory.create({});
		case objectToCreateFrom.constructor === String:
			return m$Factory.create(document.querySelector(objectToCreateFrom));
		default:
			return m$Factory.create(objectToCreateFrom);
		}
	}

	$$(objectToCreateFrom: any = {}): $Object {
		const m$Factory = new $Factory();

		switch (true) {
		case objectToCreateFrom === undefined:
			return m$Factory.create({});
		case objectToCreateFrom.constructor === String:
			return m$Factory.create(document.querySelectorAll(objectToCreateFrom));
		default:
			return m$Factory.create(objectToCreateFrom);
		}
	}
}

const mNotJQuery = new NotJQuery();

export const { $ } = mNotJQuery;
export const { $$ } = mNotJQuery;
