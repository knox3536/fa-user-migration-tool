'use strict';

var tab, scheme, readableUsername, urlUsername, beta;
var watchList, favoriteList, currFaves = [];
var nav = {};

// Utilities
nav._toggle = function(ids, forceDisplay) {
    if (Object.prototype.toString.call(ids) === '[object String]') ids = [ids];
    for (var i = 0; i < ids.length; i++) {
        var dom = document.getElementById(ids[i]);
        var old = dom.style.display;
        var on = forceDisplay !== undefined ? forceDisplay : old === 'none'; 
        dom.style.display = on ? 'block' : 'none';
    }
};

nav._fetch = function(url, action, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(action.toUpperCase(), scheme + '//' + url, true);
    xhr.onreadystatechange = function() { 
        if (xhr.readyState === 4) callback(xhr);
    }
    xhr.send();
};

nav._elem = function(id) { return document.getElementById(id); };


// Handlers for watchlist
nav.main_watchlistImport = function() { 
    nav._toggle(["main-menu", "watchlist-import-section"]);
    nav._elem("curr-user").value = urlUsername;
};

nav.watchlistGetWatchLink = function() {
    var user = nav._elem("old-user").value;

    if (!user || !user.length) return;
    collectWatches(user).then(function(watchers) {
        nav._toggle("watchlist-import-link-instructions", true);
        nav._elem("number-of-watchers").innerText = watchers.length;
        nav._elem("old-user-confirm").innerText = user;
        nav._elem("new-user-confirm").innerText = urlUsername;
        watchList = watchers;
    }, function(err) {});
};

nav.watchlistConfirmButton = function() {
    var total = watchList.length;
    var updateProgress = function(curr) {
        if (curr !== total) {
            var percent = (curr / total * 100).toFixed(2);
            nav._elem("watchlist-import-progress").innerText = percent;
            nav._elem("watchlist-import-count").innerText = curr;
        }
        else {
            nav._toggle("watchlist-import-complete", true);
            nav._toggle('watchlist-import-in-progress', false);
        }
    };
    nav._elem("watchlist-import-total").innerText = total;
    nav._elem('old-user').disabled = true;
    nav._elem('watchlist-import-confirm').disabled = true;
    nav._toggle('watchlist-import-in-progress', true);
    nav._toggle('watchlist-import-link-instructions', false);
    viewUserPage(0, updateProgress);
};

nav.main_submissionsImport = function() {
    nav._toggle(["main-menu", "submissions-import-section"]);
    nav._elem("curr-user-subs").value = urlUsername;
};

nav.submissionsGetSubmissionLinks = function() {
    var user = nav._elem("old-user-subs").value;
    if (!user || !user.length) return;

    var button = nav._elem("submissions-import-confirm")
    button.value = "Please wait...";
    button.disabled = true;

    collectSubmissions(user, "gallery").then(function(subs) {
        nav._toggle("submissions-import-link-instructions", true);
        nav._elem("number-of-subs").innerText = subs.length;
        nav._elem("old-user-subs-confirm").innerText = user;
        nav._elem("new-user-subs-confirm").innerText = urlUsername;

        button.value = "Make change";
        button.disabled = false;
    });
};

nav.main_favoritesImport = function() {
    nav._toggle(["main-menu", "favorites-import-section"]);
    nav._elem("curr-user-favs").value = urlUsername;
};

nav.askAboutNewFaves = function() {
    nav._toggle("favorites-save-new-faves");
    nav._toggle("favorites-import-confirm");
    nav._elem("ask-new-faves-user").innerText = nav._elem("curr-user-favs").value;
    nav._toggle("favorites-import-form-confirm");
};

nav.saveNewFavoritesButton = function() {
    var user = nav._elem("curr-user-favs").value;
    if (!user || !user.length) return;

    var button = nav._elem("favorites-save-new-faves-confirm");
    button.value = "Please wait...";
    button.disabled = true;
    nav._elem("favorites-import-confirm").disabled = true;

    collectFavorites(user, "favorites").then(function(favs) {
        currFaves = favs;

        viewImage(currFaves.length - 1, function(curr) {
            if (curr === 0) {
                nav._toggle("new-faves-complete", true);
                nav._elem("favorites-save-new-faves-confirm").value = "Done!";
                nav._elem("favorites-import-confirm").disabled = false;
            }
        });
    });
};

nav.favoritesGetFavoriteLinks = function() {
    var user = nav._elem("old-user-favs").value;
    if (!user || !user.length) return;

    var button = nav._elem("favorites-import-confirm");
    button.value = "Please wait...";
    button.disabled = true;

    nav._toggle("favorites-save-new-faves", false);
    nav._toggle("new-faves-complete", false);

    collectFavorites(user, "favorites").then(function(favs) {
        favoriteList = currFaves.concat(favs);

        nav._toggle("favorites-import-link-instructions", true);
        nav._elem("number-of-favs").innerText = favoriteList.length;
        nav._elem("old-user-favs-confirm").innerText = user;
        nav._elem("new-user-favs-confirm").innerText = urlUsername;

        button.value = "Make change";
        button.disabled = false;
    });
};

nav.favoritesConfirmButton = function() {
    var total = favoriteList.length;
    var updateProgress = function(curr) {
        if (curr !== 0) {
            var current = favoriteList.length - curr;
            var percent = (current / total * 100).toFixed(2);
            nav._elem("favorites-import-progress").innerText = percent;
            nav._elem("favorites-import-count").innerText = current;
        }
        else {
            nav._toggle("favorites-import-complete", true);
            nav._toggle('favorites-import-in-progress', false);
        }
    };
    nav._elem("favorites-import-total").innerText = total;
    nav._elem('old-user').disabled = true;
    nav._elem('favorites-import-confirm').disabled = true;
    nav._toggle('favorites-import-in-progress', true);
    nav._toggle('favorites-import-link-instructions', false);
    viewImage(favoriteList.length - 1, updateProgress);
};




// Register event handlers
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        var handlers = {
            "mm-to-watch1": ["click", nav.main_watchlistImport],
            "watch1-to-mm": ["click", nav.main_watchlistImport],
            "watchlist-import-confirm": ["click", nav.watchlistGetWatchLink],
            "watchlist-import-button": ["click", nav.watchlistConfirmButton],
            "mm-to-sub1": ["click", nav.main_submissionsImport], 
            "sub1-to-mm": ["click", nav.main_submissionsImport],
            "submissions-import-confirm": ["click", nav.submissionsGetSubmissionLinks],
            "mm-to-fav1": ["click", nav.main_favoritesImport], 
            "fav1-to-mm": ["click", nav.main_favoritesImport],
            "favorites-import-form-confirm": ["click", nav.askAboutNewFaves],
            "favorites-save-new-faves-confirm": ["click", nav.saveNewFavoritesButton],
            "favorites-import-confirm": ["click", nav.favoritesGetFavoriteLinks],
            "favorites-import-button": ["click", nav.favoritesConfirmButton]
        };

        Object.keys(handlers).forEach(function(id) {
            var arr = handlers[id];
            var elem = nav._elem(id);
            elem.addEventListener(arr[0], arr[1]);
        });
    });
})();

// Bootstrap
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tab = tabs[0];
    scheme = tab.url.split('//')[0];

    function testLoginPromise(resolve, reject) {
        nav._fetch('www.furaffinity.net/advertising', 'GET', function(xhr) {
            if (xhr.status === 200)
                if (xhr.responseText.search('Log in</a>') === -1) {
                    //beta = xhr.responseText.indexOf("hideon") > 0;
                    var userPattern = /" href="\/user\/([^\/]+)\/">"?.([^<]+)/;
                    resolve(xhr.responseText.match(userPattern));
                }
            reject(xhr.status);
        });
    }

    var loggedIn = false;
    new Promise(testLoginPromise).then(function(userHtmlMatch) {
        urlUsername = userHtmlMatch[1];
        readableUsername = userHtmlMatch[2];
        var disabledButtons = document.getElementsByClassName("main-menu-button");
        for (var i = 0; i < disabledButtons.length; i++) {
            disabledButtons[i].disabled = false;
        }
    }, function(status) {
        var id = status === 200 ? 'not-logged-in' : 'no-internet';
        nav._toggle([id, "general-overview", "welcome"]);
    })
});