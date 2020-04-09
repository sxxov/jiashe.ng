var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { $, $$, ForUtility, } from '../../utilities.js';
export class $Factory {
    create(objectToCreateFrom = {}) {
        ForUtility.addToArrayPrototype();
        const object = Object.assign({ evaluate(functionToEvaluate) {
                return this.apply(functionToEvaluate(this));
            },
            addClass(classNames) {
                switch (classNames.constructor) {
                    case String:
                        classNames.split(' ').fastEach((className) => {
                            this.classList.add(className);
                        });
                        break;
                    case Array:
                        classNames.fastEach((className) => {
                            this.addClass(className);
                        });
                        break;
                    default:
                }
                return this;
            },
            removeClass(classNames) {
                switch (classNames.constructor) {
                    case String:
                        classNames.split(' ').fastEach((className) => {
                            this.classList.remove(className);
                        });
                        break;
                    case Array:
                        classNames.fastEach((className) => {
                            this.removeClass(className);
                        });
                        break;
                    default:
                }
                return this;
            },
            toggleClass(classNames) {
                switch (classNames.constructor) {
                    case String:
                        classNames.split(' ').fastEach((className) => {
                            this.classList.toggle(className);
                        });
                        break;
                    case Array:
                        classNames.fastEach((className) => {
                            this.toggleClass(className);
                        });
                        break;
                    default:
                }
                return this;
            },
            css(property, value, options = {}) {
                // handle when the options are passed into the value argument
                if (value
                    && value.constructor === Object) {
                    return this.css(property, undefined, value);
                }
                let processedValue = null;
                let returnedValues = null;
                let propertyHasParentheses = null;
                let stackable = null;
                const unitlessProperties = [
                    'opacity',
                    'grid-row-start',
                    'grid-row-end',
                ];
                const stackableProperties = [{
                        name: 'transition',
                        hasParentheses: false,
                    }, {
                        name: 'transform',
                        hasParentheses: true,
                    }];
                switch (property.constructor) {
                    case String:
                        // determine if the property is a stackable one
                        stackableProperties.fastEach(({ name, hasParentheses, }) => {
                            // return if the 'property' is not in 'stacakbleProperties'
                            if (name !== property) {
                                return;
                            }
                            stackable = true;
                            propertyHasParentheses = hasParentheses;
                        });
                        if (value === undefined) {
                            // the value of the property should be returned instead of set
                            processedValue = this.style[property];
                            if (options.computed) {
                                processedValue = getValueWithoutUnit(getComputedStyle(this)[property]);
                            }
                            if (stackable
                                && options.returnAsObject) {
                                processedValue = getAttributesFromValueString(processedValue, propertyHasParentheses);
                            }
                            return processedValue;
                        }
                        // the value of the property should be set instead of returned
                        processedValue = value;
                        // if the value string is missing a unit, add px
                        if (unitlessProperties.includes(property) === false) {
                            processedValue = getValueWithUnit(value);
                        }
                        if (stackable) {
                            // create attribute objects from the value strings
                            const oldAttributes = getAttributesFromValueString(this.style[property], propertyHasParentheses);
                            const newAttributes = getAttributesFromValueString(processedValue, propertyHasParentheses);
                            const processedAttributes = oldAttributes;
                            Object.assign(processedAttributes, newAttributes);
                            processedValue = getValueStringFromAttributes(processedAttributes, propertyHasParentheses);
                        }
                        this.style[property] = processedValue;
                        return this;
                    case Array:
                        if (value === undefined) {
                            returnedValues = {};
                            property.fastEach((item) => {
                                returnedValues[item] = this.css(item);
                            });
                            return returnedValues;
                        }
                        property.fastEach((item, i) => {
                            this.css(item, value[i]);
                        });
                        return this;
                    case Object:
                        returnedValues = {};
                        Object.keys(property).fastEach((key) => {
                            const returnedValue = this.css(key, property[key]);
                            if (returnedValue === this) {
                                return;
                            }
                            returnedValues[key] = returnedValue;
                        });
                        return returnedValues === {} ? this : returnedValues;
                    default:
                        return this.style;
                }
                function formatValueString(valueString) {
                    return valueString
                        .toLowerCase()
                        .replace(/\s/g, '');
                }
                function getValueWithoutUnit(valueWithUnit) {
                    if (valueWithUnit.includes('px') === false) {
                        return valueWithUnit;
                    }
                    return valueWithUnit.replace(/px/g, '');
                }
                function getValueWithUnit(valueWithoutUnit) {
                    if (!valueWithoutUnit) {
                        return valueWithoutUnit;
                    }
                    if (valueWithoutUnit.constructor === Number
                        || Number.isNaN(Number(valueWithoutUnit)) === false) {
                        return `${valueWithoutUnit}px`;
                    }
                    return valueWithoutUnit;
                }
                function getAttributesFromValueString(valueStringWithAttributes, hasParentheses) {
                    let valueArrayWithAttributes = null;
                    let attributeKeys = null;
                    let attributeValues = null;
                    if (hasParentheses) {
                        // split between ')' and remove ')' in the meantime
                        valueArrayWithAttributes = formatValueString(valueStringWithAttributes)
                            .split(')');
                        // remove everything inside parentheses
                        // regex is slower than native functions https://jsben.ch/8GY5K
                        attributeKeys = valueArrayWithAttributes
                            .map((attribute) => attribute
                            .substr(0, attribute.indexOf('('))
                            .trim());
                        // remove everything before and including '('
                        // ')' was removed when we split it in 'valueArrayWithAttributes'
                        attributeValues = valueArrayWithAttributes
                            .map((attribute) => attribute
                            .substr(attribute.indexOf('(') + 1));
                    }
                    else {
                        // split between and remove every ','
                        valueArrayWithAttributes = formatValueString(valueStringWithAttributes)
                            .split(',');
                        // get the substring before anything that isn't an alphabet
                        attributeKeys = valueArrayWithAttributes.map((attribute) => attribute
                            .substring(0, attribute.search(/[^a-zA-Z]/)));
                        // get the substring starting at the first character that isn't an alphabet
                        attributeValues = valueArrayWithAttributes.map((attribute) => attribute
                            .substr(attribute.search(/[^a-zA-Z]/)));
                    }
                    const attributeObject = {};
                    attributeKeys.fastEach((key, i) => {
                        if (!key) {
                            return;
                        }
                        attributeObject[key] = attributeValues[i];
                    });
                    return attributeObject;
                }
                function getValueStringFromAttributes(attributes, hasParentheses) {
                    let valueArray = null;
                    let valueString = null;
                    if (hasParentheses) {
                        valueArray = Object.keys(attributes).map((attributeKey) => `${attributeKey}(${attributes[attributeKey]})`);
                        valueString = valueArray.join('');
                    }
                    else {
                        valueArray = Object.keys(attributes).map((attributeKey) => `${attributeKey}${attributes[attributeKey]}`);
                        valueString = valueArray.join(',');
                    }
                    return valueString;
                }
            },
            on(eventsStr, ...options) {
                const events = eventsStr.split(' ');
                let selector = null;
                let handler = null;
                options.fastEach((option, i) => {
                    switch (option.constructor) {
                        case String:
                            if (selector !== null) {
                                break;
                            }
                            selector = option;
                            break;
                        case Function:
                            if (i !== options.length - 1) {
                                break;
                            }
                            handler = option;
                            break;
                        default:
                            break;
                    }
                });
                events.fastEach((eventStr) => {
                    this.addEventListener(eventStr, (event) => {
                        const processedEvent = event;
                        if (!event) {
                            return handler(undefined);
                        }
                        const { target } = processedEvent;
                        if (!target) {
                            return null;
                        }
                        if (selector !== null
                            && target.matches(selector) === false) {
                            return null;
                        }
                        return handler.call(target, processedEvent);
                    });
                });
                return this;
            },
            getJSON(url, callback) {
                return __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(url);
                    return callback ? callback(yield response.json()) : response.json();
                });
            },
            $,
            $$ }, {});
        // ...spread doesn't work directly on dom objects apparently
        Object.assign(objectToCreateFrom, object);
        return objectToCreateFrom;
    }
}
//# sourceMappingURL=$.factory.js.map