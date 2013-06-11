/*
 * grunt-bake
 *
 *
 * Copyright (c) 2013 Mathias Paumgarten
 * Licensed under the MIT license.
 */

"use strict";

var parseFunction = function( source, object ) {
	return source.replace( /{{([.-\w]*)}}/g, function( match, key ) {
		return "";
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
					"tmp/default_bake.html": "test/fixtures/default_bake.html"
				},
			},

			advanced_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en"
				},

				files: {
					"tmp/advanced_bake.html": "test/fixtures/advanced_bake.html"
				}
			},

			costum_process_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "de",
					process: parseFunction
				},

				files: {
					"tmp/costum_process_bake.html": "test/fixtures/advanced_bake.html"
				}
			},

			recursive_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en",
				},

				files: {
					"tmp/recursive_bake.html": "test/fixtures/recursive_bake.html"
				}
			},

			inline_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en"
				},

				files: {
					"tmp/inline_bake.html": "test/fixtures/inline_bake.html"
				}
			},

			absolute_path_bake: {
				options: {
					basePath: "test/fixtures/includes"
				},

				files: {
					"tmp/absolute_path_bake.html": "test/fixtures/absolute_path_bake.html"
				}
			},

			default_absolute_path_bake: {
				files: {
					"tmp/default_absolute_path_bake.html": "test/fixtures/default_absolute_path_bake.html"
				}
			},

			if_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en"
				},

				files: {
					"tmp/if_bake.html": "test/fixtures/if_bake.html"
				}
			},

			format_bake: {
				files: {
					"tmp/format_bake.html": "test/fixtures/format_bake.html"
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
