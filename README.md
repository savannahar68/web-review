# web-review

A npm package to check the responsiveness of your website and audit it's performance

### How to run this package locally

- Clone the project on your machine
- From your command line execute - `npm link` - this will add this package to global npm repo on your machine(/usr/local/bin)
- To test working of Package - Create a dir wherever you want
- From your command line execute - `npm init -y`
- From your command line execute - `npm link web-review` - this will install the package from your local global.
- Try out the package like this :

```
const webReview = require("web-review");
webReview.exec([
  {
    url: "https://www.facebook.com/",
    resolution: ["480x320", "1024x768", "1024x768", "1280x1024"],
  },
  {
    url: "https://www.github.com",
    resolution: ["480x320", "1024x768", "1280x1024", "1920x1080"],
  },
]);

```

Feel free to raise issue if you find one!
