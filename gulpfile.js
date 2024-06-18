const { src, dest, series, parallel, watch } = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const typograf = require('gulp-typograf');
const webp = require('gulp-webp');
const rev = require('gulp-rev');
const revDel = require('gulp-rev-delete-original');
const revRewrite = require('gulp-rev-rewrite');
const htmlmin = require('gulp-htmlmin');
const { readFileSync } = require('fs');

const paths = {
  srcImgFolder: 'app/images',
  srcScss: 'app/scss/**/*.scss',
  srcFullJs: 'app/js/**/*.js',
  srcPartialsFolder: 'app/partials',
  srcFolder: 'app',
  resourcesFolder: 'app/resources',
  buildImgFolder: 'docs/images',
  buildCssFolder: 'docs/css',
};

const buildFolder = 'docs';

const cleanDocs = () => {
  return src(buildFolder, { read: false, allowEmpty: true })
    .pipe(clean());
};

const styles = () => {
  return src(paths.srcScss)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(paths.buildCssFolder))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src(paths.srcFullJs)
    .pipe(dest(buildFolder + '/js'))
    .pipe(browserSync.stream());
};

const resources = () => {
  return src(paths.resourcesFolder + '/**/*')
    .pipe(dest(buildFolder + '/resources'))
    .pipe(browserSync.stream());
};

const images = () => {
  return src(paths.srcImgFolder + '/**/*.{jpg,jpeg,png,svg}')
    .pipe(dest(paths.buildImgFolder))
    .pipe(browserSync.stream());
};

const svgSprites = () => {
  return src(paths.srcImgFolder + '/**/*.svg')
    .pipe(dest(paths.buildImgFolder));
};

const webpImages = () => {
  return src([`${paths.srcImgFolder}/**/*.{jpg,jpeg,png}`])
    .pipe(webp())
    .pipe(dest(paths.buildImgFolder));
};

const htmlInclude = () => {
  return src([`${paths.srcFolder}/*.html`])
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(typograf({
      locale: ['ru', 'en-US']
    }))
    .pipe(dest(buildFolder))
    .pipe(browserSync.stream());
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: buildFolder
    },
  });

  watch(paths.srcScss, styles);
  watch(paths.srcFullJs, scripts);
  watch(paths.srcPartialsFolder + '/*.html', htmlInclude);
  watch(paths.srcFolder + '/*.html', htmlInclude);
  watch(paths.resourcesFolder + '/**/*', resources);
  watch(paths.srcImgFolder + '/**/*.{jpg,jpeg,png,svg}', images);
  watch(paths.srcImgFolder + '/**/*.{jpg,jpeg,png}', webpImages);
  watch(paths.srcImgFolder + '/*.svg', svgSprites);
};

const cache = () => {
  return src(`${buildFolder}/**/*.{css,js,svg,png,jpg,jpeg,webp,ttf}, {
      base: buildFolder
    }`)
    .pipe(rev())
    .pipe(revDel())
    .pipe(dest(buildFolder))
    .pipe(rev.manifest('rev.json'))
    .pipe(dest(buildFolder));
};

const rewrite = () => {
  const manifest = readFileSync(buildFolder + '/rev.json');
  src(paths.buildCssFolder + '/*.css')
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest(paths.buildCssFolder));
  return src(`${buildFolder}/**/*.html`)
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest(buildFolder));
};

const htmlMinify = () => {
  return src(`${buildFolder}/**/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest(buildFolder));
};

const toProd = (done) => {
  isProd = true;
  done();
};

exports.default = series(cleanDocs, htmlInclude, scripts, styles, resources, images, webpImages, svgSprites, watchFiles);

exports.build = series(toProd, cleanDocs, htmlInclude, scripts, styles, resources, images, webpImages, svgSprites, htmlMinify, watchFiles);

exports.cache = series(cache, rewrite);
