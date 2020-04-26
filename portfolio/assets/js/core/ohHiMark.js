var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { marked, } = window;
export class OhHiMark {
    static preprocess(md) {
        let processedMd = md;
        Object.keys(OhHiMark.PREPROCESSORS).forEach((key) => {
            const preprocessor = OhHiMark.PREPROCESSORS[key];
            processedMd = preprocessor(processedMd);
        });
        return processedMd;
    }
    static create(md) {
        return marked(OhHiMark.preprocess(md));
    }
    static createFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetched = yield fetch(url);
            let md = `
/
# This is awkward...
/
Something went wrong!
One of these could've happened:
* the url is invalid
* I did something wrong in the code
* google is offline (???)
* the world is ending (!!!)
/
[You can use me as a button to go back to safety!](javascript:history.back())
		`;
            if (fetched.ok) {
                md = yield fetched.text();
            }
            return OhHiMark.create(md);
        });
    }
}
OhHiMark.PREPROCESSORS = {
    x(md) {
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
    br(md) {
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
};
//# sourceMappingURL=ohHiMark.js.map