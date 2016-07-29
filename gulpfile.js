/**
 * papago 前端构建
 * webpack主要负责js模块的打包，包括模块中的样式、模板、图片
 * gulp负责任务管理、sass编译、图片压缩、MD5生成和替换
 */

'use strict';

var path = require('path'),
	fs = require('fs'),
	through = require('through2');

var gulp = require('gulp'),
	autoprefixer = require('autoprefixer'),
	postCss = require('gulp-postcss'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	cssMinify = require('gulp-minify-css'),
	imageMinify = require('gulp-imagemin'),
	gutil = require('gulp-util'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
	$if = require('gulp-if'),
	browserSync = require('browser-sync'),
	webpack = require('gulp-webpack'),
	clean = require('gulp-clean'),
	filter = require('gulp-filter'),
	rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector');

var dir = {
	css: 'dist/css/',
	sass: 'src/sass/',
	js_src: 'src/js/',
	js_dist: 'dist/js/',
	image_src: 'src/images/',
	image_dist: 'dist/images/',
	release_root: 'release/',
	release_css: 'release/css/',
	release_js: 'release/js/',
	release_image: 'release/images/',
	cache: '.cache/'
};

var files = {
	sass: dir.sass + '**/*.scss',
	js: dir.js_src + '**/*.js',
	image: dir.image_src + '*'
};

var iconfonts = [
    'src/iconfont/iconfont.eot',
    'src/iconfont/iconfont.svg',
    'src/iconfont/iconfont.ttf',
    'src/iconfont/iconfont.woff'
];

var libfiles = [
    dir.js_src + 'lib/jquery.js',
    dir.js_src + 'lib/es5-shim.js',
    dir.js_src + 'modules/global.js'
];

var relEnv = false,
    devEnv = false,
    staEnv = false,
    taskName = process.argv[2],
    pwd = path.resolve('./');

switch(taskName){
    case 'release':
        relEnv = true;
        break;

    case 'dev':
        devEnv = true;
        break;

    case 'static':
        staEnv = true;
        break;
}

var cssStyle = relEnv ? 'compressed' : 'expanded';
var inSourcemap = relEnv ? true : false;
var webpackConfig = relEnv ? require('./webpack.config.prod') : require('./webpack.config.base');

var staticServer = {
        notify: false,
        logPrefix: 'DEV',
        browser: 'google chrome',
        server: {
            baseDir: './',
            middleware: function (req, res, next) {
                // 这里主要是允许跨域访问图标字体
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        },
        startPath: '/view'    
    };


/**
 * 编译sass&自动补充前缀&压缩
 */
gulp.task('sass', function(){
	var processors = [
		autoprefixer({
            browsers: ['last 2 versions', 'ie 8-11']
        })
	];
	
	return gulp.src(dir.sass + '*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(postCss(processors))
		.pipe($if(relEnv, cssMinify()))
		.pipe(gulp.dest(dir.css));
});


/**
 * 合并lib.js
 */
gulp.task('concatlib', function(){
    gulp.src(libfiles)
    .pipe(concat('lib.js'))
    .pipe($if(relEnv, uglify()))
    .pipe(gulp.dest(dir.js_dist));
});


/**
 * webpack打包模块
 */
gulp.task('webpack', function(){
	return gulp.src('src/js/index.js')
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest(dir.js_dist));
});


/**
 * 字体图标拷贝
 */
gulp.task('iconfont', function(){
    gulp.src(iconfonts)
    .pipe(gulp.dest($if(relEnv, 'release/iconfont', 'dist/iconfont')));
});


/**
 * 图片拷贝
 */
gulp.task('imagedist', ['sass'], function(){
    return gulp.src(dir.image_src + '*')
        .pipe(gulp.dest(dir.image_dist));
});


/**
 * 监控文件改动&自动刷新
 */
gulp.task('watch', function(){
    
    var watchLrFile = ['dist/**/*', 'view/**/*'];
    var reload = browserSync.reload;

    browserSync.init(staticServer);

    // 监控sass
    gulp.watch(files.sass, ['sass']);
    // 监控js
    gulp.watch([
        dir.js_src + '**/*.scss', 
        dir.js_src + '**/*.tpl', 
        dir.js_src + '**/*.hbs', 
        files.js
    ], ['webpack']);
    // 监控lib.js
    gulp.watch(libfiles, ['concatlib']);
    // 监控icon字体文件
    gulp.watch(['src/iconfont/*'], ['iconfont']);
    // 监控图片
    gulp.watch(files.image, ['imagedist']);
    // 文件变化后自动刷新
    gulp.watch(watchLrFile, reload);
});


/**
 * 发布时图片压缩
 */
gulp.task('imagemin', function(){
    return gulp.src(dir.image_src + '*')
        .pipe(plumber())
        .pipe(imageMinify())
        .pipe(gulp.dest(dir.release_image));
});


/**
 * 发布时压缩css&js
 */
// 压缩css
gulp.task('cssminify', function(){
	return gulp.src(dir.css + '*.css')
		.pipe(cssMinify())
		.pipe(gulp.dest(dir.cache));
});


// 压缩js
gulp.task('jsminify', function(){
	return gulp.src(dir.js_dist + '*.js')
		.pipe(uglify())
		.pipe(gulp.dest(dir.cache));
});


/**
 * 生成带md5戳
 */
// 清除原有数据
gulp.task('cleancache', function(){
    return gulp.src(dir.cache + '*', {read: false})
        .pipe(clean());
});
gulp.task('cleanrelease', function(){
    return gulp.src(dir.release_root + '*', {read: false})
        .pipe(clean());
});
gulp.task('cleanold', ['cleancache', 'cleanrelease']);

// css&js压缩后，在文件名加上MD5戳
gulp.task('createrev', ['minify'], function(){

    var filterJS = filter('*.js', {restore: true}),
        filterCSS = filter('*.css', {restore: true});

    var distPath = dir.release_root;

    gulp.src([dir.cache + '*'])
        .pipe(plumber())
        .pipe(rev())

        // js
        .pipe(filterJS)  
        .pipe(gulp.dest(dir.release_js))      
        .pipe(filterJS.restore)
        
        // css
        .pipe(filterCSS)  
        .pipe(gulp.dest(dir.release_css))      
        .pipe(filterCSS.restore);
});

// 生成rev-manifest.json
// 生成json后可以用gulp-rev-collector替换页面中的相应链接
gulp.task('createrevjson', ['minify'], function(){

    gulp.src([dir.cache + '*.css', dir.cache + '*.js'])
        .pipe(plumber())
        .pipe(rev())
        .pipe(rev.manifest('version.json'))
        .pipe(gulp.dest(dir.release_root));
});

// version任务归集
gulp.task('version', ['createrev', 'createrevjson']);

// css&js&image 压缩
gulp.task('minify', ['cssminify', 'jsminify', 'imagemin']);


/**
 * 常规任务
 */
gulp.task('build', [
	'sass',
    'iconfont',
    'concatlib',
	'imagedist',
	'webpack'
]);

/**
 * 默认命令 gulp
 */
gulp.task('default', ['build']);

/**
 * 本地开发命令 gulp dev
 */
gulp.task('dev', ['build', 'watch']);

/**
 * 发布命令
 */
gulp.task('release', ['cleanold', 'build'], function(){
	// gulp.run('minify');
	// gulp.run('version');
});
