/*
 * grunt-bake
 *
 *
 * Copyright (c) 2013 Mathias Paumgarten
 * Licensed under the MIT license.
 */

"use strict";

var parseFunction = function( source, object ) {
	return source.replace( /{{(\w*)}}/g, function( match, key ) {
		return ( key in object ) ? object[ key ].toUpperCase() : "";
	} );
}

module.exports = function(grunt) {

	grunt.initConfig( {
		jshint: {
			all: [
				"Gruntfile.js",
				"tasks/*.js",
				"<%= nodeunit.tests %>",
			],
			options: {
				jshintrc: ".jshintrc",
			},
		},

		clean: {
			tests: [ "tmp" ],
		},

		bake: {
			default_bake: {
				files: {
					"tmp/index.html": "test/fixtures/index.html"
				},
			},

			advanced_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en",
					verbose: false
				},

				files: {
					"tmp/advanced-bake.html": "test/fixtures/language.html"
				}
			},

			costum_process: {
				options: {
					content: "test/fixtures/content.json",
					section: "de",
					process: parseFunction
				},

				files: {
					"tmp/costum-process.html": "test/fixtures/language.html"
				}
			},

			recursive_process: {
				options: {
					content: "test/fixtures/content.json",
					section: "en",
				},

				files: {
					"tmp/recursive.html": "test/fixtures/recursive.html"
				}
			}
		},

		nodeunit: {
			tests: [ "test/*_test.js" ],
		},

	} );

	grunt.loadTasks( "tasks" );

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");

	grunt.registerTask( "test", [ "clean", "bake", "nodeunit" ] );
	grunt.registerTask( "default", [ "jshint", "test" ] );

};
