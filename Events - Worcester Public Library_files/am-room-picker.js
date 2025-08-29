;
(function ($, window, document, undefined) {
	"use strict";
	var pluginName = "amPatronRoomPicker",
		defaults = {
			singleScene: false,
			animation: true,
			templates: false,
			enablePatronNotes: false,
			enableExpectedAttendees: false,
			expectedAttendeesRequired: false,
			emailRequired: false,
			layoutRequired: false,
			chargingEnabled: false,
			ecommerceEnabled: false,
			pinlessAuth: false,
			phoneRequired: false,
			loginRequired: false,
			useSetupBreakdown: true,
			adjustSetupBreakdown: false,
			roomsPatronDetailsReadonly: false,
			timezone: 'America/New_York',
			scenes: []
		};
	var self = false;
	// The actual plugin constructor
	function Plugin(element, options) {
		self = this;
		this.element = element;
		this.$element = $(element);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.booking = {};
		self.locations = {};
		self.rooms = [];
		self.moving = false;
		self.singleBranch = false;
		this.init();
	}
	$.extend(true, Plugin.prototype, $.fn['amShared']);
	$.extend(Plugin.prototype, {
		init: function () {
			self._buildInterface();
			self._bindEvents();
		},
		_buildInterface: function () {
			// self.extras=$('.amrp-room-extras').clone(true).removeAttr('style');
			self.holder = $('<div class="amrp-holder"></div>').appendTo(self.element);
			self.screenHeader = $('<div class="amrp-screen-header"></div>').appendTo(self.holder).hide();
			self.chooseScreen = $('<div class="amrp-choose-screen"></div>').appendTo(self.holder);
			self.reserveScreen = $('<div class="amrp-reserve-screen"></div>').appendTo(self.holder).hide();
			self.confirmScreen = $('<div class="amrp-confirm-screen"></div>').appendTo(self.holder).hide();
			self.screenThankyou = $('<div class="amrp-thanks-screen"></div>').appendTo(self.holder).hide();
			// self.chooseTabs = $('<ul class="nav nav-tabs" role="tablist">'+
			// 	'<li class="active"><a href="#bblocation" data-toggle="tab" data-type="location">Book by location</a></li>'+
			// 	'<li><a href="#bbresource" data-toggle="tab"  data-type="resource">Book by resource</a></li>'+
			// 	// '<li><a href="#bbavailability" data-toggle="tab"  data-type="availability">Book by availability</a></li>'+
			// 	'</ul>').appendTo(self.chooseScreen);
			/*=============start book by location===========*/
			var topRow = $('<div></div>').addClass('row').appendTo(self.chooseScreen);
			self.locationBottomRow = $('<div></div>').appendTo(self.chooseScreen).hide();
			self.locationCol = $('<div></div>').addClass('col-md-4').prepend('<h2>Choose a branch</h2>').appendTo(topRow);
			self.locationClosed = $('<div>Sorry this branch is closed on the selected day</div>').appendTo(self.chooseScreen).hide();
			var dateCol = $('<div>' + '<div class="form-group">' + '<div class="input-group amrp-datepicker">' + '<input type="text" class="form-control" />' + '<span class="input-group-addon">' + '<span class="am-events"></span>' + '</span>' + '</div>' + '</div>' + +'</div>').addClass('col-md-4').prepend('<h2>Choose a date</h2>').appendTo(topRow);
			var timeCol = $('<div></div>').addClass('col-md-4').prepend('<h2>Choose a time</h2>').appendTo(topRow);
			self.timeRange = $('<div class="amrp-time-range input-group"></div>').appendTo(timeCol);
			self.startTime = $('<input autocomplete="off" id="stime" class="form-control input-small" value="9:00am"/>').appendTo(self.timeRange)
			$('<span class="input-group-addon"></span>').text('to').appendTo(self.timeRange);
			self.endTime = $('<input autocomplete="off" id="etime" class="form-control input-small" value="10:00am"/>').appendTo(self.timeRange);
			self.locationList = $('<select class="form-control input-sm"></select>').appendTo(self.locationCol);
			$.getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/locations', {
				only_with_external_rooms: 1,
				only_with_patron_rooms: 1
			}, function (json, textStatus) {
				$('<option></option>').text('Please choose....').attr('value', '').appendTo(self.locationList);
				for (var i = 0; i < json.length; i++) {
					self.locations[json[i].id] = json[i];
					$('<option></option>').text(json[i].name).attr('value', json[i].id).appendTo(self.locationList);
				}
				if (json.length <= 1) {
					self.singleBranch = true;
					self.locationList.val(json[0].id).trigger('change');
					self.locationCol.hide();
				}
			});
			self.roomList = $('<div class="amrp-rooms-list"></div>').appendTo(self.locationBottomRow);
			var key = $('<div class="amrp-rooms-key">' + '<span><span class="amrp-rooms-key-i"></span>Available</span>' + '<span><span class="amrp-rooms-key-i" data-status="1"></span>Unavailable</span>' + '</div>').appendTo(self.locationBottomRow);
			if (self.settings.useSetupBreakdown) {
				$('<span class="amrp-key-message">Time is needed for library staff to set up and break down some rooms.</span>').prependTo(key);
				$('<span><span class="amrp-rooms-key-i amrp-setup-breakdown"></span>Setup &amp; Breakdown</span>').appendTo(key);
			}
			/*=============end book by location===========*/
			/*=============start book by resource===========*/
			self.ressourceCol = $('<div></div>').addClass('col-md-4').prepend('<h2>Choose a resource</h2>').prependTo(topRow).hide();
			self.resourceList = $('<select class="form-control input-sm"></select>').appendTo(self.ressourceCol);
			$.getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/resources', function (json, textStatus) {
				$('<option></option>').text('Please choose....').attr('value', '').appendTo(self.resourceList);
				$.each(json, function (index, val) {
					self.resources[val.id] = val;
					$('<option></option>').text(val.name).attr('value', val.id).appendTo(self.resourceList);
				});
			});
			/*=============end book by resource===========*/
			$('<div class="amrp-room-summary-back link amrp-back-to-picker">Back to room picker</div>').appendTo(self.screenHeader);
			self.reserveRoomSummary = $('<div class="amrp-room-summary"></div>').appendTo(self.screenHeader);
			self.loginForm = $('<div class="amrp-login-form"></div>').appendTo(self.reserveScreen);
			if(self.settings.pinlessAuth){
				if (self.settings.loginRequired) {
					self._createField('login_card', 'text', 'Library card number', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amrp-lookup input-group-addon">Login</span>', 'A library card is required to book a room.')
					.appendTo(self.loginForm);
				}
			}else{
				self._createField('login_card', 'text', 'Library card number', false).addClass('amrp-card').appendTo(self.loginForm);
				if (self.settings.loginRequired) {
					var pin = self._createField('login_pin', 'password', 'PIN / Password', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amrp-lookup input-group-addon">Login</span>', 'A library card is required to book a room.')
					.appendTo(self.loginForm);
				} else{
					var pin = self._createField('login_pin', 'password', 'PIN / Password', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amrp-lookup input-group-addon">Look up details</span>', 'Enter your Library card number and PIN and we\'ll look up your details to fill in the next fields.').appendTo(self.loginForm);
				}
			}
			$('<div class="amrp-spacer"><div class="events2-error-message"></div></div>').appendTo(self.reserveScreen);
			self.detailsForm = $('<div></div>').appendTo(self.reserveScreen);

			self._createField('contact_first_name', 'text', 'First name', true).appendTo(self.detailsForm);
			self._createField('contact_last_name', 'text', 'Last name', true).appendTo(self.detailsForm);
			// self._createField('zip_code', 'text', 'Zip code', true).appendTo(self.detailsForm);
			self._createField('contact_email', 'text', 'Email', self.settings.emailRequired, false, 'We\'ll use the email address to confirm the booking and to notify if the room becomes unavailable.').appendTo(self.detailsForm);
			self._createField('contact_tel', 'text', 'Phone', self.settings.phoneRequired, false).appendTo(self.detailsForm);
			$('<input type="hidden" id="librarycard" value="">').appendTo(self.detailsForm);
			self._createField('group_name', 'text', 'Group name', true, false, '(This is <b>not displayed</b> to the public)').appendTo(self.detailsForm);
			self._createField('booking_title', 'text', 'Booking title', true, false, '(This <b>will be displayed</b> to the public)').appendTo(self.detailsForm);
			if (self.settings.enableExpectedAttendees) {
				self._createField('expected_attendees', 'number', 'Attendees', self.settings.expectedAttendeesRequired, false, 'Number of attendees expected.',0).appendTo(self.detailsForm);
			}
			if (self.settings.enablePatronNotes) {
				self._createField('patron_notes', 'textarea', 'Notes', false, false, false).appendTo(self.detailsForm);
			}
			self.customQuestions = $('<div class="amrp-custom-questions"></div>').appendTo(self.detailsForm);
			$('<div class="amrp-buttons">' + '<span class="amrp-required-label"><span class="required-field"></span> field required</span>' + '<button class="btn btn-edit amrp-back-to-picker">Cancel</button>' + '<button class="btn btn-success amrp-to-confirm-screen">Next</button>' + '</div>').appendTo(self.detailsForm);
			$('<div class="row">' + '<div class="col-sm-3 amrp-booking-room-details"></div>' + '<div class="col-sm-6 amrp-booking-options"></div>' + '<div class="col-sm-3 amrp-booking-final-summary"></div>' + '</div>').appendTo(self.confirmScreen);
			$('<div class="amrp-buttons">' + '<button class="btn btn-edit amrp-back-to-reserve">Back</button>' + '<button class="btn btn-success amrp-submit-booking" disabled="true">Reserve</button>' + '</div>').appendTo(self.confirmScreen);

			if (self.settings.loginRequired) {
				self.detailsForm.hide();
			} else {
				self.loginForm.hide();

				if(self.settings.librarycardnumber) $('#librarycard', self.detailsForm).val(self.settings.librarycardnumber);
				if(self.settings.patron.data && self.settings.patron.data.names[0]) $('#contact_first_name', self.detailsForm).val(self.settings.patron.data.names[0].first_name);
				if(self.settings.patron.data && self.settings.patron.data.names[0]) $('#contact_last_name', self.detailsForm).val(self.settings.patron.data.names[0].last_name);
				if(self.settings.patron.data && self.settings.patron.data.emails[0]) $('#contact_email', self.detailsForm).val(self.settings.patron.data.emails[0]);
				if(self.settings.patron.data && self.settings.patron.data.phones[0]) $('#contact_tel', self.detailsForm).val(self.settings.patron.data.phones[0]);
			}
		},
		_reset: function () {
			self.booking = {};
			$('.amrp-submit-booking').prop('disabled', 'true');
			$('input[type=text],input[type=password]', self.reserveScreen).val("");
			if($('option', self.locationList).length>2){
				self.locationList.val("").trigger('change');
			}
		},
		_bindEvents: function () {
			// $('a[data-toggle="tab"]', self.chooseTabs).on('shown.bs.tab', function (e) {
			// 	var target = $(this).attr("data-type");
			// 	switch(target){
			// 		case 'resource':
			// 			self.locationCol.hide();
			// 			self.ressourceCol.show();
			// 		break;
			// 		case 'location':
			// 		default:
			// 			self.locationCol.show();
			// 			self.ressourceCol.hide();
			// 		break;
			// 	}
			// });
			self.confirmScreen.on('change', '.amrp-bookable-assets-list input, .amrp-bookable-assets-list select', function (event) {
				event.preventDefault();
				self._updateBookedAssets();
			}).on('change', '.agreed', function (event) {
				event.preventDefault();
				if ($(this).is(':checked')) {
					$('.amrp-submit-booking').removeProp('disabled');
				} else {
					$('.amrp-submit-booking').prop('disabled', 'true');
				}
			});
			self.holder.on('click', '.amrp-submit-booking', function (event) {
				event.preventDefault();
				// if(self.booking.layout.length)
				var start = moment(self.booking.start_time);
				var end = moment(self.booking.end_time);
				var booking = JSON.parse(JSON.stringify(self.booking));
				booking.room_id = booking.room.id;
				booking.layout_id = booking.layout.id;
				booking.customQuestions = JSON.stringify(booking.customQuestions);
				var room = JSON.parse(JSON.stringify(booking.room));
				if(self.settings.layoutRequired && room.layouts && room.layouts.length>0 && !self.booking.layout.id){
					alert('Please select a room layout');
					return;
				}

				delete booking.room;
				delete booking.layout;

				$.post('/reserve?action=submit', booking, function (json, textStatus) {
					if(!json.ok){
						alert(json.message || 'Sorry there was a problem creating your booking, please try again.');
						return;
					}
					self.chooseScreen.hide();
					self.reserveScreen.hide();
					self.confirmScreen.hide();
					self.screenHeader.hide();
					self.screenThankyou.show().empty();

					var extra = '';
					if (room.restrictions.unmediated) {
						$('<div class="events2-reg-thanks-stage">' + '<div class="events2-reg-thanks-title">Thank you!</div>' + '<div class="events2-reg-thanks-details">Your booking for the following room is now confirmed: ' + '<div class="events2-reg-thanks-evtitle">' + self.booking.room.title + '</div>' + '<div class="events2-reg-thanks-evlocation">' + self.locations[self.booking.room.location_id].name + '</div>' + '<div class="events2-reg-thanks-evdate">' + start.format('MMMM DD, YYYY') + '</div>' + '<div class="events2-reg-thanks-evtime">' + start.format('h:mma') + ' - ' + end.format('h:mma') + '</div>' + extra + '</div>' + '<div class="events2-reg-thanks-online">' + '<div class="events2-reg-thanks-online-title">View online</div>' + '<div class="events2-reg-thanks-message">You can view the status of your room bookings at:</div>' + '<div><a href="/myreservations">' + window.location.hostname + '/myreservations</a></div>' + '<div class="events2-reg-thanks-ref">This event registration reference: <b>' + json.reference + '<b></div>' + '</div>' + '</div>').appendTo(self.screenThankyou);
					} else {
						$('<div class="events2-reg-thanks-stage">' + '<div class="events2-reg-thanks-title">Thank you!</div>' + '<div class="events2-reg-thanks-details">We have received your request for a room booking for: ' + '<div class="events2-reg-thanks-evtitle">' + self.booking.room.title + '</div>' + '<div class="events2-reg-thanks-evlocation">' + self.locations[self.booking.room.location_id].name + '</div>' + '<div class="events2-reg-thanks-evdate">' + start.format('MMMM DD, YYYY') + '</div>' + '<div class="events2-reg-thanks-evtime">' + start.format('h:mma') + ' - ' + end.format('h:mma') + '</div>' + extra + '<div class="events2-reg-thanks-message">Once your reservation has been approved you will receive confirmation.</div>' + '</div>' + '<div class="events2-reg-thanks-online">' + '<div class="events2-reg-thanks-online-title">View online</div>' + '<div class="events2-reg-thanks-message">You can view the status of your room bookings at:</div>' + '<div><a href="/myreservations">' + window.location.hostname + '/myreservations</a></div>' + '<div class="events2-reg-thanks-ref">This event registration reference: <b>' + json.reference + '<b></div>' + '</div>' + '</div>').appendTo(self.screenThankyou);
					}
					$('<div class="amrp-room-summary-back link amrp-back-to-picker">Make another reservation</div>').appendTo(self.screenThankyou);
					self._reset();
				}, 'json');
			}).on('click', '.amrp-back-to-picker', function (event) {
				event.preventDefault();
				self.chooseScreen.show();
				self.reserveScreen.hide();
				self.confirmScreen.hide();
				self.screenHeader.hide();
				self.screenThankyou.hide();
				if (self.settings.loginRequired) {
					self.loginForm.show();
					self.detailsForm.hide();
				}
			}).on('click', '.amrp-back-to-reserve', function (event) {
				event.preventDefault();
				self.chooseScreen.hide();
				self.reserveScreen.show();
				self.confirmScreen.hide();
				self.screenHeader.show();
			}).on('click', '.amrp-to-confirm-screen', function (event) {
				event.preventDefault();
				if (!self.booking.contact) self.booking.contact = {};
				self.booking.contact.first_name = $('#contact_first_name', self.holder).val();
				self.booking.contact.last_name = $('#contact_last_name', self.holder).val();
				self.booking.contact.phone = $('#contact_tel', self.holder).val();
				self.booking.contact.email = $('#contact_email', self.holder).val();
				self.booking.contact.librarycard = $('#librarycard', self.holder).val();
				self.booking.contact.group_name = $('#group_name', self.holder).val();
				self.booking.contact.booking_title = $('#booking_title', self.holder).val();
				self.booking.expected_attendees = parseInt($('#expected_attendees', self.holder).val()||0, 10);
				self.booking.patron_notes = $('#patron_notes', self.holder).val();

				// CH#1957 - CK - Fix for when max is 0 to ignore the message.
				// 2-26-18 - Fix for wrong room object being used in V1 as compared to other pickers.
				var maxCapacity = Math.max(parseInt(self.booking.room.capacity_standing, 10), parseInt(self.booking.room.capacity_chairs, 10), parseInt(self.booking.room.capacity_tables, 10));
				if (self.settings.enforceMaxAttendees && (self.booking.expected_attendees > maxCapacity) && maxCapacity > 0) {
					$('.events2-error-message', self.holder).text('Expected attendees exceeds capacity').fadeIn().delay(3000).fadeOut();
					$('#expected_attendees', self.holder).addClass('amrp-missing-field');
					return;
				}
				self.booking.customQuestions = {};
				var reemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				var rephone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
				if (!self._isFormClean(self.reserveScreen)) {
					$('.events2-error-message', self.holder).text('Please enter information for all required fields').fadeIn().delay(3000).fadeOut();
					return;
				}
				if (!$('#contact_email', self.holder).prop('disabled') && self.booking.contact.email.length > 0 && !reemail.test(self.booking.contact.email)) {
					$('.events2-error-message', self.holder).text('Please enter a valid email address').fadeIn().delay(3000).fadeOut();
					$('#contact_email', self.holder).addClass('amrp-missing-field');
					return;
				}
				if (!$('#contact_tel', self.holder).prop('disabled') && self.booking.contact.phone.length > 0 && !rephone.test(self.booking.contact.phone)) {
					$('.events2-error-message', self.holder).text('Please enter a valid phone number').fadeIn().delay(3000).fadeOut();
					$('#contact_tel', self.holder).addClass('amrp-missing-field');
					return;
				}
				if (self.booking.room.custom_fields && self.booking.room.custom_fields.fields && self.booking.room.custom_fields.fields.length > 0) {
					for (var i = self.booking.room.custom_fields.fields.length - 1; i >= 0; i--) {
						var field = self.booking.room.custom_fields.fields[i];
						var val = false;
						switch (field.type) {
							case 'checkbox':
								val = $('#' + field.name, self.customQuestions).is(':checked');
								break;
							default:
								val = $('#' + field.name, self.customQuestions).val();
								break;
						}
						switch (field.validate) {
							case 'custom':
								var flags = field.regex.replace(/.*\/([gimy]*)$/, '$1');
								var pattern = field.regex.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
								var regex = new RegExp(pattern, flags);
								if (val.length > 0 && !regex.test(val)) {
									$('.events2-error-message', self.holder).text('The information entered is not valid').fadeIn().delay(3000).fadeOut();
									$('#' + field.name, self.holder).addClass('amrp-missing-field');
									return;
								}
							break;
							case 'email':
								if (val.length > 0 && !reemail.test(val)) {
									$('.events2-error-message', self.holder).text('Please enter a valid email address').fadeIn().delay(3000).fadeOut();
									$('#' + field.name, self.holder).addClass('amrp-missing-field');
									return;
								}
								break;
							case 'phone':
								if (val.length > 0 && !rephone.test(val)) {
									$('.events2-error-message', self.holder).text('Please enter a valid phone number').fadeIn().delay(3000).fadeOut();
									$('#' + field.name, self.holder).addClass('amrp-missing-field');
									return;
								}
								break;
						}
						if (val) self.booking.customQuestions[field.name] = val;
					}
				}
				self._confirmScreen();
			}).on('click', '.amrp-lookup', function (event) {
				event.preventDefault();
				var b = $(this).button('loading');

				// CH#1942 - Trim the card/pin fields to prevent blanks.
				var card = $.trim($('#login_card', self.holder).val());
				var loginData  = {u:card, 'type':'reserve'};
				if(!self.settings.pinlessAuth){
					loginData.p = $.trim($('#login_pin', self.holder).val());
				}
				$.getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/patron', loginData, function (json, textStatus) {
					if (json.result == 'ok') {
						if(!self.settings.pinlessAuth){
							if (json.data.names.length > 0) {
								$('#contact_first_name', self.holder).val(json.data.names[0].first_name);
								$('#contact_last_name', self.holder).val(json.data.names[0].last_name);
								if(self.settings.roomsPatronDetailsReadonly){
									$('#contact_first_name', self.holder).prop('disabled', true);
									$('#contact_last_name', self.holder).prop('disabled', true);
								}
							}
							if (json.data.phones.length > 0) {
								$('#contact_tel', self.holder).val(json.data.phones[0]);
								if(self.settings.roomsPatronDetailsReadonly){
									$('#contact_tel', self.holder).prop('disabled', true);
								}
							}
							if (json.data.emails.length > 0) {
								$('#contact_email', self.holder).val(json.data.emails[0]);
								if(self.settings.roomsPatronDetailsReadonly){
									$('#contact_email', self.holder).prop('disabled', true);
								}							}
						}
						if (json.data.barcodes.length > 0) {
							$('#librarycard', self.holder).val(json.data.barcodes[0]);
						}
						if (self.settings.loginRequired) {
							self.loginForm.hide();
							self.detailsForm.show();
						}
					} else {
						var msg = self.settings.pinlessAuth?'Sorry, card number not found':'Sorry, pin or card number not found';
						if( json.message && json.message.length>0 ){
							msg = json.message;
						}
						$('.events2-error-message', self.holder).text(json.message||msg).fadeIn().delay(3000).fadeOut();
					}
					b.button('reset');
				}).error(function () {
					$('.events2-error-message', self.holder).text('Sorry, there was a problem making the request').fadeIn().delay(3000).fadeOut();
					b.button('reset');
				});
			});
			self.reserveScreen.on('focus', '.amrp-missing-field', function (event) {
				$(this).removeClass('amrp-missing-field');
			});
			self.datePicker = $('.amrp-datepicker', self.holder);
			self.startTime.timepicker({
				minuteStep: 5,
				showInputs: false
			}).on('changeTime.timepicker', function (event) {
				if (!self.moving) self._changed();
			});
			self.endTime.timepicker({
				minuteStep: 5,
				showInputs: false
			}).on('changeTime.timepicker', function (event) {
				if (!self.moving) self._changed();
			});
			self.datePicker.datetimepicker({
				icons: {
					previous: 'fa fa-chevron-left',
					next: 'fa fa-chevron-right'
				},
				minDate:  moment().format('MM/DD/YYYY'),
				defaultDate: moment().format('MM/DD/YYYY'),
				format: 'LL'
			}).on('dp.change', function (event) {
				self._update();
			});
			self.locationList.on('change', function (event) {
				event.preventDefault();
				self.openingHours = false;
				self._update();
			});
			self.resourceList.on('change', function (event) {
				event.preventDefault();
				self._changed();
			});
			interact('.amrp-booking', {
				context: self.roomList[0]
			}).draggable({
				restrict: {
					restriction: "parent",
					endOnly: false,
					elementRect: {
						top: 0,
						left: 0,
						bottom: 1,
						right: 1
					}
				},
				onstart: function (event) {
					self.moving = true;
				},
				onmove: function (event) {
					var $target = $(event.target);
					var start = (parseFloat($target.css('left')) || 0)
					var x = start + event.dx;
					$('.amrp-booking', self.roomList).css({
						left: x + 'px'
					});
					self._updateBookingTime();
					self._updateButtons();
				},
				onend: function (event) {
					self.moving = false;
					self._updateCurrent(event);
				}
			});
			self.roomList.on('click', '.amrp-ava-btn', function (event) {
				event.preventDefault();
				self.booking.room = $(this).closest('.amrp-room').data('room');
				self.booking.contact = {};
				self.booking.layout = {};
				self.booking.assets = [];
				self._reserveScreen();
			}).on('mouseenter', '.amrp-room-title img', function (event) {
				event.preventDefault();
				var room = $(this).closest('.amrp-room').data('room');
				$(this).qtip({
					overwrite: false, // Don't overwrite tooltips already bound
					content: {
						text: function (event, api) {
							var $data = $('<div></div>');
							var $top = $('<div class="amrp-room-popup-top"></div>').appendTo($data);
							var $row = $('<div class="row"></div>').appendTo($data);
							var $left = $('<div class="col-sm-7"></div>').appendTo($row);
							var $right = $('<div class="col-sm-5"></div>').appendTo($row);
							var min = parseInt(room.restrictions.minimum_booking_time, 10);
							var max = parseInt(room.restrictions.maximum_booking_time, 10);
							var near = parseInt(room.restrictions.nearest_booking_days, 10);
							var far = parseInt(room.restrictions.furthest_booking_days, 10);

							if (room.image && room.image.length > 0) {
								$('<img/>').attr('src', '//' + self.settings.client + '.libnet.info/images/roombooking/' + self.settings.client + '/' + room.image).attr('alt', room.title).appendTo(img);
							}

							$('<h3></h3>').text(room.title).appendTo($top);
							if (max > 0) {
								$('<div class="amrp-room-popup-item"><span class="amrp-room-popup-info">'+ self.settings.roomsMaxBookingMessage.replace('{{amount}}', self._formatMinsAsString(max)) +'</span></div>').appendTo($top);
							}
							if (min > 0) {
								$('<div class="amrp-room-popup-item"><span class="amrp-room-popup-info">'+ self.settings.roomsMinBookingMessage.replace('{{amount}}', self._formatMinsAsString(min)) +'</span></div>').appendTo($top);
							}
							if (near > 0) {
								$('<div class="amrp-room-popup-item"><span class="amrp-room-popup-info">' + self.settings.roomsNearBookingMessage.replace('{{amount}}', near) + '</span></div>').appendTo($top);
							}
							if (far > -1) {
								$('<div class="amrp-room-popup-item"><span class="amrp-room-popup-info">' + self.settings.roomsFarBookingMessage.replace('{{amount}}', far) + '</span></div>').appendTo($top);
							}
							if (room.length || room.width || room.area) {
								$('<div class="amrp-rrom-popup-title">Room size</div>').appendTo($left);
								if (room.length) $('<div class="amrp-room-popup-item"><span class="amrp-room-popup-label">Length</span><span class="amrp-room-popup-value">' + room.length + ' ft</span></div>').appendTo($left);
								if (room.width) $('<div class="amrp-room-popup-item"><span class="amrp-room-popup-label">Width</span><span class="amrp-room-popup-value">' + room.width + ' ft</span></div>').appendTo($left);
								if (room.area) $('<div class="amrp-room-popup-item"><span class="amrp-room-popup-label">Area</span><span class="amrp-room-popup-value">' + room.area + ' sq ft</span></div>').appendTo($left);
							}
							// #4762 - CK
							var maxCap = Math.max(room.capacity_standing, room.capacity_chairs, room.capacity_tables, 0);
							$('<div class="events2-room-popup-title">Room capacity</div>').appendTo($left);
							$('<div class="events2-room-popup-item"><span class="events2-room-popup-label">Max Capacity</span><span class="events2-room-popup-value">' + maxCap + '</span></div>').appendTo($left);

							var $bottom = $('<div class="amrp-room-popup-bottom"></div>').appendTo($data);
							if (room.description) $('<div class="amrp-room-popup-description"><div class="amrp-rrom-popup-title">Room description</div>' + room.description + '</div>').appendTo($bottom);
							if (room.assets && room.assets.length > 0) {
								$('<div class="amrp-rrom-popup-title">Room features</div>').appendTo($bottom);
								$.each(room.assets, function (index, asset) {
									var a = $('<div class="amrp-room-popup-asset"></div>').appendTo($bottom);
									$('<span class="amrp-room-popup-asset-name">' + asset.name + '</span>').appendTo(a);
									if (asset.qty > 1) {
										$('<span class="amrp-room-popup-asset-qty">' + asset.qty + '</span>').appendTo(a);
									}
									if (asset.description) {
										$('<span class="amrp-room-popup-asset-description"> (' + asset.description + ') </span>').appendTo(a);
									}
								});
							}
							if (room.layouts && room.layouts.length > 0) {
								var layoutsList = $('<div class="amrp-room-popup-bottom"></div>').appendTo($data);
								$.each(room.layouts, function (index, layout) {
									layoutsList.append(self._getLayoutDetailView(layout));
									layoutsList.append('<br>');
								});
							} else if (self.settings.useSetupBreakdown) {
								if (room.setup_time && parseInt(room.setup_time) > 0) $('<div class="amrp-room-popup-item"><span class="amrp-room-popup-label">Setup time</span><span class="amrp-room-popup-value">' + room.setup_time + ' minutes</span></div>').appendTo($data);
								if (room.breakdown_time && parseInt(room.breakdown_time) > 0) $('<div class="amrp-room-popup-item"><span class="amrp-room-popup-label">Breakdown time</span><span class="amrp-room-popup-value">' + room.breakdown_time + ' minutes</span></div>').appendTo($data);
							}
							return $data;
						}
					},
					position: {
						my: 'left top',
						at: 'top right'
					},
					style: {
						classes: 'qtip-shadow qtip-light qtip-rounded amrp-room-popup'
					},
					show: {
						delay: 500,
						ready: true // Show immediately - important!
					},
					hide: {
						delay: 200,
						fixed: true, // <--- add this
						effect: function () {
							$(this).fadeOut(250);
						}
					},
				});
			});
		},
		_updateBookingTime: function () {
			var elementTime = self._getElTime($('.amrp-booking', self.roomList).first());
			var start = moment(elementTime.from);
			var end = moment(elementTime.to);
			self.booking.start_time = start.format('YYYY-MM-DD HH:mm:ss');
			self.booking.end_time = end.format('YYYY-MM-DD HH:mm:ss');
			self.startTime.timepicker('setTime', start.format('h:mma'));
			self.endTime.timepicker('setTime', end.format('h:mma'));
			return true;
		},
		getSecondsFromMidnight: function (time, date) {
			return moment(date+' '+time, 'YYYY-MM-DD h:mma').diff(moment(date, 'YYYY-MM-DD').startOf('day'), 'seconds');
		},
		_updateCurrent: function (event) {
			var $target = $(event.target);
			var elementTime = self._getElTime($(event.target));
			self.booking.start_time = elementTime.from.format('YYYY-MM-DD HH:mm:ss');
			self.booking.end_time = elementTime.to.format('YYYY-MM-DD HH:mm:ss');
			self._renderList();
		},
		_update: function () {
			var loc = self.locationList.val();
			if (loc == '') {
				self.locationBottomRow.hide();
			} else {
				var dateString = self.datePicker.data("DateTimePicker").date().clone().startOf('day').format('YYYY-MM-DD');
				$.getJSON(self.settings.apiServer + '/v2/' + self.settings.client + '/rooms/' + loc, {
					date: dateString,
					external_only: 1,
					classtype: 1
				}, function (json, textStatus) {
					self.rooms = json;
					if (self.settings.useSetupBreakdown) {
						$.each(self.rooms, function (index, room) {
							$.each(room.bookings, function (index, booking) {
								if (room.setup_time) {
									booking.start_time = moment(booking.start_time).add(room.setup_time * -1, 'minutes').format('YYYY-MM-DD HH:mm:ss');
								}
								if (room.breakdown_time) {
									booking.end_time = moment(booking.end_time).add(room.breakdown_time, 'minutes').format('YYYY-MM-DD HH:mm:ss');
								}
							});
						});
					}
					$.getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/opening-hours/' + dateString + '/1', function (openingTimes, textStatus) {
						self.openingHours = openingTimes[loc][dateString];
						var d = moment(dateString).startOf('day');
						self.openingHours.raw_open_time = d.clone().add(moment(self.openingHours.open, 'h:mma').diff(moment().startOf('day'), 'seconds'), 'seconds').format('YYYY-MM-DD HH:mm:ss');
						self.openingHours.raw_close_time = d.clone().add(moment(self.openingHours.close, 'h:mma').diff(moment().startOf('day'), 'seconds'), 'seconds').format('YYYY-MM-DD HH:mm:ss');
						if (self.openingHours.raw_open_time == self.openingHours.raw_close_time) {
							self.locationBottomRow.hide();
							self.locationClosed.show();
						} else {
							self.locationBottomRow.show();
							self.locationClosed.hide();
							self._changed();
							self._renderList();
						}
					});
				});
			}
		},
		_changed: function () {
			var d = self.datePicker.data("DateTimePicker").date().clone().startOf('day');
			var s = self.getSecondsFromMidnight(self.startTime.val(), d.format('YYYY-MM-DD'));
			var e = self.getSecondsFromMidnight(self.endTime.val(), d.format('YYYY-MM-DD'));
			var new_start_time = d.clone().add(Math.min(s, e), 'seconds');
			var new_end_time = d.clone().add(Math.max(s, e), 'seconds');
			var badTime = e <= s;

			if (badTime) {
				self.moving = true;
				self.endTime.timepicker('setTime', d.clone().add(s, 'seconds').add(1, 'hour').format('h:mma'));
				e = self.getSecondsFromMidnight(self.endTime.val(), d.format('YYYY-MM-DD'));
				self.moving = false;
			}

			self.booking.start_time = d.clone().add(Math.min(s, e), 'seconds').format('YYYY-MM-DD HH:mm:ss');
			self.booking.end_time = d.clone().add(Math.max(s, e), 'seconds').format('YYYY-MM-DD HH:mm:ss');
			self._renderList();
		},
		_renderList: function () {
			self.roomList.empty();
			var markers = $('<div class="amrp-roomlist-markers"></div>').appendTo(self.roomList);
			var w = markers.width() - 22;
			for (var i = 3; i < 24; i += 3) {
				var left = ((w / 24) * i);
				$('<span class="l"></span>').css('left', left + 'px').appendTo(markers);
				left -= 18;
				$('<span class="t">' + moment(i + ':00', ["HH:mm"]).format("h:mma") + '</span>').css('left', left + 'px').appendTo(markers);
			}
			$.each(self.rooms, function (index, val) {
				var b = val.bookings;
				// CH#2461 - This fix below was already here but applies to this ticket.
				if(val.restrictions.viewable===false) return;
				var room = $('<div class="amrp-room"></div>').data('bookings', b).data('room', val).attr('data-roomid', val.id).appendTo(self.roomList);
				var title = $('<div class="amrp-room-title"></div>').text(val.title).appendTo(room);
				if (val.image.length > 0) {
					$('<img/>').attr('src', '//' + self.settings.client + '.libnet.info/images/roombooking/' + self.settings.client + '/' + val.image).attr('alt', val.title).prependTo(title);
				}
				var timeline = $('<div class="amrp-room-timeline"><div class="amrp-booking"><div class="amrp-setup"></div>&nbsp;<div class="amrp-breakdown"></div></div></div>').appendTo(room);
				$('<div class="amrp-room-status"><button class="btn btn-info amrp-ava-btn">Select</button><div class="amrp-reason"></div></div>').appendTo(room);
				$.each(b, function (index, booking) {
					$('<div class="amrp-ex-booking" data-status="1">&nbsp;</div>').data('booking', booking).attr('data-booking-id', booking.id).appendTo(timeline);
				});
				if (val.sub_rooms && val.sub_rooms.length > 0) {
					room.wrap('<div class="amrp-parent-room"></div>').attr('data-roomid', val.id);
					room.parent().append('<div class="amrp-sub-room"></div>');
				}
				var opt;
				if(self.singleBranch){
					opt = $('<div class="amrp-room-opening-hours">Library hours</div>').appendTo(timeline);
				}else{
					opt = $('<div class="amrp-room-opening-hours">Branch hours</div>').appendTo(timeline);
				}
				self._updateEl({
					start_time: self.openingHours.raw_open_time,
					end_time: self.openingHours.raw_close_time
				}, opt);
			});
			$.each(self.rooms, function (index, val) {
				$.each(val.childRooms, function (cIndex, child) {
					$.each(val.bookings, function (bIndex, booking) {
						self._addBooking(booking, child);
					});
				});
				$.each(val.parentRooms, function (pIndex, parent) {
					$.each(val.bookings, function (bIndex, booking) {
						self._addBooking(booking, parent);
					});
				});
			});
			$('>.amrp-parent-room', self.roomList).each(function (index, el) {
				var subs = $('.amrp-sub-room', el);
				var r = $('>.amrp-room', el).first().data('room');
				$.each(r.sub_rooms, function (index, val) {
					$('>.amrp-room[data-roomid=' + val + ']', self.roomList).prependTo(subs);
				});
			});
			$('.amrp-booking', self.roomList).each(function (index, el) {
				self._updateEl(self.booking, $(el));
			});
			self._updateExBookings(self.roomList);
			self._updateButtons();
		},
		_addBooking: function (booking, room_id) {
			var timeline = $('[data-roomid=' + room_id + ']').find('.amrp-room-timeline').first();
			if ($('[data-booking-id=' + booking.id + ']', timeline).length === 0 && parseInt(booking.status, 10) !== 3 && parseInt(booking.status, 10) !== 2) {
				$('<div class="amrp-ex-booking" data-status="' + booking.status + '">&nbsp;</div>').data('booking', booking).attr('data-booking-id', booking.id).appendTo(timeline);
			}
		},
		_formatMinsAsString: function (mins) {
			var min = parseInt(mins, 10);
			if (min < 60) {
				return mins + " minutes";
			}
			var hours = Math.floor(min / 60);
			var minutes = min % 60;
			if (minutes > 0) {
				if (hours > 1) {
					return hours + ' hours ' + minutes + ' minutes';
				} else {
					return hours + ' hour ' + minutes + ' minutes';
				}
			} else {
				if (hours > 1) {
					return hours + ' hours';
				} else {
					return hours + ' hour';
				}
			}
		},
		_updateButtons: function () {
			$('.amrp-ava-btn', self.roomList).each(function (index, el) {
				var reason = $('.amrp-reason', $(el).closest('.amrp-room')).text('').hide();
				var elementTime = self._getElTime($('.amrp-booking', self.roomList).first());
				var b = $(el).closest('.amrp-room').find('.amrp-ex-booking');
				var bookings = [];
				for (var i = 0; i < b.length; i++) {
					bookings.push($(b[i]).data('booking'));
				}
				var roomData = $(el).closest('.amrp-room').data('room');
				if (!roomData.restrictions.bookable) {
					$(el).text('Please call').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					reason.text(self.settings.roomsNotBookableMessage.replace('{{branch_number}}', self.locations[roomData.location_id].tel)).show();
					return;
				}
				var min = parseInt(roomData.restrictions.minimum_booking_time, 10) || 0;
				var max = parseInt(roomData.restrictions.maximum_booking_time, 10) || 0;
				var near = parseInt(roomData.restrictions.nearest_booking_days, 10) || 0;
				var far = parseInt(roomData.restrictions.furthest_booking_days, 10) || -1;

				var day_start_buffer = parseInt(roomData.restrictions.day_start_buffer, 10) || 0;
				var day_end_buffer = parseInt(roomData.restrictions.day_end_buffer, 10) || 0;

				var open = moment(self.openingHours.raw_open_time);
				var close = moment(self.openingHours.raw_close_time);

				var roomOpens = open.clone().add(day_start_buffer, 'minutes');
				var roomCloses = close.clone().add(day_end_buffer * -1, 'minutes');

				if (self.settings.useSetupBreakdown) {
					roomOpens.add(roomData.setup_time * -1, 'minutes');
					roomCloses.add(roomData.breakdown_time, 'minutes');

					elementTime.to.add(roomData.breakdown_time, 'minutes');
					elementTime.from.add(roomData.setup_time * -1, 'minutes');
				}
				if (elementTime.from < roomOpens || elementTime.to > roomCloses) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					reason.text('The room is closed at this time.').show();
					return;
				}


				if (elementTime.from < open || elementTime.to > close) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					return;
				}
				var duration = moment.duration(elementTime.to.diff(elementTime.from)).asMinutes();
				if (max > 0 && duration > max) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);

					reason.text(self.settings.roomsMaxBookingMessage.replace('{{branch_number}}', self.locations[roomData.location_id].tel).replace('{{amount}}', self._formatMinsAsString(max))).show();
					return;
				}
				if (min > 0 && duration < min) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					reason.text(self.settings.roomsMinBookingMessage.replace('{{branch_number}}', self.locations[roomData.location_id].tel).replace('{{amount}}', self._formatMinsAsString(min))).show();
					return;
				}
				var when = Math.round(moment.duration(elementTime.to.diff(moment())).asDays());
				if (near > 0 && when < near) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					reason.text(self.settings.roomsNearBookingMessage.replace('{{branch_number}}', self.locations[roomData.location_id].tel).replace('{{amount}}', near)).show();
					return;
				}
				if (far > -1 && when > far) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					reason.text(self.settings.roomsFarBookingMessage.replace('{{branch_number}}', self.locations[roomData.location_id].tel).replace('{{amount}}', far)).show();
					return;
				}
				if (moment(self.booking.start_time).isBefore(moment())) {
					$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					return;
				}
				$(el).text($(el).closest('.amrp-room').hasClass('amrp-room-selected') ? 'Chosen' : 'Select').removeClass('btn-info btn-edit').addClass($(el).closest('.amrp-room').hasClass('amrp-room-selected') ? 'btn-primary' : 'btn-info').removeProp('disabled');

				$.each(bookings, function (index, val) {
					var lStart = moment(val.start_time);
					var lEnd = moment(val.end_time);
					if (lStart < elementTime.to && lEnd > elementTime.from) {
						$(el).text('Unavailable').removeClass('btn-info btn-edit').addClass('btn-edit').prop('disabled', true);
					}
				});
			});
		},
		_getElTime: function (el) {
			var mmtMidnight = moment(self.booking.start_time).clone().startOf('day');
			var width = $('.amrp-room-timeline', self.roomList).width();
			var roomData = $(el).closest('.amrp-room').data('room');
			var x = (parseFloat(el.css('left')) || 0);
			var w = el.width();
			var startMin = Math.floor(x / (width / 1440) / 5) * 5;
			var endMin = startMin + (Math.ceil(w / (width / 1440) / 5) * 5);
			var start = mmtMidnight.clone().add(startMin, 'minutes');
			var end = mmtMidnight.clone().add(endMin, 'minutes');
			return {
				from: start,
				to: end
			};
		},
		_updateEl: function (time, el) {
			if (!time) return;
			var from = moment(time.start_time);
			var to = moment(time.end_time);
			var roomData = $(el).closest('.amrp-room').data('room');
			var mmtMidnight = from.clone().startOf('day');
			var start = from.clone().diff(mmtMidnight, 'minutes');
			var end = to.clone().diff(mmtMidnight, 'minutes');
			var width = $(el).parent().width();
			var x = Math.ceil(start * (width / 1440));
			var w = Math.floor(end * (width / 1440)) - x;
			if (self.settings.useSetupBreakdown && roomData && roomData.breakdown_time) {
				var bw = roomData.breakdown_time * (width / 1440);
				$('.amrp-breakdown', el).css({
					width: bw + 'px',
					right: (bw * -1) + 'px'
				});
			}
			if (self.settings.useSetupBreakdown && roomData && roomData.setup_time) {
				var sw = roomData.setup_time * (width / 1440);
				$('.amrp-setup', el).css({
					width: sw + 'px',
					left: (sw * -1) + 'px'
				});
			}
			el.css({
				left: x + 'px'
			});
			el.width(w + 'px');
		},
		_updateExBookings: function (list) {
			$('.amrp-ex-booking', list).each(function (index, el) {
				var booking = $(this).data('booking');
				self._updateEl(booking, $(el));
			});
		},
		_reserveScreen: function () {
			var customQuestions = self.customQuestions.empty();
			var summary = self.reserveRoomSummary.empty();
			$('<div class="amrp-room-name"></div>').html('<i class="am-locations"></i><b>' + self.booking.room.title + '</b>, ' + self.locations[self.booking.room.location_id].name).appendTo(summary);
			var start = moment(self.booking.start_time);
			var end = moment(self.booking.end_time);
			$('<div class="amrp-room-time"></div>').html('<b>' + start.format('h:mma') + ' - ' + end.format('h:mma') + '</b> ' + start.format('MMMM DD, YYYY')).appendTo(summary);
			if (self.booking.room.custom_fields && self.booking.room.custom_fields.fields && self.booking.room.custom_fields.fields.length > 0) {
				$.each(self.booking.room.custom_fields.fields, function (index, val) {
					var field = self._createField(val.name, val.type, val.title, val.required, false, val.helpText).data('fieldSettings', val).addClass('amrp-custom-field').appendTo(customQuestions);
					if (val.type === 'select') {
						var select = $('select', field);
						if (!val.required) {
							$('<option>Please choose...</option>').appendTo(select);
						}
						var options = val.options.trim().split(/\r?\n/);
						for (var i = 0; i < options.length; i++) {
							$('<option>' + options[i] + '</option>').appendTo(select);
						}
					}
				});
			}
			//
			self.chooseScreen.hide();
			self.confirmScreen.hide();
			self.reserveScreen.show();
			self.screenHeader.show();
		},
		_confirmScreen: function () {
			self.confirmScreen.show();
			self.screenHeader.show();
			self.chooseScreen.hide();
			self.reserveScreen.hide();
			self._updateFinalSummary();
			var roomDetails = $('.amrp-booking-room-details', self.confirmScreen).empty();
			var bookingOptions = $('.amrp-booking-options', self.confirmScreen).empty();
			var room = self.booking.room;
			if (room.image && room.image.length > 0) {
				$('<img/>').attr('src', '//' + self.settings.client + '.libnet.info/images/roombooking/' + self.settings.client + '/' + room.image).attr('alt', room.title).appendTo(roomDetails);
			}
			$('<div class="amrp-booking-room-desc"></div>').html(room.description).appendTo(roomDetails);
			if (room.assets && room.assets.length > 0) {
				var included = $('<div class="amrp-booking-room-included"><b>What\'s included?<b><br></div>').appendTo(roomDetails);
				var includedList = $('<ul><ul>').appendTo(included);
				$.each(room.assets, function (index, asset) {
					var a = $('<li></li>').appendTo(includedList);
					if (asset.qty > 1) {
						$('<span class="amrp-booking-room-asset-qty">' + asset.qty + '&nbsp;</span>').appendTo(a);
					}
					$('<span class="amrp-booking-room-asset-name">' + asset.name + '</span>').appendTo(a);
					if (asset.description) {
						$('<span class="amrp-booking-room-asset-description"> (' + asset.description + ') </span>').appendTo(a);
					}
				});
			}
			var bookingPreview = $('<div class="amrp-booking-preview"></div>').appendTo(bookingOptions);
			var markers = $('<div class="amrp-roomlist-markers"></div>').appendTo(bookingPreview);
			var w = markers.width();
			for (var i = 3; i < 24; i += 3) {
				var left = ((w / 24) * i);
				$('<span class="l"></span>').css('left', left + 'px').appendTo(markers);
				left -= 18;
				$('<span class="t">' + moment(i + ':00', ["HH:mm"]).format("h:mma") + '</span>').css('left', left + 'px').appendTo(markers);
			}
			var b = room.bookings;
			var roomRow = $('<div class="amrp-room"></div>').data('bookings', b).data('room', room).attr('data-roomid', room.id).appendTo(bookingPreview);
			var timeline = $('<div class="amrp-room-timeline"><div class="amrp-booking"><div class="amrp-setup"></div>&nbsp;<div class="amrp-breakdown"></div></div></div>').appendTo(roomRow);
			$.each(b, function (index, booking) {
				$('<div class="amrp-ex-booking" data-status="1">&nbsp;</div>').data('booking', booking).attr('data-booking-id', booking.id).appendTo(timeline);
			});
			self._updateEl(self.booking, $('.amrp-booking', bookingPreview));
			self._updateExBookings(bookingPreview);
			// self._updateButtons();

			if (room.layouts && room.layouts.length > 0) {
				var layoutSelect = self._createField('layout_id', 'select', 'Layout', false).appendTo(bookingOptions).find('select');
				$('<option value="">Please choose a layout</option>').appendTo(layoutSelect);
				$.each(room.layouts, function (index, layout) {
					$('<option>' + layout.name + '</option>').val(layout.id).data('details', layout).appendTo(layoutSelect);
				});
				var layoutDetail = $('<div></div>').appendTo(bookingOptions);
				layoutSelect.on('change', function (event) {
					event.preventDefault();
					layoutDetail.empty();
					self.booking.layout = $(':selected', this).data('details');
					self._updateFinalSummary();
					if (self.booking.layout)layoutDetail.append(self._getLayoutDetailView(self.booking.layout));
				});
			}

			var assets = $('<div class="amrp-booking-final-summary-assets"></div>').appendTo(bookingOptions);
			$.getJSON(self.settings.apiServer + '/v2/' + self.settings.client + '/rooms/assets/' + room.location_id + '/' + room.id+'?start='+self.booking.start_time+'&end='+self.booking.end_time, function (json, textStatus) {
				self.assets = [];
				if (json.length > 0) {
					$('<div class="amrp-booking-final-summary-subheading">Bookable resources</div>').appendTo(assets);
					var assetList = $('<ul class="amrp-bookable-assets-list"></ul>').appendTo(assets);
					$.each(json, function (index, val) {
						if(parseInt(val.quantity)>0){
							self.assets[val.id] = val;
							var li = $('<li><label><input type="checkbox">&nbsp;&nbsp;' + val.name + '</label></li>').data('details', val).appendTo(assetList);
							if (parseInt(val.quantity) < parseInt(val.booking_max))val.booking_max = val.quantity;
							if (parseInt(val.booking_max) > 1) {
								$('<span> (' + val.booking_max + ' available)</span>').appendTo($('label', li));
								var s = $('<select></select>').appendTo(li);
								for (var i = parseInt(val.booking_min); i <= parseInt(val.booking_max); i++) {
									$('<option>' + i + '</option>').appendTo(s);
								}
							}
						}else{
							var li = $('<li class="amnp-none-available"><label><input type="checkbox" disabled>&nbsp;&nbsp;' + val.name + ' (none available at the chosen time)</label></li>').data('details', val).appendTo(assetList);
						}
					});
				}
			});
			if (room.tc_link && room.tc_link.length > 0) {
				$('<label><input class="agreed" type="checkbox"> I have read and agree to the room booking <a target="_blank" href="' + room.tc_link + '">terms and conditions</a></label>').appendTo(bookingOptions);
			} else {
				$('<label><input class="agreed" type="checkbox"> I have read and agree to the room booking terms and conditions</label>').appendTo(bookingOptions);
			}
		},
		_getLayoutDetailView: function (layout) {
			var view = $('<div class="amrp-room-layout-details"></div>');
			$('<img>').attr('src', 'http://' + self.settings.client + '.libnet.info/images/roomlayouts/' + layout.image).appendTo(view);
			$('<div class="amrp-room-layout-title"></div>').text(layout.name).appendTo(view);
			$('<div class="amrp-room-layout-capacity"><span>Capacity:</span> ' + layout.capacity + '</div>').appendTo(view);
			if (self.settings.useSetupBreakdown) {
				if (parseInt(layout.setup_time, 10) > 0)$('<div class="amrp-room-layout-capacity"><span>Setup:</span> ' + layout.setup_time + '</div>').appendTo(view);
				if (parseInt(layout.breakdown_time, 10) > 0)$('<div class="amrp-room-layout-capacity"><span>Breakdown:</span> ' + layout.breakdown_time + '</div>').appendTo(view);
			}
			$('<div class="amrp-room-layout-description"></div>').text(layout.description).appendTo(view);
			return view;

		},
		_updateBookedAssets: function () {
			self.booking.assets = [];
			self._updateFinalSummary();
			$('.amrp-bookable-assets-list li', self.confirmScreen).each(function (index, el) {
				if ($(this).find('input').is(':checked')) {
					var details = $(this).data('details');
					var qty = parseInt(details.booking_max) > 1 ? $(this).find('select').val() : 1;
					self.booking.assets.push({
						id: details.id,
						qty: parseInt(qty)
					});
					self._updateFinalSummary();
				}
			});
		},
		_updateFinalSummary: function () {
			var finalSummary = $('.amrp-booking-final-summary', self.confirmScreen).empty();
			$('<div class="amrp-booking-final-summary-heading">Your reservation</div>').appendTo(finalSummary);
			$('<div class="amrp-booking-final-summary-subheading">Contact:</div>').appendTo(finalSummary);
			finalSummary.append('<div>' + self.booking.contact.first_name + ' ' + self.booking.contact.last_name + '</div>');
			if (self.booking.contact.phone) finalSummary.append('<div>' + self.booking.contact.phone + '</div>');
			if (self.booking.contact.email) finalSummary.append('<div>' + self.booking.contact.email + '</div>');
			if (self.booking.contact.group_name) {
				$('<div class="amrp-booking-final-summary-subheading">Group name:</div>').appendTo(finalSummary);
				finalSummary.append('<div>' + self.booking.contact.group_name + '</div>');
			}
			if (self.booking.contact.booking_title) {
				$('<div class="amrp-booking-final-summary-subheading">Booking title:</div>').appendTo(finalSummary);
				finalSummary.append('<div>' + self.booking.contact.booking_title + '</div>');
			}
			$('<div class="amrp-booking-final-summary-subheading">Where:</div>').appendTo(finalSummary);
			finalSummary.append('<div>' + self.booking.room.title + ', ' + self.locations[self.booking.room.location_id].name + '</div>');
			$('<div class="amrp-booking-final-summary-subheading">When:</div>').appendTo(finalSummary);
			var start = moment(self.booking.start_time);
			var end = moment(self.booking.end_time);
			finalSummary.append('<div>' + start.format('MMMM DD, YYYY') + '</div>');
			finalSummary.append('<div>' + start.format('h:mma') + ' - ' + end.format('h:mma') + '</div>');

			if (self.booking.layout) {
				$('<div class="amrp-booking-final-summary-subheading">Layout:</div>').appendTo(finalSummary);
				finalSummary.append('<div>' + self.booking.layout.name + '</div>');
			}

			if (self.booking.assets && self.booking.assets.length > 0) {
				$('<div class="amrp-booking-final-summary-subheading">Bookable resources:</div>').appendTo(finalSummary);
				$.each(self.booking.assets, function (index, val) {
					var asset = self.assets[val.id];
					var r = $('<div></div>').text(asset.name).appendTo(finalSummary);
					if (parseInt(asset.booking_max) > 1) {
						r.append('&nbsp; (' + val.qty + ')');
					}
				});
			}
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
