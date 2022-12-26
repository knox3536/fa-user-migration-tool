function setUpDeclarative() {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [ 
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostSuffix: "furaffinity.net" }
            }) 
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
    }]);
}

function startWatchImport(watchList, nav, trackFunc) {
    var viewUserPage = function(currUser) {
        var url = 'www.furaffinity.net/user/' + watchList[currUser] + '/';
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                var id = xhr.responseText.match(/key=([0-9a-f]*)/)[0];
                followUser(currUser, id, trackFunc);
            }
        });
    };
    var followUser = function(currUser, id) {
        var url = 'www.furaffinity.net/watch/' + watchList[currUser] + '/?' + id;
        nav._fetch(url, 'GET', function(xhr) {
            if (xhr.status === 200) {
                if (trackFunc) trackFunc(currUser++);
                if (currUser !== watchList.length) viewUserPage(currUser, trackFunc);
            }
        });
    }
    viewUserPage(0);
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, setUpDeclarative);
});