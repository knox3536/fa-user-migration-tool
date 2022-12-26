'use strict';

var tab, scheme;
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    tab = tabs[0];
    scheme = tab.url.split('//')[0];

    function testLoginPromise(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', scheme + '//www.furaffinity.net/advertising', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200)
                    if (xhr.responseText.search('Log in</a>') === -1)
                        resolve();
                reject(xhr.status);
            }
        }
        xhr.send();
    }




    var loggedIn = false;
    new Promise(testLoginPromise).then(function() {
        
    }, function(status) {
        var id = status === 200 ? 'not-logged-in' : 'no-internet';
        document.getElementById(id).style.display = "block";
    })

});