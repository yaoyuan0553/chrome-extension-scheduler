/********* Header *********/

const EARLIEST_HOUR = 8;
const LATEST_HOUR = 9;

Array.prototype.setValueInRange = function(value, start, end)
{
    for (var i = start; i < end + 1; i++) {
        this[i] = value;
    }
}

function Time(hourString, minuteString, periodString)
{
    if (typeof hourString !== "string" || typeof minuteString !== "string"
    || typeof periodString !== "string") {
        console.log("Error! Parameters must be 'string'!");
        throw "type error";
    }
    
    var classRef = this;

    function calculateDecimalTime(hourString, minuteString, periodString)
    {
        return Number(hourString) + Number(minuteString) / 60 + 
       	    classRef.periodTable[periodString.toLocaleLowerCase()];
    }

    this.hourString = hourString;
    this.minuteString = minuteString;
    this.periodString = periodString;
    this.decimalTime = calculateDecimalTime(hourString, minuteString, periodString);
}

Time.prototype.periodTable = {
    am : 0,
    pm : 12
}

Time.prototype.getTimeInMinutes = function()
{
    let hour = Number(this.hourString);
    let minute = Number(this.minuteString);

    if (this.periodString.toLocaleLowerCase() == "pm" && this.hourString != 12)
        hour += 12;

    let timeInMinutes = (hour - EARLIEST_HOUR) * 60 + minute;
    return (timeInMinutes < 0 || timeInMinutes >= 780) ? false : timeInMinutes;
}

Time.prototype.get12HourTime = function()
{
    return this.hourString + ":" + this.minuteString + " " + this.periodString;
}

function TimeRangeInMinutes(startTime, endTime)
{
    if (typeof startTime !== "number" || typeof endTime !== "number") {
        console.log("Error! Parameter type must be 'number'");
        throw "type error";
    }

    this.startTime = startTime;
    this.endTime = endTime;
}

function TimePeriod(startTime, endTime, weekdays)
{
    if (!(startTime instanceof Time) || !(endTime instanceof Time)
        || typeof weekdays !== "string") {
        console.log("Error! Invalid Parameter type!");
        throw "type error";
    }
    
    this.startTime = startTime;
    this.endTime = endTime;
    this.weekdays = weekdays;

    this.getTimeRangeInMinutes = function()
    {
        var timeRangeInMinutes = [];
        for (var i = 0; i < this.weekdays.length; i++) {
            var start = this.startTime.getTimeInMinutes() + this.weekdayLookupTable[this.weekdays[i]];
            var end = this.endTime.getTimeInMinutes() + this.weekdayLookupTable[this.weekdays[i]];
            timeRangeInMinutes.push(new TimeRangeInMinutes(start, end));
        }
        return timeRangeInMinutes;
    }
}

TimePeriod.prototype.weekdayLookupTable = {
    M : 0,
    T : 780,
    W : 1560,
    R : 2340,
    F : 3120
}

TimePeriod.prototype.getTimePeriodString = function()
{
    let timePeriodString = this.startTime.get12HourTime() + " - " +
        this.endTime.get12HourTime() + " " + this.weekdays;
    return timePeriodString;
}


// Course class
function Course(courseIrn, courseId, courseName)
{
    // private members
    var masterObjRef = this;

    // private class 
    function Section(sectionId, instructor)
    {
        this.sectionId = sectionId;
        this.instructor = instructor;
        this.timePeriods = [];
    }

    Section.prototype.addTimePeriod = function(startTime, endTime, weekdays)
    {
        var newTimePeriod = new TimePeriod(startTime, endTime, weekdays);
        this.timePeriods.push(newTimePeriod);
    }

    Section.prototype.getTimeRangesInMinutes = function()
    {
        var timeRanges = [];
        for (var i = 0; i < this.timePeriods.length; i++) {
            timeRanges = timeRanges.concat(this.timePeriods[i].getTimeRangeInMinutes());
        }
        return timeRanges;
    }

    Section.prototype.getFullSectionName = function()
    {
        return masterObjRef.courseId + "-" + this.sectionId + " " + this.instructor;
    }

    Section.prototype.getFullCourseId = function()
    {
        return masterObjRef.courseId + "-" + this.sectionId;
    }

    Section.prototype.getCourseName = function()
    {
        return masterObjRef.courseName;
    }

    Section.prototype.getTimeString = function()
    {
        var timeString = "";
        for (var i = 0; i < this.timePeriods.length; i++) {
            timeString += this.timePeriods[i].getTimePeriodString() + "\r\n"
        }
        return timeString;
    }

    // private functions
    function convertToMinutes(hourString, minuteString, periodString)
    {
        if (typeof hourString !== "string" || typeof minuteString !== "string"
            || typeof periodString !== "string") {
            console.log("Error! Parameters must be 'string'!");
            throw "type error";
        }
        let hour = Number(hourString);
        let minute = Number(minuteString);

        if (periodString.toLocaleLowerCase() == "pm" && hourString != 12)
            hour += 12;

        let timeInMinutes = (hour - EARLIEST_HOUR) * 60 + minute;
        return (timeInMinutes < 0 || timeInMinutes >= 780) ? undefined : timeInMinutes;
    }
    
    
    // public members 
    this.courseIrn = courseIrn;
    this.courseId = courseId;
    this.courseName = courseName;
    this.sections = [];

    // public functions
    this.addNewSection = function(sectionId, instructor)
    {
        this.sections.push(new Section(sectionId, instructor));

        return this.sections[this.sections.length - 1];
    }
}

function Schedule()
{
    this.sections = [];
}

Schedule.prototype.addSection = function(section)
{
    this.sections.push(section);
}

Schedule.prototype.printSchedule = function()
{
    var scheduleString = "";
    for (var i = 0; i < this.sections.length; i++) {
        scheduleString += this.sections[i].getFullSectionName() + " :\n" + this.sections[i].getTimeString() + "\r\n";
    }
    console.log(scheduleString);
}


function ScheduleChecker()
{
    var hashTable = Array.apply(null, new Array(3900)).map(Boolean.prototype.valueOf, false);
    var sectionHolder = [];

    function isConflictInRange(start, end)
    {
        for (var i = start; i < end; i++) {
            if (hashTable[i] === true) {
                return true;
            }
        }
        return false;
    }

    this.Check = function(section) 
    {
        if (sectionHolder.length === 0)
            return "No Conflict";

        var timeRanges = section.getTimeRangesInMinutes();
        
        for (var i = 0; i < timeRanges.length; i++) {
            if (isConflictInRange(timeRanges[i].startTime, timeRanges[i].endTime))
                return "Conflict";
        }
        return "No Conflict";
    }

    this.AddSection = function(section)
    {
        sectionHolder.push(section);

        var timeRanges = section.getTimeRangesInMinutes();
        for (var i = 0; i < timeRanges.length; i++) {
            hashTable.setValueInRange(true, timeRanges[i].startTime, timeRanges[i].endTime);
        }
    }

    this.PopLast = function ()
    {
        var last = sectionHolder.pop();

        var timeRanges = last.getTimeRangesInMinutes();
        for (var i = 0; i < timeRanges.length; i++) {
            hashTable.setValueInRange(false, timeRanges[i].startTime, timeRanges[i].endTime);
        }
    }
}

function ScheduleContents()
{
    var classRef = this;

    this.scheduleChecker = new ScheduleChecker();
    this.completeSchedules = [];
    this.courses = [];

    this.addNewCourse = function(courseIrn, courseId, courseName)
    {
        this.courses.push(new Course(courseIrn, courseId, courseName));
        return this.courses[this.courses.length - 1];
    }

    function makeSchedule(schedule, depth)
    {
        if (depth === classRef.courses.length) {
            classRef.completeSchedules.push(schedule);
            return;
        }

        var size = classRef.courses[depth].sections.length;
        for (var i = 0; i < size; i++)
        {
            if (classRef.scheduleChecker.Check(classRef.courses[depth].sections[i]) === "No Conflict") {
                classRef.scheduleChecker.AddSection(classRef.courses[depth].sections[i]);
                var tmp = $.extend(true, new Schedule, schedule);
                tmp.addSection(classRef.courses[depth].sections[i]);

                makeSchedule(tmp, depth + 1);

                classRef.scheduleChecker.PopLast();
            }
        }
    }

    this.initMakeSchedule = function()
    {
        var schedule = new Schedule();
        makeSchedule(schedule, 0);
    }

    this.printAllSchedule = function()
    {
        for (var i = 0; i < this.completeSchedules.length; i++) {
            console.log("Schedule %d", i + 1);
            this.completeSchedules[i].printSchedule();
        }
    }
}

