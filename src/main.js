const Pageres = require("pageres");
const Path = require("path");
const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator");
const launchChromeAndRunLighthouse = (url, opts, config = null) => {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then((chrome) => {
      opts.port = chrome.port;
      return lighthouse(url, opts, config).then((results) => {
        return chrome.kill().then(() => results.lhr);
      });
    });
};
/**
 * @param {String} url (Website's URL to check for responsiveness)
 * @param {list} resolution (Resolution in which to take the screenshots)
 * @categories [
    "480x320",
    "1024x768",
    "iphone 7 plus",
    "1280x1024",
    "1920x1080"]
 */
module.exports.ss = (
  url = "https://github.com",
  resolution = [
    "480x320",
    "1024x768",
    "iphone 7 plus",
    "1280x1024",
    "1920x1080",
  ]
) => {
  //right now URL is just string
  //TODO : Check the type of URL, if string then below code, if list i.e multiple URLs then handle that
  // Resolution will be a list of list in that case or Better have a dictionary and iterate over that
  return (async () => {
    console.log("called");
    await new Pageres({ delay: 2 })
      .src(url, resolution)
      .dest(Path.join(__dirname, "screenshots"))
      .run();

    console.log("Finished generating screenshots!");
    return true;
  })();
};

/**
 * @param {String} url (to audit)
 * @param {list} categories (categories required,outputs all if empty)
 * @categories ['performance','accessibility','seo','pwa']
 */

module.exports.lh = (url = "https://github.com", categories = []) => {
  //TODO : Best Practices Option yet to add
  //some more config options - from documentation of lighthouse
  const opts = {
    chromeFlags: ["--show-paint-rects","--headless"],
  };
  if (categories.length) opts["onlyCategories"] = categories;
  // console.log(opts);
  launchChromeAndRunLighthouse(url, opts).then((results) => {
    const html = ReportGenerator.generateReport(results, "html");
    var filename = new URL(url).hostname;
    filename += ".html";
    var dir = "./reports";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile(Path.join(dir, filename), html, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  });
};
