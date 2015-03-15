var markdown = function(site, name) {
    var ghm = require("github-flavored-markdown")
    var fs = require('fs');

    var templateFile = fs.readFileSync('./' + site + '/_templates/' + name + '.markdown').toString();

    return ghm.parse(templateFile, "isaacs/npm");
};

var underscore = function(template, data) {
    var _ = require('underscore');
    return _.template(template)(data);
};

var loremIpsum = function(min, max, units) {
    var count = Math.floor(Math.random() * (max - min + 1)) + min;

    var loremIpsum = require('lorem-ipsum');

    if (!units) {
        units = 'words';
    }

    return loremIpsum(
        {
            count: count,
            units: units            // Generate words, sentences, or paragraphs.
        }
    );
};

module.exports.underscoreTemplate = function(templateFileName, outputFileName, templateData) {
    var fs = require('fs');

    var templateFile = fs.readFileSync(templateFileName).toString();

    templateData.controler = {
        markdown: function(name) {
            return markdown(site, name);
        },
        loremIpsum: loremIpsum,
        include: function(name, attrs) {
            var templateFile = fs.readFileSync("templates/" + name + '.us').toString();

            var obj = templateData;

            if (typeof attrs === 'object') {
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        obj[key] = attrs[key];
                    }
                }
            }

            return underscore(templateFile, obj);
        }
    };

    fs.writeFileSync(outputFileName, underscore(templateFile, templateData));
};



