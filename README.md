# grunt-bake [![Build Status](https://travis-ci.org/MathiasPaumgarten/grunt-bake.png?branch=master)](https://travis-ci.org/MathiasPaumgarten/grunt-bake)

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

The module parses the files recursivly, meaning it allows for nested includes. While parsing the includes it also performs a simple find and replace on placeholders. The replacements are supplied in a JSON file but more an [here](#bake-with-content).

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
Type: `String` or `Object`
Default value: `null`

A string value that determines the location of the JSON file that is used to fill the place holders. If a `Object` is specified it will be used as content.

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

#### options.parsePattern
Type: `Regex`
Default value: `/\{\{\s?([\.\-\w]*)\s?\}\}/g`

Determines the regex to parse the files in order to insert the content from the JSON file. The default pattern allows place holders such as: `{{value}}`.

#### options.process
Type: `Function`
Default value: default process procedure

A Function which is used to process the template before putting it into the file. If `process` is defined as `null` or `false` the includes won't be processed at all.
The default process uses two curly braces as marker, such as `{{json.value.name}}`. However the parse regex is costumizable using `options.parsePattern`.

The function gets passed two arguments:
* `String`: representing the template to parse.
* `Object`: the content from the JSON file as object.


#### options.basePath
Type: `String`
Default value: ""

Determines the base directory for includes that are specified with an absolute path. All paths starting with an `/` are absolute while other paths starting with folder or file names are relative to the include being parsed.

`<!--(bake includes/footer.html)-->` relative to the file

`<!--(bake /includes/footer.html)-->` relative to the basePath (level of Gruntfile by default)



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


#### IF Statement

The __bake__ task also allows a simple `if` conditional. Inline attributes named `_if` are treated as such. If the value that `_if` holds can't be found in the content.json or if found equals to the value `false` the include will be ignored. The `_if` can also be used inverted to create a `_else` effect in a way. A definition as `_if="!name"` would mean the template will be rendered when `name` cannot be found or is `false`.

_app/base.html_:
```html
<html>
	<body>
		<!--(bake includes/container.html _if="name")-->
	</body>
</html>
```

_app/content.json_:

```json
{
	"foo": "bar"
}
```

This bake task will create _app/index.html_:
```html
<html>
	<body>

	</body>
</html>
```

Additionally the `_if` statement also works with inlining the bake content.

```html
<html>
	<body>
		<!--(bake-start _if="name")-->
		<h1>{{name}}</h1>
		<!--(bake-end)-->
	</body>
</html>
```

#### Foreach Loop

Another special inline attribute is the `_foreach` attribute. This keyword expects a specific syntax and can be used both inline as well as pulling
content from the json. This allows to loop over a set of values and using that value in the partial.
It accepts an inline syntax: `_foreach="name:[mike, drew, steve]"` as well as a reference to an array in the json: `_foreach="name:authors.names"`. The values from the array can then be used with the key `name`. This key can be chosen arbitrarily.

_app/base.html_:
```html
<html>
	<body>
		<ul class="first">
			<!--(bake includes/li.html _foreach="name:[mike, drew, steve]")-->
		</ul>

		<ul class="second">
			<!--(bake includes/li.html _foreach="name:authors.names")-->
		</ul>
	</body>
</html>
```

_app/includes/li.html_:
```html
<li>{{name}}</li>
```

_app/content.json_:
```json
{
	"authors": {
		"names": [ "jenna", "carla", "susy" ]
	}
}
```

This bake task will create _app/index.html_:
```html
<html>
	<body>
		<ul class="first">
			<li>mike</li>
			<li>drew</li>
			<li>steve</li>
		</ul>

		<ul class="second">
			<li>jenna</li>
			<li>carla</li>
			<li>susy</li>
		</ul>
	</body>
</html>
```

Just like the `_if` statement the `_foreach` also works with inlined content:

```html
<html>
	<body>
		<ul>
		<!--(bake-start _foreach="name:[robert, susan, carl]")-->
			<li>{{name}}</li>
		<!--(bake-end)-->
		</ul>
	</body>
</html>
```


#### Inline Section statement

The `_section` attribute, when used inline, allows to use a specific subcontent of the values.

_app/base.html_:
```html
<html>
	<body>
		<!--(bake includes/file.html _section="home")-->
		<!--(bake includes/file.html _section="about")-->
	</body>
</html>
```

_app/includes/file.html_:
```html
<h1>{{title}}</h1>
<p>{{content}}</p>
```

With the following content file
```json
{
	"home": {
		"title": "Home",
		"content": "This is home"
	},
	"about": {
		"title": "About",
		"content": "This is about"
	}
}
```

This will render the following:
```html
<html>
	<body>
		<h1>Home</h1>
		<p>This is home</p>
		<h1>About</h1>
		<p>This is about</p>
	</body>
</html>
```


#### Inline _render statement

The `_render` statement simular to the `_if` statement determines whether or not the include is parsed.
However the `_render` statement looks for it's counterpart in the options not in the content JSON. It then
determines whether or not the field exists and if so, if the field has a truthy value.
If the field doesnt exist the `_render` will be ignored. If it does existes a `true` value will render the template
and a `false` value will skip the template.

_app/base.html_:
```html
<html>
	<body>
		<!--(bake includes/file.html _render="baseline")-->
	</body>
</html>
```

With the following grunt task:
```js
bake: {
	your_target: {
		options: {
			baseline: false
		},

		files: {
			"dist/index.html": "app/base.html"
		}
	},
}
```

This will create:

_dist/index.html_:
```html
<html>
	<body>
	</body>
</html>
```



#### Custom process
This example shows the use of a custom process function.

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

### Continuous development

For ease of development just add the `bake` task to your watch list. The static page will be baked every time you change the template.

```javascript
watch: {
	bake: {
		files: [ "app/includes/**" ],
		tasks: "bake:build"
	}
}
```
