/** @type {import('tailwindcss').Config} */

const config = {
    content: ["./main/**/*.templ"],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    }
}

export default config;