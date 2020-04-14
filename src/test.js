const webReview = require("./index");
webReview.exec([
  {
    url: "https://www.facebook.com/",
    resolution: ["480x320", "1024x768", "1024x768", "1280x1024"],
    config: {
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
              title: "480x320",
              src: "../screenshots/480x320.png",
            },
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
  {
    url: "https://www.github.com",
    resolution: ["480x320", "1024x768", "1280x1024", "1920x1080"],
    config: {
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
              title: "480x320",
              src: "../screenshots/480x320.png",
            },
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
]);
