/// <reference path="typings/jquery/jquery.d.ts" />


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

function createTable()
{
    var $newTable = $('<table />', {
        'class' : 'animate-fadein',
        'border' : '0',
        'cellpadding' : '0',
        'cellspacing' : '0'
    });
    $(".time-table").append($newTable);
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
    $('div.time-table').children().remove();
    createTable();
}

function displayHeader(index)
{
    $('div.time-table').prepend($('<h1 />', {
        text : 'Schedule ' + String(index + 1)
    }));
}

function createPager(count)
{
    var $pager = $('.pagination');
    $pager.append('<li><a href="#" class="pager-button prev">&laquo</a></li>');
    for (var i = 0; i < count; i++) {
        $pager.append('<li> <a class="pager-button" href="#">' + String(i+1) + '</a></li>');
    }
    $pager.append('<li><a href="#" class="pager-button next">&raquo;</a></li>');
    $pager.children().eq(1).children().attr('class', 'active');

    $('.pagination li').on('click', function(event){
        if ($(event.target).hasClass('prev')) {
            if (index !== 0) {
                clearTable();
                displaySchedule(--index);
                //displayHeader(index);
                var $prev = $('a.active').parent().prev().children();
                $('a.active').removeClass('active');
                $prev.addClass('active');
            }
        }
        else if ($(event.target).hasClass('next')) {
            if (index < scheduleCount - 1) {
                clearTable();
                displaySchedule(++index);
                //displayHeader(index);
                var $next = $('a.active').parent().next().children();
                $('a.active').removeClass('active');
                $next.addClass('active');
            }
        }
        else {
            if (!$(event.target).is($('a.active'))) {
                index = Number($(event.target).text()) - 1;
                clearTable();
                displaySchedule(index);
                //displayHeader(index);
                $('a.active').removeClass('active');
                $(event.target).addClass('active');
            }
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

function createInstructorList()
{
    var courses = scheduleContents.courses;
    var id = 1;
    var $block = $('div.instructor-list');
    $block.append("<ul class='cd-filter-content cd-filters list'>" + 
        "<li><input class='filter' data-filter='all' type='radio' name='all' id='radio0' checked>" +
		"<label class='radio-label' for='radio0'>All</label></li>");
    
    for (var i = 0; i < courses.length; i++) {
        $block.append($('<h5 />', {
            'class' : 'cd-filter-content',
            'text' : courses[i].courseId
        }));
        var $newButtonList = $("<ul class='cd-filter-content cd-filters list'></ul>");
        
        for (var j = 0; j < courses[i].instructorList.length; j++) {
            var $li = $('<li />');
            $li.append($('<input />', {
                'class' : 'filter',
                'data-filter' : courses[i].instructorList[j],
                'type' : 'radio',
                'name' : courses[i].courseId,
                'id' : 'radio' + String(id),
            }));
            $li.append($('<label />', {
                'class' : 'radio-label',
                'for' : 'radio' + String(id++),
                'text' : courses[i].instructorList[j]
            }));
            $newButtonList.append($li);
        }
        $block.append($newButtonList);
        $(".cd-filter form").append($block);
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


var buttonFilter = {
    $filters: null,
    groups: [],

    init: function() {
        var self = this;

        self.$filters = $('.cd-main-content');
        
        // find all filters and store them in groups
        self.$filters.find('.cd-filters').each(function(){
            var $this = $(this);

            self.groups.push({
                $inputs: $this.find('.filter'),
                active: '',
            });
        });
        self.bindHandlers();
    },

    bindHandlers: function() {
        var self = this;

        self.$filters.on('click', 'a', function(){
            if ($(this).hasClass('pager-button') === false) {
                self.parseFilters();
                console.log('click a triggerd');
            }
        });
        self.$filters.on('change', function(){
            self.parseFilters();
            console.log('change triggered');
        })
    },

    parseFilters: function() {
        var self = this;

        for (var i = 0, group; group = self.groups[i]; i++) {
            group.active = [];
            group.$inputs.each(function() {
                var $this = $(this);
                if ($this. is('input[type="radio"]') || $this.is('input[type="checkbox"]')) {
                    if ($this.is(':checked')) {
                        group.active.push($this.attr('data-filter'));
                    }
                }
                else if ($this.is('select')) {
                    group.active.push($this.val());
                }
                else if ($this.find('.selected').length > 0) {
                    group.active.push($this.attr('data-filter'));
                }
            });
        }
        self.concatenate();
    },

    concatenate: function() {
        var self = this;

        self.outputString = '';

        for (var i = 0, group; group = self.groups[i]; i++) {
            self.outputString += group.active;
        }

        !self.outputString.length && (self.outputString = 'all');
    }
}


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

    createTable();
    createPager(scheduleContents.completeSchedules.length);
    displaySchedule(index);

    createInstructorList();

    $('.instructor-list input:radio').on('click', function(event){
        $allButton = $(".instructor-list input[name='all']");
        if ($(event.target).data('filter') === 'all') {
            $('.instructor-list input').prop('checked', false);
            $allButton.prop('checked', true);
        }
        else if ($allButton.prop('checked')) {
            $allButton.prop('checked', false);
        }
    });

    buttonFilter.init();
    
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        var tab = tabs[0];
        chrome.runtime.sendMessage({"message": "scheduleDisplayed"});
    });

});