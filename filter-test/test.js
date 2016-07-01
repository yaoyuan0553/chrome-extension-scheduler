/// <reference path="typings/jquery/jquery.d.ts" />

$(document).ready(function($) {
    //open/close lateral filter
	$('.cd-filter-trigger').on('click', function(){
		triggerFilter(true);
	});
	$('.cd-filter .cd-close').on('click', function(){
		triggerFilter(false);
	});

	function triggerFilter($bool) {
		var elementsToTrigger = $([$('.cd-filter-trigger'), $('.cd-filter'), $('.cd-tab-filter'), $('.cd-gallery')]);
		elementsToTrigger.each(function(){
			$(this).toggleClass('filter-is-visible', $bool);
		});
	}

	$('.cd-tab-filter li').on('click', function(event){
		//detect which tab filter item was selected
		var selected_filter = $(event.target).data('type');
		
		//add class selected to the selected filter item
		$('.cd-tab-filter .selected').removeClass('selected');
		$(event.target).addClass('selected');
	});

    //close filter dropdown inside lateral .cd-filter 
	$('.cd-filter-block h4').on('click', function(){
		$(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
	})

	//fix lateral filter and gallery on scrolling
	$(window).on('scroll', function(){
		(!window.requestAnimationFrame) ? fixGallery() : window.requestAnimationFrame(fixGallery);
	});

	function fixGallery() {
		var offsetTop = $('.cd-main-content').offset().top,
			scrollTop = $(window).scrollTop();
		( scrollTop >= offsetTop ) ? $('.cd-main-content').addClass('is-fixed') : $('.cd-main-content').removeClass('is-fixed');
	}

	function parseFilter() {

	}
});

var allColors = ["blue", "purple", "navy", "green", "red", "orange", "maroon"];
var weekdayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var schooldayCount = 5;

/* html generation  */
/* --------------- */

function generateRandomUniqueColorSet(count)   // including start and end
{
    var uniqueColorSet = [];
    var localColors = $.extend(true, [], allColors);
    if (localColors.length < count) {
        throw "we've run out of colors, add more colors!";
    }
    for (var i = 0; i < count; i++)
    {
        var index = Math.floor(Math.random() * localColors.length);
        uniqueColorSet.push(localColors[index]);

        localColors.splice(index, 1);
    }
    return uniqueColorSet;
}

function setCenter()
{
    var centeredWidth = $('.centered').width() / 2,
        centeredHeight = $('.centered').height() / 2;
    $('.centered').css({'margin-left' : -centeredWidth, 'margin-top' : -centeredHeight});
}

function createTable()
{
    var $newTable = $('<table />', {
        'class' : 'animate-fadein',
        'border' : '0',
        'cellpadding' : '0',
        'cellspacing' : '0'
    });
    $(".tab.centered").append($newTable);
    $newTable.append($('<tr />', {
        'class' : 'days'
    }));
    $newTable.children().children().append($('<th />'));
    for (var i = 0; i < schooldayCount; i++) {
        $newTable.children().children().append($('<th />', {
            'text' : weekdayName[i]
        }));
    }
    for (var i = EARLIEST_HOUR; i < LATEST_HOUR + 12; i++) {
        $newTable.append($('<tr />'));
        $newTable.children().children().last().append($('<td />', {
            'class' : 'time',
            'text' : String(i) + ':00'
        }));
        for (var j = 0; j < schooldayCount - 1; j++) {
            $newTable.children().children().last().append($('<td />'));
        }
        $newTable.children().children().last().append($('<td />', {
            'text' : '-'
        }));
    }
}

function clearTable()
{
    $('div.tab.centered').children().remove();
    createTable();
}

function displayHeader(index)
{
    $('div.tab.centered').prepend($('<h1 />', {
        text : 'Schedule ' + String(index + 1)
    }));
}

function createPager(count)
{
    var $pager = $('<ul />', {'class' : 'pagination modal-1'});
    $pager.append('<li><a href="#" class="prev">&laquo</a></li>');
    for (var i = 0; i < count; i++) {
        $pager.append('<li> <a href="#">' + String(i+1) + '</a></li>');
    }
    $pager.append('<li><a href="#" class="next">&raquo;</a></li>');
    $pager.children().eq(1).children().attr('class', 'active');
    $('section').append($pager);

    $('.pagination li').on('click', function(event){
        if ($(event.target).attr('class') === 'prev') {
            if (index !== 0) {
                clearTable();
                displaySchedule(--index);
                displayHeader(index);
                var $prev = $('a.active').parent().prev().children();
                $('a.active').removeClass('active');
                $prev.addClass('active');
            }
        }
        else if ($(event.target).attr('class') === 'next') {
            if (index < scheduleCount - 1) {
                clearTable();
                displaySchedule(++index);
                displayHeader(index);
                var $next = $('a.active').parent().next().children();
                $('a.active').removeClass('active');
                $next.addClass('active');
            }
        }
        else {
            index = Number($(event.target).text()) - 1;
            clearTable();
            displaySchedule(index);
            displayHeader(index);
            $('a.active').removeClass('active');
            $(event.target).addClass('active');
        }
    });
}


function TableCoordinate(timeIndex, weekdayIndex)
{
    if (typeof timeIndex !== "number" || typeof weekdayIndex !== "number") {
        throw "type error";
    }

    this.timeIndex = timeIndex;
    this.weekdayIndex = weekdayIndex;
}
TableCoordinate.prototype.weekdayIndexLookupTable = {
    M: 1, T: 2, W: 3, R: 4, F: 5
}

function getCoordinateForTimePeriod(timePeriod)
{
    var coordinates = [];
    for (var i = 0; i < timePeriod.weekdays.length; i++) {
        
        var timeIndex = Math.round(timePeriod.startTime.decimalTime - 0.01) - EARLIEST_HOUR + 1;
        var endTimeIndex = Math.round(timePeriod.endTime.decimalTime) - EARLIEST_HOUR + 1;
        
        for (; timeIndex < endTimeIndex; timeIndex++) {
            coordinates.push(new TableCoordinate(timeIndex, 
                TableCoordinate.prototype.weekdayIndexLookupTable[timePeriod.weekdays[i]]));
        }
    }
    return coordinates;
}

function generateCoordinates(section)
{
    var coordinates = [];
    var timePeriods = section.timePeriods;
    for (var i = 0; i < timePeriods.length; i++) {
        coordinates = coordinates.concat(getCoordinateForTimePeriod(timePeriods[i]));
    }
    return coordinates;
}

function insertCourse(section, color, coordinates)
{
    var timeArray = document.getElementsByTagName('tr');

    for (var i = 0; i < coordinates.length; i++) {
        var weekdayArray = timeArray[coordinates[i].timeIndex].children;
        weekdayArray[coordinates[i].weekdayIndex].innerText = section.getFullCourseId();
        weekdayArray[coordinates[i].weekdayIndex].setAttribute("class", "course");
        weekdayArray[coordinates[i].weekdayIndex].setAttribute("color", color);
        weekdayArray[coordinates[i].weekdayIndex].setAttribute("data-tooltip", 
            section.getCourseName() + "\r\n" + "Instructor: " + section.instructor + "\r\n" +
            "Time: " + section.getTimeString());
    }
}

function displaySchedule(index)
{
    var schedule = scheduleContents.completeSchedules[index];
    if (schedule.isDisplayed !== true) {
        schedule.isDisplayed = true;
        schedule.uniqueColorSet = generateRandomUniqueColorSet(schedule.sections.length);
    }
    for (var i = 0; i < schedule.sections.length; i++) {
        var color = schedule.uniqueColorSet[i];
        var section = schedule.sections[i];
        var coordinates = generateCoordinates(section);
        insertCourse(section, color, coordinates);
    }
}

var index = 0, scheduleCount = 0;
var scheduleContents;
if (!chrome.extension) {
    throw "chrome extension not enabled";
}
var backgroundWindow = chrome.extension.getBackgroundPage();
if (backgroundWindow) {
    scheduleContents = backgroundWindow.scheduleContents;
    scheduleCount = scheduleContents.completeSchedules.length;
}

document.addEventListener("DOMContentLoaded", function()
{
    createTable();
    createPager(scheduleContents.completeSchedules.length);
    displayHeader(index);
    setCenter();

    displaySchedule(index);
    
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        var tab = tabs[0];
        chrome.runtime.sendMessage({"message": "scheduleDisplayed"});
    });
});