/*
 * grunt-bake
 *
 * Copyright (c) 2013 Mathias Paumgarten
 * Licensed under the MIT license.
 */

"use strict";

function parseFunction( source ) {
	return source.replace( /\{\{\s?([\.\-\w]*)\s?\}\}/g, function() {
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

		jsonlint: {
			config: {
				src: [ "package.json" ]
			}
		},

		clean: {
			tests: [ "tmp" ],
		},

		nodeunit: {
			tests: [ "test/*_test.js" ],
		},

		watch: {
			jshint: {
				files: [
					"Gruntfile.js",
					"tasks/*.js",
					"<%= nodeunit.tests %>",
				],
				tasks: [ "jshint" ]
			},
			jsonlint: {
				files: [ "package.json" ],
				tasks: [ "jsonlint" ]
			},
			test: {
				files: [
					"tasks/*.js",
					"<%= nodeunit.tests %>",
				],
				tasks: [ "jshint", "test" ]
			}
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

			object_bake: {
				options: {
					content: {
						"title": "A Title",
						"info": {
							"author": "Mike"
						}
					}
				},

				files: {
					"tmp/object_bake.html": "test/fixtures/advanced_bake.html"
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
			},

			foreach_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en"
				},

				files: {
					"tmp/foreach_bake.html": "test/fixtures/foreach_bake.html"
				}
			},

			foreach_inline_bake: {
				options: {
					content: "test/fixtures/content.json",
					section: "en"
				},

				files: {
					"tmp/foreach-inline_bake.html": "test/fixtures/foreach-inline_bake.html"
				}
			},

			no_process_bake: {
				options: {
					process: false
				},

				files: {
					"tmp/no_process_bake.html": "test/fixtures/no_process_bake.html"
				}
			},

			section_bake: {
				options: {
					content: {
						home: {
							title: "Home"
						},
						about: {
							title: "About"
						}
					}
				},

				files: {
					"tmp/section_bake.html": "test/fixtures/section_bake.html"
				}
			},

			render_bake: {
				options: {
					foo: false,
					bar: true
				},

				files: {
					"tmp/render_bake.html": "test/fixtures/render_bake.html"
				}
			}
		}

	} );

	grunt.loadTasks( "tasks" );

	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-clean" );
	grunt.loadNpmTasks( "grunt-contrib-nodeunit" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-jsonlint" );

	grunt.registerTask( "test", [ "clean", "bake", "nodeunit" ] );
	grunt.registerTask( "default", [ "jsonlint", "jshint", "test" ] );

};
