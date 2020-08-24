import {
	$,
	$$,
	ForUtility,
} from '../../utilities.js';
// eslint-disable-next-line import/named
import { $Object } from '../../utilities.types.js';

export class $Factory {
	create(objectToCreateFrom: any = {}): $Object {
		ForUtility.addToArrayPrototype();

		const object: $Object = {
			evaluate(functionToEvaluate): $Object {
				return this.apply(functionToEvaluate(this));
			},
			addClass(classNames): $Object {
				switch (classNames.constructor) {
				case String:
					(classNames as string).split(' ').fastEach((className: string) => {
						this.classList.add(className);
					});
					break;
				case Array:
					(classNames as string[]).fastEach((className: string) => {
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
					(classNames as string).split(' ').fastEach((className: string) => {
						this.classList.remove(className);
					});
					break;
				case Array:
					(classNames as string[]).fastEach((className: string) => {
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
					(classNames as string).split(' ').fastEach((className: string) => {
						this.classList.toggle(className);
					});
					break;
				case Array:
					(classNames as string[]).fastEach((className: string) => {
						this.toggleClass(className);
					});
					break;
				default:
				}

				return this;
			},
			css(
				property,
				value,
				options = {},
			) {
				// handle when the options are passed into the value argument
				if (value
					&& value.constructor === Object) {
					return this.css(property, undefined, value);
				}

				let processedValue: string | Record<string, string> = null;
				let returnedValues: Record<string, string> = null;

				let propertyHasParentheses: boolean = null;
				let stackable: boolean = null;

				const unitlessProperties = [
					'opacity',
					'gridRowStart',
					'gridRowEnd',
					'columns',
					'columnCount',
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
					stackableProperties.fastEach(({
						name,
						hasParentheses,
					}) => {
						// return if the 'property' is not in 'stacakbleProperties'
						if (name !== property) {
							return;
						}

						stackable = true;
						propertyHasParentheses = hasParentheses;
					});

					if (value === undefined) {
						// the value of the property should be returned instead of set

						processedValue = this.style[property as string];

						if (options.computed) {
							processedValue = getValueWithoutUnit(getComputedStyle(this)[property as string]);
						}

						if (stackable
							&& options.returnAsObject) {
							processedValue = getAttributesFromValueString(
								processedValue as string,
								propertyHasParentheses,
							);
						}

						return processedValue;
					}
					// the value of the property should be set instead of returned

					processedValue = value as string;

					// if the value string is missing a unit, add px
					if (unitlessProperties.includes(property as string) === false) {
						processedValue = getValueWithUnit(value as string);
					}

					if (stackable) {
						// create attribute objects from the value strings
						const oldAttributes = getAttributesFromValueString(
							this.style[(property as string)], propertyHasParentheses,
						);
						const newAttributes = getAttributesFromValueString(
							processedValue, propertyHasParentheses,
						);

						const processedAttributes = oldAttributes;

						Object.assign(processedAttributes, newAttributes);

						processedValue = getValueStringFromAttributes(
							processedAttributes, propertyHasParentheses,
						);
					}

					this.style[(property as string)] = processedValue;

					return this;
				case Array:
					if (value === undefined) {
						returnedValues = {};

						(property as string[]).fastEach((item: string) => {
							returnedValues[item] = this.css(item);
						});

						return returnedValues;
					}
					(property as string[]).fastEach((item: string, i: number) => {
						this.css(item, value[i]);
					});

					return this;
				case Object:
					returnedValues = {};

					Object.keys(property as Record<string, string | number>).fastEach((key: string) => {
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

				function formatValueString(valueString: string): string {
					return valueString
						.toLowerCase()
						.replace(/\s/g, '');
				}

				function getValueWithoutUnit(valueWithUnit: string): string {
					if (valueWithUnit.includes('px') === false) {
						return valueWithUnit;
					}

					return valueWithUnit.replace(/px/g, '');
				}

				function getValueWithUnit(valueWithoutUnit: string): string {
					if (!valueWithoutUnit) {
						return valueWithoutUnit;
					}

					if (valueWithoutUnit.constructor === Number
						|| Number.isNaN(Number(valueWithoutUnit)) === false) {
						return `${valueWithoutUnit}px`;
					}

					return valueWithoutUnit;
				}

				function getAttributesFromValueString(
					valueStringWithAttributes: string,
					hasParentheses: boolean,
				): Record<string, string> {
					let valueArrayWithAttributes: string[] = null;
					let attributeKeys: string[] = null;
					let attributeValues: string[] = null;

					if (hasParentheses) {
						// split between ')' and remove ')' in the meantime
						valueArrayWithAttributes = formatValueString(valueStringWithAttributes)
							.split(')');

						// remove everything inside parentheses
						// regex is slower than native functions https://jsben.ch/8GY5K
						attributeKeys = valueArrayWithAttributes
							.map(
								(attribute) => attribute
									.substr(0, attribute.indexOf('('))
									.trim(),
							);

						// remove everything before and including '('
						// ')' was removed when we split it in 'valueArrayWithAttributes'
						attributeValues = valueArrayWithAttributes
							.map(
								(attribute) => attribute
									.substr(
										attribute.indexOf('(') + 1,
									),
							);
					} else {
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

					const attributeObject: Record<string, string> = {};

					attributeKeys.fastEach((key: string, i: number) => {
						if (!key) {
							return;
						}

						attributeObject[key] = attributeValues[i];
					});

					return attributeObject;
				}

				function getValueStringFromAttributes(
					attributes: Record<string, string>,
					hasParentheses: boolean,
				): string {
					let valueArray: string[] = null;
					let valueString: string = null;

					if (hasParentheses) {
						valueArray = Object.keys(attributes).map(
							(attributeKey) => `${attributeKey}(${attributes[attributeKey]})`,
						);

						valueString = valueArray.join('');
					} else {
						valueArray = Object.keys(attributes).map(
							(attributeKey) => `${attributeKey}${attributes[attributeKey]}`,
						);

						valueString = valueArray.join(',');
					}

					return valueString;
				}
			},
			on(eventsStr: string, ...options) {
				const events: string[] = eventsStr.split(' ');
				let selector: string = null;
				let handler: (event: Event) => unknown = null;
				let eventOptions: EventListenerOptions = {};

				options.fastEach((option: string | string[] | ((event: Event) => unknown)) => {
					switch (typeof option) {
					case 'string':
						if (selector === null) {
							selector = option as string;
						}
						break;
					case 'function':
						if (handler === null) {
							handler = option as (event: Event) => unknown;
						}
						break;
					case 'object':
						if (option === null) {
							break;
						}
						if (Object.keys(eventOptions).length === 0) {
							eventOptions = option as EventListenerOptions;
						}
						break;
					default:
						break;
					}
				});

				events.fastEach((eventStr) => {
					this.addEventListener(
						eventStr,
						(event: Event) => {
							const processedEvent: Record<string, any> = event;

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
						},
						eventOptions,
					);
				});

				return this;
			},
			off(eventsStr: string, ...options) {
				const events: string[] = eventsStr.split(' ');
				let selector: string = null;
				let handler: (event: Event) => unknown = null;

				options.fastEach((option: string | string[] | ((event: Event) => unknown), i) => {
					switch (option.constructor) {
					case String:
						if (selector !== null) {
							break;
						}
						selector = option as string;
						break;
					case Function:
						if (i !== options.length - 1) {
							break;
						}
						handler = option as (event: Event) => unknown;
						break;
					default:
						break;
					}
				});

				events.fastEach((eventStr) => {
					this.removeEventListener(eventStr, (event: Event) => {
						const processedEvent: Record<string, any> = event;

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
			async getJSON(url, callback?) {
				const response = await fetch(url);

				return callback ? callback(await response.json()) : response.json();
			},
			$,
			$$,
			// workaround to keep the type
			...{} as any,
		};

		// ...spread doesn't work directly on dom objects apparently
		Object.assign(objectToCreateFrom, object);

		return objectToCreateFrom;
	}
}
