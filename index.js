/*!
 * Apache Ant adapter
 * Version: 0.1.0 (2012/08/02)
 * Author: Miller Medeiros
 * Released under the MIT license
 */

/*jshint multistr:true */

var _childProcess = require('child_process');
var _fs = require('fs');
var _path = require('path');
var _jxon = require('./lib/jxon');
var os = require('os');

function exec(tasks, options, callback) {
    // args is optional
    if (arguments.length === 2) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
    }
    options.args = options.args || [];

    var tmpFile = _path.join(os.tmpdir(), '_build_' + uid() + '.xml');

    var xml = '<?xml version="1.0" encoding="utf-8"?>\
<project name="node_ant" default="run">\
  <target name="run">{{target}}</target>\
</project>';

    xml = xml.replace('{{target}}', _jxon.toXML(tasks));

    function processCallback(e_err, stdout, stderr) {
        _fs.unlink(tmpFile, function(u_err) {
            if (typeof callback === 'function') {
                var err = u_err || e_err;
                callback(err, stdout, stderr);
            }
        });
    }

    // write XML to temporary file and call ant passing it
    _fs.writeFile(tmpFile, xml, 'utf-8', function(w_err) {
        if (w_err) {
            if (typeof callback === 'function') {
                callback(w_err);
            }
            // can't execute without writing the temp build file
            return;
        }

        var antPath;
        if (options.antPath) {
            var antExecutable = 'ant' + (process.platform === 'win32' ? '.bat' : '');
            var antPath = _path.join(options.antPath, antExecutable);
            antPath = _path.normalize(antPath);
            _childProcess.execFile(antPath, ['-buildfile', tmpFile].concat(options.args), processCallback);
        } else {
            // Let's hope that ant is in the user's PATH
            var cmd = ['ant', '-buildfile', tmpFile].concat(options.args);
            _childProcess.exec(cmd, processCallback);
        }
    });
}

var _prevUid = 0;

function uid() {
    return String(Date.now()).substr(-7) + '-' + (++_prevUid);
}

exports.exec = exec;