const { src, dest, parallel } = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const del = require('del');
const rigger = require('gulp-rigger');
const uglify = require('gulp-uglify');
const browsersync = require('browser-sync').create();

// Path setup
const srcPath = './src';
const distPath = './dist';
const path = {
    build: {
        html: distPath,
        css: `${distPath}/css/`,
        js: `${distPath}/js/`,
        images: `${distPath}/images/`,
        fonts: `${distPath}/fonts/`,
    },
    src: {
        html: `${srcPath}/*.html`,
        css: `${srcPath}/scss/style.scss`,
        js: `${srcPath}/js/*.js`,
        images: `${srcPath}/images/**/*.{jpg,svg,png,gif,webp,ico,webmanifest,xml,json}`,
        fonts: `${srcPath}/fonts/**/*.{eot,woff,woff2,ttf,svg}`
    },
    watch: {
        html: `${srcPath}/**/*.html`,
        css: `${srcPath}/scss/*.scss`,
        js: `${srcPath}/js/*.js`,
        images: `${srcPath}/images/**/*.{jpg,svg,png,gif,webp,ico,webmanifest,xml,json}`,
        fonts: `${srcPath}/fonts/**/*.{eot,woff,woff2,ttf,svg}`
    },
    clean: distPath
}

// Gulp tasks

// HTML-task
function html() {
    return src(path.src.html, { base: srcPath })
        .pipe(dest(path.build.html))
        .pipe(browsersync.reload({ stream: true }));
}
// CSS-task
function css() {
    return src(path.src.css, { base: `${srcPath}/scss/` })
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.reload({ stream: true }));
}
// JS-task
function js() {
    return src(path.src.js, { base: `${srcPath}/js/` })
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min',
            extname: '.js'
        }))
        .pipe(dest(path.build.js));
}
// Image-task
function images() {
    return src(path.src.images, { base: `${srcPath}/images` })
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 70, progressive: true }),
        ]))
        .pipe(dest(path.build.images))
        .pipe(browsersync.reload({ stream: true }));
}
// Clean-task
function clean() {
    return del(path.clean)
}
// Watcher-task
function watcher() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
}
// Browsersync-task
function browserSync() {
    browsersync.init({
        server: {
            baseDir: distPath
        }
    })
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images))
const watch = gulp.parallel(build, watcher, browserSync)

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
