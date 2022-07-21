const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
	entry: path.resolve(__dirname, '../src/index.js'),
	output: {
		filename: 'bundle.[contenthash].js',
		path: path.resolve(__dirname, '../dist'),
        assetModuleFilename: 'assets/[name][ext]',
        publicPath: "/terra-gen/",
	},
	devtool: 'source-map',
	plugins: [
		new CopyPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') }
            ]
        }),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../src/index.html'),
			minify: true
		})
	],
	module: {
        rules: [
            // HTML
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader'
                }
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:
                [
                    'babel-loader'
                ]
            },

            // CSS
            {
                test: /\.css$/,
                use:
                [
                    'style-loader',
                    'css-loader'
                ]
            },

            // Images
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                type: "asset/resource"
                //use: {
                //    loader: 'file-loader',
                //    options: {
                //        name: '/assets/[name].[ext]'
                //    }
                //}
                
            },

            // Shaders
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader'
                ]
            },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                        options:
                        {
                            outputPath: 'assets/fonts/'
                        }
                    }
                ]
            }
        ]
    }
}