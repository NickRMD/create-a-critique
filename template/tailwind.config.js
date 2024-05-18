/** @type {import('tailwindcss').Config} */

const config = {
    content: ["./main/**/*.templ"],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: true,
    }
}

export default config;