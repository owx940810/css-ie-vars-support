const { parallel, src, dest } = require('gulp')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')

function minJs () {
  return src('src/index.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(rename((path) => {
      path.basename = 'css-ie-vars-support'
      path.extname = '.min.js'
    }))
    .pipe(dest('dist'))
}

exports.default = parallel(minJs)
