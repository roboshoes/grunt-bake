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
			return template.replace( /{{(\w*)}}/g, function( match, key ) {
				return ( key in content ) ? content[ key ] : "";
			} );
		}


		// =============
		// -- OPTIONS --
		// =============

		// Merging the passed otions with the default settingss

		var options = this.options( {
			content: null,
			section: null,
			process: defaultProcess
		} );

		// ===========
		// -- UTILS --
		// ===========

		// Regex to parse bake tags.

		var regex = /<!--\([ ]?bake[ ]+([\S]+)[ ]?\)-->/g;


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

		// =====================
		// -- RECURSIVE PARSE --
		// =====================

		// Recursivly search for includes and create one file.

		var parse = function( fileContent, filePath, values ) {

			return fileContent.replace( regex, function( match, includePath ) {

				var includePath = directory( filePath ) + "/" + includePath;
				var includeContent = grunt.file.read( includePath );

				if ( typeof options.process === "function" ) {
					includeContent = options.process( includeContent, values );
				}

				return parse( includeContent, includePath, values );
			} );
		}


		// ==========
		// -- BAKE --
		// ==========

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
