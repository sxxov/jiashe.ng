import { $Object } from './types/$.object';
import { $Factory } from './factories/$.factory';
// eslint-disable-next-line import/named

class NotJQuery {
	// the object that is applied to can be just some random object
	$(objectToCreateFrom: any = {}): $Object {
		const m$Factory = new $Factory();

		switch (true) {
		case this
			&& this.constructor === Object
			&& objectToCreateFrom.constructor === String:
			return m$Factory.create(Object.values(this)
				.find((node: HTMLElement) => node.matches && node.matches(objectToCreateFrom)));
		case objectToCreateFrom === undefined:
			return m$Factory.create({});
		case objectToCreateFrom === null:
			throw new Error('Cannot create from null!');
		case objectToCreateFrom.constructor === String: {
			const queryResult = document.querySelector(objectToCreateFrom);
			return queryResult && m$Factory.create(queryResult);
		}
		default:
			return m$Factory.create(objectToCreateFrom);
		}
	}

	$$(objectToCreateFrom: any = {}): $Object[] {
		const m$Factory = new $Factory();

		switch (true) {
		case this
			&& this.constructor === Object
			&& objectToCreateFrom.constructor === String:
			return Object.values(this)
				.getAll((node: HTMLElement) => node.matches && node.matches(objectToCreateFrom))
				.map((elem: HTMLElement) => m$Factory.create(elem));
		case objectToCreateFrom === undefined:
			return [m$Factory.create({})];
		case objectToCreateFrom === null:
			throw new Error('Cannot create from null!');
		case objectToCreateFrom.constructor === String:
			return Array.from(
				document.querySelectorAll(objectToCreateFrom),
			).map(
				(elem) => m$Factory.create(elem),
			);
		default:
			return [m$Factory.create(objectToCreateFrom)];
		}
	}
}

const mNotJQuery = new NotJQuery();

export const { $ } = mNotJQuery;
export const { $$ } = mNotJQuery;
