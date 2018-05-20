var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var WriteFilePlugin = require('write-file-webpack-plugin');
var FriendlyErrors = require('friendly-errors-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

// var FF = process.env.BROWSER === 'Firefox'; // needed for custom stuff in manifest for Firefox

// console.log(process.env.BROWSER)
// console.log(process.env.NODE_ENV);
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

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
        // publicPath: '/dist/',
        filename: '[name].js'
    },
    mode: mode,
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
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
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    devtool: '#source-map',
    plugins: [
        new VueLoaderPlugin(),
        // new webpack.optimize.OccurrenceOrderPlugin(),
        // new webpack.optimize.CommonsChunkPlugin({
        //     names: ['app', 'background', 'options'] // , 'webpack-manifest'] // Specify the common bundle's name.
        // }),
        new CopyWebpackPlugin([
            // { // copy host json --> exluded (manual download required)
            //     from: 'src/host/',
            //     to: 'host/'
            // },
            { // copy locale
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
                flatten: true
            },
            // {output}/file.txt
            {
                //from: 'src/manifest.json',
                from: `src/${manifestFileName}`,
                to: 'manifest.json',
                transform: function(content, path) {
                    // add description & version from package.json
                    // let json = JSON.parse(content.toString('utf8'));

                    // if (FF) {
                    //     Object.assign(json, manifestAdditionsFF);
                    // }

                    return JSON.stringify(
                        Object.assign({}, JSON.
                            parse(content.toString('utf8')), {
                                description: process.env.
                                  npm_package_description,
                                version: process.env.
                                  npm_package_version || '0.0.1'
                            }), null, 2);
                }
            }
        ]),
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
            chunks: ['background'] //, 'webpack-manifest']
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'options.html'),
            filename: 'options.html',
            // chunksSortMode: 'none',
            chunks: ['options'] //, 'webpack-manifest']
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
