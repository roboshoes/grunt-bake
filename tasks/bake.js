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

		// =============
		// -- OPTIONS --
		// =============

		// Merging the passed options with the default settingss

		var options = this.options( {
			content: null,
			section: null,
			semanticIf: false,
			basePath: "",
			transforms: {},
			parsePattern: /\{\{\s*([^\}]+)\s*\}\}/g,
			transformGutter: "|"
		} );


		// normalize basePath

		if ( options.basePath.substr( -1 , 1 ) !== "/" && options.basePath.length > 0 ) {
			options.basePath = options.basePath + "/";
		}


		// normalize content

		if ( mout.lang.isString( options.content ) ) {
			options.content = grunt.file.readJSON( options.content );
		} else if ( mout.lang.isFunction( options.content ) ) {
			options.content = options.content();
		} else {
			options.content = options.content ? options.content : {};
		}


		// =======================
		// -- DEFAULT PROCESSOR --
		// =======================

		// This process method is used when no process function is supplied.
		function defaultProcess( template, content ) {
			return template.replace( options.parsePattern, function( match, inner ) {

				// remove whitespace
				var transforms = inner.split( options.transformGutter ).map( function( str ) {
					return mout.string.trim( str );
				});

				// the first value is our variable key and not a transfrom
				var key = transforms.shift();
				var resolved = resolveName( key, content );

				return transforms.reduce( applyTransform, resolved );
			} );
		}

		if ( ! options.hasOwnProperty( "process" ) ) {
			options.process = defaultProcess;
		}

		function applyTransform( content, transform ) {
			// check if transform is registred
			if( ! mout.object.has( options.transforms, transform ) ) {
				grunt.log.error( "Unknown transform: " + transform );

				return content;
			}

			// check if transform is valid callback
			if( ! mout.lang.isFunction( options.transforms[transform] ) ) {
				grunt.log.error( "Transform is not a function: " + transform );

				return content;
			}

			// apply transform
			return options.transforms[transform].call( null, content );
		}

		// ===========
		// -- UTILS --
		// ===========

		// Regex to parse bake tags. Retuns linebreak, indent, type, and signature

		var regex = /(\n?)([ |\t]*)<!--\(\s?bake(-start|-end)?([^]*?)\)-->/;

		// Regex to parse attributes.

		var attributesRegex = /([\S_]+)="([^"]+)"/g;


		// Regex to detect array syntax.

		var arrayRegex = /\[([\w\.\,\-]*)\]/;

		// Regex to detect includePath / attributes in signature

		var signatureRegex = /^((?!_\S+=)[^\s]+)\s?([\S\s]*)$/;

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

		function parseInlineValues( string ) {
			var match;
			var values = {};

			while( match = attributesRegex.exec( string ) ) {
				values[ match[ 1 ] ] = match[ 2 ];
			}

			return values;
		}

		// Parses a bake call signature (extract filepath and arguments)

		function parseSignature( signature ) {
			var match;
			var result;

			// trim whitespace from signature otherwise reqular expression test may fail
			signature = signature.trim();

			if( match = signatureRegex.exec( signature ) ) {
				result = {
					includePath: match[1],
					attributes: match[2],
					signature: signature
				};

			} else {
				result = {
					includePath: "",
					attributes: signature,
					signature: signature
				};
			}

			return result;
		}

		// Helper method to check if a value represents false

		function isFalse( value ) {
			var string = String( value ).toLowerCase();

			if ( value === "" || value === undefined || value === false || string === "false" ) {
				return true;
			}

			if ( options.semanticIf === true ) {
				return mout.array.indexOf( [ "no", "off" ], string ) !== -1;
			}

			if ( mout.lang.isArray( options.semanticIf ) ) {
				return mout.array.indexOf( options.semanticIf, string ) !== -1;
			}

			if ( mout.lang.isFunction( options.semanticIf ) ) {
				return options.semanticIf( value );
			}

			return false;
		}

		// Helper method to resolve nested placeholder names like: "home.footer.text"

		function resolveName( name, values ) {
			return mout.object.get( values, name ) || "";
		}


		// Helper that simply checks weather a value exists and is not `false`

		function hasValue( name, values ) {

			name = name.replace( / /g, "" );

			var invert = false;

			if ( name[ 0 ] === "!" ) {
				name = name.substr( 1 );
				invert = true;
			}

			var current = mout.object.get( values, name );
			var returnValue = !isFalse( current );

			return invert ? ! returnValue : returnValue;
		}


		// Helper method to apply indent

		function applyIndent( indent, content ) {
			if ( ! indent || indent.length < 1 ) {
				return content;
			}

			return content
				.split( "\n" )
				.map( function( line ) {
					return indent + line;
				} )
				.join( "\n" );
		}


		// Helper to either find values from JSON or inline values

		function getArrayValues( string, values ) {

			string = string.split( " " ).join( "" );

			if ( arrayRegex.test( string ) )
				return string.match( arrayRegex )[ 1 ].split( "," );

			else {
				var array = resolveName( string, values );
				if ( array === "" ) array = [];

				return array;
			}

		}


		// Handle _if attributes in inline arguments

		function validateIf( inlineValues, values ) {

			if ( "_if" in inlineValues ) {

				var value = inlineValues[ "_if" ];
				delete inlineValues[ "_if" ];

				var operator = getOperator( value );

				if ( operator ) {
					var parts = value.split( operator );

					var left = mout.string.rtrim( parts[ 0 ] );
					var right = mout.string.ltrim( parts[ 1 ] ).replace( /'/g, "" );

					if( mout.object.has( values, left ) ) left = resolveName( left, values );
					if( mout.object.has( values, right ) ) right = resolveName( right, values );

					if ( operator === "==" && left === right ) return false;
					else if ( operator === "!=" && left !== right ) return false;

					return true;
				}

				if ( ! hasValue( value, values ) ) {

					return true;

				} else if ( value[ 0 ] === "!" ) {

					var name = value.substr( 1 );

					return ! isFalse( resolveName( name, values ) );

				} else if ( isFalse( resolveName( value, values ) ) ) {

					return true;

				}

			}

			return false;
		}

		function getOperator( string ) {
			var operators = [ "==", "!=" ];

			for ( var i = 0; i < operators.length; i++ ) {
				if ( string.indexOf( operators[ i ] ) > -1 ) return operators[ i ];
			}

			return false;
		}

		// Handle _render attributes in inline arguments

		function validateRender( inlineValues ) {
			if ( "_render" in inlineValues ) {

				var skipValue = inlineValues[ "_render" ];

				if ( skipValue in options ) {
					return ! options[ skipValue ];
				}
			}

			return false;
		}


		// Handle _section attributes in inline arguments

		function validateSection( inlineValues ) {
			if ( "_section" in inlineValues ) {

				var value = inlineValues[ "_section" ];
				delete inlineValues[ "_section" ];

				return value;
			}

			return null;
		}


		// Handle _foreach attributes in inline arguments

		function validateForEach( inlineValues, values, array ) {

			if ( "_foreach" in inlineValues ) {

				var pair = inlineValues[ "_foreach" ].split( ":" );
				delete inlineValues[ "_foreach" ];

				getArrayValues( pair[ 1 ], values ).forEach( function( value ) {
					array.push( value );
				} );

				return pair[ 0 ];
			}

			return null;
		}

		function preparePath( includePath, filePath ) {
			if ( includePath[ 0 ] === "/" )
				return options.basePath + includePath.substr( 1 );
			else return directory( filePath ) + "/" + includePath;
		}

		function replaceFile( linebreak, indent, includePath, attributes, filePath, values ) {
			includePath = preparePath( includePath, filePath );

			var includeContent = grunt.file.read( includePath );

			return replaceString( includeContent, linebreak, indent, includePath, attributes, values );
		}

		function replaceString( includeContent, linebreak, indent, includePath, attributes, values ) {
			var inlineValues = parseInlineValues( attributes );
			var section = validateSection( inlineValues, values );

			if ( section !== null ) {
				values = values[ section ];
			}

			if ( validateIf( inlineValues, values ) ) return "";
			if ( validateRender( inlineValues ) ) return "";

			var forEachValues = [];
			var forEachName = validateForEach( inlineValues, values, forEachValues );

			values = mout.object.merge( values, inlineValues );

			includeContent = applyIndent( indent, includeContent);

			if ( forEachValues.length > 0 ) {

				var fragment = "";
				var oldValue = values[ forEachName ];
				var total = forEachValues.length;

				forEachValues.forEach( function( value, index ) {
					values[ forEachName ] = value;

					// assign meta vars with information about current iteration
					values[ forEachName + "@index" ] = String( index );
					values[ forEachName + "@iteration" ] = String( index + 1 );
					values[ forEachName + "@first" ] = ( index === 0 );
					values[ forEachName + "@last" ] = ( ( total - 1 ) === index );
					values[ forEachName + "@total" ] = String( total );

					fragment += linebreak + parse( includeContent, includePath, values );
				} );

				if ( oldValue === undefined ) values[ forEachName ] = oldValue;
				else delete values[ forEachName ];

				return fragment;

			} else {

				return linebreak + parse( includeContent, includePath, values );

			}
		}


		// =====================
		// -- RECURSIVE PARSE --
		// =====================

		// extract bake sections.
		// For inline-bake it searches for matching closing tags and returns inline content and other information

		function extractSection( content ) {
			var depth = 0;			// tracks how difference between found opening and closing tags
			var start = 0;			// character position in `content` where inner-content starts
			var position = 0;			// current character position within _original_ content
			var length = 0;			// length section (= spacing plus bake-tag) we currently evaluate
			var remain = content;	// content left for further extraction
			var section = {};

			do {

				var result = remain.match( regex );

				if( ! result ) break;

				length = result[ 0 ].length;
				position += result.index;

				if( depth === 0 ) {

					start = position + length;

					section = mout.object.merge( section, parseSignature( result[ 4 ] ), {
						before: content.slice( 0, position ),
						linebreak: result[ 1 ],
						indent: result[ 2 ]
					} );
				}

				remain = remain.slice( result.index + length );

				depth += (result[ 3 ] === "-start");
				depth -= (result[ 3 ] === "-end");

				if( depth === 0 ) {
					return mout.object.merge( section, {
						inner: content.slice( start, position ),
						after: content.slice( position + length )
					} );
				}

				position += length;

			} while( true );

			return null;
		}


		// Recursivly search for bake-tags and create one file.

		function parse( fileContent, filePath, values ) {

			var section = extractSection( fileContent );

			if( section ) {
				fileContent = section.before;

				if(section.inner) {
					fileContent += replaceString( section.inner, "", "", filePath, section.attributes, values );
				} else {
					fileContent += replaceFile( section.linebreak, section.indent, section.includePath, section.attributes, filePath, values );
				}

				fileContent += parse( section.after, filePath, values );
			}

			return mout.lang.isFunction( options.process ) ? options.process( fileContent, values ) : fileContent;
		}


		// ==========
		// -- BAKE --
		// ==========

		// Loop over files and create baked files.

		this.files.forEach( function( file ) {

			var src = file.src[ 0 ];
			var dest = file.dest;

			if ( ! checkFile( src ) ) return;

			if ( options.section ) {

				if ( ! options.content[ options.section ] ) {
					grunt.log.error( "content doesn't have section " + options.section );
				}

				options.content = options.content[ options.section ];
			}

			var srcContent = grunt.file.read( src );
			var destContent = parse( srcContent, src, options.content );

			grunt.file.write( dest, destContent );
			grunt.log.ok( "File \"" + dest + "\" created." );

		} );
	} );
};
