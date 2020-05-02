# web-review

It is extremely important from the developer's point of view that your website is responsive and follows good practices. That's why we have developed web-review an npm package which will compile reports consisting of : 

* Performace of website
* Responsiveness (Screenshots)
* SEO capability
* Accessibility
* Best Practices
* Progressive web app support


And serve it to you HTML format. All this is done by using [lighthouse](https://developers.google.com/web/tools/lighthouse) under the hood.

### Install this package

```
npm install --save web-review
```

### or Run this package locally

- Clone the project on your machine
- From your command line execute - `npm link` - this will add this package to global npm repo on your machine(/usr/local/bin)
- To test working of Package - Create a dir wherever you want
- From your command line execute - `npm init -y`
- From your command line execute - `npm link web-review` - this will install the package from your local global.
- Try out the package like this :


## Usage

```bash
$ npm install -g web-review

$ web-review --sites='{"github":"https://www.github.com","zulip":"https://chat.zulip.org/"}' --resolutions='["1280x1024", "1900x1600", "800x600"]'

$ # and check
$ web-review --usage
Host web-review
Usage: web-review [options]

Examples: web-review --sites='{"github":"http://ww.github.com"}' --resolutions='["1280x1024", "1900x1600", "800x600"]'

Options:
  --title, -t        Title of the review                                       [default: "Review"]
  --sites, -s        Sites as JSON Object of strings                           [required]
  --resolutions, -r  Resolutions as JSON Array of strings                      [default: "[\"1200x800\"]"]
  --help, -h         Print usage instructions

```

or create a review programmatically:

```
const webReview = require("web-review");
webReview.exec([
  {
    url: "https://chat.zulip.org/",
    resolution: ["480x320", "1024x768", "1024x768", "1280x1024"],
  },
  {
    url: "https://www.github.com",
    resolution: ["480x320", "1024x768", "1280x1024", "1920x1080"],
  },
]);

```
List of resolution sizes can be from this list [sizes](https://github.com/kevva/viewport-list/blob/master/data.json)

## Contibutors

* [Savan Nahar](https://github.com/savannahar68/)
* [Pranav Joglekar](https://github.com/Pranav2612000)
* [Vasu Sharma](https://github.com/vasusharma7)


Feel free to raise issue if you find one! Contributions are always welcomed :)
