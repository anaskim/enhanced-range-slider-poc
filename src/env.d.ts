/// <reference types="astro/client" />

interface RangeGroupThumbOptions {
    min?: string;
    max?: string;
    name?: string;
    label?: string;
}

interface HTMLRangeGroupElement extends HTMLElement {
    disabled: boolean;
    readonly form: HTMLElement | null;
    readonly list: HTMLDataListElement | null;
    min: string;
    max: string;
    stepBetween: string;
    name: string;
    readonly type: string;
    readonly willValidate: boolean;
    readonly values: readonly number[];
    readonly inputs: readonly HTMLInputElement[];
    getRangeInput(index: number): HTMLInputElement | null;
    setRangeValue(index: number, value: number): void;
    addThumb(value: number, options?: RangeGroupThumbOptions): HTMLInputElement;
    removeThumb(index: number): HTMLInputElement | null;
}

declare var HTMLRangeGroupElement: {
    prototype: HTMLRangeGroupElement;
    new (): HTMLRangeGroupElement;
};

interface HTMLElementTagNameMap {
    rangegroup: HTMLRangeGroupElement;
}
