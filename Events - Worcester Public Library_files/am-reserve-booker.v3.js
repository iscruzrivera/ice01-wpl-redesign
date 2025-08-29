;
(function ($, window, document, undefined) {
	"use strict";
	var pluginName = "amReserveBooker",
		defaults = {
			apiServer: false,
			client: false,
			mode: 0,
			showSMSPrompt: false,
			SMSOptMode: 0,
			SMSPromptMessage: '',
			offlineButtonText: 'Offline',
			sessionId: '',
			chargingMode: 0,
			mediated: 0,
			testMode: 0,
			payment_currency: "USD",
			payment_currency_symbol: '$'
		};
	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.bookings = [];
		this.currentBooking = false;
		this.bookingPaymentType = 'card';
		this.cardForm = null;
		this.paypalAmount = 0.00;
		this.PayPalPayFlow = null;
		this.availablePaymentTypes = [];

		this.init();
	}
	$.extend(true, Plugin.prototype, $.fn['amShared']);
	$.extend(Plugin.prototype, {
		init: function () {
			var self = this;
			var defaultPaymentType = 
				self.settings.ecommerceEnabled && self.settings.cardPaymentEnabled && self.settings.mode !== 1 ? 'card' : 'offline';
			self.bookingPaymentType = defaultPaymentType;
			this.settings.bookings.forEach(function (booking) {
				self.bookings.push({
					data: {
						start_time: booking.start,
						end_time: booking.end,
						contact: { first_name: "", last_name: "", phone: "", email: "", librarycard: "", booking_title: "", group_name: "" },
						assets: booking.assets,
						room_id: booking.room.id,
						expected_attendees: 0,
						customQuestions: {},
						layout_id: booking.layout ? booking.layout.id : false,
						paymentType: defaultPaymentType,
						bookingClass: booking.booking_class
					},
					layout: booking.layout,
					room: booking.room,
					location: booking.location,
					startTime: moment(booking.start),
					endTime: moment(booking.end)
				});

				if (booking.room.restrictions.require_login) {
					if (parseInt(booking.room.restrictions.require_login) === 1 && !self.settings.loginRequired) {
						self.settings.loginRequired = true;
					}
				}
			});

			this._buildInterface();
			this._bindEvents();

			window.scroll({
				top: 0,
				left: 0
			});

			if (this.settings.mode === 1) {
				this.cardlookup.show();
			} else {
				if (this.settings.loginRequired) {
					this.loginForm.show();
					this.detailsForm.hide();
				}
			}

		},
		_buildInterface: function () {
			var self = this;

			self.holder = $('<div class="amnp-booker-holder"></div>').appendTo(self.element);
			self.reserveScreen = $('<div class="amnp-reserve-screen amnp-reserve-screen-basket"></div>').appendTo(self.holder);
			self.reserveScreenShared = $('<div class="amnp-reserve-screen-shared"></div>').appendTo(self.reserveScreen);
			self.confirmScreen = $('<div class="amnp-confirm-screen"></div>').appendTo(self.holder).hide();
			self.screenThankyou = $('<div class="amnp-thanks-screen"></div>').appendTo(self.holder).hide();

			if (self.bookings.length == 1) {
				self._getBookingHeader(self.bookings[0]).appendTo(self.reserveScreenShared);
			}

			if (self.settings.mode === 1) {
				var bookingType = self._createField('booking_type', 'select', 'Booking type', false).appendTo(self.reserveScreenShared);
				var bookingTypeSelect = $('select', bookingType);
				self._getJSON('/ajax/fetch/get_user_classes').then(function (json) {
					json.forEach(function (cls) {
						$('<option value="' + cls.id + '">' + cls.name + '</option>').data('details', cls).appendTo(bookingTypeSelect);
						if (!self.settings.bookingClass && parseInt(cls.type, 10) === 1) {
							$('#booking_type', self.reserveScreenShared).val(cls.id).trigger('change');
						}
					});
					if (self.settings.bookingClass) $('#booking_type', self.reserveScreenShared).val(self.settings.bookingClass).trigger('change');
				}).catch(function (err) {
					console.log(err);
				});
				self.cardlookup = self._createField('login_card', 'text', 'Library card number', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit events2-lookup input-group-addon">Find details</span>').addClass('events2-card').appendTo(self.reserveScreenShared).hide();
			} else {
				/*start login form*/
				self.loginForm = $('<div class="amnp-login-form"></div>').appendTo(self.reserveScreenShared);
				if (self.settings.pinlessAuth) {
					if (self.settings.loginRequired) {
						self._createField('login_card', 'text', 'Library card number', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amnp-lookup input-group-addon">Login</span>', 'A library card is required to book a room.')
							.appendTo(self.loginForm);
					}
				} else {
					if(self.settings.ezproxy.showLoginButton == 1) {
						$('<a href="' + self.settings.ezproxy.loginButtonLink + '" class="btn btn-info">' + self.settings.ezproxy.loginButtonText + '</a>').appendTo(self.loginForm);
					} else {
						self._createField('login_card', 'text', 'Library card number', false).addClass('amnp-card').appendTo(self.loginForm);
						if (self.settings.loginRequired) {
							var pin = self._createField('login_pin', 'password', 'PIN / Password', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amnp-lookup input-group-addon">Login</span>', 'A library card is required to book a room.')
								.appendTo(self.loginForm);
						} else {
							var pin = self._createField('login_pin', 'password', 'PIN / Password', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amnp-lookup input-group-addon">Find details</span>', 'Enter your Library card number and PIN and we\'ll look up your details to fill in the next fields.').appendTo(self.loginForm);
						}
					}
				}
			}

			self.detailsForm = $('<div></div>').appendTo(self.reserveScreenShared);
			if (self.settings.mode !== 1 && self.settings.loginRequired) {
				self.reserveScreen.addClass('amnp-login-required');
				self.detailsForm.hide();
			}

			self._createField('contact_first_name', 'text', 'First name', true).appendTo(self.detailsForm);
			self._createField('contact_last_name', 'text', 'Last name', true).appendTo(self.detailsForm);
			self._createField('contact_email', 'text', 'Email', self.settings.emailRequired, false, 'We\'ll use the email address to confirm the booking and to notify if the room becomes unavailable.').appendTo(self.detailsForm);
			self._createField('contact_tel', 'text', 'Phone', self.settings.phoneRequired, false).appendTo(self.detailsForm);

			$('<input type="hidden" id="librarycard" value="">').appendTo(self.detailsForm);

			if (self.settings.showSMSPrompt) {
				var checked = self.settings.SMSOptMode ? 'checked="checked"' : '';
				var cbx = $('<div class="row amf-row">' +
					'	<label for="phone" class="col-sm-4 control-label">&nbsp;</label>' +
					' <div class="col-sm-8 field">' +
					' 	<div class="checkbox"><label style="font-size:12px;text-align:left;"><input style="width:auto !important;" type="checkbox" id="contact_allow_sms"' + checked + '/>' + self.settings.SMSPromptMessage + '</label></div>' +
					' </div></div>');
				cbx.appendTo(self.detailsForm);
			}

			this._setBooking(0);
			$('<div class="amnp-booking-final-summary-heading link">Reservation details</div>').appendTo(self.confirmScreen);
			self.bookingSummary = $('<div class="amnp-booking-summary"></div>').appendTo(self.confirmScreen);
			$('<div class="amnp-booking-final-summary-heading link">Booking details</div>').appendTo(self.confirmScreen);
			self.bookingDetails = $('<div class="amnp-booking-options"></div>').appendTo(self.confirmScreen);

			self.bookingPayment = $('<div></div>').appendTo(self.confirmScreen).hide();
			if (self.settings.chargingEnabled && self.settings.ecommerceEnabled) $('<div class="amnp-booking-final-summary-heading link">Payment details</div>').appendTo(self.bookingPayment);

			var buttons = $('<div class="amnp-buttons">' + '<span class="amnp-required-label"><span class="required-field"></span> field required</span>' + '<button class="btn btn-edit amnp-back-to-reserve">Cancel</button>' + '<button class="btn btn-success amnp-submit-booking">Reserve</button>' + '</div>').appendTo(self.confirmScreen);
			if(this._isChargable() && self.settings.payLaterEnabled && this.settings.mode == 1) {
				var paymentType = self._createField('payment_type', 'select', 'Payment type', false).appendTo(self.reserveScreenShared);
				var $paymentTypeSelect = $('select', paymentType);
				$paymentTypeSelect.append('<option value="offline">Offline</option>');
				$paymentTypeSelect.append('<option value="pay_later">Pay Later</option>');
			}

			var paymentTypes = [
				{
					string: 'card',
					cond: self.settings.ecommerceEnabled && self.settings.cardPaymentEnabled,
					buttonText: 'Card'
				},
				{
					string: 'pay_later',
					cond: self.settings.ecommerceEnabled && self.settings.payLaterEnabled,
					buttonText: self.settings.payLaterButtonText || 'Pay Later'
				},
				{ // CH#4337 - Offline text button customization
					string: 'offline',
					cond: self.settings.offlinePaymentsEnabled,
					buttonText: self.settings.offlineButtonText || 'Offline'
				}
			];

			// Determine which payment types are enabled and only show those buttons
			var buttonHtml = '';
			paymentTypes.forEach(function (paymentType) {
				if (paymentType['cond']) {
					self.availablePaymentTypes.push(paymentType['string']);
					var isActiveString = '';
					var isCheckedString = '';
					// Pre-select button for default payment type
					if (self.bookingPaymentType === paymentType['string']) {
						isActiveString = 'active';
						isCheckedString = 'checked';
					}
					buttonHtml += 
					'<label class="btn btn-default ' + isActiveString + '">'
						+ '<input type="radio" name="options" value="' + paymentType['string'] + '" autocomplete="off" ' + isCheckedString + '>'
						+ paymentType['buttonText'] +
					'</label>';
				}
			})

			self.paymentTypeForm = $('<div class="row amf-row amnp-payment-toggle">'
				+ '<label  class="col-sm-4 control-label">Payment type'
				+ '</span>'
				+ '</label>'
				+ '<div class="col-sm-8 field">'
				+ '<div class="btn-group" data-toggle="buttons" style="display:flex"}}>'
				+ buttonHtml				
				+ '</div>'
				+ '</div>'
				+ '<div class="col-sm-4">'
				+ '</div>'
				+ '<div class="col-sm-8 am-form-desc">'
				+ '</div>'
				+ '</div>').appendTo(self.bookingPayment).hide();

			self.offlineForm = $('<div class="amnp-offline-form"></div>').html(self.settings.offlinePaymentsMessage).appendTo(self.bookingPayment).hide();
			self.laterForm = $('<div class="amnp-paylater-form"></div>').html(self.settings.laterPaymentsMessage).appendTo(self.bookingPayment).hide();


			if (self.settings.ecommerceEnabled) {
				self.PayPalPayFlow = new PayPalPayFlow('S', self.settings.testMode, self.settings.client);
				self.PayPalPayFlow.buildForm().then(function (form) {
					self.cardForm = form;
					self.cardForm.appendTo(self.bookingPayment).hide();
					self._finishInterface();
				});
			} else {
				self._finishInterface();
			}
		},
		_finishInterface: function () {
			var self = this;
			$('<div class="amnp-spacer"><div class="amnp-error-message"></div></div>').appendTo(self.holder);

			var $stage = $('.stage');
			if($stage.length > 0) {
				$stage.scrollTop(0);
			}

			self._bindEvents();

			if (self.settings.mode === 1) {
				self.cardlookup.show();
			} else {
				if (self.settings.loginRequired) {
					self.loginForm.show();
					self.detailsForm.hide();
				}
			}
		},
		_back: function () {
			if (!this.currentBooking) {
				this.$element.trigger('booker:closed', false);
			}
			var pos = this.bookings.indexOf(this.currentBooking);
			if (pos > 0) {
				this._setBooking(pos - 1);
			} else {
				this.$element.trigger('booker:closed', false);
			}
		},
		_next: function () {
			var pos = this.bookings.indexOf(this.currentBooking) + 1;
			if (pos < this.bookings.length) {
				this._setBooking(pos);
			} else {
				this._showSummaryScreen();
			}
		},
		_setBooking: function (pos) {
			this.currentBooking = this.bookings[pos];
			this.reserveScreen.find('.amnp-booker-fields').remove();
			this._getBookingFields().appendTo(this.reserveScreen);
			if (this.bookings.length > 1 || this.settings.chargingEnabled) {
				if (pos > 0) {
					this.reserveScreenShared.hide();
				} else {
					this.reserveScreenShared.show();
				}
				$('.amnp-booking-summary', this.reserveScreen).remove();
				$('.amnp-booking-final-summary-heading', this.reserveScreen).remove();
				this._getBookingSummeryDetails(this.currentBooking).prependTo(this.reserveScreen);
				$('<div class="amnp-booking-final-summary-heading link">Reservation details (' + (pos + 1) + ' of ' + this.bookings.length + ')</div>').prependTo(this.reserveScreen);
			}
		},
		_showSummaryScreen: function () {
			this.reserveScreen.hide();

			var self = this;
			self.bookingSummary.empty();
			this.bookings.forEach(function (booking) {
				self._getBookingSummeryDetails(booking, self.settings.chargingEnabled).appendTo(self.bookingSummary);
			});
			self.bookingDetails.empty();
			self._createField('contact_first_name', 'text', 'First name', false).appendTo(self.bookingDetails).find('input').val(self.currentBooking.data.contact.first_name).prop('readonly', true);
			self._createField('contact_last_name', 'text', 'Last name', false).appendTo(self.bookingDetails).find('input').val(self.currentBooking.data.contact.last_name).prop('readonly', true);
			self._createField('contact_tel', 'text', 'Phone', false, false).appendTo(self.bookingDetails).find('input').val(self.currentBooking.data.contact.phone).prop('readonly', true);
			self._createField('contact_email', 'text', 'Email', false, false, 'We\'ll use the email address to confirm the booking and to notify if the room becomes unavailable.').appendTo(self.bookingDetails).find('input').val(self.currentBooking.data.contact.email).prop('readonly', true);

			if (this._isChargable() && this.settings.chargingEnabled && this.settings.mode !== 1) {
				var cost = this._calculateTotalCharge();

				if (this.availablePaymentTypes.length > 0) {
					this.bookingPayment.show();
					if (this.availablePaymentTypes.length > 1) {
						this.paymentTypeForm.show();
					}
					if (this.availablePaymentTypes.includes(this.bookingPaymentType)) {
						if (this.bookingPaymentType === 'card') {
							this.cardForm.show();
						} else if (this.bookingPaymentType === 'offline') {
							this.offlineForm.show();
						} else if (this.bookingPaymentType === 'pay_later') {
							this.laterForm.show();
						}
					}
				}
			} else {
				if (this.paymentTypeForm) this.paymentTypeForm.hide();
				if (this.cardForm) this.cardForm.hide();
				if (this.offlineForm) this.offlineForm.hide();
				if (this.laterForm) this.laterForm.hide();
				if (this.bookingPayment) this.bookingPayment.hide();
			}

			this.confirmScreen.show();
		},
		_getBookings: function () {
			var self = this;
			return self.bookings.reduce(function (ret, b) {
				var booking = JSON.parse(JSON.stringify(b.data));
				var chargeamt = self._calculateBookingCharge(b, true);

				booking.setup_time = 0;
				booking.breakdown_time = 0;

				booking.contact.group_name = booking.contact.group_name || booking.contact.first_name + ' ' + booking.contact.last_name.slice(0, 1);
				booking.contact.booking_title = booking.contact.booking_title || booking.contact.first_name + ' ' + booking.contact.last_name.slice(0, 1);
				booking.paymentType = self.bookingPaymentType;

				if(self.settings.useSetupBreakdown) {
					if(b.layout) {
						//use layout setup/breakdown times
						booking.setup_time =  b.layout.setup_time;
						booking.breakdown_time = b.layout.breakdown_time;
					} else {
						//use room setup/breakdown times
						booking.setup_time = b.room.setup_time;
						booking.breakdown_time = b.room.breakdown_time;
					}
				}

				if (self._isChargable() && self.settings.mode !== 1 && self.settings.ecommerceEnabled && self.settings.chargingEnabled && chargeamt > 0 && booking.paymentType === 'card') {

					if (!self._isFormClean(self.cardForm)) {
						throw "Please enter information for all required fields";
					}

					booking.paymentDetails = {
						first_name: $('input#card_first_name', self.cardForm).val(),
						last_name: $('input#card_last_name', self.cardForm).val(),
						card_number: $('input#card_number', self.cardForm).val(),
						expiration: $('input#expiration', self.cardForm).payment('cardExpiryVal'),
						cvc: $('input#CVV2', self.cardForm).val(),
						amt: chargeamt // Have to get the charge from the 'b' object not booking
					};

					self.paypalAmount += parseFloat(booking.paymentDetails.amt);

					if (booking.paymentType == 'card' && !$.payment.validateCardNumber(booking.paymentDetails.card_number)) {
						throw "Invalid card number";
					}
					if (booking.paymentType == 'card' && !$.payment.validateCardExpiry(booking.paymentDetails.expiration.month, booking.paymentDetails.expiration.year)) {
						throw "Invalid expiration date";
					}
					if (booking.paymentType == 'card' && !$.payment.validateCardCVC(booking.paymentDetails.cvc)) {
						throw "Invalid cvc";
					}
					if (booking.paymentType == 'card' && !$.payment.validateCardExpiry(booking.paymentDetails.expiration.month, booking.paymentDetails.expiration.year)) {
						throw "Invalid expiration date";
					}
					if (booking.paymentType == 'card' && !$.payment.validateCardCVC(booking.paymentDetails.cvc)) {
						throw "Invalid cvc";
					}
				}

				booking.customQuestions = JSON.stringify(booking.customQuestions);
				ret.push(booking);
				return ret;
			}, []);
		},
		_resetEvents: function () {
			this.paymentTypeForm.off('change', ':input');
			this.holder.off('click', '.amnp-submit-booking');
			this.holder.off('click', '.amnp-back-to-picker');
			this.holder.off('click', '.amnp-back-to-reserve');
			this.holder.off('click', '.amnp-lookup-history');
			this.holder.off('click', '.amnp-to-next-screen');
			this.holder.off('change', '.agreed');

			if (this.settings.mode === 1) {
				this.reserveScreen.off('change', '#booking_type');
				this.reserveScreen.off('change', '#payment_type');
				this.reserveScreen.off('click', '.events2-lookup');
			} else {
				this.loginForm.off('click', '.amnp-lookup');
			}
		},
		_bindEvents: function () {
			var self = this;
			self._resetEvents();

			self.paymentTypeForm.on('change', ':input', function () {
				self.bookingPaymentType = $(this).val();
				var bookingForms = {'card': self.cardForm, 'offline': self.offlineForm, 'pay_later': self.laterForm};
				for (var paymentType in bookingForms) {
					if (paymentType === self.bookingPaymentType) {
						bookingForms[paymentType]?.show();
					} else {
						bookingForms[paymentType]?.hide();
					}
				}
			});
			
			if (this.settings.mode == 1) {
				this.reserveScreen.on('change', '#payment_type', function () {
					self.bookingPaymentType = $(this).val();
				});
			}

			self.holder.on('click', '.amnp-submit-booking', function (event) {
				event.preventDefault();
				var b = $(this).button('loading');
				var cache = [];

				var runCharges = self.settings.chargingEnabled && self.settings.ecommerceEnabled && self.settings.cardPaymentEnabled && self.bookingPaymentType === 'card';

				try {
					var finalBookings = self._getBookings();
				} catch (exception) {
					$('.amnp-error-message', self.holder).text(exception).fadeIn().delay(6000).fadeOut();
					b.button('reset');
					return;
				}

				if (self.settings.mode === 1) {
					// Control Panel
					// No Payments
					var toDo = finalBookings.length;
					$.each(finalBookings, function (index, booking) {
						var bookingData = self.bookings[index];
						var data = {
							location_id: bookingData.location.id,
							status: 0,
							class_id: bookingData.class_id,
							booking_type: bookingData.type,
							contact_first_name: booking.contact.first_name,
							contact_last_name: booking.contact.last_name,
							contact_email: booking.contact.email,
							contact_tel: booking.contact.phone,
							contact_allow_sms: booking.contact.allow_sms ? 1 : 0,
							group_name: booking.contact.group_name,
							expected_attendees: booking.expected_attendees,
							patron_notes: booking.patron_notes,
							display_name: booking.contact.booking_title,
							librarycard: booking.contact.librarycard,
							start_time: booking.start_time,
							end_time: booking.end_time,
							setup_time: booking.setup_time,
							breakdown_time: booking.breakdown_time,
							assets: booking.assets,
							room_id: booking.room_id,
							custom_questions: booking.customQuestions,
							layout_id: booking.layout_id,
							paymentType: booking.paymentType,
							booking_class: bookingData.class_id
						};
						if (booking.paymentDetails) {
							data.paymentDetails = booking.paymentDetails;
						}
						$.ajax({
							type: 'POST',
							data: data,
							dataType: 'json',
							url: '/ajax/fetch/save_room_booking',
							success: function (data) {
								toDo--;
								if (toDo <= 0) {
									confirmChanges();
									showAlert(data);
									b.button('reset');
									if (data.type === 'success') {
										self.$element.trigger('booker:reset', true);
										self.$element.trigger('booker:closed', true);
										window.location.hash = '#rooms';
									}
								}
							}
						});
					});
				} else {
					// Website
					// PayPal PayFlow
					var blocks = '';
					var body = '';
					var head = '';
					var stage = $('<div class="events2-reg-thanks-stage"></div>');

					var toDo = finalBookings.length;
					var cache = [];
					var bookings = [];
					var bookingTransactions = [];

					self.paymentTypeForm.hide();
					self.reserveScreen.hide();
					self.confirmScreen.hide();
					self.screenThankyou.show().empty();

					// Setup a new stage, as we don't want the message.
					if (runCharges) {
						self.PayPalPayFlow.showProcessingAnimation($('.amnp-booker-holder'));
					} else {
						// We only want to show these once
						stage.append('<div class="events2-reg-thanks-title">Your room booking information</div>');
					}

					var foot = $('<div class="events2-reg-thanks-online">' +
						'	<div class="events2-reg-thanks-online-title">View online</div>' +
						'	<div>You can manage your room bookings at:</div>' +
						'	<div><a href="/myreservations">' + window.location.hostname + '/myreservations</a></div>' +
						'</div>');

					var sendBooking = function(booking, index) {
						return $.ajax({
							url: '/reserve?action=submit',
							data: booking,
							dataType: 'json',
							type: 'POST',
						}).then(function (data) {
							if (runCharges && booking.paymentDetails && booking.paymentDetails.amt > 0) {
								data.amt = booking.paymentDetails.amt;
								data.paymentType = self.bookingPaymentType; // booking.paymentType;
								bookingTransactions.push({ json: data, booking: self.bookings[index] });
							}

							// Cache should include all bookings, not just charged ones.
							// merge the data with bookings data - regardless if new or not, we don't really care either way
							for (var key in data) {
								self.bookings[index].data[key] = data[key];
							}
							var cacheData = self.bookings[index].data;
							cacheData.loc = JSON.parse(JSON.stringify(self.bookings[index].location.name));
							cache.push(cacheData);

							// Bookings needs to include all as well.
							bookings.push({ json: data, booking: self.bookings[index] });
							return cache;
						});
					};

					// Send bookings sequentially
					finalBookings.reduce(function(acc, nextBooking, index) {
						return acc.then(function() {
							return sendBooking(nextBooking, index);
						});
					}, Promise.resolve(cache)).then(function () {
						stage.empty();

						for (var b = 0; b < bookings.length; b++) {
							var book = bookings[b];
							// Get a formatted block per registration, this allows us to make a nicely designed 'stage'
							blocks = self._getBookingMessageBlock(book.booking, book.json);
							body = $('<div class="events2-reg-thanks-body"></div>');
							head = $('<div class="events2-reg-thanks-head"></div>');
							body.append(blocks.body);
							head.append(blocks.head);
							stage.append(head).append(body);
						}

						if (runCharges && bookingTransactions && bookingTransactions.length > 0) {
							if (parseInt(self.settings.chargingMode, 10) === 1) {
								$.post('/reserve', { action: 'set_booking_cache', bookingCache: cache }, function (cacheResponse) {
									if (typeof cacheResponse.id !== 'undefined') {
										new Promise(function (resolve, reject) {
											if (typeof self.PayPalPayFlow !== 'undefined') {
												if (bookingTransactions.length > 0) {
													var paymentDetails = {
														first_name: $('input#card_first_name', self.cardForm).val(),
														last_name: $('input#card_last_name', self.cardForm).val(),
														card_number: $('input#card_number', self.cardForm).val(),
														expiration: $('input#expiration', self.cardForm).payment('cardExpiryVal'),
														cvc: $('input#CVV2', self.cardForm).val(),
														email: $('input#contact_email').val()
													};

													paymentDetails.expiration = ("0" + paymentDetails.expiration.month.toString() + paymentDetails.expiration.year.toString().substr(2)).slice(-4);
													paymentDetails.card_number = paymentDetails.card_number.replace(/\s+/g, '');

													var transactionData = {
														'AMT': 0.00,
														'CVV2': paymentDetails.cvc,
														'EXPDATE': paymentDetails.expiration,
														'ACCT': paymentDetails.card_number,
														'BILLTOFIRSTNAME': paymentDetails.first_name,
														'BILLTOLASTNAME': paymentDetails.last_name,
														'EMAIL': paymentDetails.email,
														'CURRENCY': self.settings.payment_currency ? self.settings.payment_currency : 'USD',
														'CLIENT': self.settings.client
													};

													self.PayPalPayFlow.sendReserveTransaction(transactionData, bookingTransactions, cacheResponse.id).then(function (response) {
														// If we are back here, then we haven't browsed away, something is wrong with the bookings.
														if (!response) {
															reject(false);
														} else {
															resolve();
														}
													});
												} else {
													reject('Bookings array is empty.');
												}
											} else {
												reject('Form is broken.');
											}
										})
										.then(function () {
											// do nothing on success
											return;
										})
										.catch(function (response) {
											console.error(response);
											// If we are are here, then just draw the page as normal with whatever errors appear
											if (self.PayPalPayFlow) self.PayPalPayFlow.hideProcessingAnimation();

											self.screenThankyou.empty();
											self.$element.trigger('booker:reset', true);
											self.screenThankyou.append(stage).append(foot);
										});
									}
								}, 'json');
							} else {
								// We've finished all the main drawing, time to append THANKS!
								if (self.PayPalPayFlow) self.PayPalPayFlow.hideProcessingAnimation();

								self.screenThankyou.empty();
								self.$element.trigger('booker:reset', true);
								self.screenThankyou.append(stage).append(foot);
							}
						} else {
							// We've finished all the main drawing, time to append THANKS!
							if (self.PayPalPayFlow) self.PayPalPayFlow.hideProcessingAnimation();

							self.screenThankyou.empty();
							self.$element.trigger('booker:reset', true);
							self.screenThankyou.append(stage).append(foot);
						}
					}).catch(function(reason){
						console.error(reason);
					});
				}
			});

			self.holder.on('click', '.amnp-back-to-picker', function () {
				self.$element.trigger('booker:closed', true);
			}).on('change', '.agreed', function (event) {
				event.preventDefault();
				if ($(this).is(':checked')) {
					$('.amnp-to-next-screen', self.reserveScreen).removeProp('disabled');
					self.currentBooking.agreed = true;
				} else {
					self.currentBooking.agreed = false;
					$('.amnp-to-next-screen', self.reserveScreen).prop('disabled', 'true');
				}
			}).on('click', '.amnp-back-to-reserve', function (event) {
				event.preventDefault();
				self._back();
			}).on('click', '.amnp-lookup-history', function (event) {
				var search = $('#contact_first_name', self.holder).val();
				search += ' ' + $('#contact_last_name', self.holder).val();
				openDialog('/ajax/fetch/patron_finder?embedded=1&include_past=1&term=' + search + '&type=roombooking', 'Look up', function () {
					addButton('.gldbuttons', '<i class="fa fa-times"></i>', 'btn-edit', function () { closeDialog(false); });
				}, function (status) {
				});

			}).on('click', '.amnp-to-next-screen', function (event) {
				event.preventDefault();

				var reserveWindow = document.getElementsByClassName('amnp-booker-holder');
				if(reserveWindow[0] !== undefined) reserveWindow[0].scrollIntoView({behavior: "smooth"});

				if (!self.currentBooking) self.currentBooking = self.bookings[0];
				if (self.settings.mode === 1) {
					var bookingClass = $('#booking_type', self.holder).find(':selected').data('details');
					self.currentBooking.type = parseInt(bookingClass.type, 10) === 0 ? 1 : 2;
					var paymentType = $('#payment_type', self.holder).val();
					self.currentBooking.data.paymentType = paymentType;
					self.currentBooking.class_type = bookingClass.type;
					self.currentBooking.class_id = bookingClass.id;
				}
				self.currentBooking.data.contact.first_name = $('#contact_first_name', self.holder).val();
				self.currentBooking.data.contact.last_name = $('#contact_last_name', self.holder).val();
				self.currentBooking.data.contact.phone = $('#contact_tel', self.holder).val();
				self.currentBooking.data.contact.allow_sms = $('#contact_allow_sms', self.holder).length > 0 ? $('#contact_allow_sms', self.holder).is(":checked") : 0;
				self.currentBooking.data.contact.email = $('#contact_email', self.holder).val();
				self.currentBooking.data.contact.librarycard = $('#librarycard', self.holder).val();
				self.currentBooking.data.contact.group_name = $('#group_name', self.holder).val();
				self.currentBooking.data.contact.booking_title = $('#booking_title', self.holder).val();

				var patron = $(self.holder).data('patron');
				if (patron && typeof patron.mediationRequired !== 'undefined' && patron.mediationRequired !== null) {
					self.currentBooking.data.mediationRequired = patron.mediationRequired ? 1 : 0;
				}

				$('input#card_first_name', self.cardForm).val(self.currentBooking.data.contact.first_name);
				$('input#card_last_name', self.cardForm).val(self.currentBooking.data.contact.last_name);

				self.currentBooking.data.expected_attendees = parseInt($('#expected_attendees', self.holder).val() || 0, 10); //TODO: we still need this
				self.currentBooking.data.patron_notes = $('#patron_notes', self.holder).val();
				self.currentBooking.data.customQuestions = {};
				var reemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				var rephone = new RegExp(self.settings.phone_number_regex, "i");
				var roomMax = Math.max(parseInt(self.currentBooking.room.capacity_standing, 10), parseInt(self.currentBooking.room.capacity_chairs, 10), parseInt(self.currentBooking.room.capacity_tables, 10));
				if (self.currentBooking.data.layout_id) {
					$.each(self.currentBooking.room.layouts, function (idx, layout) {
						if (layout.id === self.currentBooking.data.layout_id) {
							roomMax = parseInt(layout.capacity, 10);
						}
					});
				}
				if (self.settings.mode !== 1) {
					if (!self._isFormClean(self.reserveScreen)) {
						$('.amnp-error-message', self.holder).text('Please enter information for all required fields').fadeIn().delay(6000).fadeOut();
						return;
					}
					// CH#1957 - CK - Fix for when max is 0 to ignore the message.
					if (self.settings.enforceMaxAttendees && (self.currentBooking.data.expected_attendees > roomMax) && roomMax > 0) {
						$('.amnp-error-message', self.holder).text('Expected attendees exceeds capacity').fadeIn().delay(6000).fadeOut();
						$('#expected_attendees', self.holder).addClass("hightlight-field").delay(6000).queue(function () {
							$(this).removeClass("hightlight-field").dequeue();
						});
						return;
					}
					if (!$('#contact_email', self.holder).prop('disabled') && self.currentBooking.data.contact.email.length > 0 && !reemail.test(self.currentBooking.data.contact.email)) {
						$('.amnp-error-message', self.holder).text('Please enter a valid email address').fadeIn().delay(6000).fadeOut();
						$('#contact_email', self.holder).addClass("hightlight-field").delay(6000).queue(function () {
							$(this).removeClass("hightlight-field").dequeue();
						});
						return;
					}
					if (!$('#contact_tel', self.holder).prop('disabled') && self.currentBooking.data.contact.phone.length > 0 && !rephone.test(self.currentBooking.data.contact.phone)) {
						$('.amnp-error-message', self.holder).text('Please enter a valid phone number').fadeIn().delay(6000).fadeOut();
						$('#contact_tel', self.holder).addClass("hightlight-field").delay(6000).queue(function () {
							$(this).removeClass("hightlight-field").dequeue();
						});

						return;
					}

					if (self.currentBooking.room.custom_fields && self.currentBooking.room.custom_fields.fields && self.currentBooking.room.custom_fields.fields.length > 0) {
						for (var i = self.currentBooking.room.custom_fields.fields.length - 1; i >= 0; i--) {
							var field = self.currentBooking.room.custom_fields.fields[i];
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
										$('.amnp-error-message', self.holder).text('The information entered is not valid').fadeIn().delay(6000).fadeOut();
										$('#' + field.name, self.holder).addClass("hightlight-field").delay(6000).queue(function () {
											$(this).removeClass("hightlight-field").dequeue();
										});
										return;
									}
									break;
								case 'email':
									if (val.length > 0 && !reemail.test(val)) {
										$('.amnp-error-message', self.holder).text('Please enter a valid email address').fadeIn().delay(6000).fadeOut();
										$('#' + field.name, self.holder).addClass("hightlight-field").delay(6000).queue(function () {
											$(this).removeClass("hightlight-field").dequeue();
										});
										return;
									}
									break;
								case 'phone':
									if (val.length > 0 && !rephone.test(val)) {
										$('.amnp-error-message', self.holder).text('Please enter a valid phone number').fadeIn().delay(6000).fadeOut();
										$('#' + field.name, self.holder).addClass("hightlight-field").delay(6000).queue(function () {
											$(this).removeClass("hightlight-field").dequeue();
										});
										return;
									}
									break;
							}
							if (val) self.currentBooking.data.customQuestions[field.name] = val;
						}
					}

					self._next();
				} else {
					if (self.currentBooking.room.custom_fields && self.currentBooking.room.custom_fields.fields && self.currentBooking.room.custom_fields.fields.length > 0) {
						for (var i = self.currentBooking.room.custom_fields.fields.length - 1; i >= 0; i--) {
							var field = self.currentBooking.room.custom_fields.fields[i];
							var val = false;
							switch (field.type) {
								case 'checkbox':
									val = $('#' + field.name, self.customQuestions).is(':checked');
									break;
								default:
									val = $('#' + field.name, self.customQuestions).val();
									break;
							}
							if (val) self.currentBooking.data.customQuestions[field.name] = val;
						}
					}
					if (self.settings.enforceMaxAttendees && (self.currentBooking.data.expected_attendees > roomMax && roomMax > 0)) {
						showAlert({
							title: 'Warning',
							message: 'expected attendees exceeds capacity',
							type: 'warning'
						});
					}

					if (parseInt(self.currentBooking.class_type, 10) > 0 && (self.currentBooking.data.contact.librarycard && self.currentBooking.data.contact.librarycard.length > 0 || self.currentBooking.data.contact.email && self.currentBooking.data.contact.email.length > 0)) {
						$.getJSON('/ajax/fetch/check_room_booking', { room_id: self.currentBooking.data.room_id, start_time: self.currentBooking.data.start_time, end_time: self.currentBooking.data.end_time, librarycard: self.currentBooking.data.contact.librarycard, email: self.currentBooking.data.contact.email, class_id: self.currentBooking.class_id }, function (json) {
							if (!json.ok) {
								if (self.settings.staffRespectPatronLimit) {
									showAlert({
										title: 'This will exceed the patrons booking limit',
										message: json.message,
										type: 'error'
									});
									return;
								} else {
									if (json.far) {
										var far = parseInt(self.currentBooking.room.restrictions.furthest_booking_days, 10);
										showAlert({
											title: 'This will exceed the furthest booking day for the room (' + far + ' days)',
											message: json.message,
											type: 'warning'
										});
									} else {
										showAlert({
											title: 'This will exceed the patrons booking limit',
											message: json.message,
											type: 'warning'
										});
									}
								}
							}
							self._next();
						});
					} else {
						self._next();
					}
				}
			});
			if (self.settings.mode === 1) {
				self.reserveScreen.on('change', '#booking_type', function (event) {
					event.preventDefault();
					var details = $(this).find(':selected').data('details');
					var locRooms = self.bookings.reduce(function (ret, booking) {
						if (!ret[booking.room.location_id]) ret[booking.room.location_id] = [];
						ret[booking.room.location_id].push(booking.room.id);
						return ret;
					}, {});
					for (var loc in locRooms) {

						self._getJSON(self.settings.apiServer + '/v2/' + self.settings.client + '/rooms/' + loc, { room_id: locRooms[loc].join(','), class_id: $('#booking_type', self.reserveScreen).val() }).then(function (json) {
							json.forEach(function (roomData) {
								self.bookings.forEach(function (booking) {
									if (booking.room.id == roomData.id) {
										booking.room = roomData;
									}
								});

								// CH14585 - Fix for issues
								self._updateCustomQuestions(null, null);
							});
							if (parseInt(details.type, 10) === 0) {
								self.cardlookup.hide();
								self._getJSON('/ajax/fetch/logged_in_data').then(function (json) {
									self.userData = json;
									$('#contact_first_name', self.reserveScreen).val(self.userData.first_name);
									$('#contact_last_name', self.reserveScreen).val(self.userData.last_name);
									$('#contact_email', self.reserveScreen).val(self.userData.username);
								});
							} else {
								$('#contact_first_name', self.reserveScreen).val('');
								$('#contact_last_name', self.reserveScreen).val('');
								$('#contact_email', self.reserveScreen).val('');
								self.cardlookup.show();
							}
							$('.amnp-booking-summary', self.reserveScreen).replaceWith(self._getBookingSummeryDetails(self.currentBooking));
						}).catch(function (err) {
							console.log(err);
						});
					}
				}).on('click', '.events2-lookup', function (event) {
					event.preventDefault();
					var b = $(this).button('loading');
					var card = $('#login_card', self.holder).val();
					self._getJSON('/ajax/fetch/patron_info', {
						barcode: card,
						type: 'reserve'
					}).then(function (json, textStatus) {
						$('#contact_first_name', self.holder).val('');
						$('#contact_last_name', self.holder).val('');
						$('#contact_tel', self.holder).val('');
						$('#contact_allow_sms', self.holder).val('');
						$('#contact_email', self.holder).val('');
						$('#librarycard', self.holder).val('');
						if (json.result === 'ok') {
							if (json.data.names.length > 0) {
								$('#contact_first_name', self.holder).val(json.data.names[0].first_name);
								$('#contact_last_name', self.holder).val(json.data.names[0].last_name);
							}
							if (json.data.phones.length > 0) {
								$('#contact_tel', self.holder).val(json.data.phones[0].replace(/\W/g, ''));
							}
							if (json.data.emails.length > 0) {
								$('#contact_email', self.holder).val(json.data.emails[0]);
							}
							if (json.data.barcodes.length > 0) {
								$('#librarycard', self.holder).val(json.data.barcodes[0]);
							}
							if (json.prefixBlocked) {
								showAlert({
									title: 'Warning',
									message: 'This card is not allowed to reserve rooms',
									type: 'warning'
								});
							}
						} else {
							showAlert({
								title: 'Failed',
								message: 'Sorry, pin or card number not found',
								type: 'warning'
							});
						}
						b.button('reset');
					}).catch(function (err) {
						showAlert({
							title: 'Error',
							message: 'Sorry, there was a problem making the request',
							type: 'error'
						});
						b.button('reset');
					});
				});
			} else {
				self.loginForm.on('click', '.amnp-lookup', function (event) {
					event.preventDefault();
					var b = $(this).button('loading');
					// CH#1942 - Trim the card/pin fields to prevent blanks.
					var card = $.trim($('#login_card', self.holder).val());
					var loginData = { u: card, 'type': 'reserve' };
					if (!self.settings.pinlessAuth) {
						loginData.p = $.trim($('#login_pin', self.holder).val());
					}
					var locRooms = self.bookings.reduce(function (ret, booking) {
						ret.push(booking.room.id);
						return ret;
					}, []);
					if(locRooms.length > 0) {
						loginData.rooms = locRooms.join(',');
					}
					self._getJSON(self.settings.apiServer + '/v1/' + self.settings.client + '/patron', loginData).then(function (json, textStatus) {
						$(self.holder).removeData('patron');
						$('#contact_first_name', self.holder).val('');
						$('#contact_last_name', self.holder).val('');
						$('#contact_tel', self.holder).val('');
						$('#contact_allow_sms', self.holder).val('');
						$('#contact_email', self.holder).val('');
						$('#librarycard', self.holder).val('');
						if (json.result == 'ok') {
							$(self.holder).data('patron', json.data);
							if (!self.settings.pinlessAuth) {
								if (json.data.names.length > 0) {
									$('#contact_first_name', self.holder).val(json.data.names[0].first_name);
									$('#contact_last_name', self.holder).val(json.data.names[0].last_name);
									if (self.settings.roomsPatronDetailsReadonly) {
										$('#contact_first_name', self.holder).prop('disabled', true);
										$('#contact_last_name', self.holder).prop('disabled', true);
									}
								}
								if (json.data.phones.length > 0) {
									$('#contact_tel', self.holder).val(json.data.phones[0].replace(/\W/g, ''));
									if (self.settings.roomsPatronDetailsReadonly) {
										$('#contact_tel', self.holder).prop('disabled', true);
									}
								}
								if (json.data.emails.length > 0) {
									$('#contact_email', self.holder).val(json.data.emails[0]);
									if (self.settings.roomsPatronDetailsReadonly) {
										$('#contact_email', self.holder).prop('disabled', true);
									}
								}
							}
							if (json.data.barcodes.length > 0) {
								$('#librarycard', self.holder).val(json.data.barcodes[0]);
							}
							if (self.settings.loginRequired) {
								self.reserveScreen.removeClass('amnp-login-required');
								self.loginForm.hide();
								self.detailsForm.show();
							}
						} else {
							var msg = self.settings.pinlessAuth ? 'Sorry, card number not found' : 'Sorry, pin or card number not found';
							if (json.message && json.message.length > 0) {
								msg = json.message;
							}
							$('.amnp-error-message', self.holder).text(json.message || msg).fadeIn().delay(6000).fadeOut();
						}
						b.button('reset');
					}).catch(function (err) {
						$('.amnp-error-message', self.holder).text('Sorry, there was a problem making the request').fadeIn().delay(6000).fadeOut();
						b.button('reset');
					});
				});
			}
		},
		// Formatting block for CH#327
		_getBookingMessageBlock: function (booking, json) {
			// Booking - Room booking?
			// JSON - Custom object { amt(payment figure float), paymentType('card') }
			var self = this;

			var message = '<i class="fa fa-check-circle"></i>&nbsp;Reservation For: ';
			var ref = (self.settings.mode !== 1) ? ' <div class="events2-reg-thanks-ref">Ref:<span class="events2-reg-thanks-ref-num">' + json.reference + '</span></div>' : '';

			var costMessage = '';
			var mediatedMessage = '';
			if (!json.ok) {
				message = '<span style="color:#ED0202;"><i class="fa fa-times-circle"></i>&nbsp;' + json.message + '</span>';
				ref = '';
			}
			var lock = '';

			if (booking.room.unmediated === false || booking.data.mediationRequired === 1) {
				// Mediated
				mediatedMessage = '<div class="amrp-status-inreview"><i class="fa fa-info-circle"></i>' + '&nbsp' + self.settings.rooms_mediated_booking_message + '</div>';
				if (json.lock_code && json.lock_code.length > 0 && self.settings.rooms_remotelock_show_on_confirmationscreen_mediated) {
					lock = '<div class="events2-reg-thanks-pin"><span><i class="am-unlock"></i>Door code: </span>' + json.lock_code + '</div>' +
						'<div class="events2-reg-thanks-pin-message"><i class="fa fa-info-circle"></i>' +
						'<div class="events2-reg-thanks-pin-message-title">This room has a door lock.</div>' +
						'<div class="events2-reg-thanks-pin-message-body">You will need to enter the ' + json.lock_code.length + ' digit door code to unlock the room. Note: The code will not work before your room booking start time.</div>' +
						'</div>';
				}
			} else {
				// Unmediated
				if (json.lock_code && json.lock_code.length > 0) {
					lock = '<div class="events2-reg-thanks-pin"><span><i class="am-unlock"></i>Door code: </span>' + json.lock_code + '</div>' +
						'<div class="events2-reg-thanks-pin-message"><i class="fa fa-info-circle"></i>' +
						'<div class="events2-reg-thanks-pin-message-title">This room has a door lock.</div>' +
						'<div class="events2-reg-thanks-pin-message-body">You will need to enter the ' + json.lock_code.length + ' digit door code to unlock the room. Note: The code will not work before your room booking start time.</div>' +
						'</div>';
				}
			}

			if (json.ok && this._isChargable()) {
				var cost = this._calculateBookingCharge(booking, true);
				if (cost > 0) {
					if (this.bookingPaymentType === 'card') {
						costMessage = '<div class="events2-cost-msg">The total cost of this booking was ' + this.settings.payment_currency_symbol + '' + this._formatCurrency(cost);
						costMessage += ((booking.room.unmediated === false || booking.data.mediationRequired === 1) ? ', payment will be collected once the booking is confirmed.' : '');
						costMessage += '</div>';
					} else if (this.bookingPaymentType === 'offline') {
						costMessage = '<div class="events2-cost-msg">The total cost of this booking was ' + this.settings.payment_currency_symbol + '' + this._formatCurrency(cost) + '.</div>';
					}
				}
			}

			var thanksHead = $('<div class="events2-reg-thanks-evtitle">' + booking.room.title + '</div>' +
				'<div class="events2-reg-thanks-evlocation"><i class="fa fa-map-marker"></i>&nbsp;' + booking.location.name + '</div>');


			var thanksBody = $('<div class="events2-reg-thanks-event">' +
				'	<div class="events2-reg-thanks-sub-title">' + message + '</div>' +
				(json.ok ? mediatedMessage : "") +
				'	<div class="events2-reg-thanks-evdate">' + booking.startTime.format('MMMM DD, YYYY') + '</div>' +
				'	<div class="events2-reg-thanks-evtime">' + booking.startTime.format('h:mma') + ' - ' + booking.endTime.format('h:mma') + '</div>' +
				ref +
				lock +
				costMessage +
				'</div>');

			if(self.settings.mode === 1) {
				var closeButton = $('<button style="margin-top: 30px;" class="btn btn-info">Close</button>').appendTo(thanksBody);

				closeButton.on('click', function (event) {
					event.preventDefault();
					event.stopPropagation();

					self.$element.trigger('booker:reset', true);
					self.$element.trigger('booker:closed', true);
				});
			}

			return { head: thanksHead, body: thanksBody };
		},
		_getBookingSummeryDetails: function (booking, forcePrice) {
			var $bookingSummary = $('<div class="amnp-booking-summary"></div>');
			var $bookingSummaryDetails = $('<div class="amnp-booking-summary-details"></div>').appendTo($bookingSummary);
			var startTime = booking.startTime;
			var endTime = booking.endTime;

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
			if (this.settings.chargingEnabled || forcePrice) {
				costHolder.html(this.settings.payment_currency_symbol + '' + this._formatCurrency(this._calculateBookingCharge(booking, false)));
			}
			if (booking.data.assets.length > 0) {
				var $bookingSummaryAssets = $('<div class="amnp-booking-summary-assets"></div>').appendTo($bookingSummary);
				var self = this;
				booking.data.assets.forEach(function (asset) {
					var a = $('<div class="amnp-booking-summary-asset"></div>').appendTo($bookingSummaryAssets);
					$('<div class="amnp-booking-summary-booking-name"></div>').text(asset.name).appendTo(a);
					$('<div class="amnp-booking-summary-asset-qty"></div>').text('qty ' + asset.qty).appendTo(a);
					var costHolder = $('<div class="amnp-booking-summary-booking-cost"></div>').appendTo(a);
					if ((self.settings.mode !== 1 && self.settings.chargingEnabled) || forcePrice) {
						costHolder.html(self.settings.payment_currency_symbol + '' + self._formatCurrency(parseFloat(asset.cost) * asset.qty));
					}
					$('<div class="amnp-booking-summary-booking-remove link">remove</div>').data('asset', asset).appendTo(a);
				});
			}

			var $bookingSummaryTotal = $('<div class="amnp-booking-summary-total"></div>').appendTo($bookingSummary);
			var $subTotal = $('<div class="amnp-booking-summary-booking-subtotal"></div>').appendTo($bookingSummaryTotal);
			var costHolder = $('<div class="amnp-booking-summary-booking-cost"></div>').appendTo($bookingSummaryTotal);
			$('<div class="amnp-booking-summary-booking-remove link">remove</div>').data('booking', booking).appendTo($bookingSummaryTotal);
			if (this.settings.chargingEnabled) {
				$subTotal.text('sub total');
				costHolder.html(this.settings.payment_currency_symbol + '' + this._formatCurrency(this._calculateBookingCharge(booking, true)))
			}
			return $bookingSummary;
		},
		_getBookingHeader: function (booking) {
			var $bookingHeader = $('<div></div>');

			var title = $('<div class="amnp-booker-summary"><div class="amnp-booker-title"><i class="am-locations"><b>' + booking.room.title + '</b></div>' +
				'<b>' + booking.startTime.format('h:mma') + ' - ' + booking.endTime.format('h:mma') + '</b>, ' + booking.endTime.format('MMMM DD, YYYY') +
				'<div class="amnp-booker-time"/></div>').appendTo($bookingHeader);

			if (!this.settings.singleBranch) {
				$('.amnp-booker-title', title).append('<span>, ' + booking.location.name + '</span>');
			}
			return $bookingHeader;
		},
		_updateCustomQuestions: function ($form, last) {
			var customQuestions = null;
			var self = this;
			var pos = self.bookings.indexOf(self.currentBooking);
			var lastBooking;
			var $bookingForm = null;

			if (pos > 0 && last === null) {
				lastBooking = self.bookings[pos - 1];
			}

			if ($form === null) {
				$bookingForm = $('<div class="amnp-booker-fields"></div>').data(self.currentBooking);
			} else {
				$bookingForm = $form;
			}

			if ($('.amnp-custom-questions', $bookingForm).length > 0) {
				customQuestions = $('.amnp-custom-questions', $bookingForm);
				customQuestions.empty();
			} else {
				customQuestions = $('<div class="amnp-custom-questions"></div>').appendTo($bookingForm);
			}

			if (this.currentBooking.room.custom_fields.fields) {
				$.each(this.currentBooking.room.custom_fields.fields, function (index, val) {
					var field = self._createFieldWithObject(val).data('fieldSettings', val).addClass('amnp-custom-field').appendTo(customQuestions);
					if (val.type === 'select') {
						var select = $('select', field);
						$('<option value="">Please choose...</option>').appendTo(select);
						var options = val.options.trim().split(/\r?\n/);
						for (var i = 0; i < options.length; i++) {
							$('<option>' + options[i] + '</option>').appendTo(select);
						}
					}
					switch (val.type) {
						case 'checkbox':
							break;
						default:
							if (self.currentBooking.data.customQuestions && self.currentBooking.data.customQuestions[val.name]) {
								$('#' + val.name, $bookingForm).val(self.currentBooking.data.customQuestions[val.name]);
							} else if (lastBooking && lastBooking.data.customQuestions && lastBooking.data.customQuestions[val.name]) {
								$('#' + val.name, $bookingForm).val(lastBooking.data.customQuestions[val.name]);
							}
							break;
					}
				});
			}
		}
		,
		_getBookingFields: function () {
			var pos = this.bookings.indexOf(this.currentBooking);
			var lastBooking;
			if (pos > 0) {
				lastBooking = this.bookings[pos - 1];
			}

			var $bookingForm = $('<div class="amnp-booker-fields"></div>').data(this.currentBooking);

			if(parseInt(this.currentBooking.room.group_name_enabled, 10) === 1){
				this._createField('group_name', 'text', 'Group name', true, false, '(This is <b>not displayed</b> to the public)').appendTo($bookingForm);
				var group_name = this.currentBooking.data.contact.group_name;
				if (group_name === "" && lastBooking) {
					group_name = lastBooking.data.contact.group_name
				}
				$('#group_name', $bookingForm).val(group_name);
			}

			if(parseInt(this.currentBooking.room.booking_title_enabled, 10) === 1){
				this._createField('booking_title', 'text', 'Booking title', true, false, '(This <b>will be displayed</b> to the public)').appendTo($bookingForm);
				var booking_title = this.currentBooking.data.contact.booking_title;
				if (booking_title === "" && lastBooking) {
					booking_title = lastBooking.data.contact.booking_title
				}
				$('#booking_title', $bookingForm).val(booking_title);
			}

			if (this.settings.enableExpectedAttendees) {
				this._createField('expected_attendees', 'number', 'Attendees', this.settings.expectedAttendeesRequired, false, 'Number of attendees expected.', 0).appendTo($bookingForm);
				var expected_attendees = this.currentBooking.data.contact.expected_attendees;
				if (expected_attendees === "" && lastBooking) {
					expected_attendees = lastBooking.data.contact.expected_attendees
				}
				$('#expected_attendees', $bookingForm).val(expected_attendees);
			}

			if (this.settings.enablePatronNotes && parseInt(this.currentBooking.room.patron_notes_enabled, 10) === 1) {
				this._createField('patron_notes', 'textarea', 'Notes', false, false, false).appendTo($bookingForm);
				$('#patron_notes', $bookingForm).val(this.currentBooking.data.patron_notes);
			}

			if (this.currentBooking.room.custom_fields && this.currentBooking.room.custom_fields.fields && this.currentBooking.room.custom_fields.fields.length > 0) {
				this._updateCustomQuestions($bookingForm, lastBooking);
			}
			var backlabel = this.bookings.indexOf(this.currentBooking) === 0 ? 'Cancel' : 'Back';
			if (this.settings.mode === 1) {
				$('<div class="amnp-buttons"><button class="btn btn-edit amnp-lookup-history pull-left"><i class="am-search"/> Look up</button><button class="btn btn-edit amnp-back-to-reserve">' + backlabel + '</button><button class="btn btn-success amnp-to-next-screen">Next</button></div>').appendTo($bookingForm);
			} else {
				if (parseInt(this.currentBooking.room.tc_hidden, 10) === 0) {
					if (this.currentBooking.room.tc_link && this.currentBooking.room.tc_link.length > 0) {
						$('<label><input class="agreed" type="checkbox"> <span class="required-field"></span> I have read and agree to the room booking <a target="_blank" href="' + this.currentBooking.room.tc_link + '">terms and conditions</a></label>').appendTo($bookingForm);
					} else {
						$('<label><input class="agreed" type="checkbox"> <span class="required-field"></span> I have read and agree to the room booking terms and conditions</label>').appendTo($bookingForm);
					}
				} else {
					this.currentBooking.agreed = true;
				}
				$('<div class="amnp-buttons"><button class="btn btn-edit amnp-back-to-reserve">' + backlabel + '</button><button class="btn btn-success amnp-to-next-screen" disabled="true">Next</button></div>').appendTo($bookingForm);

				if (this.currentBooking.agreed) {
					$('.agreed', $bookingForm).prop('checked', true);
					$('.amnp-to-next-screen', $bookingForm).removeProp('disabled');
				}
			}

			return $bookingForm;
		},
		_isChargable: function () {
			return this._calculateTotalCharge() > 0;
		},
		_formatCurrency: function (amount) {
			return amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
		},
		_calculateBookingCharge: function (booking, incAssets) {
			var roomTotal = parseFloat(booking.room.restrictions.charge_amount);

			if (parseInt(booking.room.restrictions.charge_period) === 0) {
				var blockSize = parseInt(booking.room.restrictions.segment_size) * parseInt(booking.room.restrictions.block_count);
				var rawDuration = moment.duration(booking.endTime.diff(booking.startTime)).asMinutes();
				roomTotal = (rawDuration / blockSize) * roomTotal;
			}

			if (booking.layout && booking.layout.cost && parseFloat(booking.layout.cost) > 0) {
				roomTotal += parseFloat(booking.layout.cost);
			}
			if (incAssets) {
				var assetCharge = booking.data.assets.reduce(function (total, asset) {
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