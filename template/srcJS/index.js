import "htmx.org";
import Alpine from "alpinejs";
import morph from '@alpinejs/morph';
import "./layout.scss";
import "./tailwind.css"
import "./get_cookie.js"
import { getCookie } from "./get_cookie.js"

const htmx = import("htmx.org");

window.htmx = htmx;
window.Alpine = Alpine;
window.getCookie = getCookie;
Alpine.plugin(morph);

Alpine.start();