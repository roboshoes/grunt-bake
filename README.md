# grunt-bake

> Bake static pages for production while using modular files while in development.


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
This module helps creating static pages while still having the coding comfort of multiple small files. It also helps not to repeat yourself as includes can be used at multiple places.

The module parses the files recursivly, meaning it allows for nested includes. While parsing the includes it also performs a simple find and replace on placeholders. The replacements are supplied in a JSON file but more an [here](#advanced-bake).

When `grunt-bake` parses files it looks for anchors like this: `<!--(bake path/to/file.html)-->`.

Setup the `bake` task like so:


```js
grunt.initConfig( {
	bake: {
		your_target: {
			options: {
				// Task-specific options go here.
			},

			files: {
				// files go here, like so:

				"dist/index.html": "app/index.html",
				"dist/mobile.html": "app/mobile.html"

				// etc ...
			}
		},
	},
} )
```

With a `app/index.html` file like this one:

```html
<html>
	<head></head>
	<body>
		<!--(bake includes/container.html)-->
		<!--(bake includes/footer.html)-->
	</body>
</html>
```

The paths given are relative to the file being parsed.

### Options

#### options.content
Type: `String`
Default value: `null`

A string value that determines the location of the JSON file that is used to fill the place holders.

#### options.section
Type: `String`
Default value: `""`

A string that determines which subsection of the JSON passed as `content` should be used. If no section is passed the entire JSON will be used for templating.

Given a content JSON like such:

```json
{
	"en": {
		"title": "Book",

		"info": {
			"author": "Joe Do",
			"job": "Writer"
		}
	},

	"de": {
		"title": "Buch",

		"info": {
			"author": "Joe Do",
			"job": "Schreiber"
		}
	}
}
```

If `"en"` is passed as section,  `{ "title": "Book", "info": { ... } }` will be passed to the include. If no section is specified the entire JSON will be passed.

This could be used to parse a template like such:

```html
<div>{{title}}</div>
<div>
	<span>{{info.author}}</span>
	<span>{{info.job}}</span>
</div>
```

#### options.process
Type: `Function`
Default value: `null`

A Function which is used to process the template before putting it into the file. If no process given or `null` given the default process is used.

The function gets passed two arguments:
* `String`: representing the template to parse.
* `Object`: the content from the JSON file as object.


### Usage Examples

#### Simple bake
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
_app/base.html_:
```html
<html>
	<body>
		<!--(bake includes/container.html)-->
	</body>
</html>
```

_app/includes/container.html_:
```html
<div id="container"></div>
```

This bake task will create _app/index.html_:
```html
<html>
	<body>
		<div id="container"></div>
	</body>
</html>
```


#### Bake with content
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

_app/content.json_:

```json
{
	"en": {
		"title": "Hello World"
	},

	"de": {
		"title": "Hallo Welt"
	}
}
```

_app/base.html_:
```html
<html>
	<body>
		<!--(bake includes/container.html)-->
	</body>
</html>
```

_app/includes/container.html_:
```html
<div id="container">{{title}}</div>
```

This bake task will create _app/index.html_:
```html
<html>
	<body>
		<div id="container">Hello World</div>
	</body>
</html>
```

#### Inline attributes

In addition to the file the bake anchor tag also allows for inline attributs which will override the content from the JSON file.
_Note: Please note that the parsing of inline attributes requires double quotes in the definition as shown in the example_

Same scenario as above.

_app/base.html_:
```html
<html>
	<body>
		<!--(bake includes/container.html title="Salut Monde" name="Mathias")-->
	</body>
</html>
```

_app/includes/container.html_:
```html
<div id="container">{{title}}</div>
<span>{{name}}</span>
```

This bake task will create _app/index.html_:
```html
<html>
	<body>
		<div id="container">Salut monde</div>
		<span>Mathias</span>
	</body>
</html>
```


#### Costum process
This example shows the use of a costum process funtion.

```js

var processFunction( source, content ) {
	return source + "<br>";
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

### Continues development

For ease of development just add the `bake` task to your watch list. The static page will be baked everytime you change the template.

```javascript
watch: {
	bake: {
		files: [ "app/includes/**" ],
		tasks: "bake:build"
	}
}
```

## Release History
* 2013-04-23      v0.0.7      Support for a wider range of characters in inline arguments
* 2013-03-01      v0.0.3      Adding support for recursive parsing and inline attributes
* 2013-02-27      v0.0.1      Initial Release