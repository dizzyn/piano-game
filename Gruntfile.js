module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'js/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        less: {
            development: {
                options: {
                },
                files: {
                    "css/app.css": "css/app.less"
                }
            }
        },
        templates: {
            production: {
                folder: "templates",
                dest: ""
            }
        },
        watch: {
            less: {
                files: ['css/**/*.less'],
                tasks: ['less']
            },
            templates: {
                files: ['templates/**/*.us'],
                tasks: ['templates']
            }
        }
    });

    grunt.registerTask('templates', 'Generate pages from templates', function () {

        var options = grunt.config('templates')["production"];

        //list template files
        var fs = require('fs');
        var files = fs.readdirSync(options.folder);

        var libFile = require('./lib.file.js');

        for (var i in files) {
            var file = files[i];

            if (file.indexOf("_") !== 0) {

                var parts = file.split('.')
                var ext = (parts.length > 1 ? parts.pop() : null)
                var outputFileName = parts.join('.');

                if (ext === 'us') {
                    console.log(' ... ' + file);

                    libFile.underscoreTemplate(options.folder + "/" + file, options.dest + outputFileName + ".html", {});
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['jshint']);

};