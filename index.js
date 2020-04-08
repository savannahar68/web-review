const Pageres = require('pageres');

module.export = (url = "https://github.com", resolution = ['480x320', '1024x768', 'iphone 5s', '1280x1024', '1920x1080']) => {
    //right now URL is just string
    //TODO : Check the type of URL, if string then below code, if list i.e multiple URLs then handle that
    // Resolution will be a list of list in that case or Better have a dictionary and iterate over that
    (async () => {
        await new Pageres({delay: 2})
            .src(url, resolution, {crop: true})
            //.src('https://github.com', ['1280x1024', '1920x1080'])
            //.src('data:text/html,<h1>Awesome!</h1>', ['1024x768'])
            .dest(__dirname)
            .run();
            
        console.log('Finished generating screenshots!');
    })();
}