"use strict";

var mout = require( "mout" );
var grunt = require( "grunt" );

exports.bake = {

	run: function( test ) {

		var files = {
			"tmp/default_bake.html": "test/expected/default_bake.html",
			"tmp/advanced_bake.html": "test/expected/advanced_bake.html",
			"tmp/advanced_bake_multi_one.html": "test/expected/advanced_bake_multi_one.html",
			"tmp/advanced_bake_multi_two.html": "test/expected/advanced_bake_multi_two.html",
			"tmp/costum_process_bake.html": "test/expected/costum_process_bake.html",
			"tmp/recursive_bake.html": "test/expected/recursive_bake.html",
			"tmp/inline_recursive_bake.html": "test/expected/inline_recursive_bake.html",
			"tmp/inline_bake.html": "test/expected/inline_bake.html",
			"tmp/absolute_path_bake.html": "test/expected/default_bake.html",
			"tmp/default_absolute_path_bake.html": "test/expected/default_bake.html",
			"tmp/if_bake.html": "test/expected/if_bake.html",
			"tmp/semantic_if.html": "test/expected/semantic_if.html",
			"tmp/format_bake.html": "test/expected/format_bake.html",
			"tmp/foreach_bake.html": "test/expected/foreach_bake.html" ,
			"tmp/foreach-inline_bake.html": "test/expected/foreach-inline_bake.html",
			"tmp/no_process_bake.html": "test/expected/no_process_bake.html",
			"tmp/object_bake.html": "test/expected/object_bake.html",
			"tmp/section_bake.html": "test/expected/section_bake.html",
			"tmp/render_bake.html": "test/expected/render_bake.html",
			"tmp/html_include_bake.html": "test/expected/html_include_bake.html",
			"tmp/function_content_bake.html": "test/expected/function_content_bake.html",
			"tmp/transform_pass_through.html": "test/expected/transform_pass_through.html",
			"tmp/transform_single.html": "test/expected/transform_single.html",
			"tmp/transform_params.html": "test/expected/transform_params.html",
			"tmp/transform_multiple.html": "test/expected/transform_multiple.html",
			"tmp/transform_deep.html": "test/expected/transform_deep.html",
			"tmp/transform_foreach.html": "test/expected/transform_foreach.html",
			"tmp/foreach_meta.html": "test/expected/foreach_meta.html",
			"tmp/multiline_bake.html": "test/expected/multiline_bake.html",
			"tmp/var_as_array_key.html": "test/expected/var_as_array_key.html",
			"tmp/keep_undefined_vars.html": "test/expected/keep_undefined_vars.html",
			"tmp/path_with_placeholder.html": "test/expected/path_with_placeholder.html",
			"tmp/recursive_path_with_placeholder.html": "test/expected/recursive_path_with_placeholder.html",
			"tmp/extra_bake.html": "test/expected/extra_bake.html",
			"tmp/extra_bake_multiple.html": "test/expected/extra_bake_multiple.html",
			"tmp/extra-page.html": "test/expected/extra/extra-page.html",
			"tmp/extra-0-a-team.html": "test/expected/extra/extra-0-a-team.html",
			"tmp/extra-1-b-team.html": "test/expected/extra/extra-1-b-team.html",
			"tmp/assign_bake.html": "test/expected/assign_bake.html",
			"tmp/inline_no_process.html": "test/expected/inline_no_process.html",
			"tmp/default_variables.html": "test/expected/default_variables.html"
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
