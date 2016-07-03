//chrome.runtime.sendMessage(document.getElementsByTagName("title")[0].innerText);
/// <reference path="typings/jquery/jquery.d.ts" />

console.log("content.js loaded");
if (!$) {
    throw "jquery not loaded";
}

function copyToClipboard(text)
{
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}

function selectAll()
{
    document.execCommand("SelectAll");
    console.log("selected!");
}

function copyAll()
{
    var selectedString = window.getSelection();
    copyToClipboard(selectedString);
}

function getSelectedText()
{
    return window.getSelection().toString();
}

function selectElementContents(el)
{
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function deselectAll()
{
    window.getSelection().removeAllRanges();
    console.log("deselected!");
}

function htmlReadingTest()
{
    var tableBody = $('.datadisplaytable').children('tbody');
    var ddheader = $('th.ddheader');
    for (var i = 0; i < ddheader.length; i++) {
        console.log(ddheader[i].innerHTML);
    }
}

function getInstructorName()
{
    var tableBody = $('.datadisplaytable').children('tbody');
    var instructorName = $($(tableBody.children('tr')[2]).children()[13]).text();
    console.log(instructorName);
}

function analyzeTable()
{
    var $tableBody = $('table.datadisplaytable').children('tbody');
    
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "start") {
        //alert("started");
        console.log("message 'start' received");
        if (document.body.className === "campuspipeline") {

            getInstructorName();
            selectAll();
            //copyAll();
            var selectedText = getSelectedText();
            deselectAll();
            chrome.runtime.sendMessage({ message: "saveSchedule", content: selectedText });
        }
    }
});
