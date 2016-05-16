module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch:{
      scripts: [ {
        files: ['src/**/*.coffee'],
        tasks: ["coffee", "concat"],
        options: {
          spawn: true
        }
      }, {
        files: ['src/**/*.js'],
        tasks: ['babel', 'concat'],
        options: {
          spawn: true
        }
      } ],
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          './www/babel.js': 'src/js/*.js'
        }
      }
    },
    coffee: {
      compileBare:{
        options:{
          bare: true
        },
        files: {
          "./www/coffeescript.js" : "./src/js/*.coffee"
        }
      }
    },
    concat:{
      options:{
        separator: ';'
      },
      dist:{
        src:["./www/babel.js", "./www/coffeescript.js", "./src/js/lib/OT-common-js-helpers.js"],
        dest:"./www/opentok.js"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'www/opentok.js',
        dest: 'www/opentok.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');

  // Default task(s).
  grunt.registerTask('default', ["coffee", "babel", "concat"]);
};
