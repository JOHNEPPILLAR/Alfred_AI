/**
 * Setup includes
 */
const Skills = require('restify-router').Router;
const alfredHelper = require('../../lib/helper.js');
const $ = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const xray = require('x-ray')();
const sanitizeHtml = require('sanitize-html');
const logger = require('winston');

const skill = new Skills();
const entities = new Entities();

/**
 * @api {get} /search Display Google search results
 * @apiName search
 * @apiGroup Search
 *
 * @apiParam {String} search_term search term
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTPS/1.1 200 OK
 *   {
 *     success: 'true'
 *     data: google search results
 *   }
 *
 * @apiErrorExample {json} Error-Response:
 *   HTTPS/1.1 500 Internal server error
 *   {
 *     data: Error message
 *   }
 *
 */
async function googlesearch(req, res, next) {
  logger.info('Search API called');
  let returnData;

  // Get the search term
  let searchTerm = '';
  if (typeof req.query.search_term !== 'undefined' && req.query.search_term !== null) {
    searchTerm = req.query.search_term;
    const url = `http://www.google.co.uk/search?q=${searchTerm}&oe=utf8&hl=en-GB`;

    try {
      const apiData = await alfredHelper.requestAPIdata(url);
      const { body } = apiData; // Get the search results data

      // result variable init
      let found = 0;
      if (!found) {
        // how many
        const items = $('._m3b', body).get().length; // find how many lines there are in answer table
        if (items) {
          found = ''; // $('._eGc',body).html();
          for (let count = 0; count < items; count += 1) {
            found = `${found + $('._m3b', body).eq(count).html()}, `;
          }
        }
      }

      // name list
      if (!found && $('#_vBb', body).length > 0) {
        found = $('#_vBb', body).html();
      }

      // facts 1
      if (!found && $('._tXc>span', body).length > 0) {
        found = $('._tXc>span', body).html();
        found = sanitizeHtml(found, {
          allowedTags: [],
          allowedAttributes: [],
          nonTextTags: ['a'],
        });
      }

      // facts 2
      if (!found && $('._sPg', body).length > 0) {
        found = ` ${$('._sPg', body).html()}`;
      }

      // instant + description 1
      if (!found && $('._Oqb', body).length > 0) {
        found = $('._Oqb', body).html();

        // how many 1
        if ($('._Mqb', body).length > 0) {
          found += ` ${$('._Mqb', body).html()}`;
        }
      }

      // instant + description 2
      if (!found && $('._o0d', body).length > 0) {
        const tablehtml = $('._o0d', body).html();
        let title = '';
        let htmlcontent = '';

        // get title
        xray(tablehtml, 'b')((conversionError, html) => {
          title = `${html}.`;
        });

        // Get content
        xray(tablehtml, ['li'])((conversionError, html) => {
          htmlcontent = html;
        });

        let content = '';
        htmlcontent.forEach((value) => {
          content = `${content} ${value}`;
        });
        found = title + content;
      }

      // Time, Date
      if (!found && $('._rkc._Peb', body).length > 0) {
        found = $('._rkc._Peb', body).html();
      }

      // Maths
      if (!found && $('.nobr>.r', body).length > 0) {
        found = $('.nobr>.r', body).html();
      }

      // simple answer
      if (!found && $('.obcontainer', body).length > 0) {
        found = $('.obcontainer', body).html();
      }

      // Definition
      if (!found && $('.r>div>span', body).first().length > 0) {
        found = `${$('.r>div>span', body).first().html()} definition. `;
        // how many
        const items = $('.g>div>table>tr>td>ol>li', body).get().length; // find how many lines there are in answer table
        if (items) {
          for (let count = 0; count < items; count += 1) {
            found = `${found + $('.g>div>table>tr>td>ol>li', body).eq(count).html()}, `;
          }
        }
      }

      // TV show
      if (!found && $('._B5d', body).length > 0) {
        found = $('._B5d', body).html();
        // how many
        if ($('._Pxg', body).length > 0) {
          found += `. ${$('._Pxg', body).html()}`;
        }
        // how many
        if ($('._tXc', body).length > 0) {
          found += `. ${$('._tXc', body).html()}`;
        }
      }

      // Weather
      if (!found && $('.g>.e>h3', body).length > 0) {
        found = $('.g>.e>h3', body).html();
        // how many
        if ($('.wob_t', body).first().length > 0) {
          found += ` ${$('.wob_t', body).first().html()}`;
        }
        // how many
        if ($('._Lbd', body).length > 0) {
          found += ` ${$('._Lbd', body).html()}`;
        }
      }

      // Construct returning data
      if (found) {
        found = entities.decode(found);
        found = sanitizeHtml(found, {
          allowedTags: ['<b>'],
          allowedAttributes: [],
        });
        returnData = found;
      } else {
        returnData = "I’m sorry, I wasn't able to find a specific answer for you.";
      }

      // Send response back to caller
      alfredHelper.sendResponse(res, true, returnData);
    } catch (err) {
      logger.error(`googlesearch: ${err}`);
      alfredHelper.sendResponse(res, null, err); // Send response back to caller
      next();
    }
  } else {
    logger.info('googlesearch: No search term param');
    alfredHelper.sendResponse(res, false, 'No search term param'); // Send response back to caller
    next();
  }
}
skill.get('/search', googlesearch);

module.exports = skill;
