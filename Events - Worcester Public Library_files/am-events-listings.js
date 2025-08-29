(function ($, window, document, undefined) {
	$.support.cors = true;
	var pluginName = "amEvents",
		defaults = {
			title: '',
			view: 'list',
			range: 'today',
			ages: [],
			excludedAges: [],
			types: [],
			excludedTypes: [],
			locale: 'en-US',
			timezone: 'America/New_York',
			locations: [],
			excludedLocations: [],
			linkTarget: '_blank',
			inCellEvents: 3,
			private: false,
			eventsGroupCalenderBAge: false,
			term: '',
			end: '',
			start: '',
			gridDate: '',
			filters: {}, // added for brochure
			filterOptions: {},
			filterMaxItems: 15,
			filterCurrentColumn: null,
			filterCurrentColumnCount: 0,
			showBrochure: false,
			showRSS: false,
			showICAL: false,
			singleBranch: false,
			limitWaitlist: false,
			allowWaitlistSubscription: false,
			customInterestedText: '',
			brochuredata: null,
			allowSubs: false,
			brochureNoPopup: false,
			showImagesInListGrid: false,
			testMode: 0,
			duration: '',
			emitEvents: false,
			term: '',
		};

	function Plugin(element, options) {
		var self = this;
		this.element = element;
		this.$element = $(element);

		if (!options.view) options.view = self._readCookie('eventsView') ? self._readCookie('eventsView') : 'list';
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.paused = false;
		this.rangeUpdating = false;
		this.tagsLoaded = false;
		this.locationsLoaded = false;
		this.agesLoaded = false;
		this._init();
	}

	$.extend(Plugin.prototype, {
		_init: function () {
			var self = this;
			var params = self._getURLSearchParameters();
			if (params.et) {
				self.settings.excludedTypes = params.et.split(',').map(s => s.trim().toLowerCase());
			}
			if (params.t) {
				self.settings.types = params.t.split(',').map(s => s.trim().toLowerCase());
			}
			self.initComplete = false;
			self.$element.addClass('events-holder');
			if (self.settings.singleBranch) {
				self.$element.addClass('events-single-branch');
			}
			var navigation = $('<div class="row events-filter-row"></div>').appendTo(self.element);
			self.views = $('<div class="row events-view-row"></div>').appendTo(self.element);

			$('<div class="col-md-4 col-sm-12 col-xs-12"><label for="eventsearch" class="sr-only">Search events</label><input id="eventsearch" class="form-control events-search-field"  placeholder="Search for ' + self.settings.customEventsLabel + '" type="text"/></div>').appendTo(navigation);
			var filters = $('<div class="col-md-6 col-sm-12 col-xs-12"><span class="hidden-xs events-single-hidden">Filter by: </span></div>').appendTo(navigation);
			self.viewPicker = $('<div class="col-md-2 col-sm-12 col-xs-12 events-views"></div>').appendTo(navigation);

			$('<button class="events-option-dropdown noselect events-single-hidden" data-show-filter="events-location-section"  aria-label="Location filter button" tabindex="0">Location</button>').appendTo(filters);
			$('<button class="events-option-dropdown noselect" data-show-filter="events-age-section" aria-label="Age group filter button" tabindex="0">Age group</button>').appendTo(filters);
			$('<button class="events-option-dropdown noselect" data-show-filter="events-type-section" aria-label="Type filter button" tabindex="0">' + self.settings.customEventLabel + ' type</button>').appendTo(filters);

			var checked = (self.settings.locations.length + self.settings.excludedLocations.length) === 0 ? 'checked="checked"' : '';

			self.locationList = $('<div id="event_locations"></div>');
			$('<div class="events-filter-section events-location-section">' +
				'<div class="events-filter-close">close</div>' +
				'<div class="heading4">Location</div>' +
				'<div class="checkbox">' +
				'   <label for="loc_all" class="check-all-filter-text">' +
				'       <input id="loc_all" type="checkbox" ' + checked + ' aria-label="View all locations">View events at all branches' +
				'   </label>' +
				'</div><hr>' +
				'</div>').append(self.locationList).appendTo(self.element);

			var checked = self.settings.ages.length === 0 ? 'checked="checked"' : '';
			self.ageList = $('<div id="event_ages"></div>');
			$('<div class="events-filter-section events-age-section">' +
				'<div class="events-filter-close">close</div>' +
				'<div class="heading4">Age group</div>' +
				'<div class="checkbox">' +
				'   <label for="group_all" class="check-all-filter-text">' +
				'       <input id="group_all" type="checkbox" ' + checked + ' aria-label="View all Ages">View all age groups' +
				'   </label>' +
				'</div><hr>' +
				'</div>').append(self.ageList).appendTo(self.element);

			var checked = self.settings.types.length === 0 ? 'checked="checked"' : '';
			self.typeList = $('<div id="event_types"></div>');
			$('<div class="events-filter-section events-type-section">' +
				'<div class="events-filter-close">close</div>' +
				'<div class="heading4">' + self.settings.customEventLabel + ' type</div>' +
				'<div class="checkbox">' +
				'   <label for="type_all" class="check-all-filter-text">' +
				'       <input id="type_all" type="checkbox" ' + checked + ' aria-label="View all Types">View all ' + self.settings.customEventLabel + ' types' +
				'   </label>' +
				'</div><hr>' +
				'</div>').append(self.typeList).appendTo(self.element);


			self.todayButton = $('<button aria-label="Show events for today" class="events-option-dropdown">Today</button>').appendTo(self.viewPicker);

			$('<i data-view="list" role="button" tabindex="0" aria-pressed="true" aria-label="Show list view" class="fa fa-list"></i>').appendTo(self.viewPicker);
			$('<i data-view="grid" role="button" tabindex="0" aria-pressed="mixed" aria-label="Show calendar view" class="am-events"></i>').appendTo(self.viewPicker);


			self.gridView = $('<div data-view="grid" class="events-list-view"></div>').appendTo(self.views);
			var listView = $('<div data-view="list" class="events-list-view"></div>').appendTo(self.views);
			var brochureButton = self.settings.showBrochure ? '<div class="events-brochure"><button class="events-option-dropdown events-brochure-button"><i class="fa fa-file-pdf-o" style="color: #ED0202;"></i>&nbsp;Create Brochure</button></div>' : '';

			if (self.settings.start !== '') {
				self.settings.start = moment(self.settings.start);
				self.settings.end = self.settings.end !== '' ? moment(self.settings.end) : self.settings.start;
			} else {
				self.settings.start = moment();
				self.settings.end = self.settings.start
			}

			self.listViewLeft = $('<div class="events-left">' +
				'<div class="events-details">' +
				'<ul class="nav nav-tabs" role="tablist">' +
				'<li role="presentation" class="active"><a href="#calendar" aria-controls="calendar" role="tab" data-toggle="tab">Calendar</a></li>' +
				'<li role="presentation"><a href="#date_range" aria-controls="date_range" role="tab" data-toggle="tab">Date range</a></li>' +
				'</ul>' +
				'<div class="tab-content">' +
				'<div role="tabpanel" class="tab-pane active" id="calendar">' +
				'<div class="events-calendar"></div>' +
				'</div>' +
				'<div role="tabpanel" class="tab-pane" id="date_range">' +
				'<div class="events-range input-daterange input-group" id="datepicker">' +
				'<label for="start">From</label>' +
				'<div class="input-group events-date-input">' +
				'<input type="text" title="From" class="form-control" value="' + self.settings.start.format('MMMM D YYYY') + '" name="start" id="start" aria-label="Start Date"><span class="input-group-addon"><i class="am-events"></i></span>' +
				'</div>' +
				'<label for="end">To</label>' +
				'<div class="input-group events-date-input">' +
				'<input type="text" title="To" class="form-control" value="' + (self.settings.end !== '' ? self.settings.end.format('MMMM D YYYY') : self.settings.start.format('MMMM D YYYY')) + '" name="end" id="end" aria-label="End Date"><span class="input-group-addon"><i class="am-events"></i></span>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'<div class="events-link hidden-xs">' +
				'<a aria-label="Show events for today" href="#" data-type="today">Today</a>' +
				'<a aria-label="Show events for tomorrow" href="#" data-type="tomorrow">Tomorrow</a>' +
				'<a aria-label="Show events for this week" href="#" data-type="thisweek">This week</a>' +
				'<a aria-label="Show events for next week" href="#" data-type="nextweek">Next week</a>' +
				'<a aria-label="Show events for this month" href="#" data-type="thismonth">This month</a>' +
				'<a aria-label="Show events for next month" href="#" data-type="nextmonth">Next month</a>' +
				'</div>' +
				'</div>').appendTo(listView);
			self.listViewRight = $('<div class="events-right">' +
				'<h1 class="headingtext">' + self.settings.customEventsLabel + '</h1>' +
				'<div class="events-date-bar noselect">' +
				'<div class="events-day-title">' +
				'<span data-by="-1" tabindex="0" role="button" aria-label="Previous day" class="events-change-day events-change-prev fa fa-chevron-left"></span>' +
				'<span aria-live="polite" class="events-date-string headingtext"></span>' +
				'<span data-by="1" tabindex="0" role="button" aria-label="Next day" class="events-change-day events-change-next fa fa-chevron-right"></span>' +
				'</div>' +
				'<div class="events-range-title">' +
				'<div class="events-date-range-string headingtext"></div>' +
				'</div>' +
				'</div>' +
				'<div class="events-filter-details">' +
				'<div aria-label="Clear the current filters" class="events-filter-clear">Clear filter</div>' +
				'<div class="events-filter-message"></div>' +
				'</div>' +
				'<div class="events-body"></div>' +
				'</div>').appendTo(listView);

			var a = moment().startOf('week');
			var b = a.clone().add(7, 'days');
			var days = '';
			for (var m = a; m.isBefore(b); m.add(1, 'days')) {
				days += '<div>' + m.format('dddd') + '</div>';
			}
			$('<div class="events-grid">' +
				'<h1 class="headingtext">' + self.settings.customEventsLabel + '</h1>' +
				'<div class="events-date-bar noselect">' +
				'<div class="events-day-title">' +
				'<span data-by="-1" tabindex="0" role="button" aria-label="Previous month" class="events-change-day events-change-prev fa fa-chevron-left"></span>' +
				'<span aria-live="polite" class="events-date-string headingtext"></span>' +
				'<span data-by="1" tabindex="0" role="button" aria-label="Next month" class="events-change-day events-change-next fa fa-chevron-right"></span>' +
				'</div>' +
				'</div>' +
				'<div class="events-filter-details">' +
				'<div class="events-filter-clear">Clear filter</div>' +
				'<div class="events-filter-message"></div>' +
				'</div>' +
				'<div class="events-grid-header">' + days + '</div>' +
				'<div class="events-grid-body"></div>' +
				'</div>').appendTo(self.gridView);


			self._loadFilters();
			self._bindEvents();
			if (self.settings.range === 'today' && !self.settings.filters.date && (self.settings.start && !self.settings.end)) {
				var now = moment();
				$('.events-range.input-daterange input[name=start]', this.listViewLeft).datepicker('update', now.format('MMMM D YYYY'));
				$('.events-range.input-daterange input[name=end]', this.listViewLeft).datepicker('update', now.endOf('month').format('MMMM D YYYY'));
				$('.events-details a[href="#date_range"]', this.listViewLeft).tab('show');
			}

			var acceptableRanges = ['days', 'weeks', 'months'];
			if (acceptableRanges.includes(self.settings.range) && '' != self.settings.duration) {
				self._updateDateRange();
			} else if (self.settings.range !== 'today' && $('a[data-type=' + self.settings.range + ']').length > 0) {
				self._updateDateRange();
			} else {

				if ((self.settings.start && self.settings.end) && (self.settings.start.format('MMMM D YYYY') !== self.settings.end.format('MMMM D YYYY'))) {
					$('.events-details a[href="#date_range"]', this.listViewLeft).tab('show');
					$('.events-range.input-daterange input[name=start]', this.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', this.listViewLeft).datepicker('update', (self.settings.end ? self.settings.end.format('MMMM D YYYY') : self.settings.start.format('MMMM D YYYY')));
				}

				if (self.settings.start && !self.settings.end) {
					$('.events-details a[href="#calendar"]', this.listViewLeft).tab('show');
				}
			}
			if (self.settings.term && self.settings.term.length > 0) {
				$('.events-search-field', navigation).val(self.settings.term);
			}

			self.setView(self.settings.view);
			// self.setView('grid');
			self.initComplete = true;
		},
		_getURLSearchParameters: function () {
			var self = this;
			var prmstr = window.location.search.substr(1);
			return prmstr != null && prmstr != "" ? this._transformToAssocArray(prmstr) : {};
		},
		_transformToAssocArray: function (prmstr) {
			var params = {};
			var prmarr = prmstr.split("&");
			for (var i = 0; i < prmarr.length; i++) {
				var tmparr = prmarr[i].split("=");
				params[tmparr[0]] = decodeURIComponent(tmparr[1]).replace(/\+/g, " ");
			}
			return params;
		},
		_setURLPieces: function () {
			var self = this;
			var url = window.location.pathname + '?';
			var params = '';
			var vars = self._getURLSearchParameters();
			if (self.settings.range !== 'today') {
				vars.r = self.settings.range;
			}

			if (self.settings.filters.locations.length > 0) {
				vars.l = self.settings.filters.locations.join(',');
			} else {
				delete vars['l'];
			}
			if (self.settings.filters.ages.length > 0) {
				vars.a = self.settings.filters.ages.join(',');
			} else {
				delete vars['a'];
			}
			if (self.settings.filters.types.length > 0) {
				vars.t = self.settings.filters.types.join(',');
			} else {
				delete vars['t'];
			}
			if (self.settings.filters.term && self.settings.filters.term.length > 0) {
				vars.term = self.settings.filters.term;
			} else {
				delete vars['term'];
			}
			delete vars['start'];
			delete vars['end'];
			delete vars['r'];
			if (self.settings.range !== 'today') {
				vars['r'] = self.settings.range;
			}
			//if the range is not specified with a duration then remove the duration
			if (false == (['days', 'weeks', 'months', 'range'].includes(self.settings.range))) {
				delete vars['n'];
			}
			if (self.settings.range === 'range' && this.settings.view !== 'grid') {
				vars['start'] = self.settings.start.format('YYYY-MM-DD');
				if (self.settings.end === '' || self.settings.end.format('YYYY-MM-DD') === self.settings.start.format('YYYY-MM-DD')) {
					delete vars['end'];
				} else {
					vars['end'] = self.settings.end.format('YYYY-MM-DD');
				}
			}
			if (this.settings.view === 'grid' && self.settings.gridDate) {
				vars['d'] = self.settings.gridDate;
			}
			if (self.settings.view === 'list') {
				delete vars['v'];
			} else {
				vars['v'] = self.settings.view;
			}

			if (Object.keys(vars).length > 0) {
				params = $.param(vars, true);
			}

			if (self.settings.emitEvents) {
				var data = { 'data': (url + params) };
				var event = new $.Event('am-events-listings.url-update', data);
				self.$element.trigger(event, data);
			} else {
				window.history.pushState({ 'r': 'type' }, '', url + params);
			}
		},
		_updateDateRange: function () {
			var self = this;
			self.paused = true;
			var now = moment();

			switch (self.settings.range) {
				case 'today':
					self.settings.start = now.startOf('day');
					self.settings.end = now.clone();
					$('div.events-calendar').datepicker('setDate', now.startOf('day').toDate());
					$('.events-details a[href="#calendar"]').tab('show');
					break;
				case 'tomorrow':
					self.settings.start = now.add(1, 'day').startOf('day');
					self.settings.end = now.clone();
					$('div.events-calendar').datepicker('setDate', self.settings.start.toDate());
					$('.events-details a[href="#calendar"]').tab('show');
					break;
				case 'thisweek':
					self.settings.start = now;
					self.settings.end = self.settings.start.clone().endOf('week');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
				case 'thismonth':
					self.settings.start = now;
					self.settings.end = self.settings.start.clone().endOf('month');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
				case 'nextweek':
					self.settings.start = now.add(1, 'week').startOf('week');
					self.settings.end = self.settings.start.clone().endOf('week');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
				case 'nextmonth':
					self.settings.start = now.add(1, 'month').startOf('month');
					self.settings.end = self.settings.start.clone().endOf('month');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
				case 'days':
					self.settings.start = now;
					self.settings.end = now.clone().add(self.settings.duration, 'days');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
				case 'weeks':
					self.settings.start = now;
					self.settings.end = now.clone().add(self.settings.duration, 'weeks');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
				case 'months':
					self.settings.start = now;
					self.settings.end = now.clone().add(self.settings.duration, 'months');
					$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', self.settings.start.format('MMMM D YYYY'));
					$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', self.settings.end.format('MMMM D YYYY'));
					$('.events-details a[href="#date_range"]', self.listViewLeft).tab('show');
					break;
			}
			self.paused = false;
			self._update();
		},
		_bindEvents: function () {
			var self = this;
			self.gridView.data('date', moment(self.settings.gridDate).startOf('month'));
			self.viewPicker.on('click keyup', '[data-view]', function (e) {
				e.preventDefault();

				var isSpace = e.type === 'keyup' && (e.which == 32 || e.keyCode == 32 || e.key == " ");
				var isEnter = e.type === 'keyup' && (e.which == 13 || e.keyCode == 13 || e.key == "Enter");

				if (e.type === 'click' || isSpace || isEnter) {
					$('[data-view]').each(function (_, el) {
						$(el).attr('aria-pressed', 'mixed');
					})

					self.setView($(this).attr('data-view'));
					$(this).attr('aria-pressed', true);
				}
			});
			$('.events-range.input-daterange', self.listViewLeft).datepicker({
				todayBtn: "linked",
				title: "Events calendar",
				orientation: "bottom left",
				format: 'MM d yyyy',
				todayHighlight: true
			}).on('changeDate', function (event) {
				self.settings.range = 'range';
				self.settings.start = moment($('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('getDate'));
				self.settings.end = moment($('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('getDate'));
				self._update();
			});
			$('.events-date-input').on('click', '.input-group-addon', function (event) {
				event.preventDefault();
				event.stopPropagation();
				$(this).closest('.events-date-input').find('input').datepicker('show');
			});

			$('div.events-calendar', self.listViewLeft).datepicker({
				title: "Events calendar",
				startDate: new Date()
			}).on('changeDate', function (event) {
				event.preventDefault();
				self.paused = true;
				$('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('update', moment(event.date).format('MMMM D YYYY'));
				$('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('update', moment(event.date).format('MMMM D YYYY'));
				self.settings.start = moment(event.date).startOf('day');
				self.settings.end = moment(event.date).endOf('day');
				if (!self.rangeUpdating) {
					self.settings.range = 'range';
				}
				self.paused = false;
				self._update();
			});

			if (self.settings.start === self.settings.end) {
				self.rangeUpdating = true;
				$('div.events-calendar', self.listViewLeft).datepicker('setDate', new Date(self.settings.start.format('MMMM D YYYY')));
				self.rangeUpdating = false;
			}

			self.$element.on('click', '.events-option-dropdown', function (event) {
				if (!$(event.target).hasClass('events-option-dropdown')) return;
				event.preventDefault();
				var hide = $('.' + $(this).attr('data-show-filter')).is(':visible');
				$('.events-filter-section', self.$element).fadeOut();
				if (!hide) {
					$('div.' + $(this).attr('data-show-filter'), self.$element).css({
						top: 30,
						left: 0
					}).position({
						my: "left top",
						at: "left bottom",
						of: this, // or $("#otherdiv)
						collision: "fit",
						within: self.$element,
						using: function (pos, data) {
							var menu = data.element.element;
							pos.top = data.target.top + data.target.height + 30;
							$(menu).css(pos)
						}
					}).fadeIn();
				}
			}).on('click', '.events-filter-close', function (event) {
				event.preventDefault();
				$(this).closest('.events-filter-section').fadeOut();
			}).on('change', '#loc_all', function (event) {
				if ($(this).is(':checked')) {
					self.$element.find('#event_locations [id^=loc_]').prop('checked', false);
				} else {
					$(this).prop('checked', true);
				}
				self._update();
			}).on('change', '#event_locations [id^=loc_]', function (event) {
				if ($(this).is(':checked')) {
					self.$element.find('#loc_all').prop('checked', false);
				} else if (self.$element.find('#event_locations [id^=loc_]:checked').length === 0) {
					self.$element.find('#loc_all').prop('checked', true);
				}
				self._update();
			}).on('change', '#group_all', function (event) {
				if ($(this).is(':checked')) {
					self.$element.find('#event_ages [id^=group_]').prop('checked', false);
				} else {
					$(this).prop('checked', true);
				}
				self._update();
			}).on('change', '#event_ages [id^=group_]', function (event) {
				if ($(this).is(':checked')) {
					self.$element.find('#group_all').prop('checked', false);
				} else if (self.$element.find('#event_locations [id^=group_]:checked').length === 0) {
					self.$element.find('#group_all').prop('checked', true);
				}
				self._update();
			}).on('change', '#type_all', function (event) {
				if ($(this).is(':checked')) {
					self.$element.find('#event_types [id^=type_]').prop('checked', false);
				} else {
					$(this).prop('checked', true);
				}
				self._update();
			}).on('change', '#event_types [id^=type_]', function (event) {
				if ($(this).is(':checked')) {
					self.$element.find('#type_all').prop('checked', false);
				} else if (self.$element.find('#event_types [id^=type_]:checked').length === 0) {
					self.$element.find('#type_all').prop('checked', true);
				}
				self._update();
			}).on('click', '.events-filter-clear', function (event) {
				event.preventDefault();
				self.$element.find('.events-search-field').val('');
				self.$element.find('#loc_all').prop('checked', true);
				self.$element.find('#group_all').prop('checked', true);
				self.$element.find('#type_all').prop('checked', true);
				self.$element.find('#event_ages [id^=group_]').prop('checked', false);
				self.$element.find('#event_types [id^=type_]').prop('checked', false);
				self.$element.find('#event_locations [id^=loc_]').prop('checked', false);
				self._update();
			}).on('keyup', '.events-search-field', function (event) {
				if (self.SearchTimer) {
					clearTimeout(self.SearchTimer);
					self.SearchTimer = false;
				}
				var term = $(this).val();
				self.SearchTimer = setTimeout(function () {
					self._doSearch(term);
				}, 750);
			});
			$('.events-change-day', self.listViewRight).on('click keyup', function (event) {
				event.preventDefault();

				var isSpace = event.type === 'keyup' && (event.which === 32 || event.keyCode === 32 || event.key === " ");
				var isEnter = event.type === 'keyup' && (event.which === 13 || event.keyCode === 13 || event.key === "Enter");

				if (event.type === 'click' || isSpace || isEnter) {
					self.settings.range = 'range';
					var newdate = moment($('div.events-calendar', self.listViewLeft).datepicker('getDate')).add($(this).attr('data-by'), 'day').startOf('day');
					if (newdate.isBefore(moment().startOf('day'))) return;
					$('div.events-calendar', self.listViewLeft).datepicker('setDate', newdate.toDate());
				}
			});
			self.listViewLeft.on('click', '.events-link>a', function (event) {
				event.preventDefault();
				self.paused = true;
				self.settings.range = $(this).attr('data-type');
				self.rangeUpdating = true;
				self._updateDateRange();
				self.rangeUpdating = false;
			});
			self.gridView.on('click', '.events-grid-cell', function (event) {
				event.preventDefault();
				var selected = $(this).hasClass('events-grid-cell-selected');
				self.gridView.find('.events-grid-day-list').remove();
				self.gridView.find('.events-grid-cell-selected').removeClass('events-grid-cell-selected');
				if (!selected) {
					$(this).addClass('events-grid-cell-selected');
					var dayView = $('<div class="events-grid-day-list"></div>').insertAfter($(this).closest('.events-grid-row'));
					$.each($(this).data('events'), function (index, val) {
						var hasPre = false;
						var isBilled = false;
						var preText = '';
						var tagString = '';
						var ticketIcon = '<span class="fa-stack ticket-symbol" style="font-size:12px"><i class="fa fa-circle fa-stack-2x" style="color: #2bafbe"></i><i class="fa fa-usd fa-stack-1x fa-inverse"></i></span>&nbsp;';
						var title = val.title;

						if (typeof (val.enable_billing) !== 'undefined') {
							isBilled = parseInt(val.enable_billing) === 1;
						}

						if (self.settings.eventsGroupCalenderBAge) {
							if (val.ages) {
								$.each(val.agesArray, function (index, val) {
									var dotColour = typeof self.ages[val] !== 'undefined' ? self.ages[val] : self._genColour(val);
									tagString += ' <i class="fa fa-circle" style="color:' + dotColour + '"></i> ' + val;
								});
							}
						} else {
							if (val.tags) {
								$.each(val.tagsArray, function (index, val) {
									var dotColour = typeof self.tags[val] !== 'undefined' ? self.tags[val] : self._genColour(val);
									tagString += ' <i class="fa fa-circle" style="color:' + dotColour + '"></i> ' + val;
								});
							}
						}

						if (parseInt(val.changed) === 1) {
							title = '<span class="eelist-changed-message">Cancelled</span>&nbsp;' + title;
						}

						if (parseInt(val.changed) === 2 || parseInt(val.changed) === 3) {
							title = '<span class="eelist-changed-message">Rescheduled</span>&nbsp;' + title;
						}

						if (isBilled) {
							title = ticketIcon + title;
						}

						if (hasPre) {
							title = preText + title;
						}


						if (val.link) {
							var link = $('<a target="' + self.settings.linkTarget + '" href="' + val.link + '"> ' + $('<div></div>').html(title).text() + '</a>');
						} else {
							var id = val.new_event_id || val.id;
							var link = $('<a target="' + self.settings.linkTarget + '">' + title + '</a>');
							if (window.websiteUrl) {
								link.attr('href', window.websiteUrl + '/event/' + id);
							} else {
								link.attr('href', 'event/' + id);
							}
						}
						if (val.sub_title) {
							link.append('<span> - ' + val.sub_title + '</span>');
						}


						link.qtip({
							content: {
								text: function (event, api) {
									return self._getEventBlock(val, true);
								}
							},
							style: {
								classes: 'qtip-bootstrap events-popup',
								def: false,
								width: 500
							},
							hide: {
								fixed: true,
								delay: 300
							},
							position: {
								viewport: $(window)
							}
						});
						if (parseInt(val.changed) === 1) {
							$('<div>&nbsp;, ' + val.location + '&nbsp;&nbsp;<span class="events-grid-day-list-tags">' + tagString + '</span></div>').prepend(link).appendTo(dayView);
						} else if (parseInt(val.changed) === 2 || parseInt(val.changed) === 3) {
							$('<div>&nbsp;<b>' + val.time_string + '</b>, ' + val.location + '&nbsp;&nbsp;<span class="events-grid-day-list-tags">' + tagString + '</span></div>').prepend(link).appendTo(dayView);
						} else {
							$('<div>&nbsp;<b>' + val.time_string + '</b>, ' + val.location + '&nbsp;&nbsp;<span class="events-grid-day-list-tags">' + tagString + '</span></div>').prepend(link).appendTo(dayView);
						}

					});
				}
			}).on('click keyup', '.events-change-day', function (e) {
				e.preventDefault();

				var isSpace = event.type === 'keyup' && (e.which == 32 || e.keyCode == 32 || e.key == " ");
				var isEnter = event.type === 'keyup' && (e.which == 13 || e.keyCode == 13 || e.key == "Enter");

				if (e.type === 'click' || isSpace || isEnter) {
					self.settings.range = 'range';
					self.gridView.data('date').add($(this).attr('data-by'), 'month');
					self.settings.gridDate = self.gridView.data('date').format('YYYY-MM-DD');
					self._update();
				}
			});

			self.todayButton.on('click', function (event) {
				event.preventDefault();
				self.settings.range = 'today';
				if (self.settings.view == 'list') {
					self.rangeUpdating = true;
					$('div.events-calendar', self.listViewLeft).datepicker('setDate', moment().startOf('day').toDate());
					self.rangeUpdating = false;
				} else {
					self.gridView.data('date', moment().startOf('month'));

				}
				self._update();
			});
			$(window).on('resize', function () {
				var w = $(document).width();
				if (w < 768 && self.settings.view == 'grid') {
					self.setView('list');
				} else {

				}
			});

			// Brochure button logic:

		},
		_doSearch: function (term) {
			this.paused = true;
			var now = moment();
			if (this.settings.filters.days === 0) {
				var startDate = now.format('MMMM D YYYY');
				var endDate = now.endOf('month').format('MMMM D YYYY');
				$('.events-range.input-daterange input[name=start]', this.listViewLeft).datepicker('update', startDate);
				$('.events-range.input-daterange input[name=end]', this.listViewLeft).datepicker('update', endDate);
			}
			$('.events-details a[href="#date_range"]', this.listViewLeft).tab('show');
			this.paused = false;
			this._update();
		},

		// #4381 - CK
		// Hide external venue description on qtip
		_getEventBlock: function (event, inQtip) {
			var self = this;
			var $item = $('<div class="eelistevent-data"></div>');
			if (parseInt(event.changed) === 3) {
				$item.addClass('eelistevent-postponed');
			}
			if (parseInt(event.changed) === 2 || parseInt(event.changed) === 3) {
				$('<div class="eelist-changed-message"></div>').text('Rescheduled').prependTo($item);
			} else if (parseInt(event.changed) === 1) {
				$item.addClass('eelistevent-canceled');
				$('<div class="eelist-changed-message"></div>').text('Cancelled').prependTo($item);
			}
			var title = event.title;
			var evtLink = '';
			var imageLink = ''

			if (event.sub_title) title += '<span>' + ' - ' + event.sub_title + '</span>';
			if (event.link) {
				evtLink = $('<a target="' + self.settings.linkTarget + '" href="' + event.link + '"></a>');
			} else {
				var id = event.new_event_id || event.id;
				evtLink = $('<a target="' + self.settings.linkTarget + '" href="' + (window.websiteUrl || "") + '/event/' + id + '"></a>');
			}

			imageLink = evtLink.clone();
			evtLink.html(title);
			$('<div class="eelisttitle"></div>').append(evtLink).appendTo($item);

			// CH 14854 - Add in event images.
			//
			if (self.settings.showImagesInListGrid) {
				if (typeof event.image === 'string' && event.image.length > 0) {
					var url = 'https://' + self.settings.client + '.libnet.info/images/events/' + self.settings.client + '/' + event.image;
					//var image = '<img src="' + url + '" class="img-thumbnail event-list-image" alt="' + event.title + '"/>';
					var imageFrame = $('<div/>');
					var image = $('<span/>')
						.attr('role', 'img')
						.attr('aria-label', event.title)
						.css({
							'display': 'inline-block',
							'width': '118px',
							'height': '118px',
							'background-image': 'url(\'' + url + '\')',
							'background-position': 'center center',
							'background-size': 'cover'
						});

					if (typeof event.image_alt_text === 'string' && event.image_alt_text.length > 0) {
						image.attr('aria-label', event.image_alt_text);
					}

					imageFrame.append(image);
					imageLink.append(imageFrame);

					$('<div class="eelistimage"></div>').append(imageLink).appendTo($item);
				}
			}

			if (parseInt(event.changed) === 2) {
				$item.append('<div class="eelisttime eelisttime-postponed headingtext">(' +
					'<span>Rescheduled from </span>' +
					event.datestring + ': ' + event.time_string +
					')</div>');

				var tt = $('<div class="eelisttime headingtext"></div>').append("<span class='eelist-changed-message'> New date </span>").appendTo($item);
				tt.append(document.createTextNode(event.changed_datestring + ': ' + event.changed_time_string));
			} else if (parseInt(event.changed) === 3) {
				$item.append('<div class="eelisttime headingtext">' + event.datestring + ': ' + event.time_string + '</div>');
				var tt = $('<div class="eelisttime headingtext"></div>').append("<span class='eelist-changed-message'> New date </span>").appendTo($item);
				tt.append(document.createTextNode(event.changed_datestring + ': ' + event.changed_time_string));
			} else {
				$item.append('<div class="eelisttime headingtext">' + event.datestring + ': ' + event.time_string + '</div>');
			}

			var lstring = event.library;
			if (event.venues) {
				lstring += ' - <i>' + event.venues + '</i>';
			}
			if (parseInt(event.changed_venue) == 1) {
				$item.append('<div class="eelocation"><i class="am-locations"/><span class="eelist-changed-message"> New venue </span> ' + lstring + '</div>');
			} else {
				$item.append('<div class="eelocation"><i class="am-locations"/> ' + lstring + '</div>');
			}

			if (event.agesArray) {
				if (self.settings.eventsGroupCalenderBAge) {
					var tagsList = $('<div class="eelisttags"></div>').append('<span>Age group:&nbsp;&nbsp;</span>').appendTo($item);
					$.each(event.agesArray, function (index, val) {
						var dotColour = typeof self.ages[val] !== 'undefined' ? self.ages[val] : self._genColour(val);
						tagsList.append('<span><i class="fa fa-circle" style="color:' + dotColour + '"></i> ' + val + ' </span>');
					});
				} else {
					$('<div class="eelistgroup"></div>').append('<span>Age group:&nbsp;&nbsp;</span>').append(event.agesArray.join(", ")).appendTo($item);
				}
			}

			if (event.tagsArray) {
				if (self.settings.eventsGroupCalenderBAge) {
					$('<div class="eelistgroup"></div>').append('<span>' + self.settings.customEventLabel + ' type:&nbsp;&nbsp;</span>').append(event.tagsArray.join(", ")).appendTo($item);
				} else {
					var tagsList = $('<div class="eelisttags"></div>').append('<span>' + self.settings.customEventLabel + ' type:&nbsp;&nbsp;</span>').appendTo($item);
					$.each(event.tagsArray, function (index, val) {
						var dotColour = typeof self.tags !== 'undefined' && typeof self.tags[val] !== 'undefined' ? self.tags[val] : self._genColour(val);
						tagsList.append('<span><i class="fa fa-circle" style="color:' + dotColour + '"></i> ' + val + ' </span>');
					});
				}
			}

			$item.append('<div class="eelistdesc">' + event.description + '</div>');
			// #4381 - CK
			// Hide external venue description on qtip
			if (event.venue_type && event.venue_type == 'external' && event.venue_description.length > 0 && !inQtip) {
				$item.append('<div class="eelistvenuedesc"><b>Venue details</b><br>' + event.venue_description + '</div>');
			}

			if ((parseInt(event.changed, 10) !== 1 && parseInt(event.changed, 10) !== 3) && parseInt(event.allow_reg, 10) === 1) {
				if (moment(event.close_registration).tz(self.settings.timezone).diff() < 0) {
					if (parseInt(event.third_party_reg, 10) == 0) {
						$item.append('<div class="regclosed">Registration is now closed</div>');
					}
				} else {
					// If third-party-reg is off then run the numbers, otherwise jump to next if set.
					// CH #11417 - Added maximums for waitlists.
					if (event.ticketInfo) {
						var available = 0;
						if (event.ticketInfo.ticketData) {
							for (var t = 0; t < event.ticketInfo.ticketData.length; t++) {
								var tkt = event.ticketInfo.ticketData[t];
								available += tkt.available;
							}
						}

						if (event.ticketInfo.typeId === -1) {
							available = event.ticketInfo.available;
						}

						if (available <= 0) {
							if (self.settings.allowWaitlistSubscription) {
								$item.append('<div class="regclosed">This ' + self.settings.customEventLabel + ' is full. Click the button below to be notified when a registration becomes available.</div>');
								$('<button data-eventid="' + event.id + '" data-recurringid="' + event.recurring_id + '" data-regtype="-1" class="button subscribeToEvent"></button>')
									.text(self.settings.customInterestedText)
									.on('click', function () {
										self._showInterestedPopup($(this).attr('data-eventid'), $(this).attr('data-recurringid'), event);
									})
									.appendTo($item)
							} else {
								$item.append('<div class="regclosed">This ' + self.settings.customEventLabel + ' is full</div>');
							}

							//$btn.text('Event Full').prop('disabled', true);
							return $item;
						}
					}

					var allowWaitList = parseInt(event.allow_waitlist, 10) !== 0 && ((event.max_waitlist == 0 || (parseInt(event.max_waitlist) > 0) && (parseInt(event.total_waitlist) < parseInt(event.max_waitlist))));
					var regAllowed = parseInt(event.total_registrants, 10) < parseInt(event.max_attendee, 10) || allowWaitList;

					if (parseInt(event.third_party_reg, 10) === 0) {
						if (!regAllowed) {
							$item.append('<div class="regclosed">This ' + self.settings.customEventLabel + ' is full</div>');
							return $item;
						}
					}

					if (event.version == 2 && parseInt(event.third_party_reg, 10) === 1) {
						if (event.reg_url.length > 0) {
							$('<a target="' + self.settings.linkTarget + '" href="' + event.reg_url + '" class="button eventRegButton">Register</a>').appendTo($item);
						}
					} else if (parseInt(event.staff_only_registration, 10) === 1) {
						$('<div class="regclosed eventStaffRegMessage">Please contact the library to register for this event</div>').appendTo($item);
					} else {
						var event_id = event.id;
						var location_id = event.location_id;
						var $btn, $onlineBtn;

						if (parseInt(event.total_registrants, 10) >= parseInt(event.max_attendee, 10)) {
							var m = 'Join the wait list';
							var regstatus = '0';
							var t = '2';
						} else {
							var m = 'Register';
							var regstatus = '1';
							var t = '1';
						}

						if (parseInt(event.whole_serires_only, 10) === 1 && moment(event.series_starts).subtract(event.registration_close, 'minutes').tz(self.settings.timezone).diff() < 0) {
							if (parseInt(event.third_party_reg, 10) == 0) {
								$item.append('<div class="regclosed">Registration is now closed</div>');
							}
						} else if (parseInt(event.whole_serires_only, 10) === 0 || (parseInt(event.whole_serires_only, 10) === 1)) {
							$btn = null, $onlineBtn = null;
							if (event.event_type !== undefined && event.event_type !== '') {
								if (event.event_type == 'INPERSON' && event.webinar_seats && event.venue_type == 'external') {
									event.event_type = 'HYBRID';
									event.max_attendee_virtual = event.webinar_seats;
								}

								switch (event.event_type) {
									case 'INPERSON':
										var ariaLabel = m + " for " + event.title + " in person" + " on " + event.datestring + " at " + event.start_time;
										$btn = $('<button aria-label="' + ariaLabel + '" data-eventid="' + event.id + '" data-recurringid="' + event.recurring_id + '" data-regtype="' + t + '" data-attendancetype="INPERSON" data-testmode="' + self.settings.testMode + '" class="button eventRegButton"></button>').text(m).appendTo($item).regButton();
										break;
									case 'ONLINE':
										var ariaLabel = m + " for " + event.title + " on line" + " on " + event.datestring + " at " + event.start_time;
										$btn = $('<button aria-label="' + ariaLabel + '" data-eventid="' + event.id + '" data-recurringid="' + event.recurring_id + '" data-regtype="' + t + '" data-attendancetype="ONLINE" data-testmode="' + self.settings.testMode + '" class="button eventRegButton"></button>').text(m + ' to attend online').appendTo($item).regButton();
										break;
									case 'HYBRID':
										if (parseInt(event.allow_waitlist, 10) == 1 && parseInt(event.total_inperson_registrants, 10) >= parseInt(event.max_attendee_in_branch, 10)) {
											var m_in_branch = 'Join the wait list';
											var t_in_branch = '2';
										} else if (parseInt(event.max_attendee_in_branch, 10) > 0) {
											var m_in_branch = 'Register';
											var t_in_branch = '1';
										}

										if (parseInt(event.allow_waitlist, 10) == 1 && parseInt(event.total_online_registrants, 10) >= parseInt(event.max_attendee_virtual, 10)) {
											var m_online = 'Join the wait list';
											var t_online = '2';
										} else if (parseInt(event.max_attendee_virtual, 10) > 0) {
											var m_online = 'Register';
											var t_online = '1';
										}

										if (parseInt(event.allow_waitlist, 10) == 1 || parseInt(event.total_inperson_registrants, 10) < parseInt(event.max_attendee_in_branch, 10)) {
											var ariaLabel = m_in_branch + " for " + event.title + " to attend in person" + " on " + event.datestring + " at " + event.start_time;
											if (parseInt(event.max_attendee_in_branch, 10) > 0) {
												$btn = $('<button aria-label="' + ariaLabel + '" data-eventid="' + event.id + '" data-recurringid="' + event.recurring_id + '" data-regtype="' + t_in_branch + '" data-attendancetype="INPERSON" data-testmode="' + self.settings.testMode + '" class="button eventRegButton"></button>').text(m_in_branch + ' to attend in person').appendTo($item).regButton();
											}
										}

										if (parseInt(event.allow_waitlist, 10) == 1 || parseInt(event.total_online_registrants, 10) < parseInt(event.max_attendee_virtual, 10)) {
											var ariaLabelOnline = m_online + " for " + event.title + " to attend online" + " on " + event.datestring + " at " + event.start_time;
											if (parseInt(event.max_attendee_virtual, 10) > 0) {
												$onlineBtn = $('<button aria-label="' + ariaLabelOnline + '" data-eventid="' + event.id + '" data-recurringid="' + event.recurring_id + '" data-regtype="' + t_online + '" data-attendancetype="ONLINE" data-testmode="' + self.settings.testMode + '" class="button eventRegButton"></button>').text(m_online + ' to attend online').appendTo($item).regButton();
											}
										}

										break;
								}
							} else {
								var ariaLabelOther = m + " for " + event.title + " on " + event.datestring + " at " + event.start_time;
								$btn = $('<button aria-label="' + ariaLabelOther + '" data-eventid="' + event.id + '" data-recurringid="' + event.recurring_id + '" data-regtype="' + t + '" data-attendancetype="UNKNOWN" data-testmode="' + self.settings.testMode + '" class="button eventRegButton"></button>').text(m).appendTo($item).regButton();
							}

							// Time juggling for the reg button CH10228.
							// Due to some oddities in the way moment works and calculates differences
							// No TZ conversion here since time is saved as a TZ time to the database. It also screws with comparisons.
							// E.g. IF we have 2019-02-01 12:00:00 stored in the database as a CST time, converting to a moment with tz included will produce something like this:
							// E.g(2). 2019-02-01T11:00:00-6:00 as tz calculation takes into account a tz-less time. Confusing. I know.
							var regOpens = moment(event.reg_opens).format('YYYY-MM-DD HH:mm:ss');
							// Add the timezone here to account for local computer time
							// This is because if someone has EST set on their local computer, we want it to compare on that time so that someone can't abuse the system and just change the clock to get around it.
							var nowTime = moment().tz(self.settings.timezone).format('YYYY-MM-DD HH:mm:ss');
							// Formatted times can now be compared, because the TZ string has been stripped. So basically we are comparing two different times.
							// E.g. 2019-02-01 1:30:00 (now) >= 2019-02-01 12:00:00 (opens) would be true.
							var regOpened = nowTime >= regOpens;

							if (parseInt(event.open_registration_imidiatly, 10) === 0 && !regOpened) {
								if ($btn) {
									$btn.prop('disabled', true);
								}

								if ($onlineBtn) {
									$onlineBtn.prop('disabled', true);
								}

								$('<div class="events-reg-open-message"></div>').text("Registration opens on " + moment(event.reg_opens).format('dddd') + ", " + moment(event.reg_opens).format('MMMM D YYYY') + ' at ' + moment(event.reg_opens).format('h:mma')).appendTo($item);
							}
						}


					}
				}

				if (typeof event.enable_billing !== 'undefined' && parseInt(event.enable_billing) === 1) {
					// Then there is class/ticketdata info
					$('.ticket-group', $item).remove();
					var coEventBillingInfo = new EventBillingInfo(event.recurring_id, 1, event.ticketInfo);
					var infoBox = $('<div class="eelistgroup ticket-group"></div>');
					infoBox.append(coEventBillingInfo.info).appendTo($item);
				}
			}
			return $item;
		},
		_getFeed: function (type) {
			var self = this;
			var feedData = {
				feedType: type,
				filters: {
					location: [],
					ages: [],
					types: [],
					tags: [],
					term: '',
					days: 1
				}
			};

			if (self.settings.filters) {
				var filters = self.settings.filters;
				feedData.filters.ages = filters.ages.length > 0 ? filters.ages : ['all'];
				feedData.filters.types = filters.types.length > 0 ? filters.types : ['all'];
				feedData.filters.location = self.settings.locations.length > 0 ? self.settings.locations : ['all'];
			}
			if($('.events-search-field', self.element).val() && $('.events-search-field', self.element).val().length > 0) {
				feedData.filters.term = $('.events-search-field', self.element).val();
			} else if (self.settings.term && self.settings.term.length > 0) {
				feedData.filters.term = self.settings.term;
			}

			var urlFilters = JSON.stringify(feedData);
			var url = window.location.protocol + "//" + window.location.hostname + '/feeds?data=' + btoa(urlFilters);
			this._showFeedPopup(url, feedData);
			//window.open('/feeds?data='+ urlFilters , '_blank');
		},
		_showFeedPopup: function (url, filterData) {
			var self = this;
			var term = filterData.filters.term;
			var filterString = 'Showing ';

			if (term && term.length > 2) {
				filterString += 'search results for <b>' + term + '</b> for ';
			}

			if (filterData.filters.types.length > 0) {
				filterString += filterData.filters.types.join(', ') + ' events';
			} else {
				filterString += 'all ' + self.settings.customEventLabel + 'types';
			}
			filterString += ' at ';
			if (self.settings.filters.locations.length > 0) {
				if (self.settings.filters.locations.length > 1) {
					filterString += 'these locations ' + self.settings.filters.locations.join(', ');
				} else {
					if (self.settings.filters.locations[0] !== 'all') {
						filterString += self.settings.filters.locations[0];
					} else {
						filterString += 'all locations';
					}
				}
			} else {
				filterString += 'all locations';
			}

			filterString += ' for ';
			if (filterData.filters.ages.length > 0) {
				if (filterData.filters.ages.length > 1) {
					filterString += 'the age groups ' + filterData.filters.ages.join(', ');
				} else {
					filterString += 'the age group ' + filterData.filters.ages[0];
				}
			} else {
				filterString += 'all ages';
			}


			if (filterData) {
				var icon = "fa fa-rss";
				var style = "color:#f26522";
				var title = "RSS";

				if (filterData.feedType === 'ical') {
					icon = "fa fa-calendar";
					style = "color:#3981c6";
					title = "iCal";
				}

				var html = '<div id="brochure-popup">' +
					'	<div class="row">' +
					'		<div class="col-md-12">' +
					'			<div style="float:right;"><a class="close-brochure-popup" style="cursor: pointer;">close</a></div>' +
					'			<h3 class="patron-popup heading-text"><i class="' + icon + '" style="' + style + '"></i>&nbsp;&nbsp;' + title + '&nbsp;Events Feed</h3>' +
					'		</div>' +
					'	</div>' +
					'	<div class="patron-popup top-row row">' +
					'		<div class="col-md-12">' +
					'			<strong>Feed will contain up to 500 events with filters selected, excluding dates.</strong>' +
					'		</div>' +
					'		<div class="col-md-12">' +
					'			Filtered By: ' + filterString +
					'		</div>' +
					'	</div>' +
					'	<div class="patron-popup row" style="margin-left:15px;margin-right:15px;padding-top:35px;padding-bottom:20px;">' +
					'		<div class="col-md-12">' +
					'			<input type="text" id="feed-link" class="form-control" aria-label="Feed URL" value="' + url + '"/>' +
					'		</div>' +
					'	</div>' +
					'	<div class="patron-popup button-row" style="margin-left:15px;">' +
					'		<div class="col-md-3 col-md-offset-6" style="padding-top: 10px;">' +
					'			<button class="copy-button brochure-button btn-block">Copy Link to Clipboard</button>' +
					'		</div>' +
					'		<div class="col-md-3" style="padding-top: 10px;">' +
					'			<button class="view-button brochure-button btn-block">Download File</button>' +
					'		</div>' +
					'	</div>' +

					'</div>';

				var popup = $('<div class="events2-brochure"></div>').amPopup({
					title: '',
					popUpClass: '',
					showTitle: false
				});
				popup.append(html);
				popup.on('click', '.close-brochure-popup', function () {
					popup.data('plugin_amPopup').close();
				})
					.on('click', '.copy-button', function () {
						var el = document.getElementById("feed-link");
						el.select();
						document.execCommand('copy');
					}).on('click', '.view-button', function () {
						window.open(url, '_blank');
					});
				popup.data('plugin_amPopup').open();
			}
		},
		_showBrochurePopup: function () {
			var filters = {};
			var options = {};
			var self = this;

			if (self.settings.filters) {
				filters = self.settings.filters;
			}

			if (self.settings.filterOptions) {
				options = self.settings.filterOptions;
			}

			var subData = {
				filters: filters,
				options: options,
				allowSubs: self.settings.allowSubs,
				customEventsLabel: self.settings.customEventsLabel,
				customEventLabel: self.settings.customEventLabel
			};

			var ps = new patronSubscriptions(subData);
			ps.showPopup();
		},
		// CH14299
		_showInterestedPopup: function (dateId, recurringId, eventInfo) {
			var self = this;
			var eventInfo = {
				title: eventInfo.title + ' - ' + eventInfo.sub_title,
				datestring: eventInfo.datestring + ' - ' + eventInfo.time_string,
				location: eventInfo.location
			};

			var interested = new EventBillingSubscriptions(dateId, recurringId, eventInfo, true);
			var interestedForm = interested.subscriptionForm;
			interestedForm.appendTo('body');

			$('.Event_Full-dialog').modal({
				backdrop: 'static',
				keyboard: false
			}).modal('show');

		},
		_update: function () {
			var self = this;
			if (self.paused) return;
			if (!self.initComplete) return;
			var options = {};
			var filter = {};
			options.private = self.settings.private;

			var term = $('.events-search-field', self.element).val();
			if (term && term.length > 2) {
				options.search = term;
			}

			if (self.settings.view == 'list') {
				var end = moment($('.events-range.input-daterange input[name=end]', self.listViewLeft).datepicker('getDate'));
				var start = moment($('.events-range.input-daterange input[name=start]', self.listViewLeft).datepicker('getDate'));
				var days = end.diff(start, 'days');

				if (self.settings.filters.date === start.format('YYYY-MM-DD')) {
					options.date = self.settings.filters.date;
				} else {
					options.date = start.format('YYYY-MM-DD');
				}

				if (self.settings.filters.days === days) {
					options.days = self.settings.filters.days;
				} else {
					options.days = end.diff(start, 'days');
				}

			} else {
				var date = self.gridView.data('date').clone();
				// options.date=date.isoWeekday(1).format('YYYY-MM-DD');
				options.date = date.startOf('week').format('YYYY-MM-DD');
				options.days = 42;
			}

			//if (options.days === 0) options.days = 1;

			$(".events-brochure, .brochure-grid, .events-rss, .events-ical").remove();
			var navigation = $('.events-filter-row').first();
			var brochureButton = self.settings.showBrochure ? '<div class="events-brochure"><button class="events-option-dropdown events-brochure-button"><i class="fa fa-file-pdf-o" style="color: #ED0202;"></i>&nbsp;Create Brochure</button></div>' : '';
			var rssButton = self.settings.showRSS ? '<div class="events-rss"><button class="events-option-dropdown events-rss-button"><i class="fa fa-rss" style="color: #f26522;"></i>&nbsp;RSS</button></div>' : '';
			var icalButton = self.settings.showICAL ? '<div class="events-ical"><button class="events-option-dropdown events-ical-button"><i class="fa fa-calendar" style="color: #3981c6;"></i>&nbsp;Add to Calendar</button></div>' : '';
			var left = $('.events-left');

			if (self.settings.view === "grid") {
				navigation.append($('<div class="col-md-12 brochure-grid" style="margin-top:10px;">' + brochureButton + '</div>'));
			} else {
				left.append(brochureButton);
				left.append(rssButton);
				left.append(icalButton);
			}

			$('.events-brochure-button').on('click', function () {
				//self._getBrochure();
				if (self.settings.brochureNoPopup) {
					window.location.href = "/brochure";
				} else {
					self._showBrochurePopup();
				}
			});

			$('.events-rss-button').on('click', function () {
				//self._getBrochure();
				self._getFeed('rss');
			});

			$('.events-ical-button').on('click', function () {
				//self._getBrochure();
				self._getFeed('ical');
			});

			$('.events-day-title', self.listViewRight).toggle(options.days == 0);
			$('.events-range-title', self.listViewRight).toggle(options.days >= 1);

			if (!$('#loc_all', self.listViewLeft).is(':checked')) {
				options.locations = [];
				filter.locations = [];
				$('[id^=loc_]', self.locationList).each(function () {
					if ($(this).is(':checked')) {
						options.locations.push($(this).attr('id').substr(4));
						filter.locations.push($.trim($(this).parent().text()));
					}
				});
			}
			if (!$('#group_all', self.listViewLeft).is(':checked')) {
				options.ages = [];
				filter.ages = [];
				$('[id^=group_]', self.ageList).each(function () {
					if ($(this).is(':checked')) {
						options.ages.push(encodeURIComponent($(this).attr('value')));
						filter.ages.push($.trim($(this).parent().text()));
					}
				});
			}
			if (!$('#type_all', self.listViewLeft).is(':checked')) {
				options.types = [];
				filter.types = [];
				$('[id^=type_]', self.typeList).each(function () {
					if ($(this).is(':checked')) {
						options.types.push(encodeURIComponent($(this).attr('value')));
						filter.types.push($.trim($(this).parent().text()));
					}
				});
			}
			if ((term && term.length > 2) || filter.locations.length > 0 || filter.ages.length > 0 || filter.types.length > 0) {
				var filterString = 'Showing ';
				if (term && term.length > 2) {
					filterString += 'search results for <b>' + term + '</b> for ';
				}
				if (filter.types.length > 0) {
					filterString += filter.types.join(', ') + ' events';
				} else {
					filterString += 'all ' + self.settings.customEventLabel + ' types';
				}
				filterString += ' at ';
				if (filter.locations.length > 0) {
					filterString += filter.locations.join(', ');
				} else {
					filterString += 'all locations';
				}
				filterString += ' for ';
				if (filter.ages.length > 0) {
					if (filter.ages.length > 1) {
						filterString += 'the age groups ' + filter.ages.join(', ');
					} else {
						filterString += 'the age group ' + filter.ages[0];
					}
				} else {
					filterString += 'all ages';
				}
				$('.events-filter-message', self.views).html(filterString);
				$('.events-filter-details', self.views).fadeIn();
			} else {
				$('.events-filter-details', self.views).hide();
			}
			$('.events-date-range-string', self.listViewRight).text('');

			var $list = $('.events-body', self.listViewRight).empty().text('Loading events...');

			var $grid = $('.events-grid-body', self.gridView).empty().text('Loading events...');

			// Fix for bad dates.
			options.days++;

			// Request for brochure on front-end, need to save off the filters - which are all the options used to get event data
			var filterOptions = {
				ages: filter.ages,
				locations: filter.locations,
				types: filter.types,
				days: options.days,
				date: options.date,
				private: options.private,
				term: options.search
			};

			self.settings.locations = options.locations;
			self.settings.filters = filterOptions;
			if (typeof (filterString) !== "undefined") {
				self.settings.filters.display = filterString.substr(7);
			} else {
				self.settings.filters.display = "All events for date range, no filters.";
			}

			if (typeof (options.display) !== "undefined") {
				delete options.display;
			}

			self.settings.filterOptions = options;
			self._setURLPieces();

			var website = (window.websiteUrl || "");
			$.getJSON(website + '/eeventcaldata?event_type=' + self.settings.type + '&req=' + encodeURIComponent(JSON.stringify(options)), function (data) {
				if (self.settings.view == 'list') {
					$('.events-date-string', self.listViewRight).text(start.format('MMMM D YYYY'));
					$('.events-date-range-string', self.listViewRight).text(start.format('MMMM D YYYY') + ' - ' + end.format('MMMM D YYYY'));
					$list.empty();
					$.each(data, function (index, val) {

						var cancelled = parseInt(val.changed);
						if ((cancelled !== 1 || isNaN(cancelled)) || self.settings.eventsCalendarShowCancelledEvents) {
							$('<div class="eelistevent"></div>').append(self._getEventBlock(val, false)).appendTo($list);
						}
					});
					if ($list.children().length === 0) $list.html('<div class="eelisttitle" style="margin-left:20px">Sorry there are no events that match your selection.</div>');
				} else if (self.settings.view == 'grid') {
					var sortedData = {};
					$.each(data, function (index, val) {
						var d = moment(val.raw_start_time).format('YYYY-M-D');
						if (!sortedData[d]) sortedData[d] = [];

						var cancelled = parseInt(val.changed);
						if ((cancelled !== 1 || isNaN(cancelled)) || self.settings.eventsCalendarShowCancelledEvents) {
							sortedData[d].push(val);
						}
					});
					$grid.empty();
					var month = self.gridView.data('date').format('M');
					$('.events-date-string', self.gridView).text(self.gridView.data('date').format('MMMM YYYY'));

					var a = moment(options.date);
					var b = a.clone().add(42, 'days');
					var row = false;
					for (var m = a; m.isBefore(b); m.add(1, 'days')) {
						if (m.format('e') == 0) {
							row = $('<div class="events-grid-row"></div>').appendTo($grid);
						}
						var cell = $('<div class="events-grid-cell noselect"></div>').appendTo(row);

						$('<span class="events-grid-cell-date fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="events-grid-cell-date-number fa fa-stack-1x">' + m.format('D') + '</i></span>').appendTo(cell);
						var cellContent = $('<div class="events-grid-cell-content"></div>').appendTo(cell);
						var cellTypes = $('<div class="events-grid-cell-types"></div>').appendTo(cell);

						if (m.format('M') !== month) cell.addClass('events-grid-cell-fade');
						if (m.isSame(moment().startOf('day'))) cell.addClass('events-grid-cell-today');
						cell.data('events', sortedData[m.format('YYYY-M-D')] || []);

						if (cell.data('events').length > 0) {
							var dayData = cell.data('events');
							var evts = $('<div class="events-grid-cell-event-holder"></div>').appendTo(cell);
							if (dayData.length <= self.settings.inCellEvents) {
								$.each(dayData, function (index, val) {
									if (self.settings.eventsGroupCalenderBAge) {
										var age = val.agesArray[0];
										if (parseInt(val.changed, 10) === 2) {
											var start = (val.changed_start_time == '12:00am' && val.changed_end_time == '11:59pm') ? 'All day' : val.changed_start_time;
										} else {
											var start = (val.start_time == '12:00am' && val.end_time == '11:59pm') ? 'All day' : val.start_time;
										}
										var dotColour = typeof self.ages[age] !== 'undefined' ? self.ages[age] : self._genColour(age);
									} else {
										var tag = val.tagsArray[0];
										if (parseInt(val.changed, 10) === 2) {
											var start = (val.changed_start_time == '12:00am' && val.changed_end_time == '11:59pm') ? 'All day' : val.changed_start_time;
										} else {
											var start = (val.start_time == '12:00am' && val.end_time == '11:59pm') ? 'All day' : val.start_time;
										}
										var dotColour = typeof self.tags[tag] !== 'undefined' ? self.tags[tag] : self._genColour(tag);
									}
									var evcell = $('<div class="events-grid-cell-event"><i class="fa fa-circle" style="color:' + dotColour + '"></i> <b>' + start + '</b> ' + val.title + '</div>').data('event', val).appendTo(evts);
									evcell.qtip({
										content: {
											text: function (event, api) {
												return self._getEventBlock(val, true);
											}
										},
										style: {
											classes: 'qtip-bootstrap events-popup',
											def: false,
											width: 500
										},
										hide: {
											fixed: true,
											delay: 300
										},
										position: {
											viewport: $(window)
										}
									});

								});
							} else {
								var locs = [];
								var tags = {};
								$.each(dayData, function (index, val) {
									if (parseInt(val.changed, 10) == 1) return; // Do not show cancelled events in total
									locs.push(val.location);
									if (self.settings.eventsGroupCalenderBAge) {
										if (val.ages) {
											$.each(val.agesArray, function (index, val) {
												if (!tags[val]) {
													tags[val] = 1;
												} else {
													tags[val]++;
												}
											});
										}
									} else {
										if (val.tags) {
											$.each(val.tagsArray, function (index, val) {
												if (!tags[val]) {
													tags[val] = 1;
												} else {
													tags[val]++;
												}
											});
										}
									}
								});
								locs = locs.filter(function (item, i, ar) {
									return ar.indexOf(item) === i;
								});

								var i = 0;
								$.each(tags, function (type, total) {
									i++;
									if (i <= 14) {
										if (self.settings.eventsGroupCalenderBAge) {
											var textColour = self._getContrastYIQ(self.ages[type] || self._genColour(type));
											$('<span title="' + type + '" class="events-grid-cell-type fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:' + textColour + '" class="events-grid-cell-type-number fa fa-stack-1x">' + total + '</i></span>').css('color', self.ages[type] || self._genColour(type)).appendTo(cellTypes);
										} else {
											var textColour = self._getContrastYIQ(self.tags[type] || self._genColour(type));
											$('<span title="' + type + '" class="events-grid-cell-type fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i style="color:' + textColour + '" class="events-grid-cell-type-number fa fa-stack-1x">' + total + '</i></span>').css('color', self.tags[type] || self._genColour(type)).appendTo(cellTypes);
										}
									}
								});
								if (i > 14) {
									$('<div class="events-grid-cell-more">+ ' + (i - 14) + ' more ' + self.settings.customEventLabel + ' types</div>').appendTo(cellTypes);
								}
								var summary = dayData.length + ' ' + self.settings.customEventsLabel + ' at<br>';
								summary += locs.length > 1 ? locs.length + ' locations' : ' 1 location';
								cellContent.prepend(summary);
							}
						}

					}

				}
			});
		},
		_eraseCookie: function (name) {
			createCookie(name, "", -1);
		},
		_createCookie: function (name, value, days) {
			var expires = "";
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();
			}
			document.cookie = name + "=" + value + expires + "; path=/";
		},
		_readCookie: function (name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		},
		setView: function (view) {
			var self = this;
			self._createCookie('eventsView', view, 365);
			$('.linkcolour', self.viewPicker).removeClass('linkcolour');
			$('[data-view=' + view + ']', self.viewPicker).addClass('linkcolour');
			$('[data-view]', self.views).hide();
			$('[data-view=' + view + ']', self.views).show();

			if (self.settings.view == view) return;
			self.settings.view = view;
			self._update();
		},
		reload: function () {
			this._update();
		},
		_getContrastYIQ: function (hexcolor) {
			var r = parseInt(hexcolor.substr(1, 2), 16);
			var g = parseInt(hexcolor.substr(3, 2), 16);
			var b = parseInt(hexcolor.substr(5, 2), 16);
			var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
			return (yiq >= 128) ? 'black' : 'white';
		},
		_genColour: function (str) {
			for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
			for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
			return colour;
		},
		_genColumn: function (item, idx, targetEle, last) {
			var self = this;
			if (self.settings.filterCurrentColumn === null) {
				self.settings.filterCurrentColumn = $('<div style="float:left;width:250px;" />');
			}

			var limit = (typeof this.settings.filterMaxItems !== "undefined") ? this.settings.filterMaxItems : 15;
			if (idx % limit === 0) {
				self.settings.filterCurrentColumn.appendTo(targetEle);
				if (idx > 0) {
					self.settings.filterCurrentColumn = $('<div style="float:left;width:250px;" />');
					self.settings.filterCurrentColumnCount++;
				}
			}

			item.appendTo(self.settings.filterCurrentColumn);

			if (last) {
				var colsMax = 250;
				self.settings.filterCurrentColumn.appendTo(targetEle);
				colsMax = (self.settings.filterCurrentColumnCount + 1) * 250;
				targetEle.css('max-width', colsMax.toString() + "px !important");
				self.settings.filterCurrentColumn = null;
				self.settings.filterCurrentColumnCount = 0;
			}
		},
		_loadFilters: function () {
			var self = this;
			$.getJSON(this.settings.apiServer + '/v1/' + self.settings.client + '/locations', function (json, textStatus) {
				self.locations = json;

				$.each(json, function (index, val) {
					var lcName = val.name.toLowerCase().replace(/,/g, '');
					var checked = self.settings.locations.indexOf(lcName) >= 0 ? 'checked="checked"' : '';
					if (self.settings.excludedLocations.length > 0) {
						checked = self.settings.excludedLocations.indexOf(lcName) >= 0 ? '' : 'checked="checked"';
					}
					var item = $('<label for="loc_' + val.id + '"><input value="' + val.id + '" id="loc_' + val.id + '" type="checkbox" ' + checked + ' aria-label="Location Filter: ' + val.name + '"> ' + val.name + '</label>');
					self._genColumn(item, index, self.locationList, index === (json.length - 1));
				});

				self.locationsLoaded = true;
				if (self.agesLoaded && self.locationsLoaded && self.tagsLoaded) self._update();
			}).error(function (jqXHR, textStatus, errorThrown) {
				console.log(errorThrown);
			});

			$.getJSON(this.settings.apiServer + '/v1/' + self.settings.client + '/eventstags', function (json, textStatus) {
				if (self.settings.eventsGroupCalenderBAge) {
					self.tags = json;

					$.each(json, function (index, val) {
						var lcName = val.name.toLowerCase();
						var checked = self.settings.types.indexOf(lcName) >= 0 ? 'checked="checked"' : '';
						if (self.settings.excludedTypes.length > 0) {
							checked = self.settings.excludedTypes.indexOf(lcName) >= 0 ? '' : 'checked="checked"';
						}
						var item = $('<label for="type_' + index + '"><input value="' + val.name + '" id="type_' + index + '" type="checkbox" ' + checked + ' aria-label="Age Filter: ' + val.name + '"> ' + val.name + '</label>');
						self._genColumn(item, index, self.typeList, index === (json.length - 1));
					});
				} else {
					self.tags = {};

					$.each(json, function (index, val) {
						if (!val.colour) {
							val.colour = self._genColour(val.name);
						}

						self.tags[val.name] = val.colour;
						var lcName = val.name.toLowerCase();
						var checked = '';
						if (self.settings.types.length > 0) {
							checked = self.settings.types.indexOf(lcName) >= 0 ? 'checked="checked"' : '';
						} else if (self.settings.excludedTypes.length > 0) {
							checked = self.settings.excludedTypes.indexOf(lcName) >= 0 ? '' : 'checked="checked"';
						} else {
							//checked = 'checked="checked"';
						}
						var item = $('<label for="type_' + index + '"><input value="' + val.name + '" id="type_' + index + '" type="checkbox" ' + checked + ' aria-label="Type Filter: ' + val.name + '"> <i class="fa fa-circle" style="color:' + val.colour + '"></i> ' + val.name + '</label>');
						self._genColumn(item, index, self.typeList, index === (json.length - 1));
					});
				}

				self.tagsLoaded = true;
				if (self.agesLoaded && self.locationsLoaded && self.tagsLoaded) self._update();
			});
			$.getJSON(this.settings.apiServer + '/v1/' + self.settings.client + '/eventsages', function (json, textStatus) {
				if (self.settings.eventsGroupCalenderBAge) {
					self.ages = {};

					$.each(json, function (index, val) {
						if (!val.colour) {
							val.colour = self._genColour(val.name);
						}

						self.ages[val.name] = val.colour;
						var lcName = val.name.toLowerCase();
						var checked = self.settings.ages.indexOf(lcName) >= 0 ? 'checked="checked"' : '';
						if (self.settings.excludedAges.length > 0) {
							checked = self.settings.excludedAges.indexOf(lcName) >= 0 ? '' : 'checked="checked"';
						}
						var item = $('<label for="group_' + index + '"><input value="' + val.name + '" id="group_' + index + '" type="checkbox" ' + checked + '  aria-label="Ages Filter: ' + val.name + '"> <i class="fa fa-circle" style="color:' + val.colour + '"></i> ' + val.name + '</label>');
						self._genColumn(item, index, self.ageList, index === (json.length - 1));
					});
				} else {
					self.ages = json;

					$.each(json, function (index, val) {
						var lcName = val.name.toLowerCase();
						var checked = self.settings.ages.indexOf(lcName) >= 0 ? 'checked="checked"' : '';
						if (self.settings.excludedAges.length > 0) {
							checked = self.settings.excludedAges.indexOf(lcName) >= 0 ? '' : 'checked="checked"';
						}
						var item = $('<label for="group_' + index + '"><input value="' + val.name + '" id="group_' + index + '" type="checkbox" ' + checked + ' aria-label="Ages Filter: ' + val.name + '"> ' + val.name + '</label>');
						self._genColumn(item, index, self.ageList, index === (json.length - 1));
					});
				}
				self.agesLoaded = true;
				if (self.agesLoaded && self.locationsLoaded && self.tagsLoaded) self._update();
			});
		}
	});

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
