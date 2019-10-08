import { App } from "../App";


let precisionHeader: string;
export function getPrecisionHeader() {
    if (!precisionHeader) {
        const precision = App.renderer.getPrecision();
        precisionHeader =
            `precision ${precision} float;
precision ${precision} int;
`
    }
    return precisionHeader;
}