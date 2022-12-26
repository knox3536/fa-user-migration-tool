'use strict';

var tab, scheme, readableUsername, urlUsername, beta;
var watchList;
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


// Handlers
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
        }
        else {
            nav._toggle("watchlist-import-complete", true);
            nav._toggle('watchlist-import-in-progress', false);
        }
    };
    nav._toggle('watchlist-import-in-progress', true);
    nav._toggle('watchlist-import-link-instructions', false);
    viewUserPage(0, updateProgress);
};




// Register event handlers
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        var handlers = {
            "mm-to-watch1": ["click", nav.main_watchlistImport],
            "watch1-to-mm": ["click", nav.main_watchlistImport],
            "watchlist-import-confirm": ["click", nav.watchlistGetWatchLink],
            "watchlist-import-button": ["click", nav.watchlistConfirmButton]
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