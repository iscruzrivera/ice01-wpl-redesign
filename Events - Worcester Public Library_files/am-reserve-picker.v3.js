;
(function ($, window, document, undefined) {
	"use strict";
	var pluginName = "amReservePicker",
		defaults = {
			apiServer: false,
			client: false,
			mode: 0,
			roomId: false,
			unmediatedOnly: false,
			mediatedOnly: false,
			selectedDate: false,
			selectedLocation: false,
			selectedRoom: false,
			classId: 0,
			sessionId: '',
			chargingMode: 0,
			testMode: 0,
			payment_currency: 'USD',
			ezproxy: {}
		};
	// The actual plugin constructor
	function Plugin(element, options) {
		this.clientSettings = {};
		this.locations = [];
		this.selectedLocations = [];
		this.locationsById = {};
		this.element = element;
		this.$element = $(element);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.initComplete = false;
		this.paused = false;
		this.locationOptions = {};
		this._updating = false;
		this.groupTypeSelect = null;
		this.responsiveGroupTypeSelect = null;
		this.locationOptions = {
			only_with_external_rooms: 1
		};
		this.storage = window.sessionStorage || false;
		this.init();
	}

	$.extend(true, Plugin.prototype, $.fn['amShared']);
	$.extend(Plugin.prototype, {
		init: function () {
			var self = this;
			Promise.all([
				self._getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/settings')
			]).then(function (result) {
				self.clientSettings = result[0];
				var unmediatedParam = '';
				if (self.settings.unmediatedOnly) {
					self.locationOptions.only_with_unmediated = 1;
					unmediatedParam = '&only_unmediated=1';
				}

				if (self.settings.mode !== 1) {
					self.locationOptions.only_with_patron_rooms = 0;
				}

				self.locationOptions.mode = self.settings.mode;
				var selectedClass = self.clientSettings.rooms_group_billing_remember ? self._readCookie('selectedClass' + self.settings.client) : false;
				// CH 14359 - Check if the classId is already set. If it is then it is being passed in directly
				// Also check to make sure that selected class isn't being set by the cookie.
				if (selectedClass) {
					self.locationOptions.class_id = selectedClass;
				}

				Promise.all([
					self._getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/locations', self.locationOptions),
					self._getJSON(self.settings.apiServer + '/v2/' + self.settings.client + '/userclasses?mode=' + self.settings.mode + '&locations=1' + unmediatedParam)
				]).then(function (result) {

					self.locations = result[0];
					self.userclasses = result[1];

					self.locationsById = {};
					self.locations.forEach(function (location) {
						self.locationsById[location.id] = location;
					});

					self.bookings = self.storage && self.clientSettings.rooms_cart_enabled ? JSON.parse(self.storage.getItem('communicoReserveCart') || '[]') : [];
					self._buildInterface();
					self._bindEvents();
					self._updateLocations();
					self.initComplete = true;

					// Should work
					if (self.settings.classId > 0) {
						if (typeof self.groupTypeSelect !== 'undefined') {
							if (self.groupTypeSelect.is(":visible")) {
								self.groupTypeSelect.val(self.settings.classId);
							}
						}
					}

					self._update();
				}).catch(function (err) {
					console.log(err);
				});
			}).catch(function (err) {
				console.log(err);
			});
		},
		_buildInterface: function () {
			var self = this;
			var now = moment(); //TODO: needs to use timezone

			var selectedBranches = this._readCookie('reserveBranches');

			if (this.settings.selectedLocation) {
				selectedBranches = [this.settings.selectedLocation];
			}
			this.holder = $('<div class="amnp-holder amnp-holder-v3"></div>').appendTo(this.element);
			if (this.clientSettings.rooms_cart_enabled) {
				this.cartHolder = $('<div class="amnp-picker-cart-holder"><span class="amnp-picker-cart-button"><i class="fa fa-shopping-cart link"></i> Room basket (<span class="basket-total">0</span>)<div class="amnp-picker-cart"><div class="amnp-picker-cart-list"></div><div class="amnp-picker-cart-footer"><div class="amnp-picker-cart-total"></div><button class="amnp-picker-cart-checkout btn btn-info"><i class="fa fa-shopping-cart"></i> Reserve</button></div></div></span></div>').appendTo(this.holder);
			}
			if (this.clientSettings.events_single_branch_library) {
				this.holder.addClass('amnp-single-branch');
			}

			this.header = $('<div class="amnp-picker-header"><h2>Reserve a room</h2><p>Choose a date and room then pick a time</p></div>').appendTo(this.holder);
			this.navigation = $('<div class="amnp-navigation link"><i data-by="-1" class="fa fa-chevron-left"/><span class="amnp-navigation-title"></span><i data-by="1" class="fa fa-chevron-right"/></div>').appendTo(this.holder)

			this.responsiveKey = $('<div class="amnp-responsive-key"></div>').appendTo(this.holder);
			this.responsiveDatePicker = $('<div class="input-group date"><input type="text" class="form-control" aria-label="Date picker for mobile"><div class="input-group-addon"><span class="am-events"></span></div></div>').appendTo(this.responsiveKey);
			$('<br>').appendTo(this.responsiveKey);
			var branchPicker = $('<div class="amnp-choose-branch" />').appendTo(this.responsiveKey);
			$('<br><h5>Select a branch:</h5>').appendTo(branchPicker);
			this.responsiveLocationSelect = $('<select aria-label="Mobile Location Select" />').prop('multiple', true).appendTo(branchPicker);
			this.responsiveLocationSelect.multiselect({
				includeSelectAllOption: true,
				selectAllValue: 'all',
				buttonWidth: '100%',
				onChange: function (option, checked, select) {
					if (!self._updating) {
						if (self.locations) {
							if (!checked) {
								//self.locations.splice(self.locations.indexOf($(option).val()), 1);
							} else {
								//self.locations.push($(option).val());)
							}
						}
						self._update();
					}
				},
				onSelectAll: function (e) {
					if (!self._updating) self._update();
					//self.responsiveLocationSelect.children('options[value!="all"]').attr('checked', true);
				},
				onDeselectAll: function (e) {
					if (!self._updating) self._update();
					//self.responsiveLocationSelect.children('options[value!="all"]').prop('checked', false);
				}
			});

			this.key = $('<div class="amnp-key"></div>').appendTo(this.holder);
			if (this.settings.mode === 1) {
				this.navigation.sticky({ topSpacing: 80, wrapperClassName: 'sticky-nav' });
				this.key.sticky({ topSpacing: 140, bottomSpacing: 50, wrapperClassName: 'sticky-key' });
			} else {
				this.navigation.sticky({ wrapperClassName: 'sticky-nav' });
				this.key.sticky({ topSpacing: 60, bottomSpacing: ($('#footer').outerHeight() || 300) + 50, wrapperClassName: 'sticky-key' });
			}

			this.stage = $('<div class="amnp-stage"></div>').appendTo(this.holder);
			this.loader = $('<div class="amnp-loader"><div class="amnp-spinner"></div></div>').appendTo(this.holder);

			if (this.clientSettings.rooms_group_billing_enabled) {
				this.groupPickerHolder = $('<div class="amnp-group-picker"><span>Booking type</span><select class="form-control" aria-label="Booking type selector"></select></div>').appendTo(this.key);
				this.groupTypeSelect = $('select', this.groupPickerHolder);

				var patronClass = false;
				var staffClass = false;
				this.userclasses.forEach(function (cls) {
					var t = parseInt(cls.type, 10);
					if (self.settings.mode !== 1 && t == 0) return;
					$('<option value="' + cls.id + '">' + cls.name + '</option>').data('details', cls).appendTo(self.groupTypeSelect);
					if (t === 1) {
						patronClass = cls.id;
					}

					if (t === 0) {
						staffClass = cls.id;
					}
				});

				$('<br><h5>Booking type:</h5>').appendTo(this.responsiveKey);
				this.responsiveGroupTypeSelect = this.groupTypeSelect.clone(true).appendTo(this.responsiveKey);
				var selectedClass = this.clientSettings.rooms_group_billing_remember ? this._readCookie('selectedClass' + this.settings.client) : false;

				// CH 14359 - Check if the classId is already set. If it is then it is being passed in directly
				// Also check to make sure that selected class isn't being set by the cookie.
				if (parseInt(this.settings.classId) > 0 && !selectedClass) selectedClass = this.settings.classId;

				if (this.settings.mode !== 1 && !selectedClass && this.clientSettings.rooms_group_billing_prompt_for_class) {
					this._promptForClass();
				} else {
					this.groupTypeSelect.val(parseInt(selectedClass || patronClass));
					this.responsiveGroupTypeSelect.val(parseInt(selectedClass || patronClass));
				}

				if (this.settings.mode === 1 && this.clientSettings.rooms_staff_booking_class_default) {
					var cls = selectedClass > 0 ? selectedClass : staffClass;
					this.groupTypeSelect.val(parseInt(cls));
					this.responsiveGroupTypeSelect.val(parseInt(cls));
				}
			}

			//add the date picker
			var datePickerSection = $('<div class="amnp-date-picker"/>').appendTo(this.key);
			$('<h3>Choose date</h3>').appendTo(datePickerSection);
			this.datePicker = $('<div/>').val(now.format('MMMM D YYYY')).appendTo(datePickerSection);

			//add the branch picker
			var branchPickerSection = $('<div class="amnp-choose-branch"/>').appendTo(this.key);

			if (this.settings.roomId) {
				branchPickerSection.hide();
			}
			$('<h3>Choose branch</h3>').appendTo(branchPickerSection);
			self.locationSelect = $('<div class="amnp-location-select"/>').appendTo(branchPickerSection);
			self.toggleAll = $('<label><input class="checkall" type="checkbox">Check all</label>').appendTo(self.locationSelect);
		},
		_reset: function () {

		},
		_buildResponsive: function () {
			var self = this;
			self.responsiveLocationSelect.empty();
			self.locations.forEach(function (location) {
				self.responsiveLocationSelect.append("<option value='" + location.id + "' data-location='" + location.id + "'>" + location.name + "</option>");
			});

			self.responsiveLocationSelect.multiselect('rebuild');
		},
		_updateLocations: function () {
			var self = this;
			var selectedBranches = self._readCookie('reserveBranches');
			if (selectedBranches === null && self.settings.selectedLocation) {
				selectedBranches = [self.settings.selectedLocation];
			}
			self._updating = true;
			self._buildResponsive();
			self.locationSelect.empty().append(self.toggleAll);
			var updateLocations = false;
			for (var l = 0; l < self.locations.length; l++) {
				var location = self.locations[l];
				var box = $('<label><input type="checkbox" data-location="' + location.id + '">' + location.name + '</label>').appendTo(self.locationSelect);
				if (l === self.locations.length - 1) updateLocations = true;

				if (!selectedBranches || selectedBranches.indexOf(location.id) >= 0) {
					$('input', box).prop('checked', 'checked');
					self.responsiveLocationSelect.multiselect('select', location.id, updateLocations);
				} else {
					self.responsiveLocationSelect.multiselect('deselect', location.id, updateLocations);
				}
			}

			var lsCnt = self.locationSelect.find('input[data-location]:checked').length;
			var rlsCnt = self.responsiveLocationSelect.find('option[data-location]:selected').length;

			if (lsCnt >= self.locations.length) {
				if (!self.initComplete) {
					$('input', self.locationSelect).prop('checked', 'checked');
					self._updating = false;
					self._update();
					return;
				} else {
					$('input.checkall', self.locationSelect).prop('checked', 'checked').trigger('change');
				}
			}

			if (lsCnt === 0) {
				self._updating = false;
				$('input', self.locationSelect).prop('checked', 'checked');
				if (!self.initComplete) {
					self._update();
				} else {
					$('input.checkall', self.locationSelect).trigger('change');
				}
				return;
			} else {
				if (self.locations.length > 1) {
					if (lsCnt < self.locations.length) {
						$('input.checkall', self.locationSelect).removeProp('checked');
					}
				} else {
					$('input.checkall', self.locationSelect).prop('checked', 'checked');
				}
			}

			if (rlsCnt === 0) {
				self.responsiveLocationSelect.multiselect('selectAll', true);
			}

			self._updating = false;
		},
		_bindEvents: function () {
			var self = this;
			self.locationSelect.on('change', '.checkall', function (event) {
				if (!self.initComplete) return;
				if ($(this).is(':checked')) {
					$('input[data-location]', self.locationSelect).prop('checked', 'checked');
					self.responsiveLocationSelect.multiselect('selectAll', false);

				} else {
					$('input[data-location]', self.locationSelect).removeProp('checked');
					self.responsiveLocationSelect.multiselect('deselectAll', false);
				}
				self._update();
			});
			self.locationSelect.on('change', 'input[data-location]', function (event) {
				if (!self.initComplete) return;
				if ($(this).is(':checked')) {
					self.responsiveLocationSelect.multiselect('select', $(this).attr('data-location'), false);
				} else {
					self.responsiveLocationSelect.multiselect('deselect', $(this).attr('data-location'), false);
				}
				self._update();
			});


			var s = this.settings.selectedDate ? moment(this.settings.selectedDate) : moment();
			if (this.clientSettings.rooms_allow_past_bookings && parseInt(this.settings.mode) === 1) {
				this.responsiveDatePicker.datepicker({
					format: 'MM d yyyy',
					todayHighlight: true,
					title: "Date picker"
				}).on('changeDate', function (event) {
					if (!self.initComplete) return;
					self.datePicker.datepicker('update', event.date);
					self._update();
				}).datepicker('update', s.startOf('day').toDate());

				this.datePicker.datepicker({
					todayBtn: "linked",
					orientation: "bottom left",
					format: 'MM d yyyy',
					todayHighlight: true,
					title: "Date picker"
				}).on('changeDate', function (event) {
					if (!self.initComplete) return;
					self.responsiveDatePicker.datepicker('update', event.date);
					self._update();
				}).datepicker('update', s.startOf('day').toDate());


			} else {
				this.responsiveDatePicker.datepicker({
					format: 'MM d yyyy',
					todayHighlight: true,
					startDate: new Date(),
					title: "Date picker"
				}).on('changeDate', function (event) {
					if (!self.initComplete) return;
					self.datePicker.datepicker('update', event.date);
					self._update();
				}).datepicker('update', s.startOf('day').toDate());

				this.datePicker.datepicker({
					todayBtn: "linked",
					orientation: "bottom left",
					format: 'MM d yyyy',
					todayHighlight: true,
					startDate: new Date(),
					title: "Date picker"
				}).on('changeDate', function (event) {
					if (!self.initComplete) return;
					self.responsiveDatePicker.datepicker('update', event.date);
					self._update();
				}).datepicker('update', s.startOf('day').toDate());
			}

			if (this.clientSettings.rooms_cart_enabled) {
				this.cartHolder.on('click', '.amnp-booking-summary-asset .amnp-booking-summary-booking-remove', function (event) {
					var booking = $(this).closest('.amnp-booking-summary').find('.amnp-booking-summary-total .amnp-booking-summary-booking-remove').data('booking');
					var asset = $(this).data('asset');
					booking.assets = booking.assets.filter(function (item) {
						return item !== asset;
					});
					self._updateCart();
				}).on('click', '.amnp-picker-cart-checkout', function (event) {
					self._checkout();
				}).on('click', '.amnp-booking-summary-total .amnp-booking-summary-booking-remove', function (event) {
					var booking = $(this).data('booking');
					self.rooms.forEach(function (r) {
						r.bookings = r.bookings.filter(function (b) {
							return b.t_id !== booking.t_id;
						});
					});

					self.bookings = self.bookings.filter(function (item) {
						return item !== booking;
					});
					self._updateCart();
					self._render();
				}).on('mouseover', '.amnp-picker-cart-button', function () {
					self._showCover(false);
				}).on('mouseout', '.amnp-picker-cart-button', function () {
					self._hideCover();
				});
			}
			if (this.clientSettings.rooms_group_billing_enabled) {
				this.groupTypeSelect.on('change', function (event) {
					if (self.clientSettings.rooms_group_billing_remember) {
						self._createCookie('selectedClass' + self.settings.client, $(this).val(), 365);
					}
					self._update(true);
				});

				this.responsiveGroupTypeSelect.on('change', function (event) {
					self.groupTypeSelect.val($(this).val());
					if (self.clientSettings.rooms_group_billing_remember) {
						self._createCookie('selectedClass' + self.settings.client, $(this).val(), 365);
					}
					self._update(true);
				});
			}
			this.navigation.on('click', 'i', function (event) {
				var newdate = moment(self.datePicker.datepicker('getDate')).add($(this).attr('data-by'), 'day').startOf('day');
				if (newdate.isBefore(moment().startOf('day'))) {
					if (parseInt(self.settings.mode) === 1) {
						if (!self.clientSettings.rooms_allow_past_bookings) return;
					} else {
						return;
					}
				}
				self.datePicker.datepicker('setDate', newdate.toDate());
			});
		},
		_promptForClass: function () {
			var self = this;
			var selectClassPopup = $('<div class="amnp-choose-class-popup"><div class="buttons"><button class="btn btn-primary">done</button></div></div>').amPopup({ title: 'Booking Type', width: '300px' });
			selectClassPopup.prepend(this.groupTypeSelect.clone());
			selectClassPopup.prepend('<div>Please choose the type of room booking</div>');
			selectClassPopup.on('change', 'select', function () {
				if (self.groupTypeSelect.is(':visible')) {
					self.groupTypeSelect.val($(this).val()).trigger('change');
				}

				if (self.responsiveGroupTypeSelect.is(':visible')) {
					self.responsiveGroupTypeSelect.val($(this).val()).trigger('change');
				}
			}).on('click', '.btn', function () {
				if (self.clientSettings.rooms_group_billing_remember) {
					if (self.groupTypeSelect.is(':visible')) {
						self._createCookie('selectedClass' + self.settings.client, self.groupTypeSelect.val(), 365);
					}

					if (self.responsiveGroupTypeSelect.is(':visible')) {
						self._createCookie('selectedClass' + self.settings.client, self.responsiveGroupTypeSelect.val(), 365);
					}
				}
				selectClassPopup.data('plugin_amPopup').close();
			}).data('plugin_amPopup').open();
		},
		_hideCover: function () {
			this.loader.hide();
		},
		_showCover: function (spinner) {
			this.loader.css({
				'width': this.stage.outerWidth(),
				'height': this.stage.outerHeight()
			}).show();
			$('.amnp-spinner', this.loader).toggle(spinner);
		},
		_render: function () {
			// console.trace();
			var self = this;

			this.stage.empty();
			var curDate = moment(this.datePicker.datepicker('getUTCDate')).utc();
			var lastBooking = this.bookings.slice(-1)[0];
			var hightlightRoom = false;
			if (lastBooking) {
				if (moment(lastBooking.start).isSame(curDate, 'd')) {
					hightlightRoom = parseInt(lastBooking.room.id, 10);
				}
			}

			var roomsVisible = false;
			this.rooms.forEach(function (room) {
				//CH#92 - Parent/Child Fix
				var currentBookingClass = false;
				var currentBookingType = false;

				if (self.groupTypeSelect) {
					if (self.groupTypeSelect.is(':visible')) {
						currentBookingClass = self.groupTypeSelect.val();
						currentBookingType = parseInt(self.groupTypeSelect.find(":selected").data('details').type);
					}
				}

				if (self.responsiveGroupTypeSelect) {
					if (self.responsiveGroupTypeSelect.is(':visible')) {
						currentBookingClass = self.responsiveGroupTypeSelect.val();
						currentBookingType = parseInt(self.responsiveGroupTypeSelect.find(":selected").data('details').type)
					}
				}

				if ((!room.restrictions.viewable && self.settings.mode == 0) || (!room.restrictions.viewable && self.settings.mode === 1 && currentBookingType !== 0)) return;
				if (self.settings.roomId && parseInt(room.id, 10) !== parseInt(self.settings.roomId, 10)) return;
				if (room.roomHours[self.CurrentDateString]) {
					var hours = room.roomHours[self.CurrentDateString];
				} else {
					var hours = self.openingHours[room.location_id][self.CurrentDateString];
				}

				if (self.settings.mode !== 1 && hours.open == hours.close) {
				} else {
					roomsVisible = true;
					room.locations = room.locations == null ? [] : room.locations;
					if (room.locations.indexOf(room.location_id) == -1) room.locations.push(room.location_id);
					room.locations.forEach(function (location_id) {
						if (self.selectedLocations.indexOf(location_id) === -1) return;
						var location = self.locationsById[location_id];
						if (typeof location !== 'undefined') {
							var locationBlock = $('.amnp-location-section[data-locationid=' + location_id + ']', self.stage);
							if (locationBlock.length == 0) {
								locationBlock = $('<div class="amnp-location-section" data-location-name="' + location.name + '" data-locationid="' + location_id + '"><div class="amnp-location-section-title"><h3><i class="am-locations"/>' + location.name + '</h3></div></div>').appendTo(self.stage);
							}
							var roomDisplay = $('<div/>').appendTo(locationBlock);

							if (hightlightRoom !== false && hightlightRoom === parseInt(room.id, 10)) {
								roomDisplay.addClass('amnp-cart-added').delay(3000).queue(function () {
									$(this).removeClass('amnp-cart-added').dequeue();
								});
							}

							roomDisplay.amReserveRoom({
								client: self.settings.client,
								apiServer: self.settings.apiServer,
								multiLocation: self.locationCount > 1,
								room: room,
								location: location,
								hours: hours,
								singleBranch: self.locations.length === 1,
								enabledCart: self.clientSettings.rooms_cart_enabled,
								enablePatronNotes: self.clientSettings.rooms_patron_notes_enabled,
								enableExpectedAttendees: self.clientSettings.rooms_expected_attendees_enabled,
								expectedAttendeesRequired: self.clientSettings.rooms_expected_attendees_required,
								useSetupBreakdown: self.clientSettings.rooms_use_setup,
								adjustSetupBreakdown: self.clientSettings.rooms_adjust_setup,
								pinlessAuth: self.clientSettings.client_pinless_auth,
								ecommerceEnabled: self.clientSettings.rooms_ecommerce_enabled,
								chargingEnabled: self.clientSettings.rooms_charging_enabled,
								loginRequired: self.clientSettings.rooms_require_login,
								layoutRequired: self.clientSettings.rooms_layout_required,
								emailRequired: self.clientSettings.rooms_require_email,
								phoneRequired: self.clientSettings.rooms_require_phone,
								roomsMaxBookingMessage: self.clientSettings.rooms_max_booking_message,
								roomsMinBookingMessage: self.clientSettings.rooms_min_booking_message,
								roomsNearBookingMessage: self.clientSettings.rooms_near_booking_message,
								roomsFarBookingMessage: self.clientSettings.rooms_far_booking_message,
								roomsNotBookableMessage: self.clientSettings.rooms_not_bookable_message,
								groupBillingEnabled: self.clientSettings.rooms_group_billing_enabled,
								date: curDate.format('YYYY-MM-DD'),
								selected: parseInt(self.settings.selectedRoom, 10) === parseInt(room.id, 10),
								bookingClass: self.clientSettings.rooms_group_billing_enabled ? currentBookingClass : false,
								bookingType: self.clientSettings.rooms_group_billing_enabled ? currentBookingType : (self.settings.mode === 1 || self.clientSettings.rooms_staff_booking_class_default ? 0 : 1),
								mode: self.settings.mode,
								clientSettings: self.clientSettings,
								payment_currency: self.settings.payment_currency,
								payment_currency_symbol: self.settings.payment_currency_symbol
							}).on('room:addtocart', function (event, data) {
								data.details.t_id = Math.random().toString(36).substr(2, 5);

								if (Array.isArray(data.details.assets) && data.details.assets.length > 0) {
									var assetCheck = self._checkAssets(data.details);
									if (!assetCheck.ok) {
										alert(assetCheck.message);
										return;
									}
								}

								self.bookings.push(data.details);
								var toUpdate = [data.details.room.id];
								toUpdate = toUpdate.concat(room.parentRooms, room.childRooms);

								self._addCartBookingToRooms(data.details, toUpdate);
								self._updateCart();
								if (data.checkout && self.bookings.length > 0) {
									self._checkout();
								} else {
									self._render();
								}
							});
						}
					});
				}
			});
			if (!roomsVisible) {
				$('<div class="amnp-picker-message"><p>No rooms found.</p><p>Please change your search criteria</p></div>').appendTo(self.stage);
			}
			self._updateLocations();
			self._sortStage();
			self._updateCart();
			self._hideCover();
		},
		_addCartBookingToRooms: function (details, toUpdate) {
			this.rooms.forEach(function (r) {
				if (toUpdate.indexOf(r.id) !== -1) {
					r.bookings.push({
						start_time: details.start,
						end_time: details.end,
						breakdown_time: details.breakdown_time,
						setup_time: details.setup_time,
						t_id: details.t_id
					});
				}
			});
		},
		_checkAssetOverlap: function (booking, asset) {
			var self = this;

			if (typeof self.bookings !== 'undefined' && self.bookings.length > 0) {
				for (var b = 0; b < self.bookings.length; b++) {
					var book = self.bookings[b];

					if (book !== booking) {
						var bssA = moment(booking.start);
						var bseA = moment(booking.end);
						var bssB = moment(book.start);
						var bseB = moment(book.end);

						var bRangeA = moment.range(bssA, bseA);
						var bRangeB = moment.range(bssB, bseB);

						if (bRangeA.overlaps(bRangeB)) {
							return booking.assets.findIndex(function (v, i) { return parseInt(v.id) === parseInt(asset.id) }) > -1;
						}
					}
				}
			}

			return false;
		},
		_checkAssets: function (bookingData) {
			var self = this;
			var incomingAssets = bookingData.assets;
			if (typeof self.bookings !== 'undefined' && self.bookings.length > 0) {
				for (var i = 0; i < incomingAssets.length; i++) {
					var cartQty = 0;
					var assetToCheck = incomingAssets[i];
					var assetData = assetToCheck.assetData;
					var bookingMin = parseInt(assetData.booking_min);
					var bookingMax = parseInt(assetData.booking_max);
					var available = parseInt(assetData.quantity);
					var offset = 0;

					// Start off by setting the cart qty to the incoming one.
					cartQty += parseInt(assetToCheck.qty);

					// These checks have to be above the other bookings.
					// Reason being that we really only care about the incoming. Fairly sure this is already handled, but it is for sure now.
					if (cartQty < bookingMin && bookingMin > 0) {
						offset = bookingMin - cartQty;
						return { ok: false, message: 'You must select ' + offset + ' more of ' + assetData.name + ' to continue' };
					}

					if (cartQty > bookingMax && bookingMax > 0) {
						offset = cartQty - bookingMax;
						return { ok: false, message: 'You must remove ' + offset + ' of ' + assetData.name + ' from the current booking to continue.' };
					}

					// Loop through all bookings.
					for (var b = 0; b < self.bookings.length; b++) {
						var book = self.bookings[b];
						if (Array.isArray(book.assets) && book.assets.length > 0) {
							var found = book.assets.findIndex(function (v, i) { return parseInt(v.id) === parseInt(assetToCheck.id) });
							if (found > -1) {
								// We have a match.
								// Get booked asset data first first

								// CH 22796 - Need to check if the dates/times actually overlap, function returns t/f
								// f = DO NOT Add because it doesn't overlap
								// t = add because it overlaps
								if (self._checkAssetOverlap(bookingData, assetToCheck)) {
									cartQty += parseInt(book.assets[found].qty);
								}

								// No break, we want to get ALL bookings in the basket.
							}
						}
					}

					// Check to make sure that the available number of assets is not exceeded by all bookings + incoming
					// If it is then it was incoming that broke it.
					if (cartQty > available) {
						offset = cartQty - available;
						return { ok: false, message: 'There are only ' + available + ' of ' + assetData.name + ' remaining. You must remove ' + offset + ' from the current booking to continue.' };
					}
				}
			}

			return { ok: true };
		},
		_checkout: function () {
			var self = this;
			var roomBooker = $('<div/>').appendTo(this.element);
			var currentBookingClass = false;

			self.navigation.unstick();
			self.key.unstick();

			if (self.groupTypeSelect) {
				if (self.groupTypeSelect.is(':visible')) {
					currentBookingClass = self.groupTypeSelect.val();
				}
			}

			if (self.responsiveGroupTypeSelect) {
				if (self.responsiveGroupTypeSelect.is(':visible')) {
					currentBookingClass = self.responsiveGroupTypeSelect.val();
				}
			}
			self.holder.hide();

			roomBooker.amReserveBooker({
				client: self.settings.client,
				apiServer: self.settings.apiServer,
				singleBranch: self.locations.length === 1,
				enabledCart: self.clientSettings.rooms_cart_enabled,
				enablePatronNotes: self.clientSettings.rooms_patron_notes_enabled,
				enableExpectedAttendees: self.clientSettings.rooms_expected_attendees_enabled,
				expectedAttendeesRequired: self.clientSettings.rooms_expected_attendees_required,
				useSetupBreakdown: self.clientSettings.rooms_use_setup,
				adjustSetupBreakdown: self.clientSettings.rooms_adjust_setup,
				pinlessAuth: self.clientSettings.client_pinless_auth,
				roomsPatronDetailsReadonly: self.clientSettings.rooms_patron_details_readonly,
				ecommerceEnabled: self.clientSettings.rooms_ecommerce_enabled,
				chargingEnabled: self.clientSettings.rooms_charging_enabled,
				offlinePaymentsEnabled: self.settings.mode === 1 ? self.clientSettings.rooms_staff_offline_payments_enabled : self.clientSettings.rooms_patron_offline_payments_enabled,
				cardPaymentEnabled: self.clientSettings.rooms_enable_card,
				offlinePaymentsMessage: self.clientSettings.rooms_offline_payments_message,
				laterPaymentsMessage: self.clientSettings.rooms_later_payments_message,
				loginRequired: self.clientSettings.rooms_require_login,
				layoutRequired: self.clientSettings.rooms_layout_required,
				emailRequired: self.clientSettings.rooms_require_email,
				phoneRequired: self.clientSettings.rooms_require_phone,
				staffRespectPatronLimit: self.clientSettings.rooms_staff_respect_patron_limit,
				enforceMaxAttendees: self.clientSettings.rooms_enforce_max_attendees,
				groupBillingEnabled: self.clientSettings.rooms_group_billing_enabled,
				bookingClass: self.clientSettings.rooms_group_billing_enabled ? currentBookingClass : false,
				bookings: self.bookings,
				mode: self.settings.mode,
				offlineButtonText: self.clientSettings.rooms_offline_button_text,
				rooms_mediated_booking_message: self.clientSettings.rooms_mediated_booking_message,
				showSMSPrompt: self.clientSettings.notifications_allow_sms_optout,
				SMSOptMode: self.clientSettings.notifications_sms_opt_mode,
				SMSPromptMessage: self.clientSettings.notifications_sms_optout_message,
				sessionId: this.settings.sessionId,
				chargingMode: this.settings.chargingMode,
				testMode: this.settings.testMode,
				ezproxy: this.settings.ezproxy,
				rooms_remotelock_show_on_confirmationscreen_mediated: self.clientSettings.rooms_remotelock_show_on_confirmationscreen_mediated,
				payment_currency: this.settings.payment_currency,
				payment_currency_symbol: this.settings.payment_currency_symbol,
				phone_number_regex: this.clientSettings.phone_number_regex,
				payLaterEnabled: self.settings.mode === 1
					? self.clientSettings.rooms_enable_pay_later_staff
					: self.clientSettings.rooms_enable_pay_later,
				payLaterButtonText: self.clientSettings.rooms_pay_later_button_text,
			}).on('booker:reset', function (event, status) {
				self.storage.removeItem('communicoReserveCart');
				self.bookings = [];
				self._updateCart();
			}).on('booker:closed', function (event, status) {
				if (status || !self.clientSettings.rooms_cart_enabled) {
					self.bookings = [];
					self._updateCart();
				}
				roomBooker.remove();
				self.holder.show();
				if (self.settings.mode === 1) {
					self.navigation.sticky({ topSpacing: 80, wrapperClassName: 'sticky-nav' });
					self.key.sticky({ topSpacing: 140, bottomSpacing: 50, wrapperClassName: 'sticky-key' });
				} else {
					self.navigation.sticky({ wrapperClassName: 'sticky-nav' });
					self.key.sticky({ topSpacing: 60, bottomSpacing: ($('#footer').outerHeight() || 300) + 50, wrapperClassName: 'sticky-key' });
				}
				self._update();
			});
		},
		_updateCart: function () {
			var self = this;
			this.bookings.forEach(function (booking) {
				var room = null;
				//console.log(booking.booking_class, booking.room.id);
				//console.log(self.roomByClassById);
				if (parseInt(booking.booking_class) > 0) {
					room = self.roomByClassById[booking.booking_class][booking.room.id];
				} else {
					room = self.roomById[booking.room.id];
				}

				booking.room = room;
			});

			if (this.storage) {
				this.storage.setItem('communicoReserveCart', JSON.stringify(this.bookings));
			}

			$('.basket-total', this.cartHolder).text(this.bookings.length);
			var cartList = $('.amnp-picker-cart-list', this.cartHolder).empty();
			if (this.bookings.length === 0) {
				cartList.text('Your cart is empty');
				$('.amnp-picker-cart-footer', this.cartHolder).hide();
			} else {
				$('.amnp-picker-cart-footer', this.cartHolder).show();
				var self = this;
				this.bookings.forEach(function (booking) {
					self._getBookingSummeryDetails(booking).appendTo(cartList);
				});
			}
			if (this.settings.mode !== 1 && this.clientSettings.rooms_charging_enabled) {
				$('.amnp-picker-cart-total', this.cartHolder).html(this.settings.payment_currency_symbol + '' + this._formatCurrency(this._calculateTotalCharge()));
			}
		},
		_getBookingSummeryDetails: function (booking) {
			var $bookingSummary = $('<div class="amnp-booking-summary"></div>');
			var $bookingSummaryDetails = $('<div class="amnp-booking-summary-details"></div>').appendTo($bookingSummary);
			var startTime = moment(booking.start);
			var endTime = moment(booking.end);

			if (booking.room.image && booking.room.image.length > 0) {
				$('<img/>').attr('src', '//' + this.settings.client + '.libnet.info/images/roombooking/' + this.settings.client + '/' + booking.room.image).attr('alt', booking.room.title).appendTo($bookingSummaryDetails);
			}

			var title = $('<div class="amnp-booking-summary-title">' + booking.room.title + '</div>').appendTo($bookingSummaryDetails);
			if (!this.settings.singleBranch) {
				title.append('<span>, ' + booking.location.name + '</span>');
			}
			$('<div class="amnp-booking-summary-time">' + startTime.format('h:mma') + ' - ' + endTime.format('h:mma') + '</b>, ' + endTime.format('MMMM DD, YYYY') + '</div>').appendTo($bookingSummaryDetails);

			var $bookingSummaryCost = $('<div class="amnp-booking-summary-total"></div>').appendTo($bookingSummary);
			var minutes = moment.duration(endTime.diff(startTime)).asMinutes();
			var realmin = minutes % 60
			var hours = Math.floor(minutes / 60);
			var displayText = '';
			if (hours > 0) {
				displayText = hours + (hours === 1 ? ' hour' : ' hours');
			}
			if (realmin > 0) {
				displayText += ' ' + realmin + (realmin === 1 ? ' minute' : ' minutes');
			}
			$('<div class="amnp-booking-summary-booking-name"></div>').text(displayText).appendTo($bookingSummaryCost);
			var costHolder = $('<div class="amnp-booking-summary-booking-cost"></div>').appendTo($bookingSummaryCost);
			if (this.settings.mode !== 1 && this.clientSettings.rooms_charging_enabled) {
				costHolder.html(this.settings.payment_currency_symbol + '' + this._formatCurrency(this._calculateBookingCharge(booking, false)));
			}

			if (booking.assets.length > 0) {
				var $bookingSummaryAssets = $('<div class="amnp-booking-summary-assets"></div>').appendTo($bookingSummary);
				var self = this;
				booking.assets.forEach(function (asset) {
					var a = $('<div class="amnp-booking-summary-asset"></div>').appendTo($bookingSummaryAssets);
					$('<div class="amnp-booking-summary-booking-name"></div>').text(asset.name).appendTo(a);
					$('<div class="amnp-booking-summary-asset-qty"></div>').text('qty ' + asset.qty).appendTo(a);
					var costHolder = $('<div class="amnp-booking-summary-booking-cost"></div>').appendTo(a);
					if (self.clientSettings.rooms_charging_enabled) {
						costHolder.html(self.settings.payment_currency_symbol + '' + self._formatCurrency(parseFloat(asset.cost) * asset.qty));
					}
					$('<div class="amnp-booking-summary-booking-remove link">remove</div>').data('asset', asset).appendTo(a);
				});
			}
			var $bookingSummaryTotal = $('<div class="amnp-booking-summary-total"></div>').appendTo($bookingSummary);
			var $subTotal = $('<div class="amnp-booking-summary-booking-subtotal"></div>').appendTo($bookingSummaryTotal);
			var costHolder = $('<div class="amnp-booking-summary-booking-cost"></div>').appendTo($bookingSummaryTotal);
			$('<div class="amnp-booking-summary-booking-remove link">remove</div>').data('booking', booking).appendTo($bookingSummaryTotal);
			if (this.settings.mode !== 1 && this.clientSettings.rooms_charging_enabled) {
				$subTotal.text('sub total');
				costHolder.html(this.settings.payment_currency_symbol + '' + this._formatCurrency(this._calculateBookingCharge(booking, true)));
			}

			return $bookingSummary;
		},
		_formatCurrency: function (amount) {
			return amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		},
		_calculateBookingCharge: function (booking, incAssets) {
			var startTime = moment(booking.start);
			var endTime = moment(booking.end);

			var roomTotal = parseFloat(booking.room.restrictions.charge_amount);
			if (parseInt(booking.room.restrictions.charge_period) === 0) {
				var blockSize = parseInt(booking.room.restrictions.segment_size) * parseInt(booking.room.restrictions.block_count);
				var rawDuration = moment.duration(endTime.diff(startTime)).asMinutes();
				roomTotal = (rawDuration / blockSize) * roomTotal;
			}

			if (booking.layout && booking.layout.cost && parseFloat(booking.layout.cost) > 0) {
				roomTotal += parseFloat(booking.layout.cost);
			}

			if (incAssets) {
				var assetCharge = booking.assets.reduce(function (total, asset) {
					return total + parseFloat(asset.cost) * asset.qty;
				}, 0);
			} else {
				var assetCharge = 0;
			}
			return parseFloat(roomTotal + assetCharge);
		},
		_calculateTotalCharge: function () {
			var self = this;
			var cartTotal = this.bookings.reduce(function (total, booking) {
				return total + self._calculateBookingCharge(booking, true);
			}, 0);
			return cartTotal;
		},
		_sortStage: function () {
			var self = this;
			var sections = $('.amnp-location-section', self.stage);
			sections.sort(function (a, b) {
				var an = a.getAttribute('data-location-name');
				var bn = b.getAttribute('data-location-name');

				if (an > bn) {
					return 1;
				}
				if (an < bn) {
					return -1;
				}
				return 0;
			});
			sections.detach().appendTo(self.stage);
		},
		_update: function (force = false) {
			var self = this;

			// Date selection management
			var curDate = moment(self.datePicker.datepicker('getUTCDate')).utc();
			$('.amnp-navigation-title', self.navigation).text(curDate.format('LL'));
			self.CurrentDateString = curDate.format('YYYY-MM-DD');

			if (self._updating) return true;
			self._updating = true;

			// START - Location selection management
			self.selectedLocations = [];
			if (self.locationSelect.is(":visible")) {
				self.locationSelect.find('input[data-location]:checked').each(function (el) {
					self.selectedLocations.push($(this).attr('data-location'));
				});
			}

			if ($(".multiselect", self.holder).is(":visible")) {
				self.responsiveLocationSelect.find('option[data-location]:selected').each(function (el) {
					self.selectedLocations.push($(this).attr('data-location'));
				});
			}
			if (parseInt(self.settings.selectedLocation) > 0 && self.selectedLocations.length === 0) {
				self.selectedLocations.push(self.settings.selectedLocation);
			}

			if (self.selectedLocations.length == 0) {
				self._updating = false;
				if (!force) {
					self.locationCount = 0;
					if (self.locations.length == 0) {
						self.stage.empty().append('<h3>No rooms found. Please change your search criteria</h3>');
					} else {
						self.stage.empty().append('<h3>Please choose at least one branch</h3>');
					}
					return;
				}
				if (self.locationSelect.is(":visible")) {
					self.locationSelect.find('.checkall').prop('checked', true);
				}

				if (self.responsiveLocationSelect.is(":visible")) {
					self.responsiveLocationSelect.multiselect('selectAll', true);
				}
				// Our previous search had no matching branches, so fall back to previously selected branches for the current search
				self.selectedLocations = JSON.parse(self._readCookie('reserveBranches')).join(",");
			}
			self._createCookie('reserveBranches', JSON.stringify(self.selectedLocations), 365);
			self.locationCount = self.selectedLocations.length;
			// END - Location selection management

			self._showCover(true);

			// START - Set parameters for API calls
			var roomOptions = {
				date: self.CurrentDateString,
				class_id: []
			};
			var locationOptions = {
				only_with_external_rooms: 1
			};
			// Add locations for existing bookings to the roomclass query
			var locs = self.selectedLocations;
			locs = locs.concat(this.bookings
				.map(function (x) { return x.location.id; })
				.filter(function (x) { return !locs.includes(x) }));

			if (self.clientSettings.rooms_group_billing_enabled) {
				if (self.settings.mode === 0) {
					roomOptions.external_only = 1;
				}
				if (self.groupTypeSelect.is(':visible')) {
					roomOptions.class_id.push(self.groupTypeSelect.val());
				}
				if (self.responsiveGroupTypeSelect.is(':visible')) {
					roomOptions.class_id.push(self.responsiveGroupTypeSelect.val());
				}

				locationOptions.class_id = roomOptions.class_id[0];

				if (self.bookings.length > 0) {
					for (var b = 0; b < self.bookings.length; b++) {
						var booking = self.bookings[b];
						if (roomOptions.class_id.indexOf(booking.booking_class) === -1) {
							roomOptions.class_id.push(booking.booking_class);
						}
					}
				}
			} else {
				var classtype = 0;
				if (self.settings.mode === 0) {
					locationOptions.only_with_patron_rooms = 1;
					roomOptions.external_only = 1;
					classtype = 1;
				}
				var defaultClass = self.userclasses.find(function (c) {
					return c.type == classtype
				});
				roomOptions.class_id = [defaultClass.id];

			}

			// CH# 1678
			// Had to move this out of 'mode' check, otherwise it's never hit on patron side.
			if (self.settings.unmediatedOnly) {
				roomOptions.unmediated_only = 1;
				locationOptions.only_with_unmediated = 1;
			}

			if (self.settings.mediatedOnly) {
				roomOptions.mediated_only = 1;
			}
			locationOptions.mode = self.settings.mode;
			// END - Set parameters for API calls

			Promise.all([
				self._getJSON(self.settings.apiServer + '/v2/' + self.settings.client + '/roomsbyclass/' + locs, roomOptions),
				self._getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/opening-hours/' + self.CurrentDateString + '/1'),
				self._getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/locations', locationOptions)
			]).then(function (result) {
				var roomsByClasses = result[0];
				self.openingHours = result[1];
				self.locations = result[2];
				self.rooms = result[0][roomOptions.class_id[0]];
				self.locationsById = {};

				if (self.locations.length === 0) {
					self._updating = false;
					self.settings.selectedLocation = 0;
					self.locationSelect.find('input[data-location]:checked').prop('checked', false);
					self.responsiveLocationSelect.find('option[data-location]:selected').prop('selected', false);
					self._render();
					return;
				}

				self.locations.forEach(function (location) {
					self.locationsById[location.id] = location;
				});

				self.roomById = {};
				self.roomByClassById = {};
				if (self.groupTypeSelect) {
					var selectedClassId = parseInt(self.groupTypeSelect.val(), 10);
					var availableClassIds = Object.keys(roomsByClasses).map(function (classId) {
						return parseInt(classId, 10);
					});

					if (!availableClassIds.includes(selectedClassId)) { self._updating = false; self._update(true) }
				}

				for (var roomClassKey in roomsByClasses) {
					var roomClass = roomsByClasses[roomClassKey];
					roomClass.forEach(function (room) {
						if (typeof self.roomByClassById[room.restrictions.class_id] === "undefined") self.roomByClassById[room.restrictions.class_id] = {};
						self.roomByClassById[room.restrictions.class_id][room.id] = room;
					});
				};

				//loop each room and copy its bookings to other effected rooms

				self.rooms.forEach(function (room) {
					//if(typeof self.roomByClassById[room.restrictions.class_id] === "undefined") self.roomByClassById[room.restrictions.class_id] = {};
					//self.roomByClassById[room.restrictions.class_id][room.id] = room;
					self.roomById[room.id] = room;
					if (room.bookings.length > 0) {
						var otherRooms = room.childRooms.concat(room.parentRooms);
						self.rooms.forEach(function (subRoom) {
							if (otherRooms.indexOf(subRoom.id) !== -1) {
								subRoom.bookings = subRoom.bookings.concat(room.bookings.filter(function (booking) {
									return parseInt(booking.room_id, 10) == parseInt(room.id, 10);
								}));
							}
						});
					}
				});

				self.bookings.forEach(function (details) {
					if (!moment(details.start).isSame(curDate, 'd')) return;
					var toUpdate = [details.room.id];
					var room = null;

					if (parseInt(details.booking_class) > 0) {
						room = self.roomByClassById[details.booking_class][details.room.id];
					} else {
						room = self.roomById[details.room.id];
					}

					if (details.layout && details.layout.id) {
						var layoutId = parseInt(details.layout.id);
						details.layout = room.layouts.find(function (layout) {
							return parseInt(layout.id) === layoutId;
						});
					}

					details.room = room;
					toUpdate = toUpdate.concat(room.parentRooms, room.childRooms);
					self._addCartBookingToRooms(details, toUpdate);
				});

				self._updating = false;
				self._hideCover();
				self._render();
			}).catch(function (err) {
				self._updating = false;
				console.log(err);
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