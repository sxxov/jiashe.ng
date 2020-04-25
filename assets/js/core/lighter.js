// quick and dirty stub
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { firebase } = window;
export class Lighter {
    constructor() {
        this.analytics = null;
        this.firestore = null;
        this.docs = null;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
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
            this.analytics = firebase.analytics();
            this.firestore = firebase.firestore();
            this.docs = (yield this.firestore.collection(this.collection).get()).docs;
        });
    }
    // use the first subdomain to figure out which collection to browse to
    get collection() {
        const { href, } = window.location;
        const subdomain = href.substring(href.indexOf('://') + 3, href.indexOf('.'));
        if (!Number.isNaN(Number(subdomain))
            || subdomain === 'jiashe') {
            return 'portfolio';
        }
        return subdomain;
    }
}
//# sourceMappingURL=lighter.js.map