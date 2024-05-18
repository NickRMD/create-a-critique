/** @type {import('postcss-load-config').Config} */

import autoprefixer from 'autoprefixer'
import postcssNested from "postcss-nested"
import postcssImport from "postcss-import"
import cssnanoPlugin from 'cssnano'
import postcssPresetEnv from "postcss-preset-env"
import TailwindCSS from "tailwindcss"

const config = {
    syntax: "postcss-scss",
    plugins: [
        autoprefixer,
        postcssNested,
        postcssImport,
        cssnanoPlugin({ preset: "default" }),
        postcssPresetEnv,
        TailwindCSS
    ]
}

export default config;