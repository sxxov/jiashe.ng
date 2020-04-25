// quick and dirty stub

import { FirebaseNamespace } from '../raw/libraries/firebase/types/app.js';
import { FirebaseAnalytics } from '../raw/libraries/firebase/types/analytics.js';
import { FirebaseFirestore, QueryDocumentSnapshot } from '../raw/libraries/firebase/types/firestore.js';

const { firebase }: { firebase: FirebaseNamespace } = window as any;

export class Lighter {
	public analytics: FirebaseAnalytics = null;
	public firestore: FirebaseFirestore = null;
	public docs: QueryDocumentSnapshot[] = null;

	public async create(): Promise<void> {
		firebase.initializeApp({
			apiKey: 'AIzaSyAHM5sZ39JLrQsR0m8Xy0uaNmxI_0x4i50',
			authDomain: 'jiashe-ng.firebaseapp.com',
			databaseURL: 'https://jiashe-ng.firebaseio.com',
			projectId: 'jiashe-ng',
			storageBucket: 'jiashe-ng.appspot.com',
			messagingSenderId: '814550513437',
			appId: '1:814550513437:web:af93c50dce81733b19d3f4',
			measurementId: 'G-5QQWXLWBMZ',
		});

		this.analytics = (firebase as any).analytics();
		this.firestore = (firebase as any).firestore();

		this.docs = (await this.firestore.collection(this.collection).get()).docs;
	}

	// use the first subdomain to figure out which collection to browse to
	private get collection(): string {
		const {
			href,
		} = window.location;

		const subdomain = href.substring(
			href.indexOf('://') + 3,
			href.indexOf('.'),
		);

		if (!Number.isNaN(Number(subdomain))
			|| subdomain === 'jiashe') {
			return 'portfolio';
		}

		return subdomain;
	}
}
