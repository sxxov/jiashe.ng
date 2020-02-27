import { $ } from '../utilities.js';
export class PageUtility {
    constructor() {
        this.lastState = {
            uid: null,
        };
        this.pendingState = this.lastState;
        this.scrollTo = () => { };
        $(window).on('load', () => {
            this.isLoaded = true;
            this.onLoad();
        });
    }
    onLoad() {
        const page = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
        if (page) {
            console.log('page: update & scrollto');
            this.updateState(page.substr(1));
            this.pendingState.uid = null;
            this.scrollTo('intro');
            return;
        }
        console.log('page: apply pending');
        const { uid, } = this.pendingState;
        if (uid) {
            this.updateState(uid);
        }
    }
    set scrollToCallback(callback) {
        this.scrollTo = callback;
    }
    updateState(uid) {
        if (this.lastState.uid === uid) {
            return;
        }
        const newState = {
            uid,
        };
        if (!this.isLoaded) {
            this.pendingState = newState;
            return;
        }
        console.log('page:', uid, this.lastState, newState, this.lastState === newState);
        window.history.replaceState(newState, '', `#${uid}`);
        this.lastState = newState;
    }
}
//# sourceMappingURL=page.utility.js.map