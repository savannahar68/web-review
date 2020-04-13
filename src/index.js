const webReview = require("./main");
const fs = require("fs");
// webReview.ss('https://www.google.com/');
// webReview.lh("https://www.google.com/", ["accessibility", "performance"]);
// webReview.lh("https://www.google.com/");

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
        "1280x1024"
      ],
      category: ["accessibility", "performance"],
    },
  ]
) => {
  return (() => {
    console.log("Running...")
    var auditState = webReview.auditState;
    auditState.registerListener(() => {
      if (auditState.url === -1) return;
      if (auditState.url === urlList.length) {
        auditState.url = -1;
        return;
      }
      urlList[auditState.url].url.forEach(url => {
        webReview.lh(
          url,
          urlList[auditState.url].category
        );
      });
    });

    for (const key in urlList) {
      const urlObj = urlList[key];
      urlObj.url.forEach(url =>{
        var urlNewObj = new URL(url);
        var dir = urlNewObj.hostname + "/" + urlNewObj.pathname;
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir,{recursive:true},(err) => {
            if(err) throw new err;
          });
        }
        webReview.ss(url, urlObj.resolution);
      });
    }
    //begin auditing
    if (auditState.url === -1) auditState.url = 0;

    console.log("Done!")
    return true;
  })();
};
