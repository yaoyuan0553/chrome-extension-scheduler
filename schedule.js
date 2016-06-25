/// <reference path="typings/jquery/jquery.d.ts" />

var parsedArray = ["SR	22889	CSCE	121	513	CS	4	INTRO PGM DESIGN CONCEPT(Restrictions/Details)	MW	08:00 am-08:50 am	90	55	35	John M. Moore	08/29-12/14", "22889", "CSCE", "121", "513", "INTRO PGM DESIGN CONCEPT", "MW", "08", "00", "am", "08", "50", "am", "John M. Moore	", "08/29-12/14"];

window.scheduleContents;

function generateSchedule()
{
    
    scheduleContents = new ScheduleContents();
    // chrome.storage.local.set({scheduleContents: scheduleContents}, function() {
    //     console.log('local save successful');
    //     console.log(scheduleContents);
    // });
    /* course 1 */
    var c1 = scheduleContents.addNewCourse("21482", "CSCE 313", "Operating Systems");

    var startTime1 = new Time("09", "10", "am");
    var endTime1 = new Time("10", "00", "am");
    var weekdays1 = "WMF";

    var startTime2 = new Time("03", "00", "pm");
    var endTime2 = new Time("03", "50", "pm");
    var weekdays2 = "TR";

    var s1 = c1.addNewSection("200", "Dmitri Loguinov");
    s1.addTimePeriod(startTime1, endTime1, weekdays1);
    s1.addTimePeriod(startTime2, endTime2, weekdays2);

    // section 2
    var s2 = c1.addNewSection("501", "Tyagi");
    var startTime3 = new Time("01", "30", "pm");
    var endTime3 = new Time("02", "20", "pm");
    var weekdays3 = "WMF";

    s2.addTimePeriod(startTime3, endTime3, weekdays3);


    /* course 2 */

    var c2 = scheduleContents.addNewCourse("23321", "ECEN 314", "Signals");

    var startTime4 = new Time("08", "00", "am");
    var endTime4 = new Time("08", "50", "am");
    var weekdays4 = "MWF";

    // section 1
    var s3 = c2.addNewSection("501", "Miller");
    s3.addTimePeriod(startTime4, endTime4, weekdays4);

    // section 2
    var startTime5 = new Time("02", "50", "pm");
    var endTime5 = new Time("04", "05", "pm");
    var weekdays5 = "TR";

    var s4 = c2.addNewSection("502", "Scott");
    s4.addTimePeriod(startTime5, endTime5, weekdays5);

    // var ScheduleContent = {
    //     scheduleChecker: scheduleChecker,
    //     completeSchedules: completeSchedules,
    //     courses: courses
    // }

    scheduleContents.initMakeSchedule();

    scheduleContents.printAllSchedule();
}