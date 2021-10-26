let preprocessor = 'sass', // Preprocessor (sass, less, styl); 'sass' also work with the Scss syntax in blocks/ folder.
		fileswatch   = 'html,htm,txt,json,md,woff2,ttf,svg,png,jpg' // List of files extensions for watching & hard reload

const { src, dest, parallel, series, watch } = require('gulp')
const browserSync  = require('browser-sync').create()
const bssi         = require('browsersync-ssi')
const ssi          = require('ssi')
const webpack      = require('webpack-stream')
const sass         = require('gulp-sass')
const sassglob     = require('gulp-sass-glob')

const cleancss     = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const rename       = require('gulp-rename')
const imagemin     = require('gulp-imagemin')
const newer        = require('gulp-newer')
const rsync        = require('gulp-rsync')
const del          = require('del')
const plumber      = require('gulp-plumber')
const shorthand = require('gulp-shorthand')
const sourcemaps = require('gulp-sourcemaps')
//const gulpStylelint = require('gulp-stylelint')

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'src/',
			middleware: bssi({ baseDir: 'src/', ext: '.html' })
		},
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
		notify: false,
		online: true
	})
}

function scripts() {
	return src(['src/template/js/*.js', '!src/template/js/*.min.js'])
		.pipe(webpack({
			mode: 'production',
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('app.min.js'))
		.pipe(dest('src/template/js'))
		.pipe(browserSync.stream())
}

function jsSimple() {
	return src(['src/template/js/**/*'])
		.pipe(newer('dist/template/js'))
		.pipe(browserSync.stream())
}

function styles_old() {
	return src([`src/template/styles/${preprocessor}/*.*`, `!src/template/styles/${preprocessor}/_*.*`])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)())
		.pipe(autoprefixer({ overrideBrowserslist: ['last 5 versions'], grid: true }))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest('src/template/css'))
		.pipe(browserSync.stream())
}

function styles() {
	return src([`src/template/styles/${preprocessor}/*.*`, `!src/template/styles/${preprocessor}/_*.*`])
		.pipe(plumber())
		/*.pipe(gulpStylelint({
			failAfterError: false,
			reporters: [
				{
					formatter: 'string',
					console: true
				}
			]
		}))*/

		.pipe(sourcemaps.init({ largeFile: true }))
		.pipe(sourcemaps.identityMap())
		//.pipe(eval(`${preprocessor}glob`)())
		.pipe(sass())
		.pipe(autoprefixer({
			cascade: false
		}))
		//.pipe(shorthand())
		// .pipe(cleancss({
		// 	debug: true,
		// 	compatibility: '*'
		// }, details => {
		// 	console.log(`${details.name}: Original size:${details.stats.originalSize} - Minified size: ${details.stats.minifiedSize}`)
		// }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('../css/'))
		//.pipe(sourcemaps.write())
		.pipe(dest('src/template/css'))
		.pipe(browserSync.stream())
}

function images_old() {
	return src(['src/template/img/src/**/*'])
		.pipe(newer('src/template/img/dist'))
		.pipe(imagemin())
		.pipe(dest('src/template/img/dist'))
		.pipe(browserSync.stream())
}

function images() {
	return src('src/template/img/**/*.{gif,png,jpg,svg,webp}')
		.pipe(newer('dist/template/img'))
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({
				quality: 80,
				progressive: true
			}),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(dest('dist/template/img'))
		.pipe(browserSync.stream())
}

function imagesContent() {
	return src('src/assets/images/**/*.{gif,png,jpg,svg,webp}')
		.pipe(newer('dist/assets/images'))
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({
				quality: 80,
				progressive: true
			}),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(dest('dist/assets/images'))
		.pipe(browserSync.stream())
}


function buildcopy() {
	return src([
		//'{src/template/js,src/template/css}/*.min.*',
		'{src/template/js,src/template/css}/*.*',
		//'src/template/img/**/*.*',
		//'!src/template/img/src/**/*',
		'src/img/**/*',
		'src/template/font/**/*'
	], { base: 'src/' })
	.pipe(dest('dist'))
}

async function buildhtml() {
	let includes = new ssi('src/', 'dist/', '/**/*.html')
	includes.compile()
	del('dist/parts', { force: true })
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

function deploy() {
	return src('dist/')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store' ],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch(`src/template/styles/${preprocessor}/**/*`, { usePolling: true }, styles)
	watch(['src/template/js/**/*.js', '!src/template/js/**/*.min.js'], { usePolling: true }, jsSimple)
	watch('src/template/img/**/*.{jpg,jpeg,png,webp,svg,gif}', { usePolling: true }, images)
	watch('src/img/**/*.{jpg,jpeg,png,webp,svg,gif}', { usePolling: true }, imagesContent)
	//watch(`src/**/*/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload)
	watch(`src/**/*`, { usePolling: true }).on('change', browserSync.reload)
}

exports.jsSimple = jsSimple
exports.scripts = scripts
exports.styles  = styles
exports.images  = images
exports.deploy  = deploy
exports.assets = series(jsSimple, styles, images, imagesContent)
exports.build = series(cleandist, jsSimple, styles, images, imagesContent, buildcopy, buildhtml)
//exports.default = series(scripts, styles, images, parallel(browsersync, startwatch))

exports.default = series(jsSimple, styles, images, imagesContent, parallel(browsersync, startwatch))
