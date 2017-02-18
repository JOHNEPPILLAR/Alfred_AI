//=========================================================
// Setup search routes
//=========================================================
const Router = require('restify-router').Router;  
      router = new Router();

//=========================================================
// Route: googlesearch
// Params: searchterm: String
//=========================================================
function googlesearch (req, res, next) {

    // Get the search term
    var searchTerm = '';
    if (typeof req.query.searchterm !== 'undefined' && req.query.searchterm !== null){
        searchTerm = req.query.searchterm;




            // send response back to caller
            var returnJSON = {
                code : 'sucess',
                data : ''
            };
            res.send(returnJSON);

    } else {
        // send error response back to caller
        var returnJSON = {
            code    : 'error',
            message : 'Search term not provided'
        };
        console.log('googlesearch: ' + err);
        res.send(returnJSON);
    };
    next();
};

//=========================================================
// Add routes to server
//=========================================================
router.get('/search', googlesearch)

module.exports = router;