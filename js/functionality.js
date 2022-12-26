function scrapeWatchList(doc) {
    var result = [];
    var scrape = doc.getElementsByTagName("a");

    for (var i = 0; i < scrape.length; i++) {
        if (scrape.item(i).target === "_blank") {
            var f = scrape[i].href.split('/');
            result.push(f[f.length - 2]);
        }
    };

    return result;
}

function getWatchPagePromise(url, parser) {
    return new Promise(function(resolve, reject) {
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                var doc = parser.parseFromString(xhr.responseText, "text/html");
                var scrape = scrapeWatchList(doc);
                resolve([scrape, !!scrape.length]);
            }
            else reject(xhr.status);
        });
    });
}

function collectWatches(user) {
    return new Promise(function(resolve, reject) {
        var more = false;
        var watchers = [];
        var parser = new DOMParser();
        var pageID = 1;
        var url = function() { return "www.furaffinity.net/watchlist/by/" + user + "/" + pageID++; }

        var getWatchPages = function() {
            getWatchPagePromise(url(), parser).then(function(result) {
                if (result[1]) {
                    watchers = watchers.concat(result[0]);
                    if (result[0].length === 200) getWatchPages();
                    else resolve(watchers);
                }
                else resolve(watchers);

            }, function(status) {
                reject(status);
            });
        }
        getWatchPages();
    });
}

function viewUserPage(currUser, trackFunc) {
    var url = 'www.furaffinity.net/user/' + watchList[currUser] + '/';
    nav._fetch(url, 'GET', function(xhr) {
        if (xhr.status === 200) {
            var id = xhr.responseText.match(/key=([0-9a-f]*)/)[0];
            followUser(currUser, id, trackFunc);
        }
    });
}
function followUser(currUser, id, trackFunc) {
    var url = 'www.furaffinity.net/watch/' + watchList[currUser] + '/?' + id;
    nav._fetch(url, 'GET', function(xhr) {
        if (xhr.status === 200) {
            trackFunc(currUser++)
            if (currUser !== watchList.length) viewUserPage(currUser, trackFunc);
        }
    });
}