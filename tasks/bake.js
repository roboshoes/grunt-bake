/*
 * grunt-bake
 * https://github.com/MathiasPaumgarten/grunt-bake
 *
 * Copyright (c) 2013 Mathias Paumgarten
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function( grunt ) {

	grunt.registerMultiTask( "bake", "Bake templates into a file.", function() {


		// =======================
		// -- DEFAULT PROCESSOR --
		// =======================

		// This process method is used when no process function is supplied.

		var defaultProcess = function( template, content ) {
			return template.replace( /{{([.-\w]*)}}/g, function( match, key ) {
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

		var regex = /<!--\(\s?bake\s+([\w\/.-]+)\s?([^>]*)\)-->/g;


		// Regex to parse attributes.

		var attributesRegex = /([\S_]+)="([^"]+)"/g;


		// Method to check wether file exists and warn if not.

		var checkFile = function( src ) {
			if ( ! grunt.file.exists( src ) ) {
				grunt.log.error( "Source file \"" + src + "\" not fount." );
				return false;
			}

			return true;
		}


		// Returns the directory path from a file path

		var directory = function( path ) {
			var directory = path.split( "/" );

			directory.pop();

			return directory.join( "/" );
		}


		// Parses attribute string.

		var parseInlineOptions = function( string ) {
			var match;
			var values = {};

			while( match = attributesRegex.exec( string ) ) {
				values[ match[ 1 ] ] = match[ 2 ];
			}

			return values;
		}


		// Helper method to resolve nested placeholder names like: "home.footer.text"

		var resolveName = function( name, values ) {
			var names = name.split( "." );
			var current = values;
			var next;

			while ( names.length ) {
				next = names.shift();

				if ( ! current.hasOwnProperty( next ) ) {
					grunt.log.warn( "can't find " + name );
					return "";
				}

				current = current[ next ];
			}

			return current || "";
		}


		// Helper that simply checks weather a value exists and is not `false`

		var hasValue = function( name, values ) {
			var names = name.split( "." );
			var current = values;
			var next;

			while ( names.length ) {
				next = names.shift();

				if ( ! current.hasOwnProperty( next ) ) {
					return false;
				}

				current = current[ next ];
			}

			return current === false ? false : true;
		}


		// =====================
		// -- RECURSIVE PARSE --
		// =====================

		// Recursivly search for includes and create one file.

		var parse = function( fileContent, filePath, values ) {

			if ( typeof options.process === "function" ) {
				fileContent = options.process( fileContent, values );
			}

			return fileContent.replace( regex, function( match, includePath, attributes ) {

				var inlineOptions = parseInlineOptions( attributes );

				if ( "_if" in inlineOptions ) {
					var value = inlineOptions[ "_if" ];

					if ( ! hasValue( value, values ) ) return "";

					delete inlineOptions[ "_if" ];
				}

				grunt.util._.merge( values, inlineOptions );

				if ( includePath.substr( 0, 1 ) === "/" ) {

					includePath = options.basePath + includePath.substr( 1 );

				} else {

					includePath = directory( filePath ) + "/" + includePath;

				}

				var includeContent = grunt.file.read( includePath );

				return parse( includeContent, includePath, values );
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
			var directory;

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
