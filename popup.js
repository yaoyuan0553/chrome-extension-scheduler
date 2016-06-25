var loadButton = document.getElementById("loadButton");

if (loadButton == null) {
    console.log("loadButton failed");
}

loadButton.addEventListener("click", function() {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "start" });
        console.log("query success");
    });
    //chrome.runtime.sendMessage("message sent by popup.js");
    //chrome.tabs.create({ "url": chrome.extension.getURL("summaryPage.html") });
});

var generateButton = document.getElementById("generateButton");

if (generateButton == null)
    console.log("generateButton failed");

generateButton.addEventListener("click", function() {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.runtime.sendMessage({ "message": "generateSchedule" });
        console.log("query success");
    });
});