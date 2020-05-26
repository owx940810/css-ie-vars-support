const { parallel, src, dest } = require('gulp')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')

function minJs () {
  return src('src/index.js')
    .pipe(uglify())
    .pipe(rename((path) => {
      path.basename = 'css-ie-vars-support'
      path.extname = '.min.js'
    }))
    .pipe(dest('dist'))
}

exports.default = parallel(minJs)
