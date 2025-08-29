;(function ( $, window, document, undefined ) {

	"use strict";
		var pluginName = "amRoomInfo",
			defaults = {
				timeZone:'America/New_York',
				allowOtherDates:true,
				pinlessAuth:false,
				loginRequired:false
			};
		var self=false;

		// The actual plugin constructor'email'
		function Plugin ( element, options ) {
			self=this;
			this.element = element;
			this.$element = $(element);
			this.settings = $.extend(true, {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.currentTime=moment(self.settings.startTime).tz(self.settings.timeZone);
			this.currentNavigationDate=self.currentTime.clone().startOf('day');
			this.init();
		}

		$.extend(Plugin.prototype, {
				init: function () {
					self._buildInterface();
					self._bindEvents();
					self._updateRoomList();
					self._update();
				},
				_buildInterface:function(){
					self.$element.css({
						backgroundColor: '#171717',
						color:'##949494',
						width: '100%',
						height: '100%',
						position: 'absolute',
						top: '0',
						left: '0'

					});

					self.holder = $('<div class="amri-holder"></div>').appendTo(self.element);

					self.leftCol = $('<div class="amri-left-col"></div>').appendTo(self.holder);
					self.rightCol = $('<div class="amri-right-col"></div>').appendTo(self.holder);

					self.bookingFormHolder = $('<div class="amri-booking-form-holder"></div>').appendTo(self.leftCol).hide();
					self.bookingForm = $('<div class="amri-booking-form"></div>').appendTo(self.bookingFormHolder);

					self.statusBox = $('<div class="amri-status-box"></div>').appendTo(self.leftCol);
					self.statusBoxContent = $('<div class="amri-status-box-content"></div>').appendTo(self.statusBox);
					self.roomName = $('<div class="amri-room-name"></div>').appendTo(self.statusBoxContent);
					self.roomStatus = $('<div class="amri-room-status"></div>').appendTo(self.statusBoxContent);
					self.roomStatusUntil = $('<div class="amri-room-status-until"></div>').appendTo(self.statusBoxContent);
					self.roomStatusTitle = $('<div class="amri-room-status-title"></div>').appendTo(self.statusBoxContent);
					self.roomStatusRemaining = $('<div class="amri-room-status-remaining"></div>').appendTo(self.statusBoxContent);

					self.upnextBox = $('<div class="amri-next-box"></div>').appendTo(self.leftCol);

					self.topBox = $('<div class="amri-top-box"></div>').appendTo(self.rightCol);
					self.timeBox = $('<div class="amri-time-box"><div class="amri-date"></div><div class="amri-time"></div></div>').appendTo(self.topBox);
					$('<div class="amri-choose-label">Choose a room</div>').appendTo(self.topBox);

					self.availabilityList = $('<div class="amri-availability-box"></div>').appendTo(self.rightCol);

					self.roomList=$('<select class="form-control"></select>').appendTo(self.topBox);
					if(self.settings.allowOtherDates){
						self.todayButton=$('<button class="amri-today-btn">Today</button>').appendTo(self.topBox);
					}
					self.navigation=$('<div class="amri-navigation"></div>').appendTo(self.topBox);

					if(self.settings.allowOtherDates){
						$('<div class="amri-prev amri-nav" data-amount="-1"><i class="fa fa-angle-left"></i></div><div class="amri-navigation-date"></div><div class="amri-next amri-nav" data-amount="1"><i class="fa fa-angle-right"></i></div>').appendTo(self.navigation);
						self.topBox.addClass('amri-has-navigation');
						self.availabilityList.addClass('amri-has-navigation');
					}else{
						$('<div class="amri-bookings-title">Today\'s schedule</div>').appendTo(self.topBox);
					}

					self.todaysHours=$('<div class="amri-opening-hours"></div>').appendTo(self.topBox);
					self.bookingsListHolder=$('<div class="amri-bookings-list-holder"></div>').appendTo(self.availabilityList);
					self.bookingsList=$('<ul class="amri-bookings-list"></ul>').appendTo(self.bookingsListHolder);

					self.bookBox = $('<div class="amri-book-box"></div>').appendTo(self.rightCol);
					self.bookButton=$('<button class="amri-book-btn">Book a room</button>').appendTo(self.bookBox);

				},
				_bindEvents:function(){
					$(window).on('resize.amc', function(event) {//TODO: debounce this
						event.preventDefault();
						self.updateFonts();
					});
					self.roomList.on('change', function(event) {
						event.preventDefault();
						self._updateNavigation();
					});
					if(self.settings.allowOtherDates){
						self.todayButton.on('click', function(event) {
							event.preventDefault();
							self.currentNavigationDate=self.currentTime.clone().startOf('day');
							self._updateNavigation();
						});
					}
					self.navigation.on('click', '.amri-nav', function(event) {
						event.preventDefault();
						var amount = parseInt($(this).attr('data-amount'), 10);
						self.currentNavigationDate.add(amount, 'days');
						self._updateNavigation();
					});
					self.bookButton.on('click', function(event) {
						event.preventDefault();

						self.statusBox.hide();
						self.upnextBox.hide();
						self.bookButton.hide();
						self.bookingFormHolder.show();
					});
					self.bookingForm.on('click', '.amri-cancel-btn', function(event) {
						event.preventDefault();
						self.statusBox.show();
						self.upnextBox.show();
						self.bookButton.show();
						self.bookingFormHolder.hide();
					}).on('change', '.agreed', function(event) {
						event.preventDefault();
						if($(this).is(':checked')){
							$('.amri-submit-book-btn').removeProp('disabled');
						}else{
							$('.amri-submit-book-btn').prop('disabled', 'true');
						}
					}).on('click', '.amri-submit-book-btn', function(event) {
						event.preventDefault();

						var clean=true;
						var requiredFields = $('.required-field', self.bookingForm);
						for (var i = requiredFields.length - 1; i >= 0; i--) {
							var input = $(requiredFields[i]).closest('label').parent().find('input');
							if(input.length>0&&input.val().length===0){
								var input=$(requiredFields[i]).closest('label').parent().find('input').addClass('amrp-missing-field');
								clean=false;
							}
						}
						if(!clean){
							$('.events2-error-message', self.bookingForm).text('Please enter information for all required fields').fadeIn().delay(3000).fadeOut();
							return;
						}

						var start = moment(self.currentNavigationDate.format('YYYY-MM-DD')+' '+$('#start_hours').val()+':'+$('#start_mins').val()+$('#start_ampm').val(), 'YYYY-MM-DD h:mma');
						var end = start.clone().add($('#duration', self.bookingForm).val(), 'minute');

						var open=moment(self.openingHours.raw_open_time);
						var close=moment(self.openingHours.raw_close_time);

						if(start<open||end>close){
							$('.events2-error-message', self.bookingForm).text('Sorry, the room is unavailable at this time.').fadeIn().delay(3000).fadeOut();
							return;
						}

						for (var i = self.currentRoom.bookings.length - 1; i >= 0; i--) {
							var booking = self.currentRoom.bookings[i];
							var lStart=moment(booking.start_time);
							var lEnd=moment(booking.end_time);

							if(lStart<end && lEnd>start){
								$('.events2-error-message', self.bookingForm).text('Sorry, the room is unavailable at this time.').fadeIn().delay(3000).fadeOut();
								return;
							}
						}
						var booking={
							assets:[],
							contact:{
								first_name:$('#first_name', self.bookingForm).val(),
								last_name:$('#last_name', self.bookingForm).val(),
								email:$('#email', self.bookingForm).val(),
								booking_title:$('#booking_title', self.bookingForm).val(),
								group_name: $('#first_name', self.bookingForm).val()+' '+$('#last_name', self.bookingForm).val(),
								librarycard:$('#librarycard', self.bookingForm).val(),
								phone:$('#tel', self.bookingForm).val()
							},
							customQuestions:false,
							start_time: start.format('YYYY-MM-DD HH:mm:ss'),
							end_time: end.format('YYYY-MM-DD HH:mm:ss'),
							room_id: self.roomList.val(),
						}
						$.getJSON('/reserve?action=submit', booking, function(json, textStatus) {
							self.statusBox.show();
							self.upnextBox.show();
							self.bookButton.show();
							self.bookingFormHolder.hide();
							self._update();
							self._updateNavigation();
						});

					}).on('focus', '.amrp-missing-field', function(event) {
						$(this).removeClass('amrp-missing-field');
					});
					self.bookingForm.on('click', '.amri-login-btn', function(event) {
						event.preventDefault();
						var b=$(this).button('loading');

						// CH#1942 - Trim the card/pin fields to prevent blanks.
						var card= $.trim($('#login_card', self.holder).val());
						var pin= $.trim($('#login_pin', self.holder).val());

						$.getJSON(self.settings.apiServer+'/v1/'+self.settings.client+'/patron', {u:card, p:pin, 'type':'reserve'}, function(json, textStatus) {
							if(json.result=='ok'){
								if(json.data.names.length>0){
									$('#first_name', self.bookingForm).val(json.data.names[0].first_name);
									$('#last_name', self.bookingForm).val(json.data.names[0].last_name);

									$('#booking_title', self.bookingForm).val(json.data.names[0].first_name+' '+json.data.names[0].last_name);
								}
								if(json.data.phones.length>0){
									$('#tel', self.bookingForm).val(json.data.phones[0]);
								}
								if(json.data.emails.length>0){
									$('#email', self.bookingForm).val(json.data.emails[0]);
								}
								if(json.data.barcodes.length>0){
									$('#librarycard', self.bookingForm).val(json.data.barcodes[0]);
								}
							}else{
								$('.events2-error-message', self.holder).text(json.message||'Sorry, pin or card number not found').fadeIn().delay(3000).fadeOut();
							}
							b.button('reset');
						}).error(function() {
							$('.events2-error-message', self.holder).text('Sorry, there was a problem making the request').fadeIn().delay(3000).fadeOut();
							b.button('reset');
						});

					});
					setInterval(function(){
						self.currentTime.add(1, 'minute');
						self._update();
					}, 60000)
				},
				_reset:function(){

				},
				_createField:function(id, type, label, required, append, desc, min){
					if(!type)type='text';
					if(!label)label='';
					if(!desc)desc='';
					var field = $('<div class="row"></div>');
					var input = '';

					switch(type){
						case 'number':
						var minV = 0;
						if(typeof(min) !== "undefined"){
							minV = min;
							input='<input type="'+type+'" class="form-control" id="'+id+'" min="'+minV+'">';
						}else{
							input='<input type="'+type+'" class="form-control" id="'+id+'">';
						}

						break;
						case 'select':
						input='<select class="form-control" id="'+id+'"></select>';
						break;
						default:
						input='<input type="'+type+'" class="form-control" id="'+id+'">';
						break;
					}

					if(append){
						$('<div class="">'+
						'<div class="col-sm-5">'+
						'<div class="input-group">'+
						input+
						'</div>'+
						'</div>'+
						'</div>').appendTo(field);
						$('.input-group', field).append(append);

					}else{
						$('<div class="">'+
						'<div class="col-sm-5">'+
						input+
						'</div>'+
						'</div>').appendTo(field);
					}

					var labelEl = $('<label for="'+id+'" class="col-sm-3 control-label">'+label+' </label>').prependTo(field);
					if(required)labelEl.append('<span class="required-field"></span>');
					$('<div class="col-sm-4 amrp-field-desc">'+desc+'</div>').appendTo(field);
					return field;
				},
				_updateBookingForm:function(room){
					self.bookingForm.empty();
					$('<div class="amri-book-room-title">'+room.title+'</div>').appendTo(self.bookingForm);
					$('<div class="amri-book-room-date">'+this.currentNavigationDate.format('dddd DD MMMM YYYY')+'</div>').appendTo(self.bookingForm);


					self._createField('login_card', 'text', 'Library card number', true).appendTo(self.bookingForm);
					var pin=self._createField('login_pin', 'password', 'PIN / Password', false, '<span data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-edit amri-login-btn input-group-addon">Look up details</span>', 'Enter your Library card number and PIN and we\'ll look up your details to fill in the next felds.').appendTo(self.bookingForm);

					var start_hours = self._createField('start_hours', 'select', 'Booking from:', false, false).addClass('amri-booking-start').appendTo(self.bookingForm);
					var start_select = $('#start_hours', start_hours);

					for (var i = 1; i <= 12; i++) {
						$('<option>'+i+'</option>').appendTo(start_select);
					}

					var h=this.currentTime.format('h');
					var r=Math.round(this.currentTime.format('mm') /15) * 15;
					if(r==60){
						r='00';
						h++;
						if(h>12)h=1;
					}else if(r==0){
						r='00';
					}

					start_select.val(h);


					var startMin=$('<select id="start_mins" class="form-control">'+
						'<option>00</option>'+
						'<option>15</option>'+
						'<option>30</option>'+
						'<option>45</option>'+
						'</select>').insertAfter(start_select).val(r);

					var startAMPM=$('<select id="start_ampm" class="form-control">'+
						'<option>am</option>'+
						'<option>pm</option>'+
						'</select>').insertAfter(startMin).val(this.currentTime.format('a'));


					var duration = self._createField('duration', 'select', 'Duration:', false, false).appendTo(self.bookingForm);

					for (var i = 15; i <= parseInt(room.restrictions.maximum_booking_time, 10); i+=15) {
						$('<option value="'+i+'">'+self._formatMinsAsString(i)+'</option>').appendTo($('#duration', duration));
					}

					self._createField('first_name', 'text', 'First name:', true, false).appendTo(self.bookingForm);
					self._createField('last_name', 'text', 'Last name:', true, false).appendTo(self.bookingForm);

					self._createField('email', 'text', 'Email', self.settings.emailRequired, false, 'We\'ll use the email address to confirm the booking.').appendTo(self.bookingForm);
					$('<input type="hidden" id="tel" value="">').appendTo(self.bookingForm);
					$('<input type="hidden" id="librarycard" value="">').appendTo(self.bookingForm);

					self._createField('booking_title', 'text', 'Display name:', true, false, '(This <b>will be displayed</b> to the public)').appendTo(self.bookingForm);

					if(room.app_tc_link&&room.app_tc_link.length>0){
						$('<label><input class="agreed" type="checkbox"> I have read and agree to the room booking <a target="_blank" href="'+room.app_tc_link+'">terms and conditions</a></label>').appendTo(self.bookingForm);
					}else{
						$('<label><input class="agreed" type="checkbox"> I have read and agree to the room booking terms and conditions</label>').appendTo(self.bookingForm);
					}

					// $('<div class="amrp-spacer"></div>').appendTo(self.bookingForm);
					$('<div class="amri-booking-buttons"><div class="events2-error-message"></div><button class="btn btn-edit amri-cancel-btn">Cancel</button><button class="btn btn-success amri-submit-book-btn" disabled="disabled">Book</button></div>').appendTo(self.bookingForm);

				},
				_updateNavigation:function(){
						var dateString = self.currentNavigationDate.format('YYYY-MM-DD');
						var selected=parseInt(self.roomList.val(), 10);

						$.getJSON(self.settings.apiServer+'/v2/'+self.settings.client+'/rooms/'+self.settings.location_id, {date:dateString, classtype:1}, function(json, textStatus) {
							self.bookingsList.empty();
							$('.amri-navigation-date', self.navigation).text(self.currentNavigationDate.format('MMMM DD, YYYY'));
							$.each(json, function (index, room) {
								if(parseInt(room.id, 10)===selected){
									self.currentRoom=room;
									self._updateBookingForm(room);
									if(room.bookings.length>0){
										$.each(room.bookings, function(index, val) {
											var start=moment.tz(val.start_time, self.settings.timeZone);
											var end=moment.tz(val.end_time, self.settings.timeZone);
											$('<li><div>' + start.format('h:mma') + ' - ' + end.format('h:mma') + '</div>' + val.display_name + '</li>').appendTo(self.bookingsList);
										});
									}else{
										$('<li class="amri-no-bookings">Free all day</li>').appendTo(self.bookingsList);
									}
								}
							});
						});
				},
				_updateRoomList:function(){
					self.roomList.empty();
					$.getJSON(self.settings.apiServer+'/v2/'+self.settings.client+'/rooms/'+self.settings.location_id, {classtype:1, unmediated_only:1}, function(json, textStatus) {
						$.each(json, function (index, val) {
							if(self.settings.room_id==val.id){
								$('<option value="'+val.id+'">'+val.title+' (This room)</option>').appendTo(self.roomList);
							}else if(val.patron_viewable==="0"){
								return;
							}else{
								$('<option value="'+val.id+'">'+val.title+'</option>').appendTo(self.roomList);
							}
						});
						self.roomList.val(self.settings.room_id);
						self._updateNavigation();
					});
				},
				_update:function(){
						self.updateFonts();
						self._updateTime();

						var dateString = self.currentTime.clone().startOf('day').format('YYYY-MM-DD');


						$.getJSON(self.settings.apiServer+'/v2/'+self.settings.client+'/rooms/'+self.settings.location_id, {date:dateString, classtype:1, unmediated_only:1}, function(json, textStatus) {
							self.rooms=json;
							$.each(self.rooms, function(index, val) {
								if(parseInt(val.id, 10)===parseInt(self.settings.room_id, 10)){
									self.currentRoom=val;
									self._renderStatus();
								}
							});

							$.getJSON(self.settings.apiServer+'/v1/'+self.settings.client+'/opening-hours/'+dateString+'/1', function(openingTimes, textStatus) {
								self.openingHours=openingTimes[self.settings.location_id][dateString];
								var d = moment(dateString).startOf('day');
								self.openingHours.raw_open_time=d.clone().add(moment(self.openingHours.open, 'h:mma').diff(moment().startOf('day'), 'seconds'), 'seconds').format('YYYY-MM-DD HH:mm:ss');
								self.openingHours.raw_close_time=d.clone().add(moment(self.openingHours.close, 'h:mma').diff(moment().startOf('day'), 'seconds'), 'seconds').format('YYYY-MM-DD HH:mm:ss');

								self.todaysHours.text('Opening hours: '+self.openingHours.open.toLowerCase() + ' - '+self.openingHours.close.toLowerCase());
							});
						});


				},
				_renderStatus:function(){
					self.roomName.text(self.currentRoom.title);
					var inuse=false;
					var nextBooking=false;
					for (var i = self.currentRoom.bookings.length - 1; i >= 0; i--) {
						var booking = self.currentRoom.bookings[i];
						if(self.currentTime>moment.tz(booking.start_time, self.settings.timeZone)&&self.currentTime<moment.tz(booking.end_time, self.settings.timeZone)){
							inuse=booking;
						}
						if(!nextBooking&&moment.tz(booking.start_time, self.settings.timeZone)>self.currentTime){
							nextBooking=booking;
						}
					}
					if(inuse){
						var end=moment.tz(inuse.end_time, self.settings.timeZone);
						var left=Math.ceil(moment.duration(end.diff(self.currentTime)).asMinutes());
						self.statusBox.css({backgroundColor: '#C6001F'});
						self.roomStatus.text('In use');
						self.roomStatusUntil.text('Until '+end.format('h:mma'));
						self.roomStatusTitle.text(inuse.display_name);
						self.roomStatusRemaining.text(self._formatMinsAsString(left)+' remaining');
					}else{
						self.statusBox.css({backgroundColor: '#17B603'});
						self.roomStatus.text('Available');
					}
					self.upnextBox.empty();
					if(nextBooking){
						var nextStart=moment.tz(nextBooking.start_time, self.settings.timeZone);
						var nextend=moment.tz(nextBooking.end_time, self.settings.timeZone);
						$('<div><span>Next:</span> ' + nextStart.format('h:mma') + ' - ' + nextend.format('h:mma') + ' ' + nextBooking.display_name + '</div>').appendTo(self.upnextBox);
					}
				},
				updateFonts:function(){
					var self=this;
					$('>div', self.element).each(function(index, el) {
						$(el).css('font-size', self._getFontSize() + 'px');
					});
				},
				_getFontSize: function(){
					var self=this;
					return (self.$element.innerWidth() / 350)*5;
				},
				_updateTime:function(){
					$('.amri-date', self.timeBox).text(self.currentTime.format('dddd DD MMMM YYYY'));
					$('.amri-time', self.timeBox).text(self.currentTime.format('h:mma'));
				},
				_formatMinsAsString:function(mins){
					var min=parseInt(mins, 10);
    				if(min<60){
    					return mins+" minutes";
    				}
					var hours = Math.floor( min / 60);
					var minutes = min % 60;
					if(minutes>0){
						if(hours>1){
							return hours+' hours '+minutes+' minutes';
						}else{
							return hours+' hour '+minutes+' minutes';
						}
					}else{
						if(hours>1){
							return hours+' hours';
						}else{
							return hours+' hour';
						}
					}
				}
		});

		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
