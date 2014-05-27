"use strict";

var mout = require( "mout" );
var grunt = require( "grunt" );

exports.bake = {

	run: function( test ) {

		var files = {
			"tmp/default_bake.html": "test/expected/default_bake.html",
			"tmp/advanced_bake.html": "test/expected/advanced_bake.html",
			"tmp/costum_process_bake.html": "test/expected/costum_process_bake.html",
			"tmp/recursive_bake.html": "test/expected/recursive_bake.html",
			"tmp/inline_bake.html": "test/expected/inline_bake.html",
			"tmp/absolute_path_bake.html": "test/expected/default_bake.html",
			"tmp/default_absolute_path_bake.html": "test/expected/default_bake.html",
			"tmp/if_bake.html": "test/expected/if_bake.html",
			"tmp/format_bake.html": "test/expected/format_bake.html",
			"tmp/foreach_bake.html": "test/expected/foreach_bake.html" ,
			"tmp/foreach-inline_bake.html": "test/expected/foreach-inline_bake.html",
			"tmp/no_process_bake.html": "test/expected/no_process_bake.html",
			"tmp/object_bake.html": "test/expected/object_bake.html",
			"tmp/section_bake.html": "test/expected/section_bake.html",
			"tmp/render_bake.html": "test/expected/render_bake.html"
		};

		test.expect( mout.object.size( files ) );

		mout.object.forOwn( files, function( value, key ) {
			var name = key.split( "/" )[ 1 ];
			var actual = grunt.file.read( key );
			var expected = grunt.file.read( value );

			test.equal( actual, expected, name );
		} );

		test.done();
	}
};
