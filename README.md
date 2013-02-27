# grunt-bake

> Bake external includes into the file to create static pages with no compilation time

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-bake --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks( "grunt-bake" );
```

## The "bake" task

### Overview
In your project's Gruntfile, add a section named `bake` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig( {
	bake: {
		your_target: {
			options: {
				// Task-specific options go here.
			},

			files: {
				// files go here, like so:

				"dist/file.html": "app/file.html",
				"dist/mobile.html": "app/mobile.html"

				// etc ...
			}
		},
	},
} )
```

The file to be parsed includes placeholders in this form:

```html
<html>
	<head></head>
	<body>
		<!--(bake includes/file.html)-->
		<!--(bake includes/mobile.html)-->
	</body>
</html>
```

The paths given are relative to the file being parsed.

### Options

#### options.content
Type: `String`
Default value: `null`

A string value that determines the location of the JSON file used to parse the includes with.

#### options.verbose
Type: `Boolean`
Default value: `false`

A string value that determines weather the grunt-bake should give extra console output. This can be used to track and debug which files have been created.

#### options.section
Type: `String`
Default value: `""`

A string that determines which subsection of the JSON passed as `content` should be used. If no section is passed the entire JSON will be used for templating.

Given a content JSON like such:

```json
{
	"en": {
		"title": "Book"
	},

	"de": {
		"title": "Buch"
	}
}
```

If `"en"` is passed as section, only `{ "title": "Book" }` will be passed to the include. If no section is specified the entire JSON will be passed.

This could be used to parse a template like such:

```html
<div>{{title}}</div>
```

#### options.process
Type: `Function`
Default value: `null`

A Function which is used to process the template before putting it into the file. If no process given or `null` given the default process is used.

The function gets passed to arguments:
* template: `String`: representing the template to parse.
* content: `Object`: the section of the content file.

The default process parses the include looking for `{{title}}` and replaces the content with the value passed in the JSON.
If no match is found, it simply removes the placeholder.


### Usage Examples

#### Default Options
This example shows a simple baking process with all default options.

```js
grunt.initConfig( {
	bake: {
		build: {
			files: {
				"app/index.html": "app/base.html"
			}
		}
	}
} )
```

#### Advanced bake
This example shows how to use the bake process to parse the templates with a provided JSON and a section.

```js
grunt.initConfig( {
	bake: {
		build: {
			options: {
				content: "app/content.json",
				section: "en"
			}

			files: {
				"app/index.html": "app/base.html"
			}
		}
	}
} )
```

As an example for the `content.json`:

```javascript
{
	"en": {
		"title": "Hello World"
	},

	"de": {
		"title": "Hallo Welt"
	}
}
```

#### Costum process
This example shows the use of a costum process funtion.

```js

var processFunction( source, content ) {
	return ...
}

grunt.initConfig( {
	bake: {
		build: {
			options: {
				content: "app/content.json",
				section: "en",
				process: processFunction
			}

			files: {
				"app/index.html": "app/base.html"
			}
		}
	}
} )
```

### Continues Development

For ease of development just add the `bake` task to your watch list. The static page will be baked everytime you change the template.

```javascript
watch: {
	files: [ "app/includes/**" ],
	tasks: "bake:build"
}
```

## Release History
* 2013-02-27      v0.0.1      Initial Release