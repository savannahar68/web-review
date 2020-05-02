const webReview = require("./index");
webReview.exec([
  {
    url: "https://chat.zulip.org/",
    resolution: ["480x320", "1024x768", "iphone 5s", "iphone 7 plus", "1024x768", "1280x1024"],
  },
  {
    url: "https://www.github.com",
    resolution: ["480x320", "1024x768", "iphone 5s", "iphone 7 plus", "1024x768", "1280x1024"],
  },
]);
