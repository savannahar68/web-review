const webReview = require("./main");
// webReview.ss('https://www.google.com/');
// webReview.lh("https://www.google.com/", ["accessibility", "performance"]);
// webReview.lh("https://www.google.com/");
module.exports.exec = (
  url = "https://github.com",
  resolution = [
    "480x320",
    "1024x768",
    "iphone 7 plus",
    "1280x1024",
    "1920x1080",
  ],
  category = ["accessibility", "performance"]
) => {
  //right now URL is just string
  //TODO : Check the type of URL, if string then below code, if list i.e multiple URLs then handle that
  // Resolution will be a list of list in that case or Better have a dictionary and iterate over that
  return (async () => {
    webReview.ss(url, resolution);
    webReview.lh(url, category);
    //webReview.lh("https://www.google.com/");
    return true;
  })();
};
