// ----------------------------------------------------------------------------
// convert Object into XML following JXON format
// inspired by: https://developer.mozilla.org/en/JXON#JXON_algorithm_3
// Author: Miller Medeiros
// Version: 0.1.0 (2012/08/02)
// ----------------------------------------------------------------------------


// TODO: split into a separate NPM package
// TODO: create tests
// TODO: support multiple properties with "same" name (eg. `echo#1`, `echo#2`)


/*
Sample JXON:
===========

{ xml : {
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
} }


Generated XML:
==============

<xml><foo name="lorem" works="true">Dolor Amet</foo>
<bars><bar id="123" done="false">bar1</bar>
<bar id="456" done="true">bar2</bar></bars>
<lorem>false</lorem>
<ipsum>true</ipsum>
<dolor>0</dolor>
<sit>Sun Sep 02 2012 00:00:00 GMT-0300 (BRT)</sit>
<amet />
<ullamcor>123.345</ullamcor>
<curabitur>Infinity</curabitur>
<elit>0</elit>
<sed>0</sed></xml>

*/




function toXML(obj, nodeName){
    var str = '';
    var attributes = [];
    var keyValue = '';
    var cur;
    var childs = [];



    for (var key in obj) {
        if (! Object.prototype.hasOwnProperty.call(obj, key) ) {
            continue;
        }

        cur = obj[key];

        if ( isAttribute(key) ) {
            if (nodeName) {
                attributes.push(key.substr(1) +'="'+ escapeHtml( cur.toString() ) +'"');
            } else {
                throw new Error('attribute can only be set on node');
            }
        } else if (key === 'keyValue') {
            keyValue = cur;
        } else {
            switch( kindOf(cur) ) {
                case 'Object':
                    childs.push( toXML(cur, key) ); //inception
                    break;
                case 'Array':
                    cur.forEach(function(val){
                        if ( kindOf(val) === 'Object' ) {
                            childs.push( toXML(val, key) );
                        } else {
                            appendNode(childs, key, val);
                        }
                    });
                    break;
                case 'Null':
                    childs.push('<'+ key +' />');
                    break;
                case 'Undefined':
                    // skip
                    break;
                default:
                    appendNode(childs, key, cur);
                    break;
            }
        }

    }

    if (keyValue && childs.length) {
        throw new Error('Malformed XML: node "'+ nodeName +'" can not have keyValue and children at the same time.');
    }

    str += keyValue;
    str += childs.join('\n');

    return (nodeName)? wrapTag(nodeName, str, attributes) : str;
}


function wrapTag(key, content, attributes) {
    var attr = (attributes && attributes.length)? ' '+ attributes.join(' ') : '';
    return '<'+ key + attr +'>'+ content +'</'+ key +'>';
}

function appendNode(target, key, value){
    var str = escapeHtml( value.toString() );
    target[target.length] = wrapTag(key, str);
}



function kindOf(val) {
    if (val === null) {
        return 'Null';
    } else if (val === void(0)) {
        return 'Undefined';
    } else {
        return (/^\[object (.*)\]$/).exec( Object.prototype.toString.call(val) )[1];
    }
}

function isAttribute(key){
    return startsWith(key, '@');
}

function startsWith(str, prefix) {
    str = (str || '');
    prefix = (prefix || '');
    return str.indexOf(prefix) === 0;
}


function escapeHtml(str){
    str = (str || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;');
    return str;
}



exports.toXML = toXML;
