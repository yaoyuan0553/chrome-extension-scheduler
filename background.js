/*chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    alert(response);
}) */

//var itemToStore = "hello i'm stored!";
//localStorage.setItem("message", itemToStore);

var allContents = [];

function parseSelect(str) {
    //alert(selectAll());

    //var str = document.getElementById("test1").innerText;
    var parser = /SR\s?(\d*)\s?([A-Z]*)\W?(\d{3})\W?(\d{3})\W?[A-Z]{2}\s?\d?\W*([A-Z-&(\s{0,1})]*)\W\n?\S*\s*(\w*)\s?(\d*):(\d*)\s?(\w*)-(\d*):(\d*)\s?(\w*)\s?(?:\S{1,3}\s)*([A-Za-z.,\s\(\)]*)(\d*\/\d*-\d*\/\d*)/g;


    //alert(s);

    //console.log(str);
    //str=str.substring(str.indexOf("Select"));

    //console.log("test");
    var ls = [];

    while (true) {
        var lines = parser.exec(str);
        if (lines != null) {
            ls.push(lines);
        } else {
            break;
        }
    }

    var ws1 = [];
    var ss = [];
    for (i in ls) {

        var currentLine = ls[i];
        console.log(currentLine);
        for (var j = 0; j < ls[i].length; j++)
            console.log(j + ". " + currentLine[j] + '\n');
        /*for (var j = 0 ; j < currentLine[6].length; j++) {
            var time1 = new Time(currentLine[7], currentLine[8], currentLine[9])
            var time2 = new Time(currentLine[10], currentLine[11], currentLine[12])
            var tr = new TimeRange(time1, time2);
            var time_ranges = [tr];
            var wd = new WeekDay(currentLine[6][j], time_ranges);
            ws1.push(wd);
        }
        var str = new Section(currentLine[4], ws1);
        ss.push(str);*/
    }

    //var c1 = new Course(ls[0][2] + " " + ls[0][3], ss);
    //console.log(c1);
    return "test";

    //alert(str);
    //str.split("/\n/");
    //var lines = s.match(/SR\s?(\d*)\s?([A-Z]*)\W?(\d{3})\W?(\d{3})\W?[A-Z]{2}\s?\d?\W*([A-Z-&(\s{0,1})]*)\W\n?\S*\s*(\w*)/g);
    //var lines = s.match(parser);
    //alert(lines);
    //alert();

    // clipboard section
}

var test = "SR	22889	CSCE	121	513	CS	4	INTRO PGM DESIGN CONCEPT" +
    "(Restrictions/Details)	MW	08:00 am-08:50 am	90	55	35	John M. Moore	08/29-12/14	ETB 2005"

parseSelect(test);

function combineUnparsedString()
{
    var combinedString = "";
    for (var i = 0; i < allContents.length; i++) {
        combinedString += allContents[i] + "\n";
    }

    return combinedString;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "generateSchedule") {
        console.log("generate received");

        generateSchedule();

        var combinedString = combineUnparsedString();

        chrome.tabs.create({ "url": chrome.extension.getURL("summaryPage.html") });

        console.log(combinedString);
        //chrome.runtime.sendMessage({ message: "displaySchedules", content: combinedString });
    }
    else if (request.message === "saveSchedule") {
        console.log(request.content);
        allContents.push(request.content);
    }
});
