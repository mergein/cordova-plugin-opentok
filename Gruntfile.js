var babel = require('rollup-plugin-babel');

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: [{
        files: ['src/**/*.coffee'],
        tasks: ['coffee', 'concat'],
        options: {
          spawn: true
        }
      }, {
        files: ['src/**/*.js'],
        tasks: ['rollup', 'concat'],
        options: {
          spawn: true
        }
      }]
    },
    coffee: {
      compileBare: {
        options: {
          bare: true
        },
        files: {
          './www/coffeescript.js': './src/js/*.coffee'
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['./www/coffeescript.js', './src/js/lib/OT-common-js-helpers.js', './www/rollup.js'],
        dest: './www/opentok.js'
      }
    },
    rollup: {
      options: {
        plugins: [
          babel({
            exclude: './node_modules/**'
          })
        ]
      },
      files: {
        dest: './www/rollup.js',
        src: 'src/js/index.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today(\'yyyy-mm-dd\') %> */\n'
      },
      build: {
        src: 'www/opentok.js',
        dest: 'www/opentok.min.js'
      }
    }
  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-rollup');

  // Default task(s).
  grunt.registerTask('default', ['coffee', 'rollup', 'concat']);
};
