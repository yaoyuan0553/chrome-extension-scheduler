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

var tableReader = {

    isAlreadyRead: false,
    allHeaders: [],
    $tableBody: $('table.datadisplaytable').children('tbody'),

    rows: [],

    init : function() {
        var self = this;

        self.initDataIndex = self.$tableBody.find('th').parent().length;
        self.$tableBody.find('th').each(function() {
            if ($(this).siblings().length < 1) {
                console.log('this is a table title');
                return;
            }
            var name = $(this).text().trim().split(" ")[0];
            self.allHeaders.push(name);
        });
    },

    startParsing : function() {
        console.log('table parsing started');
        categorizeData();
    },

    categorizeData : function() {
        var self = this;

        var style = "";
        self.$tableBody.find('tr').each(function(i, val) {
            if (i < 2) return;
            var $val = $(val);
            // check if the element is just a sub row
            if ($val.attr('style') === style) {
                var data = self.rows[self.rows.length - 1];
                $val.children('td').each(function(i, val) {
                    var textVal = $(val).text().trim().split('(')[0].trim();
                    if (textVal) {
                        data[self.allHeaders[i]].push(textVal);
                    }
                });
            }
            else {  // main row
                var newData = {};
                $val.children('td').each(function(i, val) {
                    newData[self.allHeaders[i]] = [];
                    newData[self.allHeaders[i]].push($(val).text().trim().split('(')[0].trim());
                });
                self.rows.push(newData);
            }
            style = $val.attr('style');
        });
        self.isAlreadyRead = true;
    }
}

function learnTableHeader()
{
    window.getSelection().anchorNode;
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "start") {
        //alert("started");
        console.log("message 'start' received");
        if (document.body.className === "campuspipeline") {

            //analyzeTable();
            tableReader.init();

            getInstructorName();
            selectAll();
            //copyAll();
            var selectedText = getSelectedText();
            deselectAll();
            if (!tableReader.isAlreadyRead) {
                chrome.runtime.sendMessage({ message: "saveSchedule", content: selectedText });
            }
        }
    }
});
