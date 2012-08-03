/*!
 * Apache Ant adapter
 * Version: 0.1.0 (2012/08/02)
 * Author: Miller Medeiros
 * Released under the MIT license
 */


exports.TMP_PATH = null;
exports.ANT_PATH = './ant/bin/ant';

// ---

var _childProcess = require('child_process');
var _fs = require('fs');
var _path = require('path');
var _jxon = require('./lib/jxon');

// ---


function exec(tasks, args, callback) {
    // args is optional
    if ( arguments.length === 2 ) {
        if (typeof args === 'function') {
            callback = args;
            args = [];
        }
    }
    args = args || [];


    var tmpFile = _path.join(exports.TMP_PATH, '_build_'+ uid() +'.xml');

    /*jshint multistr:true */

    var xml = '<?xml version="1.0" encoding="utf-8"?>\
<project name="node_ant" default="run">\
  <target name="run">{{target}}</target>\
</project>';

    xml = xml.replace('{{target}}', _jxon.toXML(tasks) );


    // write XML to temporary file and call ant passing it
    _fs.writeFile(tmpFile, xml, 'utf-8', function(w_err){
        if (w_err) {
            if (typeof callback === 'function') {
                callback(w_err);
            }
            // can't execute without writting the temp build file
            return;
        }

        // windows uses the ".bat" file
        var antPath = exports.ANT_PATH;
        antPath += (process.platform === 'win32')? '.bat' : '';
        antPath = _path.normalize(antPath);

        _childProcess.execFile( antPath, ['-buildfile', tmpFile].concat(args), function(e_err, stdout, stderr) {
            _fs.unlink(tmpFile, function(u_err){
                if (typeof callback === 'function') {
                    var err = u_err || e_err;
                    callback(err, stdout, stderr);
                }
            });
        });
    });

}


var _prevUid = 0;
function uid(){
    return String(Date.now()).substr(-7) +'-'+ (++_prevUid);
}


exports.exec = exec;

