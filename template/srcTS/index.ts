import "htmx.org";
// Ignored because the template can't have dependencies installed
// @ts-ignore
import Alpine from "alpinejs";
// Ignored because the template can't have dependencies installed
// @ts-ignore
import morph from '@alpinejs/morph';
import "./layout.scss";
import "./tailwind.css"
import "./get_cookie"
import { getCookie } from "./get_cookie"

declare global {
    interface Window {
        htmx: any;
        Alpine: any;
        getCookie: typeof getCookie;
    }
}

// Ignored because the template can't have dependencies installed
// @ts-ignore
const htmx = import("htmx.org");

window.htmx = htmx;
window.Alpine = Alpine;
window.getCookie = getCookie;
Alpine.plugin(morph);

Alpine.start();