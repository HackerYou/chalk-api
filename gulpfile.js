'use strict';

let gulp = require('gulp');
let mocha = require('gulp-mocha');
let eslint = require('gulp-eslint');
let notify = require('gulp-notify');
let plumber = require('gulp-plumber');
let gulputil = require('gulp-util');

gulp.task('lint', () => {
	gulp.src('./api/**/*.js')
		.pipe(plumber({
			errorHandler: gulputil.env.type === 'ci' ? gulputil.noop() : notify.onError("Error: <%= error.message %>")   
		}))
		.pipe(eslint({
			useEslintrc: true
		}))
		.pipe(eslint.format());
});

gulp.task('test', () => {
	gulp.src('./tests/**/*.js')
		.pipe(plumber({
			errorHandler: gulputil.env.type === 'ci' ? gulputil.noop() : notify.onError("Error: <%= error %>")   
		}))
		.pipe(mocha({reporter: 'spec'}));
});


gulp.task('default', ['lint','test'],() => {
	gulp.watch('./api/**/*.js', ['lint','test']);
	gulp.watch('./tests/**/*.js', ['test']);
});


