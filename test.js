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
        }
    },
    function(err, stdout, stderror){
        // it doesn't throw any errors and also doesn't log the stdout by
        // default that way you can control what you want to do.
        if (stderror) console.log(stderror);
        if (err) throw err;
        if (stdout) console.log(stdout);
    }
);
