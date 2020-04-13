const webReview = require("./src/index");
webReview.exec([
  {
    url: ["https://www.github.com/marketplace"],
    resolution: [
      "480x320",
      "1024x768",
      "iphone 7 plus",
      "1280x1024",
      "1920x1080",
    ],
  },
  {
    url: ["https://www.google.com"],
    resolution: [
      "480x320",
      "1024x768",
      "iphone 7 plus",
      "1280x1024",
      "1920x1080",
    ],
    category: ["accessibility", "performance"],
  },
]);
// webReview.lh("https://www.google.com/", ["accessibility", "performance"]);
// webReview.lh("https://www.google.com/");
