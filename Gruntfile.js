var babel = require('rollup-plugin-babel');

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: [{
        files: ['src/**/*.js'],
        tasks: ['rollup', 'concat'],
        options: {
          spawn: true
        }
      }]
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rollup');

  // Default task(s).
  grunt.registerTask('default', ['rollup', 'uglify']);
};
