# node-ant

Experimental [Apache Ant](http://ant.apache.org/) adapter for
[node.js](http://nodejs.org).

This is a proof-of-concept more than anything else. Still unsure if it will
actually work on multiple environments and if it is really a good idea.



## Why?

Many people been using [node.js to run build
scripts](http://blog.millermedeiros.com/node-js-as-a-build-script/) and
everyone is writting the same tasks for the most basic stuff like
copying/concateneting/deleting/ziping files and it will take a long time before
*someone* implements [all the tasks present on
Ant](http://ant.apache.org/manual/tasksoverview.html).

Projects like [grunt](https://github.com/cowboy/grunt),
[gear](https://github.com/yahoo/gear), [jake](https://github.com/mde/jake),
[rivet](https://github.com/jaredhanson/rivet),
[roto](https://github.com/diy/roto) and many others are all writting their own
tasks to do the same things. TBH I think a better approach would be to create
separate libs that could do each task (or a group of tasks) and that wasn't
tied to a specific build tool, and create tools that abused this (no need to
convert 3rd party lib into a plugin or author a new module just to use the
methods inside your build files).

Ant contains [many advanced tasks](http://ant.apache.org/manual/tasksoverview.html)
and is *battle tested* so it makes sense to reuse them instead of reinventing
the wheel.

Ant is also not that easy to install on Windows since you need to configure the
`ANT_HOME`, `CLASSPATH` and `JAVA_HOME` paths. So it's easier to use
a standalone version of Ant that is distributed together with the
[npm](http://npmjs.org) package. The Java Runtime is avaialble on most
computers so calling the ant executable should work out of the box on most
cases.

The idea is not to write multiple ant `<target>`s, but to treat Ant as
a standalone lib that can be called from a node.js script. Performance isn't
that great (since JVM isn't as fast as node) but it is still better than
writting error-prone tasks that gets half of the job done.

Build tools based solely on configuration are doomed to "fail" the same way as
Ant did "failed". You can't express all edge-cases with configuration without
creating an overly complex system. Some things that could be easily done with
a `for` loop and a few `if/else` are a huge PITA with a descriptive syntax
(XML/JSON). The main reason why I moved my build scripts to node.js is to the
get freedom to write new tasks by myself without major pains, locking down your
build to a system that can only be extended by writting plugins that accepts
a simple config object won't scale up. Let's use Ant for what it is good for
(broad amount of battle tested tasks with flexible config options) and use
plain JavaScript for those tasks that aren't covered by Ant.

Maybe this project will motivate someone to port the most important Ant tasks
to plain JavaScript. I still haven't found a single node task that is as
complete the ones provided by Ant, see for instance all the options available
on the [copy task](http://ant.apache.org/manual/Tasks/copy.html) (multiple
`include`/`exclude`, `filter`, `globmapper`, download internet files,
`flatten`, etc...).



## How?

The idea is to use the Ant as if it was a standalone library that can be called
from node.js, that way you can reuse them in your custom node.js build files
when necessary.

It will simply convert JSON-like objects into a temporary XML file and execute
the standalone version of Ant passing the custom arguments. This tool is just
a "bridge" between Node.js and the Ant JAR file.



## Example

Execute the test file to see a very basic example:

    node test

You can run it from another node.js program:

```js
var ant = require('ant');

ant.exec({
    // concat task (http://ant.apache.org/manual/Tasks/concat.html)
    concat : {
        fileset : {
            '@dir' : '.',
            include : {
                '@name' : '*.js'
            }
        }
    }
}, function(err, stdout, stderror){
    // it doesn't throw any errors and also doesn't log the stdout by
    // default that way you can control what you want to do.
    if (stdout) console.log(stdout);
    if (stderror) console.log(stderror);
    if (err) throw err;
});
```



## Documentation

Right now it contains a single method `exec()` that accepts an object with each
task and a callback. The tasks are just JSON-like representation of the XML
markup needed to execute each task, `node-ant` will convert it back to XML
during the `exec`.


### `ant.exec(tasks, [args], callback)`

 - **tasks**:
   - JSON-like object containing Ant tasks to be executed.
 - **[args]**:
   - Command line arguments passed to the ant executable.
 - **callback**
   - Function executed after `exec` finishes. Will receive the following
     arguments: (err, stdout, stderr).


### JXON syntax

Attributes starts with `@`.

    > { foo : { '@bar' : 123 }}
    <foo bar="123" />

The XML node text value is stored as the actual key value if node doesn't
contain attributes and/or child nodes or on a special property `keyValue`.

    > {
        foo : 'Lorem Ipsum'
    }
    <foo>Lorem Ipsum</foo>

    > {
        foo : {
            '@bar' : 123,
            keyValue : 'Lorem Ipsum'
        }
    }
    <foo bar="123">Lorem Ipsum</foo>

    > {
        concat : {
            fileset : {
                '@dir' : '.',
                include : {
                    '@name' : '*.js'
                }
            }
        }
    }
    <concat><fileset dir="."><include name="*.js" /></fileset></concat>

Use the [Ant tasks
documentation](http://ant.apache.org/manual/tasksoverview.html) as reference.



## Important

This project is on early experimental phase. The way that `ant.exec` is called
might change in the future, specially since the
[JXON](https://developer.mozilla.org/en/JXON) format currently used doesn't
allow XML nodes with same name that aren't adjacent to each other (object can't
have multiple properties with the same key). So I might end up changing the
format to something closer to [JSONML](http://www.jsonml.org/) or use some sort
of special token to differentiate duplicates (eg. `echo#1`, `echo#2`).



## TODO

 - Test on a computer that doesn't have JDK installed.
 - Check if it is possible to ship with a standalone version of JDK for the
   advanced tasks.
 - Make it possible to log to console without waiting the whole task to finish.



## Requirements

 - node.js 0.8.0+
 - Java
 - JDK 1.4+ (depending on which task you use)



## Changelog

### v0.2.0 (2012/08/03)

 - add support to functions on tasks (for [script](http://ant.apache.org/manual/Tasks/script.html) task). [Thanks to @Diullei](https://gist.github.com/3245017)
 - small refactor to jxon to improve readability and autoclose empty tags.


### v0.1.0 (2012/08/02)

 - initial release.



## License

node-ant is distributed under the MIT license.

Apache Ant is distributed under the Apache License.
