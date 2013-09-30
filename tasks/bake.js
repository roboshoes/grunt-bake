/*
 * grunt-bake
 * https://github.com/MathiasPaumgarten/grunt-bake
 *
 * Copyright (c) 2013 Mathias Paumgarten
 * Licensed under the MIT license.
 */

"use strict";

var mout = require( "mout" );

module.exports = function( grunt ) {

	grunt.registerMultiTask( "bake", "Bake templates into a file.", function() {


		// =======================
		// -- DEFAULT PROCESSOR --
		// =======================

		// This process method is used when no process function is supplied.

		function defaultProcess( template, content ) {
			return template.replace( /\{\{([.\-\w]*)\}\}/g, function( match, key ) {
				return resolveName( key, content );
			} );
		}


		// =============
		// -- OPTIONS --
		// =============

		// Merging the passed otions with the default settingss

		var options = this.options( {
			content: null,
			section: null,
			basePath: "",
			process: defaultProcess
		} );

		// ===========
		// -- UTILS --
		// ===========

		// Regex to parse bake tags. The regex returns file path as match.

		var regex = /([ |\t]*)<!\-\-\(\s?bake\s+([\w\/.\-]+)\s?([^>]*)\)\-\->/g;


		// Regex to parse attributes.

		var attributesRegex = /([\S_]+)="([^"]+)"/g;


		// Regex to detect array syntax.

		var arrayRegex = /\[([\w\.\,\-]*)\]/;


		// Method to check wether file exists and warn if not.

		function checkFile( src ) {
			if ( ! grunt.file.exists( src ) ) {
				grunt.log.error( "Source file \"" + src + "\" not fount." );
				return false;
			}

			return true;
		}


		// Returns the directory path from a file path

		function directory( path ) {
			var segments = path.split( "/" );

			segments.pop();

			return segments.join( "/" );
		}


		// Parses attribute string.

		function parseInlineOptions( string ) {
			var match;
			var values = {};

			while( match = attributesRegex.exec( string ) ) {
				values[ match[ 1 ] ] = match[ 2 ];
			}

			return values;
		}


		// Helper method to resolve nested placeholder names like: "home.footer.text"

		function resolveName( name, values ) {
			return mout.object.get( values, name ) || "";
		}


		// Helper that simply checks weather a value exists and is not `false`

		function hasValue( name, values ) {
			var current = mout.object.get( values, name );
			return current === false || current === undefined ? false : true;
		}


		// Helper method to apply indent

		function applyIndent( indent, content ) {
			if ( ! indent || indent.length < 1 ) {
				return content;
			}

			var lines = content.split( "\n" );

			var prepedLines = lines.map( function( line ) {
				return indent + line;
			} );

			return prepedLines.join( "\n" );
		}


		// Helper to either find values from JSON or inline values

		function getArrayValues( string, values ) {

			string = string.split( " " ).join( "" );

			if ( arrayRegex.test( string ) ) {
				return string.match( arrayRegex )[ 1 ].split( "," );
			} else {
				return resolveName( string, values );
			}

		}


		// =====================
		// -- RECURSIVE PARSE --
		// =====================

		// Recursivly search for includes and create one file.

		function parse( fileContent, filePath, values ) {

			if ( typeof options.process === "function" ) {
				fileContent = options.process( fileContent, values );
			}

			return fileContent.replace( regex, function( match, indent, includePath, attributes ) {

				var inlineOptions = parseInlineOptions( attributes );
				var array = [];
				var name = "";

				if ( "_if" in inlineOptions ) {
					var value = inlineOptions[ "_if" ];

					if ( ! hasValue( value, values ) ) {
						return "";
					}

					delete inlineOptions[ "_if" ];

				}

				if ( "_foreach" in inlineOptions ) {
					var pair = inlineOptions[ "_foreach" ].split( ":" );

					name = pair[ 0 ];
					array = getArrayValues( pair[ 1 ], values );

					delete inlineOptions[ "_foreach" ];
				}

				grunt.util._.merge( values, inlineOptions );

				if ( includePath[ 0 ] === "/" ) {
					includePath = options.basePath + includePath.substr( 1 );
				} else {
					includePath = directory( filePath ) + "/" + includePath;
				}

				var includeContent = grunt.file.read( includePath );
				includeContent = applyIndent( indent, includeContent );

				if ( array.length > 0 ) {

					var fragment = "";
					var newline = "";
					var oldValue = values[ name ];

					array.forEach( function( value, index ) {
						values[ name ] = value;
						newline = index > 0 ? "\n" : "";

						fragment += newline + parse( includeContent, includePath, values );
					} );

					if ( oldValue ) {
						values[ name ] = oldValue;
					} else {
						delete values[ name ];
					}

					return fragment;

				} else {

					return parse( includeContent, includePath, values );

				}

			} );
		}


		// ==========
		// -- BAKE --
		// ==========

		// normalize options

		var basePath = options.basePath;

		if ( basePath.substr( -1 , 1 ) !== "/" && basePath.length > 0 ) {

			options.basePath = basePath + "/";

		}

		// Loop over files and create baked files.

		this.files.forEach( function( file ) {

			var src = file.src[ 0 ];
			var dest = file.dest;

			checkFile( src );

			var values = options.content ? grunt.file.readJSON( options.content ) : {};

			if ( options.section ) {

				if ( !values[ options.section ] ) {
					grunt.log.error( "content doesn't have section " + options.section );
				}

				values = values[ options.section ];
			}

			var srcContent = grunt.file.read( src );
			var destContent = parse( srcContent, src, values );

			grunt.file.write( dest, destContent );
			grunt.log.ok( "File \"" + dest + "\" created." );

		} );
	} );
};
