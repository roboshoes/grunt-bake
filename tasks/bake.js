/*
 * grunt-bake
 *
 *
 * Copyright (c) 2013 Mathias Paumgarten
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function( grunt ) {

	grunt.registerMultiTask( "bake", "Bake templates into a file.", function() {

		var defaultProcess = function( template, content ) {
			return template.replace( /{{(\w*)}}/g, function( match, key ) {
				return ( key in content ) ? content[ key ] : "";
			} );
		}

		var options = this.options( {
			content: null,
			verbose: false,
			section: null,
			process: defaultProcess
		} );

		var regex = /<!--\([ ]?bake[ ]+([\S]+)[ ]?\)-->/g;

		var checkFile = function( src ) {
			if ( ! grunt.file.exists( src ) ) {
				grunt.log.error( "Source file \"" + src + "\" not fount." );
				return false;
			}

			return true;
		}

		var log = function( message ) {
			if ( options.verbose ) {
				grunt.log.ok( message );
			}
		}

		this.files.forEach( function( file ) {

			var src = file.src[ 0 ];
			var dest = file.dest;
			var directory;

			log( "Processing \"" + src + "\"" );
			checkFile( src );

			var target = grunt.file.read( src );
			var content = options.content ? grunt.file.readJSON( options.content ) : {};

			if ( options.section ) {

				if ( !content[ options.section ] ) {
					grunt.log.error( "content doesn't have section " + options.section );
				}

				content = content[ options.section ];
			}

			target = target.replace( regex, function( match, path ) {

				directory = src.split( "/" );
				directory.pop();

				path = directory.join( "/" ) + "/" + path;

				checkFile( src );
				log( "|-> Parsing \"" + path + "\"" );

				var template = grunt.file.read( path );

				if ( typeof options.process === "function" ) {
					template = options.process( template, content );
				}

				return template;
			} );

			grunt.file.write( dest, target );

			grunt.log.ok( "File \"" + dest + "\" created." );
		} );
	} );

};
