//=========================================================
// Setup search skills
//=========================================================
const Skills       = require('restify-router').Router,
      skill        = new Skills(),
      $            = require('cheerio'),
      cheerio      = require('cheerio'),
      Entities     = require('html-entities').XmlEntities,
      entities     = new Entities(),
      xray         = require('x-ray')(),
      sanitizeHtml = require('sanitize-html'),
	  alfredHelper = require('../../helper.js'),
      logger       = require('winston');

alfredHelper.setLogger(logger); // Configure logging

//=========================================================
// Skill: googlesearch
// Params: search_term: String
//=========================================================
function googlesearch (req, res, next) {

	logger.info ('Search API called');

    // Get the search term
    var searchTerm = '';
    if (typeof req.query.search_term !== 'undefined' && req.query.search_term !== null) {
        searchTerm = req.query.search_term;

        var userAgent = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14',
            'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
            ],
		userAgentRandom = userAgent[Math.floor((Math.random() * 5))],
        url = 'http://www.google.co.uk/search?q=' + searchTerm + '&oe=utf8&hl=en-GB';
        
        alfredHelper.requestAPIdata(url)
        .then(function(apiData, userAgentRandom){

            // Get the search results data
            var body = apiData.body;

            logger.info("Running parsing");

			// result variable init
			var found = 0;
			if (!found) {
				//how many
				var items = $('._m3b',body).get().length; // find how many lines there are in answer table
				if (items) {
                    logger.info('Found ' + items + " answers");
					found = ''; //$('._eGc',body).html();
					for (var count = 0; count < items; count++) {	
                        found = found + $('._m3b',body).eq(count).html() + ", ";
					};
				};
            };

            //name list
			if (!found && $('#_vBb',body).length>0) {
				logger.info("Found name list");
				found = $('#_vBb',body).html();
			};

			//facts 1
			if (!found && $('._tXc>span',body).length>0) {
				logger.info("Found facts 1");
				found = $('._tXc>span',body).html();
                found = sanitizeHtml(found,{
                    allowedTags: [],
                    allowedAttributes: [],
                    nonTextTags: ['a']
                });
            };

			//facts 2
			if (!found && $('._sPg',body).length>0) {
				logger.info("Found facts 2");			
				found = " "+$('._sPg',body).html();
			};

			//instant + description 1
			if (!found && $('._Oqb',body).length>0) {
				logger.info("Found instant and desc 1");
				found = $('._Oqb',body).html();

    			//how many 1
				if ( $('._Mqb',body).length>0) {
					logger.info("Found Found instant and desc 1 - how many");
					found+= " "+$('._Mqb',body).html();
				};
			};

			//instant + description 2
			if (!found && $('._o0d',body).length>0) {
                logger.info("Found instant and desc 2");
				var tablehtml = $('._o0d',body).html(),
                    title = '',
                    htmlcontent = '';
                
                // get title
                xray(tablehtml,'b')(function (conversionError, html) {
                    title = html + '.';
                });

                // Get content
                xray(tablehtml, ['li'])(function (conversionError, html) {
                    htmlcontent = html;
                });
                
                var content = '';
                htmlcontent.forEach(function(value) {
                    content = content + ' ' + value;
                });
                found = title + content;
			};

			//Time, Date
			if (!found && $('._rkc._Peb',body).length>0) {
				logger.info("Found date and Time");
				found = $('._rkc._Peb',body).html();
			};

			//Maths	
			if (!found && $('.nobr>.r',body).length>0) {
				logger.info("Found maths");					
				found = $('.nobr>.r',body).html();
			};

			//simple answer
			if (!found && $('.obcontainer',body).length>0) {
				logger.info("Found Simple answer");
				found = $('.obcontainer',body).html();
			};

			//Definition
			if (!found && $('.r>div>span',body).first().length>0) {
				logger.info("Found definition");
				found = $('.r>div>span',body).first().html() +" definition. ";
				//how many
				var items = $('.g>div>table>tr>td>ol>li',body).get().length; // find how many lines there are in answer table
				if (items) {
					logger.info( items + " definitions found");
					for (var count = 0; count < items; count++) {	
						found = found + $('.g>div>table>tr>td>ol>li',body).eq(count).html() + ", ";
					};
				};
			};

			//TV show
			if (!found && $('._B5d',body).length>0) {	
				logger.info("Found tv show");
				found = $('._B5d',body).html();
				//how many
				if ( $('._Pxg',body).length>0) {
					found+= ". "+$('._Pxg',body).html();
				};
				//how many
				if ( $('._tXc',body).length>0) {
					found+= ". "+$('._tXc',body).html();
				};
			};
		
			//Weather
			if (!found && $('.g>.e>h3',body).length>0) {
				logger.info("Found weather");
				found = $('.g>.e>h3',body).html();
				//how many
				if ( $('.wob_t',body).first().length>0) {
					logger.info("Found more weather info");
					found+= " "+ $('.wob_t',body).first().html();
				};
				//how many
				if ( $('._Lbd',body).length>0) {
					logger.info("Found even more weather info");
					found+= " "+ $('._Lbd',body).html();
				};
            };

            // Construct returning data
            if (found) {
                found = entities.decode(found);
                found = sanitizeHtml(found, {
                    allowedTags: ['<b>'],
                    allowedAttributes: [],
                });
                var returnData = found;
            } else {
                var returnData = "I’m sorry, I wasn't able to find a specific answer for you.";
            };

            // Send response back to caller
            alfredHelper.sendResponse(res, 'sucess', returnData);

        });
    } else {

        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', 'Search term not provided.');
		logger.error('googlesearch: Search term not provided.');
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/search', googlesearch);

module.exports = skill;