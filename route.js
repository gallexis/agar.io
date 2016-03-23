// index
module.exports.index = function(req, res, next) {
  return res.render('index.ejs');
	//return res.send('Hello World!');
  //return next()

};


module.exports.error404 = function(req, res, next){
    //return res.status(404).render('404.ejs');
    return res.send('404!');
};