# web-review
A npm package to check the responsiveness of your website and audit it's performance

### How to run this package locally

* Clone the project on your machine
* From your command line execute - ``` npm link ``` - this will add this package to global npm repo on your machine(/usr/local/bin)
* To test working of Package - Create a dir wherever you want
* From your command line execute - ``` npm init -y ```
* From your command line execute - ``` npm link web-review ``` - this will install the package from your local global.
* Try out the package like this : 

```
const webr = require('web-review');
var url = "https://www.gitub.com";
webr.exec(url);
```

Feel free to raise issue if you find one!
