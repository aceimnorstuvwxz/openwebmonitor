var cheerio = require('cheerio')
var url = require('url')

function extractLinks(pageUrl, pageHtml) {
    var $ = cheerio.load(pageHtml)
    var links = {}
    var parsedUrl = url.parse(pageUrl)

    $('a').each(function (i, el) {
        var absoluteUrl = normalizeLink(parsedUrl, $(el).attr('href')),
            link = {}

        link.text = $(el).text().trim() //trim来修复看不见的空格导致的莫名其妙的长度
        link.link = absoluteUrl
        links[link.link + link.text] = link
    })

    return links
}

function normalizeLink(parsedUrl, scrapedHref) {
    if (!scrapedHref || !parsedUrl) return null
    if (scrapedHref.indexOf('javascript:') === 0) return null
    if (scrapedHref.indexOf('#') === 0) return null

    scrapedHref = scrapedHref.split('#')[0] //remove #

    var scrapedUrl = url.parse(scrapedHref)
    if (scrapedUrl.host != null) return scrapedHref
    if (scrapedHref.indexOf('//') === 0) return parsedUrl.protocol + scrapedHref
    if (scrapedHref.indexOf('/') === 0) return parsedUrl.protocol + '//' + parsedUrl.host + scrapedHref
    if (scrapedHref.indexOf('(') > 0 && scrapedHref.indexOf(')') > 0) return null

    var pos = parsedUrl.href.lastIndexOf('/')
    if (pos >= 0) {
        var surl = parsedUrl.href.substring(0, pos + 1)
        return surl + scrapedHref
    } else {
        return parsedUrl.href + '/' + scrapedHref
    }
}

exports.get_links = extractLinks