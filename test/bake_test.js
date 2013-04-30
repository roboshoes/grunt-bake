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
	}
};
