const Pageres = require('pageres');
const Path = require('path')

module.exports.ss = (url = "https://github.com", resolution = ['480x320', '1024x768', 'iphone 7 plus', '1280x1024', '1920x1080']) => {
    //right now URL is just string
    //TODO : Check the type of URL, if string then below code, if list i.e multiple URLs then handle that
    // Resolution will be a list of list in that case or Better have a dictionary and iterate over that
    return (async () => {
        console.log("called")
        await new Pageres({delay: 2})
            .src(url, resolution)
            .dest(Path.join(__dirname, 'screenshots'))
            .run();
            
        console.log('Finished generating screenshots!');
        return true;
    })();
}