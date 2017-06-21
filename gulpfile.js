'use strict';

var gulp = require('gulp'),

    postcss = require('gulp-postcss'),

     atImport = require("postcss-import"),
    // jade = require('gulp-jade'),
    cssnano = require('cssnano'),
    center = require('postcss-center'),
    precss = require('precss'),
    clearfix = require('postcss-clearfix'),
    watch = require('gulp-watch'),
    prefixer = require('autoprefixer'),

    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss'),
    sass = require('gulp-sass'),

    wiredep = require('wiredep').stream,
    gulpif = require('gulp-if'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    minifyCss = require('gulp-clean-css'),
    cssmin = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
  spritesmith = require('gulp.spritesmith'),

    reload = browserSync.reload;




// Добавление префиксов IE для opacity
/*   var  opacity = function (css, opts) {
    css.eachDecl(function(decl) {
        if (decl.prop === 'opacity') {
            decl.parent.insertAfter(decl, {
                prop: '-ms-filter',
                value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
            });
        }
    });
};*/


// Пути
var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/',
        sprite: 'build/images/sprite/'
    },
    src: {
        html: 'app/*.html',
        js: 'app/js/*.js',
        style: 'app/css/*.*',
        img: ['app/images/**/*.*', '!./app/images/sprite/**'],
        sprite: 'app/images/sprite/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/css/**/*.*',
        img: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*',
        sprite: 'app/images/sprite/**/*.*',

    },
    clean: './build'
};




// Статический сервер
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "test"
};

gulp.task('webserver', function () {
    browserSync(config);
});

// Удаление папки build
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});


// // Jade
// gulp.task('html:build', function(){
//   gulp.src(path.src.html)
//     .pipe(jade())
//     .pipe(gulp.dest(path.build.html))
//     .pipe(reload({stream: true}));
// });



// Html
gulp.task('html:build', function () {
    // var assets = useref.assets();
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(useref())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

// JS
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        // .pipe(sourcemaps.init())
        .pipe(uglify())

        .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

// postcss плагины
  var processors = [
        prefixer({browsers: ['> 0%', 'ie 8']}),
/*        opacity,*/
        center,
        precss,
      //  cssnano,
        clearfix,
        atImport()
        
    ];

// css
gulp.task('css:build', function () {
     gulp.src(path.src.style)
    .pipe(sass())
      .pipe(minifyCss())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())

    .pipe(rename({
            suffix: '.min'
        }))

 .pipe(postcss(processors))
    .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

// Сжатие изображений
gulp.task('images:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('sprite:build', function() {
    var spriteData = 
        gulp.src(path.src.sprite) // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: './sprites/sprite.png',
                cssName: 'sprite.css',
                 algorithm: 'binary-tree', 

        /*         retinaImgName: './sprites/sprite@2x.png',
               retinaSrcFilter: ['./app/images/sprite/*@2x.png'],*/
 
 

                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }
              
            }));
    spriteData.img.pipe(gulp.dest('./build/css/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('./build/css/')); // путь, куда сохраняем стили
});
// bower
// gulp.task('bower', function () {
//   gulp.src('./app/index.html')
//     .pipe(wiredep({
//    directory : "bower_components",
//     }))
//    .pipe(gulp.dest('./app'));
//  });
//
//  gulp.task('bowerfilesjs', function() {
//      return gulp.src(mainBowerFiles('**/*.js'))
//          .pipe(gulp.dest('app/js'))
//  });
//
//  gulp.task('bowerfilescss', function() {
//      return gulp.src(mainBowerFiles('**/*.css'))
//          .pipe(gulp.dest('app/css'))
//  });

// Пути папки в продакшн
gulp.task('build', [
    'html:build',
    'js:build',
    'css:build',
    'fonts:build',
    'images:build',
    'sprite:build'
]);

// Отслеживание
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('images:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
   watch([path.watch.sprite], function(event, cb) {
        gulp.start('sprite:build');
    });
});

// Задание по умоляанию
gulp.task('default', ['build', 'webserver', 'watch']);


// gulp.task('uncss', function() {
//     return gulp.src('app/css/style.css')
//         .pipe(uncss({
//             html:['app/index.html']
//         }))
//         .pipe(gulp.dest('build/css'))
// });
