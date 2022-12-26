// Watchlist
function scrapeWatchList(doc) {
    var result = [];
    var scrape = doc.getElementsByTagName("a");

    for (var i = 0; i < scrape.length; i++) {
        if (scrape.item(i).target === "_blank") {
            var f = scrape[i].attributes.href.nodeValue.split('/');
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
    if (watchList[currUser] !== undefined) {
        var url = 'www.furaffinity.net/watch/' + watchList[currUser] + '/?' + id;
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                trackFunc(currUser++)
                if (currUser !== watchList.length) viewUserPage(currUser, trackFunc);
            }
        });
    }
}







// Submissions
function scrapeSubmissions(doc) {
    var result = [];
    var gallery = doc.getElementsByClassName("gallery")[0];
    var scrape = gallery.getElementsByTagName("figure");
    if (scrape.length)
        for (var i = 0; i < scrape.length; i++) {
            var f = scrape[i].attributes.id.nodeValue.split('-');
            result.push(f[1]);
        };

    return result;
}

function getGalleryPromise(url, parser) {
    return new Promise(function(resolve, reject) {
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                var doc = parser.parseFromString(xhr.responseText, "text/html");
                var scrape = scrapeSubmissions(doc);
                resolve([scrape, !!scrape.length]);
            }
            else reject(xhr.status);
        });
    });
}

function collectSubmissions(user, section) {
    return new Promise(function(resolve, reject) {
        var more = false;
        var subs = [];
        var parser = new DOMParser();
        var pageID = 1;
        var url = function() { 
            return "www.furaffinity.net/" + section + "/" + user + "/" + pageID++ + "?perpage=72"; 
        }

        var getSubmissionPages = function() {
            getGalleryPromise(url(), parser).then(function(result) {
                if (result[1]) {
                    subs = subs.concat(result[0]);
                    getSubmissionPages();
                }
                else resolve(subs);

            }, function(status) {
                reject(status);
            });
        };
        getSubmissionPages();
    });
}





// Favorites
function scrapeFavorites(doc) {
    var result = [];
    var gallery = doc.getElementById("gallery-favorites");
    if (gallery) {
        var scrape = gallery.getElementsByTagName("figure");

        if (scrape.length) {
            for (var i = 0; i < scrape.length; i++) {
                var f = scrape[i].attributes.id.nodeValue.split('-');
                result.push(f[1]);
            };
        }
    }
    return result;
}

function getFavoritesGalleryPromise(url, parser) {
    return new Promise(function(resolve, reject) {
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                var doc = parser.parseFromString(xhr.responseText, "text/html");
                var scrape = scrapeFavorites(doc);
                resolve([scrape, !!scrape.length]);
            }
            else reject(xhr.status);
        });
    });
}

function collectFavorites(user, section) {
    return new Promise(function(resolve, reject) {
        var more = false;
        var favs = [];
        var parser = new DOMParser();
        var pageID = 1;
        var url = function() { 
            return "www.furaffinity.net/" + section + "/" + user + "/" + pageID++;  
        }

        var getFavoritesPages = function() {
            getFavoritesGalleryPromise(url(), parser).then(function(result) {
                if (result[1]) {
                    favs = favs.concat(result[0]);
                    getFavoritesPages();
                }
                else resolve(favs);

            }, function(status) {
                reject(status);
            });
        };
        getFavoritesPages();
    });
}

function viewImage(currFav, trackFunc, retry) {
    var faves = favoriteList || currFaves;
    if (currFav >= 0) {
        var url = 'www.furaffinity.net/view/' + faves[currFav] + '/';
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                var matches = xhr.responseText.match(/key=([0-9a-f]*)/);
                if (matches) { 
                    var id = matches[0];
                    faveImage(currFav, id, trackFunc);
                }
                else viewImage(--currFav, trackFunc);
            }
            else if (!retry) viewImage(currFav, trackFunc, true);
            else viewImage(--currFav, trackFunc);
        });
    }
}
function faveImage(currFav, id, trackFunc, retry) {
    var faves = favoriteList || currFaves;
    if (faves[currFav] !== undefined) {
        var url = 'www.furaffinity.net/fav/' + faves[currFav] + '/?' + id;
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) trackFunc(currFav);
            else if (!retry) faveImage(currFav, id, trackFunc, true);

            if (--currFav >= 0) {
                viewImage(currFav, trackFunc);
            }
        });
    }
}