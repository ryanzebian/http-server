// var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack')
const path = require('path');

module.exports = {
    target: 'node',
    // externals: [nodeExternals()],
    entry: './src/http-server-cli.js',
    output: {
        filename: 'tiny-http-server.js',
        path: path.resolve(__dirname, 'bin'),
        libraryTarget: 'commonjs2'
    },
    plugins: [
        new webpack.BannerPlugin({banner: '#!/usr/bin/env node', raw: true}),
        // new webpack.optimize.UglifyJsPlugin()
    ]
};