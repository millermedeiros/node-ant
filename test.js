// ============================================================================
// Test #01
// ============================================================================


require('./index').exec(
    {
        // set some properties
        property : [
            {
                '@name' : 'greeting',
                '@value' : 'Hello'
            },
            {
                '@name' : 'place',
                '@value' : 'World'
            }
        ],

        // just some simple echo (http://ant.apache.org/manual/Tasks/echo.html)
        echo : '${greeting} ${place}!',

        // concat task (http://ant.apache.org/manual/Tasks/concat.html)
        concat : {
            fileset : {
                '@dir' : '.',
                include : {
                    '@name' : '*.js'
                }
            }
        },

        // script task (http://ant.apache.org/manual/Tasks/script.html)
        script: {
            '@language': 'javascript',
            keyValue: function () {
                var echo = node_ant.createTask('echo');
                echo.setMessage('Inception: Ant script task running from inside a node.js script.');
                echo.perform();
            }
        }

    },
    function(err, stdout, stderror){
        // it doesn't throw any errors and also doesn't log the stdout by
        // default that way you can control what you want to do.
        if (stdout) console.log(stdout);
        if (stderror) console.log(stderror);
        if (err) throw err;
    }
);


/*
console.log(
require('./lib/jxon').toXML({ xml : {
    foo : {
        '@name' : 'lorem',
        '@works' : true,
        keyValue : 'Dolor Amet'
    },
    bars : {
        bar : [
            {
                '@id' : 123,
                '@done' : false,
                keyValue : 'bar1'
            },
            {
                '@id' : 456,
                '@done' : true,
                keyValue : 'bar2'
            }
        ]
    },
    lorem : false,
    ipsum : true,
    dolor : 0,
    sit : new Date(2012, 8, 2),
    amet : null, // empty node
    maecennas : undefined, // not an element
    ullamcor : 123.345,
    curabitur : Infinity,
    elit : -0,
    sed : +0
} })
)
*/
