const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: "production",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
            },
            {
                test: /\.(s(c|a)?|c)ss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // Prefer `dart-sass`
                            implementation: require("sass"),
                        },
                    },
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss', '.templ'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
};