//=========================================================
// Setup search skills
//=========================================================
const Skills = require('restify-router').Router,
      skill = new Skills(),
      $ = require('cheerio'),
      cheerio = require('cheerio'),
      Entities = require('html-entities').XmlEntities,
      entities = new Entities(),
      striptags = require('striptags'),
      xray = require('x-ray')(),
      cheerioTableparser = require('cheerio-tableparser'),
      summary = require('node-tldr');

//=========================================================
// Skill: googlesearch
// Params: searchterm: String
//=========================================================
function googlesearch (req, res, next) {

    // Get the search term
    var searchTerm = '';
    if (typeof req.query.searchterm !== 'undefined' && req.query.searchterm !== null){
        searchTerm = req.query.searchterm;

        var userAgent = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14',
            'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
            ],
		userAgentRandom = userAgent[Math.floor((Math.random() * 5))],
        url = 'http://www.google.co.uk/search?q=' + searchTerm + '&oe=utf8&hl=en-GB';
        
console.log('User Agent: - ' + userAgentRandom);
console.log('url: - ' + url)

        alfredHelper.requestAPIdata(url)
        .then(function(apiData, userAgentRandom){

            // Get the search results data
            var body = apiData.body;

            console.log("Running parsing");

			// result variable init
			var found = 0;
			if (!found ){
				//how many
				var items = $('._m3b',body).get().length; // find how many lines there are in answer table
				if (items) {
                    console.log(items + " how many 2 answer found");
					found = $('._eGc',body).html() + ", ";
					for (var count = 0; count < items; count++) {	
						found = found + $('._m3b',body).eq(count).html() + ", ";
					}
				}
            }

            //name list
			if (!found && $('#_vBb',body).length>0){
				console.log("Found name list");
				found = $('#_vBb',body).html();
			}

			//facts 1
			if (!found && $('._tXc>span',body).length>0){
				console.log("Found facts 1");
				found = $('._tXc>span',body).html();
			}

			//facts 2
			if (!found && $('._sPg',body).length>0){
				console.log("Found facts 2");			
				found = " "+$('._sPg',body).html();
			}

			//instant + description 1
			if (!found && $('._Oqb',body).length>0){
				console.log("Found instant and desc 1");
				found = $('._Oqb',body).html();

    			//how many 1
				if ( $('._Mqb',body).length>0){
					console.log("Found Found instant and desc 1 - how many");
					found+= " "+$('._Mqb',body).html();
				}
			}

			//instant + description 2
			if (!found && $('._o0d',body).length>0){
                console.log("Found Found instant and desc 2")
				var tablehtml = $('._o0d',body).html()
                found = tablehtml // fallback in case a table isn't found
                xray(tablehtml, ['table@html'])(function (conversionError, tableHtmlList) {
                if (tableHtmlList) {
                    // xray returns the html inside each table tag, and tabletojson
                    // expects a valid html table, so we need to re-wrap the table.
                    // var table1 = tabletojson.convert('<table>' + tableHtmlList[0]+ '</table>');
                    var $table2 = cheerio.load('<table>' + tableHtmlList[0]+ '</table>');
                    cheerioTableparser($table2);
                    var headerStart = 0;
                    var data2 = $table2("table").parsetable(false, false, true);
                    var tableWidth = data2.length;
                    var tableHeight = data2[0].length;
                    console.log("Height " + tableHeight);
                    console.log("Width " + tableWidth);
                    var blankFound = 0;
                    var headerText ='';
                    for (var l = 0; l < tableWidth; l++) { 
                        console.log('Table Data @@@@@' + data2[l]+ '@@@@');
                    }
                    // Look to see whether header row has blank cells in it. 
                    // If it does then the headers are titles can't be used so we use first row of table as headers instead
                    for (var i = 0; i < tableWidth; i++) { 
                        console.log(data2[i][0]);
                        if (data2[i][0] == "") {
                            blankFound++;
                        } else {
                            headerText += (data2[i][0]) + '. SHORTALEXAPAUSE';
                        }
                    }
                    console.log ("Number of blank cells : " + blankFound)
                    found = localeResponse[3] + ' ALEXAPAUSE ';
                    if (blankFound != 0){
                        headerStart = 1;
                        //found += headerText +' ALEXAPAUSE ';
                    }
                    // Parse table from header row onwards
                    for (var x = headerStart ; x < tableHeight; x++) { 
                        for (var y = 0; y < tableWidth; y++) { 
                            found += ( data2[y][x] +', SHORTALEXAPAUSE');
                        }
                        found += ('ALEXAPAUSE');
                    }
                    console.log('Found :' + found)
                }

                if (conversionError){
                    console.log("There was a conversion error: " + conversionError);
                }
              });
			}

			//Time, Date
			if (!found && $('._rkc._Peb',body).length>0){
				console.log("Found date and Time");
				found = $('._rkc._Peb',body).html();
			}

			//Maths	
			if (!found && $('.nobr>.r',body).length>0){
				console.log("Found maths");					
				found = $('.nobr>.r',body).html();
			}

			//simple answer
			if (!found && $('.obcontainer',body).length>0){
				console.log("Found Simple answer");
				found = $('.obcontainer',body).html();
			}

			//Definition
			if (!found && $('.r>div>span',body).first().length>0){
				console.log("Found definition");
				found = $('.r>div>span',body).first().html() +" definition. ";
				//how many
				var items = $('.g>div>table>tr>td>ol>li',body).get().length; // find how many lines there are in answer table
				if (items) {
					console.log( items + " Type 4 answer sections result");
					for (var count = 0; count < items; count++) {	
						found = found + $('.g>div>table>tr>td>ol>li',body).eq(count).html() + ", ";
					}
				}
			}

			//TV show
			if (!found && $('._B5d',body).length>0){	
				console.log("Found tv show");
				found = $('._B5d',body).html();
				//how many
				if ( $('._Pxg',body).length>0){
					found+= ". "+$('._Pxg',body).html();
				}
				//how many
				if ( $('._tXc',body).length>0){
					found+= ". "+$('._tXc',body).html();
				}
			}
		
			//Weather
			if (!found && $('.g>.e>h3',body).length>0){
				console.log("Found weather");
				found = $('.g>.e>h3',body).html();
				//how many
				if ( $('.wob_t',body).first().length>0){
					console.log("Found weather");
					found+= " "+ $('.wob_t',body).first().html();
				}
				//how many
				if ( $('._Lbd',body).length>0){
					console.log("Found how many");
					found+= " "+ $('._Lbd',body).html();
				}
            }

            // Construct returning data
            if (found) {
                var returnData = found;
            } else {
                var returnData = "I’m sorry, I wasn't able to find an answer";
            };

            // send response back to caller
            var returnJSON = {
                code : 'sucess',
                data : returnData
            };
            res.send(returnJSON);

        })
    } else {
        // send error response back to caller
        var returnMessage = 'Search term not provided',
        returnJSON = {
            code : 'error',
            data : returnMessage
        };
        console.log('googlesearch: ' + returnMessage);
        res.send(returnJSON);
    };
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/search', googlesearch)

module.exports = skill;