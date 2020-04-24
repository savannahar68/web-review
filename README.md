# web-review

A npm package to check the responsiveness of your website and audit it's performance, by using lighthouse under the hood

### How to run this package locally

- Clone the project on your machine
- From your command line execute - `npm link` - this will add this package to global npm repo on your machine(/usr/local/bin)
- To test working of Package - Create a dir wherever you want
- From your command line execute - `npm init -y`
- From your command line execute - `npm link web-review` - this will install the package from your local global.
- Try out the package like this :


## Usage

```bash
$ npm install -g web-review

$ web-review --sites='{"google":"http://google.com","facebook":"http://facebook.com"}' \
  --resolutions='["1280x1024", "1900x1600", "800x600"]'

$ # and check
$ web-review --usage
Host web-review
Usage: web-review [options]

Examples: web-review --sites='{"google":"http://google.com"}'

Options:
  --title, -t        Title of the review                                       [default: "Review"]
  --sites, -s        Sites as JSON Object of strings                           [required]
  --resolutions, -r  Resolutions as JSON Array of strings                      [default: "[\"1200x800\"]"]
  --cut              Cut snapshots to exact screen size                        [default: false]
  --help, -h         Print usage instructions

```

or create a review programmatically:

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
