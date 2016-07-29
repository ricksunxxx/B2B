var path = require('path');
var webpack = require('webpack');
var config = require('./webpack.config.base');

// 测试环境
// config.output.publicPath = 'http://120.76.41.193:8001/dist/js/';
// 正式环境
config.output.publicPath = 'http://resource.papago.hk/dist/js/';

config.plugins.push(
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: '"production"'
		}
	}),
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	})
);

module.exports = config;