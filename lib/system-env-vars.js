// system-env-vars.js
// check if link contains a path variable and 
// add the real path into link to open into
// Windows style %name%
// Linux style $name$
const { env } = require('sdk/system/environment');

const {isWindowsOs} = require( './utils/os-util' );

module.exports = function sysEnv() {
    // required test
    // - multiple path variables possible in link
    // - How is it displayed in tooltip/statusbar?
    // - Replace every occurence of a variable in the link

    // regex to match %var_name% but not e.g. %20 encoding
    var _currentEnvRegex = isWindowsOs() ? 
        /\%(?!\d{2})\w+\%/g:
        /\$(?!\d{2})\w+\$/g;

    return {
        checkLink: function(url) {
            // %name% already removed --> Check where it is removed
            var pathVars = url.match(_currentEnvRegex),
                pathKey; // single path variable
            // console.log('checkLink', _currentEnvRegex, pathVars, url);

            if (pathVars !== null) {
                for(var i=0; i < pathVars.length; i++) {
                    pathKey = pathVars[i].replace(/(\%|\$)/g, ''); // remove % or $
                    //console.log(pathKey, env[pathKey], env);
                    url = url.replace(new RegExp(_currentEnvRegex.source), 
                        env[pathKey] || ''); /// undefined will be changed to ''

                    url = url.replace(/\\/g, '\/'); // replace backslashes
                    // console.log('Replace', url, pathVars[i], env[pathKey]);
                }
            }
            return url;
        }
    }
}