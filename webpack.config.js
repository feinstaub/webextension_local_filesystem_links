/** @type {import('webpack').Configuration} */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');

// var FF = process.env.BROWSER === 'Firefox'; // needed for custom stuff in manifest for Firefox

const manifestFiles = {
    firefox: 'manifest.firefox.json',
    chrome: 'manifest.chrome.json'
};

const manifestFileName = manifestFiles[process.env.BROWSER || 'firefox']; // default to firefox

module.exports = {
    entry: {
        app: './src/main.js',
        background: './src/extension/background/index.js',
        options: './src/extension/options.js',
        content: './src/extension/content.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                loader: 'vue-template-loader',
                // We don't want to pass `src/index.html` file to this loader.
                exclude: /(index|options|background).html/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        writeToDisk: true
    },
    performance: {
        hints: false
    },
    devtool: 'source-map',
    plugins: [
        // new webpack.optimize.OccurrenceOrderPlugin(),
        // We're using process (polyfill for webpack 5 needed)
        new webpack.ProvidePlugin({
            process: 'process/browser'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    // copy locale
                    from: 'src/extension/_locales',
                    to: '_locales'
                },
                {
                    from: 'src/static'
                },
                {
                    from: 'src/assets'
                },
                {
                    from: 'src/installed.*',
                    to: '[name][ext]'
                },
                // {output}/file.txt
                {
                    from: `src/${manifestFileName}`,
                    to: 'manifest.json',
                    transform: function(content, path) {
                        // add description & version from package.json
                        // let json = JSON.parse(content.toString('utf8'));

                        // if (FF) {
                        //     Object.assign(json, manifestAdditionsFF);
                        // }

                        return JSON.stringify(
                            Object.assign(
                                {},
                                JSON.parse(content.toString('utf8')),
                                {
                                    description:
                                        process.env.npm_package_description,
                                    version:
                                        process.env.npm_package_version ||
                                        '0.0.1'
                                }
                            ),
                            null,
                            2
                        );
                    }
                }
            ]
        }),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            // chunksSortMode: 'none',
            chunks: ['app'], // , 'webpack-manifest'],
            inject: true
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'background.html'),
            filename: 'background.html',
            // chunksSortMode: 'none',
            chunks: ['background']
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'options.html'),
            filename: 'options.html',
            chunksSortMode: 'none',
            chunks: ['options']
        }),
        new WriteFilePlugin(),
        new FriendlyErrors()
    ]
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = ''; // ;'#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    ]);
}
