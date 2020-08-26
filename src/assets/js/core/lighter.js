// quick and dirty stub
import { Database } from 'firebase-firestore-lite';
export class Lighter {
    constructor() {
        this.docs = null;
        this.collection = (() => {
            // use the first subdomain to figure out which collection to browse to
            const { href, } = window.location;
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
    }
    async create() {
        const db = new Database({
            projectId: 'jiashe-ng',
        });
        this.docs = (await db.ref(this.collection).list()).documents;
    }
}
//# sourceMappingURL=lighter.js.map