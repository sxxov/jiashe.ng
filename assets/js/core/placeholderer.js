var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, $$, } from '../resources/utilities.js';
export class Placeholderer {
    constructor() {
        this.placeholders = {};
        this.descriptionDomCache = [];
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            if (document.readyState === 'loading') {
                yield new Promise((resolve) => $(window).on('domcontentloaded', resolve));
            }
            this.cacheDescriptionPlaceholders();
            this.updateDescriptionPlaceholders();
        });
    }
    cacheDescriptionPlaceholders() {
        const descriptionDoms = $$('.replaceable');
        descriptionDoms.fastEach((descriptionDom) => {
            descriptionDom
                .childNodes
                .forEach((node) => {
                const { textContent, } = node;
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
    updateDescriptionPlaceholders() {
        this.descriptionDomCache.fastEach((descriptionDomCache) => {
            const { domContent, textContent, } = descriptionDomCache;
            // +2 is to shift over '{{' & '}}' itself
            const indexOfKeyword = textContent.indexOf('{{') + 2;
            const indexOfRest = textContent.indexOf('}}') + 2;
            if (indexOfKeyword === -1) {
                return;
            }
            // substr is faster https://www.measurethat.net/Benchmarks/Show/2335/1/slice-vs-substr-vs-substring-with-no-end-index
            const keyword = textContent
                .substr(indexOfKeyword, indexOfRest - 2 - indexOfKeyword);
            let result = null;
            Object.keys(this.placeholders)
                .fastEach((key) => {
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
//# sourceMappingURL=placeholderer.js.map