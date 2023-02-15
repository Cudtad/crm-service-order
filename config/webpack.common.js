const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const packageJson = require('../package.json');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            },
            {
                test: /\.((sa|sc|c)ss)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|eot|woff2|ttf)$/i,
                use: ['file-loader'],
            },
        ]
    },
    resolve: {
        alias: {
            components: path.resolve(__dirname, '../src/components/'),
            features: path.resolve(__dirname, '../src/features/'),
            appSettings: path.resolve(__dirname, 'appSettings.js'),
            services: path.resolve(__dirname, '../src/services/'),
            assets: path.resolve(__dirname, '../src/assets'),
            '@ui-lib': '@ngdox/ui-lib/dist/components',
            '@lib': path.resolve(__dirname, '../lib/')
        },
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'ui_crm_service_order',
            filename: 'remoteEntry.js',
            exposes: {
                './CrmServiceOrderApp': './src/bootstrap'
            },
            shared: packageJson.dependencies
        }),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
}
