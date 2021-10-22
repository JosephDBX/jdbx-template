const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = ({ analize }, { mode }) => {
	const isProduction = mode === 'production';

	let plugins = [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'public', 'index.html'),
		}),
		new webpack.DefinePlugin({ 'process.env.mode': JSON.stringify(mode) }),
		new MiniCssExtractPlugin({
			filename: '[name].bundle.css',
		}),
		new ReactRefreshWebpackPlugin(),
	];

	let optimization = {};

	let output = {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'build'),
		clean: true,
	};

	let devtool = 'cheap-module-source-map';

	let devServer = {
		hot: true,
		open: true,
		historyApiFallback: true,
		port: 3000,
	};

	if (isProduction) {
		plugins = [
			new CopyPlugin({
				patterns: [
					{
						from: path.resolve(__dirname, 'public'),
						to: path.resolve(__dirname, 'build'),
						globOptions: {
							dot: true,
							gitignore: true,
							ignore: ['**/index.html'],
						},
					},
				],
			}),
			new webpack.DefinePlugin({ 'process.env.mode': JSON.stringify(mode) }),
			new HtmlWebpackPlugin({
				title: 'Progressive Web Application',
				template: path.resolve(__dirname, 'public', 'index.html'),
			}),
			new MiniCssExtractPlugin({
				filename: '[name].[contenthash].bundle.css',
			}),
			new WorkboxPlugin.GenerateSW({
				clientsClaim: true,
				skipWaiting: true,
			}),
		];

		if (analize) plugins = [...plugins, new WebpackBundleAnalyzer({})];

		optimization = {
			moduleIds: 'deterministic',
			runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all',
					},
				},
			},
			minimize: true,
			minimizer: [
				new CssMinimizerPlugin({
					parallel: true,
					minimizerOptions: {
						preset: [
							'default',
							{
								discardComments: { removeAll: true },
							},
						],
					},
				}),
			],
		};

		output = { ...output, filename: '[name].[contenthash].bundle.js' };

		devtool = undefined;

		devServer = undefined;
	}

	return {
		entry: path.resolve(__dirname, 'src', 'index.tsx'),

		module: {
			rules: [
				{
					test: /\.(ts|js)x?$/,
					use: 'babel-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.s[ac]ss$/i,
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				},
				{
					test: /\.(png|svg|jpg|jpeg|gif)$/i,
					type: 'asset/resource',
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/i,
					type: 'asset/resource',
				},
				{
					test: /\.(csv|tsv)$/i,
					use: ['csv-loader'],
				},
				{
					test: /\.xml$/i,
					use: ['xml-loader'],
				},
			],
		},

		resolve: {
			extensions: ['.tsx', '.ts', '.jsx', '.js'],
			alias: {
				assets: path.resolve(__dirname, 'src', 'assets'),
				scss: path.resolve(__dirname, 'src', 'scss'),
				utils: path.resolve(__dirname, 'src', 'utils'),
				jdbx: path.resolve(__dirname, 'src', 'jdbx'),
				app: path.resolve(__dirname, 'src', 'app'),
			},
		},

		plugins,

		optimization,

		output,

		devtool,

		devServer,
	};
};
