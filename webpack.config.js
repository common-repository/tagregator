const path = require( 'path' );
const webpack = require( 'webpack' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

const isProduction = process.env.NODE_ENV === 'production';

const postCssOptions = {
	// webpack needs a unique identifier. Usually this is based on the options object, but this is not possible
	// for "complex options", so we give it one ourselves.
	ident: 'postcss',
	plugins: () => [
		require( 'autoprefixer' )(),
	],
};

const webpackConfig = {
	entry: {
		index: path.join( __dirname, 'javascript', 'index.jsx' ),
	},
	mode: isProduction ? 'production' : 'development',

	output: {
		path: path.join( __dirname, 'build' ),
		filename: '[name].js',
	},
	resolve: {
		extensions: [ '.js', '.jsx' ],
	},

	// Bring in sourcemaps for non-production builds.
	devtool: isProduction ? 'none' : 'cheap-module-eval-source-map',

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: [ /node_modules/ ],
				use: [ {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					},
				} ],
			},
			{
				test: /\.scss$/,
				exclude: [ /node_modules/ ],
				use: [
					MiniCssExtractPlugin.loader,
					{ loader: 'css-loader', options: { importLoaders: 1 } },
					{ loader: 'postcss-loader', options: postCssOptions },
					'sass-loader',
				],
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin( {
			'process.env': {
				NODE_ENV: JSON.stringify( process.env.NODE_ENV ),
			},
		} ),
		new DependencyExtractionWebpackPlugin( { injectPolyfill: true } ),
		new MiniCssExtractPlugin( {
			filename: '[name].css',
		} ),
	],

	watchOptions: {
		poll: true, // required to work in a VM, see https://github.com/webpack/webpack/issues/425#issuecomment-53214820
	},
};

module.exports = webpackConfig;
