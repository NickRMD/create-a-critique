# Critique of the Gotha Program

Run:
```bash
$ npx create-a-critique
```
To create a new project using this little framework

This project is made using:

- Go (with or without Echo)
- Templ
- HTMX
- Alpine.js

So it's made using GoTHA (Go, Templ, HTMX, Alpine.js).

The template was made using the Vite template CSS, so credits to them!

Needs installed:

- A JS Package Manager (NPM, PNPM)
- Go
- Templ
- Air (for Go)

HTMX is used in the Index page and Alpine.js is used a bit in the 404 page for redirecting after 5 seconds.

## As of version 1.2.0 of the template:
Now it's also using some middlewares for:
CSRF token verification, zerolog for logging,
Recovering from panics.
Also added error handling in the renderers.

## Docs here:
- [Go](https://go.dev/doc/)
- [Echo](https://echo.labstack.com/docs)
- [Templ](https://templ.guide/)
- [HTMX](https://htmx.org/docs/)
- [Alpine.js](https://alpinejs.dev/start-here)