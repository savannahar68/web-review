const review = require("./index");
var optimist = require('optimist');

var argv = optimist
    .usage(
        'Host web-review\nUsage: $0 [options]\n\n' +
        'Examples: web-review --sites=\'{"google":"http://google.com"}\'')
    .demand(['sites'])

    .describe('port', 'Port to listen on')
    .default('port', 4000)
    .alias('p', 'port')

    .describe('title', 'Title of the review')
    .default('title', 'Review')
    .alias('t', 'title')

    .describe('sites', 'Sites as JSON Object of strings')
    .alias('s', 'sites')

    .describe('resolutions', 'Resolutions as JSON Array of strings')
    .alias('r', 'resolutions')
    .default('resolutions', '["480x320","1024x768","iphone 5s","iphone 7 plus","1024x768","1280x1024"]')

    .describe('help', 'Print usage instructions')
    .alias('h', 'help')
    .argv

if (argv.help || !argv.sites) return optimist.showHelp()

const parms = []
try {
    argv.sites = JSON.parse(argv.sites);
} catch (err) {
}
try {
    argv.resolutions = JSON.parse(argv.resolutions);
} catch (err) {
    argv.resolutions = ["480x320", "1024x768", "iphone 5s", "iphone 7 plus", "1024x768", "1280x1024"];
}
Object.keys(argv.sites).forEach(key => {
    let value = argv.sites[key];
    let websiteObject = { url: value, resolution: argv.resolutions };
    parms.push(websiteObject);
});

review.exec(parms);
