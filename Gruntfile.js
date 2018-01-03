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

		clean: [ "tmp" ],

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

			advanced_bake_multi: {
				options: {
					content: "test/fixtures/content.json",
					section: "en"
				},

				files: {
					"tmp/advanced_bake_multi_one.html": "test/fixtures/advanced_bake_multi_one.html",
					"tmp/advanced_bake_multi_two.html": "test/fixtures/advanced_bake_multi_two.html"
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

			inline_recursive_bake: {
				options: {
					content: "test/fixtures/content.json"
				},

				files: {
					"tmp/inline_recursive_bake.html": "test/fixtures/inline_recursive_bake.html"
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

			semantic_if: {
				options: {
					semanticIf: true
				},

				files: {
					"tmp/semantic_if.html": "test/fixtures/semantic_if.html"
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

			foreach_meta: {
				options: {
					transforms: {
						visibleBool: function( state ) {
							return state ? "is true" : "is false";
						}
					}
				},
				files: {
					"tmp/foreach_meta.html": "test/fixtures/foreach_meta.html"
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
						},
						books: {
							theDarkTower: {
								author: "Stephen King",
								title: "The Dark Tower"
							}
						},
						shared: {
							title: "Title",
							info: {
								author: "Test Author"
							}
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
			},

			html_include_bake: {
				options: {
					content: {
						foo: "<span>Foo</span>"
					}
				},

				files: {
					"tmp/html_include_bake.html": "test/fixtures/html_include_bake.html"
				}
			},

			function_content_bake: {
				options: {
					content: function() {
						var data = grunt.file.readJSON( "test/fixtures/content.json" );

						data.rooms = data.rooms.map( function( room ) {
							room.volume = room.width * room.depth * room.height;

							return room;
						} );

						return data;
					}
				},

				files: {
					"tmp/function_content_bake.html": "test/fixtures/function_content_bake.html"
				}
			},

			transform_pass_through: {
				options: {
					content: {
						content: "Hallo Welt!"
					},
					transforms: {
						noop: function( string ) {
							return string;
						}
					}
				},

				files: {
					"tmp/transform_pass_through.html": "test/fixtures/transform_pass_through.html"
				}
			},

			transform_single: {
				options: {
					content: {
						content: "Hallo Welt!"
					},
					transforms: {
						upper: function( string ) {
							return String( string ).toUpperCase();
						}
					}
				},

				files: {
					"tmp/transform_single.html": "test/fixtures/transform_single.html"
				}
			},

			transform_params: {
				options: {
					content: {
						content: {
							"string": "Bake",
							"array": [
								"Jim",
								"John",
								"James",
								"Jonathan"
							]
						}
					},
					transforms: {
						repeat: function( string, times ) {
							return new Array( parseInt( times, 10) + 1 ).join( String( string ) );
						},
						replace: function( string, searchvalue, newvalue ) {
							return String( string ).replace( searchvalue, newvalue );
						},
						max: function( array, limit ) {
							return array.slice( 0, limit );
						},
						join: function( array, glue ) {
							return array.join( glue );
						}
					}
				},

				files: {
					"tmp/transform_params.html": "test/fixtures/transform_params.html"
				}
			},

			transform_multiple: {
				options: {
					content: {
						content: "Hallo\nWelt!"
					},
					transforms: {
						nl2br: function( string ) {
							return String( string ).replace( /([\r\n]+)/g, "<br />" );
						},
						upper: function( string ) {
							return String( string ).toUpperCase();
						}
					}
				},

				files: {
					"tmp/transform_multiple.html": "test/fixtures/transform_multiple.html"
				}
			},

			transform_deep: {
				options: {
					content: {
						sub: {
							sub: {
								content: "Hallo Welt!"
							}
						}
					},
					transforms: {
						upper: function( string ) {
							return String( string ).toUpperCase();
						}
					}
				},

				files: {
					"tmp/transform_deep.html": "test/fixtures/transform_deep.html"
				}
			},

			transform_foreach: {
				options: {
					content: "test/fixtures/content.json",
					section: "en",
					transforms: {
						max: function( array, limit ) {
							return ( array || [] ).slice( 0, limit );
						}
					}
				},

				files: {
					"tmp/transform_foreach.html": "test/fixtures/transform_foreach.html"
				}
			},

			keep_undefined_vars: {
				options: {
					content: {
						defined: "Hallo Welt!"
					},
					transforms: {
						upper: function( string ) {
							return String( string ).toUpperCase();
						}
					},
					removeUndefined: false
				},

				files: {
					"tmp/keep_undefined_vars.html": "test/fixtures/keep_undefined_vars.html"
				}
			},

			multiline_bake: {
				files: {
					"tmp/multiline_bake.html": "test/fixtures/multiline_bake.html"
				}
			},

			var_as_array_key: {
				options: {
					content: {
						"pages": {
							"page1": {
								"title": "Page 1"
							},
							"page2": {
								"title": "Page 2"
							},
							"page3": {
								"title": "Page 3"
							},
							"page4": {
								"title": "Page 4"
							},
							"page5": {
								"title": "Page 5"
							}
						}
					}
				},

				files: {
					"tmp/var_as_array_key.html": "test/fixtures/var_as_array_key.html"
				}
			},

			path_with_placeholder: {
				options: {
					content: {
						filename: "include-one"
					}
				},
				files: {
					"tmp/path_with_placeholder.html": "test/fixtures/path_with_placeholder.html"
				}
			},

			recursive_path_with_placeholder: {
				options: {
					content: {
						filename: "include-four.html"
					}
				},
				files: {
					"tmp/recursive_path_with_placeholder.html": "test/fixtures/recursive_path_with_placeholder.html"
				}
			},

			extra_bake: {
				files: {
					"tmp/extra_bake.html": "test/fixtures/extra_bake.html"
				}
			},

			extra_bake_multiple: {
				options: {
					content: "test/fixtures/content.json",
					transforms: {
						lowercase: function( string ) {
							return String( string ).toLowerCase();
						}
					}
				},
				files: {
					"tmp/extra_bake_multiple.html": "test/fixtures/extra_bake_multiple.html"
				}
			},

			assign_bake: {
				files: {
					"tmp/assign_bake.html": "test/fixtures/assign_bake.html"
				}
			},

			inline_no_process: {
				files: {
					"tmp/inline_no_process.html": "test/fixtures/inline_no_process.html"
				}
			},

			default_variables: {
				files: {
					"tmp/default_variables.html": "test/fixtures/default_variables.html"
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

	grunt.registerTask( "test", [ "clean", "setup", "bake", "nodeunit", "teardown" ] );
	grunt.registerTask( "default", [ "jsonlint", "jshint", "test" ] );


	// Stubbing methods for testing purposes. Because we are good little developers
	// we clean up after ourselves.
	var realDateNow;

	grunt.registerTask( "setup", function() {
		realDateNow = Date.now;

		Date.now = function() {
			return 123456789;
		};
	} );

	grunt.registerTask( "teardown", function() {
		Date.now = realDateNow;
	} );
};
