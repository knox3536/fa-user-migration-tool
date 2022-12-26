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

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, setUpDeclarative);
});