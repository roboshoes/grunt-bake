"use strict";

var grunt = require( "grunt" );

exports.bake = {

	defaultBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/default_bake.html" );
		var expected = grunt.file.read( "test/expected/default_bake.html" );

		test.equal( actual, expected, "default bake" );
		test.done();
	},

	advancedBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/advanced_bake.html" );
		var expected = grunt.file.read( "test/expected/advanced_bake.html" );

		test.equal( actual, expected, "advanced bake" );
		test.done();
	},

	customBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/costum_process_bake.html" );
		var expected = grunt.file.read( "test/expected/costum_process_bake.html" );

		test.equal( actual, expected, "costum bake" );
		test.done();
	},

	recursiveBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/recursive_bake.html" );
		var expected = grunt.file.read( "test/expected/recursive_bake.html" );

		test.equal( actual, expected, "recursive bake" );
		test.done();
	},

	inlineBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/inline_bake.html" );
		var expected = grunt.file.read( "test/expected/inline_bake.html" );

		test.equal( actual, expected, "inline bake" );
		test.done();
	},

	absolutePathBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/absolute_path_bake.html" );
		var expected = grunt.file.read( "test/expected/default_bake.html" );

		test.equal( actual, expected, "absolute path bake" );
		test.done();
	},

	defaultAbsolutePathBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/default_absolute_path_bake.html" );
		var expected = grunt.file.read( "test/expected/default_bake.html" );

		test.equal( actual, expected, "default absolute path bake" );
		test.done();
	},

	ifBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/if_bake.html" );
		var expected = grunt.file.read( "test/expected/if_bake.html" );

		test.equal( actual, expected, "if bake" );
		test.done();
	},

	formatBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/format_bake.html" );
		var expected = grunt.file.read( "test/expected/format_bake.html" );

		test.equal( actual, expected, "format bake" );
		test.done();
	},

	foreachBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/foreach_bake.html" );
		var expected = grunt.file.read( "test/expected/foreach_bake.html" );

		test.equal( actual, expected, "foreach bake" );
		test.done();
	}
};
