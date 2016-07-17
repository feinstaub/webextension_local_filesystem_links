var gulp = require('gulp');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');
 
var sourceFiles = [
    'index.js', 
    'lib/js/*.js', 
    '!data/js/jquery*.js',
    '!data/js/jquery-observe.js',
    'data/js/*.js'
];

gulp.task('lint', function() {
    // ESLint ignores files with "node_modules" paths. 
    // So, it's best to have gulp ignore the directory as well. 
    // Also, Be sure to return the stream from the task; 
    // Otherwise, the task may end before the stream has finished. 
    // return gulp.src(['**/*.js','!node_modules/**'])
    return gulp.src(sourceFiles)
            //'!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property 
        // of the file object so it can be used by other modules. 
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console. 
        // Alternatively use eslint.formatEach() (see Docs). 
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failAfterError last. 
        .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
    return watch(sourceFiles, ['lint']);
});

gulp.task('default', ['lint', 'watch']);