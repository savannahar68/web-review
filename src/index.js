const webReview = require("./main");
const fs = require("fs");
// webReview.ss('https://www.google.com/');
// webReview.lh("https://www.google.com/", ["accessibility", "performance"]);
// webReview.lh("https://www.google.com/");

var config = {
  extends: "lighthouse:default",
  categories: {
    screenshots: {
      title: "Screenshots",
      description:
        "These show the screenshots of the page in various dimensions.",
      manualDescription:
        "Show the display of the page under various dimensions.",
      auditRefs: [],
      images: [
        {
          title: "1024x768",
          src: "../screenshots/1024x768.png",
        },
      ],
      id: "screenshots",
      score: 0.5,
    },
  },
};

module.exports.exec = (
  urlList = [
    {
      url: "https://github.com",
      resolution: [
        "480x320",
        "1024x768",
        "iphone 5s",
        "iphone 7 plus",
        "1024x768",
        "1280x1024",
      ],
      config: {
        categories: {
          screenshots: {
            title: "Screenshots",
            description:
              "These show the screenshots of the page in various dimensions.",
            manualDescription:
              "Show the display of the page under various dimensions.",
            auditRefs: [],
            images: [
              {
                title: "1024x768",
                src: "../screenshots/1024x768.png",
              },
            ],
            id: "screenshots",
            score: 0.5,
          },
        },
      },
    },
  ]
) => {
  //right now URL is just string
  //TODO : Check the type of URL, if string then below code, if list i.e multiple URLs then handle that
  // Resolution will be a list of list in that case or Better have a dictionary and iterate over that

  urlList.forEach((urlObject) => {
    imageList = [];
    urlObject.config = config;
    urlObject["resolution"].forEach((res) => {
      imageList.push({ title: res, src: "../screenshots/" + res + ".png" });
    });
    urlObject.config.categories.screenshots.images = imageList;
  });

  // console.log(JSON.stringify(urlList));
  return (() => {
    object
    console.log("Running...");
    var auditState = webReview.auditState;
    auditState.registerListener(() => {
      if (auditState.url === -1) return;
      if (auditState.url === urlList.length) {
        auditState.url = -1;
        return;
      }
      //console.log(urlList[auditState.url].config);
      webReview.lh(
        urlList[auditState.url].url,
        urlList[auditState.url].category,
        urlList[auditState.url].config
      );
    });

    for (const key in urlList) {
      const urlObj = urlList[key];
      var dir = new URL(urlObj.url).hostname;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      webReview.ss(urlObj.url, urlObj.resolution);
    }
    //begin auditing
    if (auditState.url === -1) auditState.url = 0;

    return true;
  })();
};
