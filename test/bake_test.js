"use strict";

var grunt = require( "grunt" );

exports.bake = {

	defaultBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/index.html" );
		var expected = grunt.file.read( "test/expected/index.html" );

		test.equal( actual, expected, "default bake" );
		test.done();
	},

	advancedBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/advanced-bake.html" );
		var expected = grunt.file.read( "test/expected/advanced-bake.html" );

		test.equal( actual, expected, "advanced bake" );
		test.done();
	},

	customBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/costum-process.html" );
		var expected = grunt.file.read( "test/expected/process.html" );

		test.equal( actual, expected, "costum process" );
		test.done();
	},

	recursiveBake: function( test ) {
		test.expect( 1 );

		var actual = grunt.file.read( "tmp/recursive.html" );
		var expected = grunt.file.read( "test/expected/recursive.html" );

		test.equal( actual, expected, "recursive process" );
		test.done();
	}
};
