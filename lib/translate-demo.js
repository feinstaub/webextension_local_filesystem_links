/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

var request = require("sdk/request");

//
// text: text to be translated
// lang: en or de
// callback: function(translated_text)
//
var translate = function(text, lang, callback) {

    if (text.length === 0) {
        throw ("Text to translate must not be empty");
    }

    if (lang.length === 0) {
        throw ("lang must be something like 'en' or 'de'.");
    }

    console.log("input: " + text + "  lang: " + lang);
    var req = request.Request({
        url: "http://ajax.googleapis.com/ajax/services/language/translate",
        content: {
            v: "1.0",
            q: text,
            // langpair: "|en"
            langpair: "|" + lang
        },
        onComplete: function (response) {
            try {
                let responseData = response.json.responseData;
                //
                // {"responseData": null, "responseDetails": "Suspected Terms of Service
                // Abuse. Please see http://code.google.com/apis/errors",
                // "responseStatus": 403} 
                let responseDetails = response.json.responseDetails;
                ////console.log("responseDetails: " + responseDetails);
                let translated = responseData.translatedText;
                console.log("output: " + translated);

                callback(translated);
            }
            catch (err) {
                console.error(err);
                console.error(err.stack);
                throw (err);
            }
        }
    });
    req.get();
};

// Export the 'translate' function
exports.translate = translate;
