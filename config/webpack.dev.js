const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');

const devConfig = {
    mode: 'development',
    devServer: {
        port: 8096,
        historyApiFallback: {
            index: 'index.html'
        },
        allowedHosts: 'all',
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    },
    devtool: 'inline-source-map'
}

module.exports = merge(commonConfig, devConfig);