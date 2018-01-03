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
			variableParsePattern: /\{\{!\s*([^\}]+)\s*\}\}/,
			removeUndefined: true
		} );


		// warning about removed parameter

		if ( options.transformGutter !== undefined ) {
			grunt.log.error( "Parameter `transformGutter` is no longer supported and defaults to `|`. See #71 for details." );
		}

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

		if ( options.section ) {

			if ( ! options.content[ options.section ] ) {
				grunt.log.error( "content doesn't have section " + options.section );
			}

			options.content = options.content[ options.section ];
		}

		// =======================
		// -- DEFAULT PROCESSOR --
		// =======================

		// This process method is used when no process function is supplied.
		function defaultProcess( template, content ) {
			return template.replace( options.parsePattern, function( match, inner ) {
				var processed = processPlaceholder( inner, content );

				if ( processed === undefined ) {
					processed = ( ! options.removeUndefined ? match : "" );
				}

				return processed;
			} );
		}

		if ( ! options.hasOwnProperty( "process" ) ) {
			options.process = defaultProcess;
		}

		function processPlaceholder( placeholder, values ) {
			// extract transforms from placeholder
			var transforms = placeholder.match( transformsRegex ).map( function( str ) {

				// remove whitespace, otherwise transforms and variable key may not be found
				str = mout.string.trim( str );

				// extract name of transform and transform parameters, and clear quotes
				var parts = str.match( paramsRegex ).map( function( str ) {
					return mout.string.trim( str, "'" );
				});

				return {
					name: parts[0],
					params: parts.slice(1)
				};
			});

			// the first value is the set that contains our variable key, and not a transfrom
			var key = transforms.shift().name;
			var resolved = resolveName( key, values );

			return transforms.reduce( applyTransform, resolved );
		}

		function applyTransform( content, transform ) {
			var name = transform.name;

			if( content === undefined ) {
				return;
			}

			// check if transform is registred
			if( ! mout.object.has( options.transforms, name ) ) {
				grunt.log.error( "Unknown transform: " + name );

				return content;
			}

			// check if transform is valid callback
			if( ! mout.lang.isFunction( options.transforms[ name ] ) ) {
				grunt.log.error( "Transform is not a function: " + name );

				return content;
			}

			// apply transform, handler is calles with signature ( variableContent, param1, param2, ..., paramN )
			return options.transforms[ name ].apply( null, [ content ].concat( transform.params ) );
		}

		// ===========
		// -- UTILS --
		// ===========

		// Regex to parse bake tags. Retuns linebreak, indent, type, and signature

		var regex = /(\n?)([ \t]*)<!--\(\s?bake(-start|-end)?([\S\s]*?)\)-->/;

		// Regex to parse attributes.

		var attributesRegex = /([\S_]+)="([^"]+)"/g;

		// Regex to parse transforms including their parameters from placeholders

		var transformsRegex = /(?:'[^']*'|[^\|])+/g;

		// Regex to parse parameters from transforms

		var paramsRegex = /(?:'[^']*'|[^:])+/g;

		// Regex to detect array syntax.

		var arrayRegex = /\[([\w\.\,\-]*)\]/;

		// Regex to detect includePath / attributes in signature

		var signatureRegex = /^((?!_\S+=)[^\s]+)\s?([\S\s]*)$/;

		// Regex to serach for variable names

		var ifRegex = /([a-z_$][0-9a-z_$@\.]*)|(?:"([^"]*)")|(?:'([^']*)')/gi;

		// Regex to evaluate foreach object loops

		var forEachRegex = /([\w]+)\s+as\s+([\w]+)\s*=>\s*([\w]+)/g;

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

		// Returns the filename from a file path

		function filename( path ) {
			return path.split( "/" ).pop();
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
					includePath: match[ 1 ],
					attributes: match[ 2 ],
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

		// Helper method to resolve nested placeholder names like: "home.footer.text"

		function resolveName( name, values ) {
			name = String( name ).replace( /\[([^\]]+)\]/g, function( match, inner ) {
				return "." + resolveName( inner, values );
			});

			return mout.object.get( values, name );
		}


		// Helper method to apply indent

		function applyIndent( indent, content ) {
			if ( ! indent || indent.length < 1 ) {
				return content;
			}

			return content
				.split( "\n" )
				.map( function( line ) {
					// do not indent empty lines
					return line.trim() !== "" ? ( indent + line ) : "";
				} )
				.join( "\n" );
		}


		// Helper to either find values from JSON or inline values

		function getArrayValues( string, values ) {

			string = string.split( " " ).join( "" );

			if ( arrayRegex.test( string ) )
				return string.match( arrayRegex )[ 1 ].split( "," );

			else {
				var array = processPlaceholder( string, values );
				if ( ! mout.lang.isArray( array ) ) array = [];

				return array;
			}

		}

		// Handle _if attributes in inline arguments

		function validateIf( inlineValues, values ) {

			if ( "_if" in inlineValues ) {

				var value = inlineValues[ "_if" ];
				delete inlineValues[ "_if" ];

				var params = {};

				var condition = value.replace( ifRegex, function( match, varname ) {
					if( ! varname ) return match;

					var resolved = resolveName( varname, values );

					// check for semantic falsy values
					if ( options.semanticIf === true ) {
						resolved = [ "no", "off" ].indexOf( resolved ) === -1;

					} else if ( mout.lang.isArray( options.semanticIf ) ) {
						resolved = options.semanticIf.indexOf( resolved ) === -1;

					} else if ( mout.lang.isFunction( options.semanticIf ) ) {
						resolved = options.semanticIf( resolved );
					}

					params[ varname ] = resolved;

					return "params['" + varname + "']";
				});

				try {
					/* jshint evil:true */
					/* eslint-disable no-eval */

					return ! eval( condition );

				} catch( e ) {
					grunt.log.error( "Invalid if condition: '" + value + "'" );
				}
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

				// test for object syntax `object as key => value`
				var match;

				if ( match = forEachRegex.exec( inlineValues[ "_foreach" ] ) ) {

					var object = {
						keyName: match[ 2 ],
						valueName: match[ 3 ],
						values: values[ match[ 1 ] ]
					};

					return object;
				}

				var set = inlineValues[ "_foreach" ].split( ":" );
				delete inlineValues[ "_foreach" ];

				// as transforms may contain colons, join rest of list to recreate original string
				getArrayValues( set.slice( 1 ).join( ":" ), values ).forEach( function( value ) {
					array.push( value );
				} );

				return set[ 0 ];
			}

			return null;
		}

		// Handle _bake attributes in inline arguments

		function validateBake( inlineValues ) {
			if ( "_bake" in inlineValues ) {

				var signature = inlineValues[ "_bake" ];
				delete inlineValues[ "_bake" ];

				var set = signature.split( ">", 2 );

				return {
					src: mout.string.trim( set[0] ),
					dest: mout.string.trim( set[1] )
				};
			}

			return null;
		}

		// Handle _assign attributes in inline arguments

		function validateAssign( inlineValues ) {
			if ( "_assign" in inlineValues ) {

				var value = inlineValues[ "_assign" ];
				delete inlineValues[ "_assign" ];

				return value;
			}

			return null;
		}

		// Handle _process attributes in inline arguments

		function validateProcess( inlineValues ) {
			if ( "_process" in inlineValues ) {

				var value = inlineValues[ "_process" ];
				delete inlineValues[ "_process" ];

				return String(value).toLowerCase() === 'true' ;
			}

			return true;
		}

		function preparePath( includePath, filePath, values ) {

			// replace placeholders within the include path
			includePath = processContent( includePath, values );

			if ( includePath[ 0 ] === "/" )
				return options.basePath + includePath.substr( 1 );
			else return directory( filePath ) + "/" + includePath;
		}

		function processExtraBake( bake, filePath, destFile, values ) {
			if ( bake === null ) return;

			var src = preparePath( bake.src, filePath, values );
			var dest = preparePath( bake.dest, destFile, values );

			// inject variable to link to dynamically processed file
			values[ "@link" ] = processContent( bake.dest, values );

			// compute the depth of the destination path
			var parentDirsCount = bake.dest.split( "/" ).length - 1;

			// create a prefix for building a link to parent folder
			var parentDirsString = new Array( parentDirsCount + 1 ).join( "../" );

			// inject variable to link to file that triggered the dynamic creation, from dynamically processed file
			values[ "@referrer" ] = parentDirsString + filename( destFile );

			bakeFile( src, dest, values );
		}

		function replaceFile( linebreak, indent, includePath, attributes, filePath, destFile, values ) {
			includePath = preparePath( includePath, filePath, values );

			var includeContent = grunt.file.read( includePath );

			return replaceString( includeContent, linebreak, indent, includePath, attributes, filePath, destFile, values );
		}

		function replaceString( includeContent, linebreak, indent, includePath, attributes, filePath, destFile, parentValues ) {
			var values = parentValues;
			var inlineValues = parseInlineValues( attributes );
			var section = validateSection( inlineValues, values );
			var extraBake = validateBake( inlineValues );
			var assign = validateAssign( inlineValues );
			var doProcess = validateProcess( inlineValues );


			if ( section !== null ) {
				values = mout.object.get( parentValues, section );
			}

			// resolve placeholders within inline values so these can be used in subsequent grunt-tags (see #67)
			inlineValues = mout.object.map( inlineValues, function( value ) {
				if ( options.variableParsePattern.test( value ) ) {
					return mout.object.get( parentValues, options.variableParsePattern.exec( value )[ 1 ] );
				} else {
					return processContent( value, parentValues );
				}
			} );

			if ( validateIf( inlineValues, values ) ) return "";
			if ( validateRender( inlineValues ) ) return "";

			var forEachValues = [];
			var forEachName = validateForEach( inlineValues, values, forEachValues );

			values = mout.object.merge( values, inlineValues );

			includeContent = applyIndent( indent, includeContent );

			var content = ""; // result of current bake-section
			var fragment = ""; // repeated bake section for loops
			var total;
			var oldValue;

			if ( ! doProcess ) {
				content = linebreak + includeContent;

			} else if ( mout.lang.isObject( forEachName ) ) {

				total = Object.keys( forEachName.values ).length;

				for ( var key in forEachName.values ) {
					values[ forEachName.keyName ] = key;
					values[ forEachName.valueName ] = forEachName.values[ key ];

					processExtraBake( extraBake, filePath, destFile, values );

					fragment += linebreak + processContent( parse( includeContent, includePath, destFile, values ), values );

					delete values[ forEachName.keyName ];
					delete values[ forEachName.valueName ];
				}

				content = fragment;

			} else if ( forEachName && forEachValues.length > 0 ) {

				oldValue = values[ forEachName ];
				total = forEachValues.length;


				forEachValues.forEach( function( value, index ) {
					values[ forEachName ] = value;

					// assign meta vars with information about current iteration
					values[ forEachName + "@index" ] = index;
					values[ forEachName + "@iteration" ] = index + 1;
					values[ forEachName + "@first" ] = ( index === 0 );
					values[ forEachName + "@last" ] = ( ( total - 1 ) === index );
					values[ forEachName + "@total" ] = total;

					processExtraBake( extraBake, filePath, destFile, values );

					fragment += linebreak + processContent( parse( includeContent, includePath, destFile, values ), values );
				} );

				if ( oldValue === undefined ) values[ forEachName ] = oldValue;
				else delete values[ forEachName ];

				content = fragment;

			} else if ( ! forEachName ) {

				processExtraBake( extraBake, filePath, destFile, values );

				content = linebreak + parse( includeContent, includePath, destFile, values );

			} else {

				content = "";
			}

			if ( assign !== null ) {
				parentValues[ assign ] = mout.string.ltrim( content );

				content = "";
			}

			return content;
		}

		// =====================
		// -- RECURSIVE PARSE --
		// =====================

		// extract bake sections.
		// For inline-bake it searches for matching closing tags and returns inline content and other information

		function extractSection( content ) {
			var depth = 0;			// tracks how difference between found opening and closing tags
			var start = 0;			// character position in `content` where inner-content starts
			var position = 0;		// current character position within _original_ content
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

				depth += ( result[ 3 ] === "-start" );
				depth -= ( result[ 3 ] === "-end" );

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

		function parse( fileContent, filePath, destFile, values ) {

			var section = extractSection( fileContent );

			if( section ) {
				fileContent = processContent( section.before, values );

				if( section.inner ) {
					fileContent += replaceString( section.inner, "", "", filePath, section.attributes, filePath, destFile, values );

				} else if( section.includePath ) {
					fileContent += replaceFile( section.linebreak, section.indent, section.includePath, section.attributes, filePath, destFile, values );
				}

				fileContent += parse( section.after, filePath, destFile, values );

			} else {
				return processContent( fileContent, values );
			}

			return fileContent;
		}

		// Run process function if processor-function is defined

		function processContent( content, values ) {
			return mout.lang.isFunction( options.process ) ? options.process( content, values ) : content;
		}

		// ==========
		// -- BAKE --
		// ==========

		function bakeFile( src, dest, content ) {

			var srcContent = grunt.file.read( src );
			var destContent = parse( srcContent, src, dest, content );

			grunt.file.write( dest, destContent );
			grunt.log.ok( "File \"" + dest + "\" created." );
		}

		// Loop over files and create baked files.

		this.files.forEach( function( file ) {

			var src = file.src[ 0 ];
			var dest = file.dest;

			if ( ! checkFile( src ) ) return;

			var content = mout.object.merge( options.content, {
				__bake: {
					filename: src,
					srcFilename: src,
					destFilename: dest,
					timestamp: Date.now()
				}
			} );

			bakeFile( src, dest, content );
		} );
	} );
};
