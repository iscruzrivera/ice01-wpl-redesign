;
(function ($, window, document, undefined) {
    "use strict";
    var pluginName = "amReserveRoom",
        defaults = {
            apiServer: false,
            client: false,
            segmentWidth: 30,
            segmentSize: 15,
            blockSize: 1,
            multiLocation: false,
            room: {},
            loggedIn: false,
            mode: 0,
            units: 'ft',
            useMetric: 0
        };
    // The actual plugin constructor
    function Plugin(element, options) {
        this.locations = [];
        this.element = element;
        this.$element = $(element);
        this.settings = $.extend(true, {}, defaults, options);
        this.clientSettings = this.settings.clientSettings;
        this._defaults = defaults;
        this._name = pluginName;
        this.selected = { start: null, end: null }
        this.selectedLayout = false;
        this.barsAdded = false;
        this.bookedAssets = [];
        this.storage = window.sessionStorage || false;
        this.init();

    }
    $.extend(true, Plugin.prototype, $.fn['amShared']);
    $.extend(Plugin.prototype, {
        init: function () {
            var self = this;

            self.settings.segmentSize = parseInt(self.settings.room.restrictions.segment_size, 10);
            self.settings.blockSize = self.settings.segmentSize * parseInt(self.settings.room.restrictions.block_count, 10);

            self.libraryOpenTime = moment(self.settings.date + ' ' + self.settings.hours.open, 'YYYY-MM-DD h:mma');
            self.libraryCloseTime = moment(self.settings.date + ' ' + self.settings.hours.close, 'YYYY-MM-DD h:mma');

            self.roomOpenTime = self.libraryOpenTime.clone().add(parseInt(self.settings.room.restrictions.day_start_buffer, 10), 'minutes');
            self.roomCloseTime = self.libraryCloseTime.clone().subtract(parseInt(self.settings.room.restrictions.day_end_buffer, 10), 'minutes');

            self._buildInterface();
            self._bindEvents();
            self._update();
            if (self.settings.selected) self._makeActive();


        },
        _buildInterface: function () {
            this.currency = $('<span class="amnp-currency link fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-usd fa-stack-1x fa-inverse"></i></span>');
            this.segmentCount = 1440 / this.settings.segmentSize;

            this.holder = $('<div class="amnp-room-holder" data-mode="' + this.settings.mode + '"></div>').appendTo(this.element);
            $('<h3/>').text(this.settings.room.title).appendTo(this.holder);
            this.dayHolder = $('<div class="amnp-day-holder"></div>').appendTo(this.holder);
            this.day = $('<div class="amnp-day"></div>').appendTo(this.dayHolder);

            var activeCount = 0;
            for (var i = 0; i < 1440; i += this.settings.segmentSize) {
                var segmentTime = moment(this.settings.date).startOf('day').add(i, 'minutes');
                var segment = $('<div class="amnp-segment" data-time="' + segmentTime.format('h:mm a') + '"></div>').data('segmentTime', segmentTime).css({ width: this.settings.segmentWidth + 'px' }).appendTo(this.day);
                if (segmentTime.format('m') == 0) {
                    segment.addClass('odd');
                }
                if (this.settings.mode === 1) {
                    activeCount++;
                    if (segmentTime >= this.roomOpenTime && segmentTime < this.roomCloseTime) {
                        segment.addClass('amnp-segment-open');
                    }
                } else {
                    if (segmentTime >= this.roomOpenTime && segmentTime < this.roomCloseTime) {
                        segment.addClass('amnp-segment-open');
                        activeCount++;
                    } else {
                        segment.hide();
                    }
                }
            }
            this.day.css({ width: (this.settings.segmentWidth * activeCount) + 'px' });
            var self = this;
            if (this.settings.mode !== 1) {
                var now = moment();
                $('.amnp-segment', self.day).each(function (idx, el) {
                    var segmentTime = $(el).data('segmentTime');
                    if (segmentTime < now) {
                        $(el).addClass('amnp-segment-booked');
                    }
                });
            }

            this.settings.room.bookings.forEach(function (booking) {
                var start = moment(booking.start_time);
                var end = moment(booking.end_time);
                var bookingStart = start.clone();
                var bookingEnd = end.clone();
                var hasParent = false;

                if (self.settings.useSetupBreakdown && (booking.event_id || null) === null) {

                    var useLayout = false;
                    if (parseInt(booking.layout_id) > 0 && self.settings.room.layouts.length > 0) {
                        self.settings.room.layouts.forEach(function (layout) {
                            if (parseInt(layout.id) === parseInt(booking.layout_id)) {
                                bookingEnd.add(layout.breakdown_time, 'minutes');
                                bookingStart.add(layout.setup_time * -1, 'minutes');
                                useLayout = true;
                            }
                        });
                    }

                    if (!useLayout) {
                        bookingEnd.add(booking.breakdown_time, 'minutes');
                        bookingStart.add(booking.setup_time * -1, 'minutes');
                    }
                }

                self.day.find('.amnp-segment').each(function (idx, el) {
                    var segmentTime = $(el).data('segmentTime');
		    var segmentEndTime = moment($(el).data('segmentTime')).add(self.settings.segmentSize, 'minutes');
                    if (segmentTime >= start && segmentTime < end) {
                        $(el).addClass('amnp-segment-booked').attr('data-show-booking', booking.id).attr('data-status', booking.status).data('booking', booking);
                        if (booking.t_id) {
                            $(el).addClass('amnp-segment-basket');
                        }
                    } else if (self.settings.useSetupBreakdown && bookingStart.isBefore(segmentEndTime) && bookingEnd.isAfter(segmentTime)) {
                        $(el).addClass('amnp-segment-booked').attr('data-show-booking', booking.id).attr('data-status', booking.status).data('booking', booking);
                        if (booking.t_id) {
                            $(el).addClass('amnp-segment-basket amnp-segment-basket-setup-breakdown');
                        }
                    }
                });
            });

            this.resetButton = $('<div class="amnp-reset-button btn"><i class="fa fa-undo"/></div>').prependTo(this.holder);
            var keylist = $('<div class="amnp-key-list"></div>').appendTo(this.holder);

            // this.closeButton = $('<div class="amnp-close-button btn"><i class="am-cancel"/></div>').prependTo(this.holder);
            var blockMessage = "Select green time blocks...";
            var blockColor = "#22A519";
            if (typeof (self.clientSettings.rooms_select_time_block_message) !== "undefined") {
                blockMessage = self.clientSettings.rooms_select_time_block_message;
            }

            var blockMessageEle = $('<div class="amnp-unselected-message">' + blockMessage + '</div>');
            if (typeof (self.clientSettings.rooms_select_time_block_color) !== "undefined") {
                blockColor = self.clientSettings.rooms_select_time_block_color;
                blockMessageEle.css("color", blockColor + " !important");
            }

            blockMessageEle.appendTo(this.holder);
            this.message = $('<div class="amnp-message"></div>').appendTo(this.holder);
            this.selection = $('<div class="amnp-selection"><span class="amnp-title link">Time and date</span> </div>').appendTo(this.holder);
            this.bookingDetails = $('<span class="amnp-booking-details"></span>').appendTo(this.selection);
            this.details = $('<div class="amnp-room-details"></div>').appendTo(this.holder)

            this.footer = $('<div class="amnp-room-footer"></div>').appendTo(this.holder);
            this.chargeTotal = $('<div class="amnp-charge-total"></div>').appendTo(this.footer);
            this.checkoutNowButton = $('<button class="amnp-checkout-now btn btn-info">Reserve now</button>').appendTo(this.footer).hide();
            this.bookingButton = $('<button class="amnp-booking-button btn"></button>').text(this.settings.enabledCart ? 'Add to basket' : 'Choose').appendTo(this.footer).hide();
            this.cartMessage = $('<div class="amnp-cart-message"><i class="fa fa-check"></i> The room reservation has been added to your cart</div>').appendTo(this.holder);

            $('<div><span class="amnp-segment amnp-segment-open"/>Available</div>').appendTo(keylist);
            $('<div><span class="amnp-segment amnp-segment-booked"/>Unavailable</div>').appendTo(keylist);
            $('<div><span class="amnp-segment amnp-segment-booked amnp-segment-selected"/>Clash</div>').appendTo(keylist);
            if (this.settings.useSetupBreakdown) {
                $('<div><span class="amnp-segment amnp-segment-open amnp-segment-setup-breakdown"/>Setup/Breakdown</div>').appendTo(keylist);
            }
            this.chargeDetails = $('<div class="amnp-charge-details"></div>').appendTo(keylist);

            setTimeout(function () {
                // self.dayHolder.scrollLeft(self.day.width()/2);
                var s = $('.amnp-segment-open:not(.amnp-segment-booked)', self.day);
                if (s.length > 0) {
                    self.dayHolder.scrollLeft(s.first().position().left - 15);
                }
            }, 100);
        },
        _addToBasket: function (checkout) {
            this._updateBookedAssets();
            this.$element.trigger('room:addtocart', {
                checkout: checkout, details: {
                    start: this.selected.start.format('YYYY-MM-DD HH:mm:ss'),
                    end: this.selected.end.format('YYYY-MM-DD HH:mm:ss'),
                    room: this.settings.room,
                    location: this.settings.location,
                    assets: this.bookedAssets,
                    layout: this.selectedLayout,
                    breakdown_time: this.selectedLayout ? this.selectedLayout.breakdown_time : this.settings.room.breakdown_time,
                    setup_time: this.selectedLayout ? this.selectedLayout.setup_time : this.settings.room.setup_time,
                    booking_class: this.settings.bookingClass
                }
            });

            if (!checkout) {
                this._reset();
            }
        },
        _bindEvents: function () {
            var self = this;
            this.checkoutNowButton.on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (self.selected.start.format('YYYY-MM-DD HH:mm:ss') === self.selected.end.format('YYYY-MM-DD HH:mm:ss')) {
                    alert('Event must have a valid duration, start and end time cannot be the same.');
                    return;
                }

                self._addToBasket(true);
            });
            this.bookingButton.on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (self.selected.start.format('YYYY-MM-DD HH:mm:ss') === self.selected.end.format('YYYY-MM-DD HH:mm:ss')) {
                    alert('Event must have a valid duration, start and end time cannot be the same.');
                    return;
                }

                self._addToBasket(!self.settings.enabledCart);
            });
            this.details.on('click', '.amnp-layouts li', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var li = $(this).closest('li');
                var input = li.find('input');
                if (input.is(':checked')) {
                    $(this).closest('.amnp-layouts').find('input').removeProp('checked');
                    self.selectedLayout = false;
                    var maxCap = Math.max(self.settings.room.capacity_standing, self.settings.room.capacity_chairs, self.settings.room.capacity_tables, 0);

                    // CH 29929 to limit displaying these when the flag is off
                    if (self.clientSettings.rooms_use_setup) {
                        $("#breakdown_time").html("Breakdown Time: " + (self.settings.room.breakdown_time ? self.settings.room.breakdown_time : 0) + "<br />");
                        $("#setup_time").html("Setup Time: " + (self.settings.room.setup_time ? self.settings.room.setup_time : 0) + "<br />");
                    }

                    $("#total_capacity").text("Total Capacity: " + maxCap);
                } else {
                    $(this).closest('.amnp-layouts').find('input').removeProp('checked');
                    self.selectedLayout = li.data('layout');

                    // CH 29929 to limit displaying these when the flag is off
                    if (self.clientSettings.rooms_use_setup) {
                        // Fix for CH#3432
                        $("#breakdown_time").html("Breakdown Time: " + (self.selectedLayout.breakdown_time ? self.selectedLayout.breakdown_time : 0) + "<br />");
                        $("#setup_time").html("Setup Time: " + (self.selectedLayout.setup_time ? self.selectedLayout.setup_time : 0) + "<br />");
                    }

                    if (self.selectedLayout.capacity > 0) {
                        $("#total_capacity").text("Total Capacity: " + self.selectedLayout.capacity);
                    }
                    input.prop('checked', true);
                }

                self._update();
            }).on('click', '.amnp-layouts li input', function (event) {
                event.stopPropagation();
                if ($(this).is(':checked')) {
                    $(this).removeProp('checked');
                } else {
                    $(this).prop('checked', true);
                }
                $(this).closest('li').trigger('click');
            }).on('change', '.amnp-bookable-assets-list select', function (event) {
                event.preventDefault();
                $(this).closest('li').find('input').prop('checked', true);
                self._updateBookedAssets();
                self._updateTotal();
            }).on('change', '.amnp-bookable-assets-list input', function (event) {
                event.preventDefault();
                self._updateBookedAssets();
                self._updateTotal();
            });
            this.holder.on('click', function () {
                self._makeActive();
            });
            this.day.on('click', '.amnp-segment', function () {
                if (self.settings.mode !== 1 && !$(this).hasClass('amnp-segment-open')) return;
                self._makeActive();

                var segmentTime = $(this).data('segmentTime');

                self.holder.addClass('amnp-room-selection');
                if ($(this).hasClass('amnp-segment-selected')) {
                    var startDiff = segmentTime.diff(self.selected.start, 'minutes');
                    var endDiff = (segmentTime.diff(self.selected.end, 'minutes') * -1);

                    if (startDiff === 0) {
                        self.selected.start = segmentTime.clone().add(self.settings.segmentSize, 'minutes');
                    } else if (endDiff === 0) {
                        self.selected.end = segmentTime.clone().subtract(self.settings.segmentSize, 'minutes');
                    } else if (startDiff <= endDiff) {
                        self.selected.start = segmentTime.clone();
                    } else {
                        self.selected.end = segmentTime.clone();
                    }
                } else if (!$(this).hasClass('amnp-segment-booked')) {
                    if (!self.selected.start) {
                        self.selected.start = segmentTime.clone();
                    }
                    if (!self.selected.end) {
                        self.selected.end = segmentTime.clone().add(self.settings.segmentSize, 'minutes');
                    }
                    if (segmentTime >= self.selected.end) {
                        self.selected.end = segmentTime.clone().add(self.settings.segmentSize, 'minutes');
                    } else if (segmentTime < self.selected.start) {
                        self.selected.start = segmentTime.clone();
                    }
                }
                if (self.selected.start > self.selected.end || self.selected.start === self.selected.end) {
                    self.selected = { start: null, end: null };
                    self.bookingButton.hide();
                    self.holder.removeClass('amnp-room-selection');
                } else {
                    // var duration = moment.duration(self.selected.end.clone().add(self.settings.segmentSize, 'minutes').diff(self.selected.start)).asMinutes();
                    // if(duration % self.settings.blockSize !== 0){
                    //     self.selected.end = self.selected.start.clone().add((Math.ceil(duration/self.settings.blockSize)*self.settings.blockSize)-self.settings.segmentSize, 'minutes');
                    // }
                }
                self._update();
            });
            this.resetButton.on('click', function () {
                self._reset();
            });
        },
        _calculateRoomCharge: function () {
            if (!this.selected || !this.selected.start) return 0;
            var charge = parseFloat(this.settings.room.restrictions.charge_amount);
            if (parseInt(this.settings.room.restrictions.charge_period) === 1) return charge;
            var blockSize = parseInt(this.settings.room.restrictions.segment_size) * parseInt(this.settings.room.restrictions.block_count);
            var rawDuration = moment.duration(this.selected.end.clone().diff(this.selected.start)).asMinutes();
            var total = (rawDuration / blockSize) * charge;
            return total;
        },
        _updateTotal: function () {
            var total = this.bookedAssets.reduce(function (total, asset) {
                return total + parseFloat(asset.cost) * asset.qty;
            }, 0);
            if (this.selectedLayout && this.selectedLayout.cost && parseFloat(this.selectedLayout.cost) > 0) {
                total += parseFloat(this.selectedLayout.cost);
            }
            total += this._calculateRoomCharge();
            this.chargeTotal.empty();
            if (total > 0 && this.settings.chargingEnabled) {
                this.chargeTotal.html(this.settings.payment_currency_symbol + '' + this._formatCurrency(total));
            }
        },
        _formatCurrency: function (amount) {
            return amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        },
        _updateAssets: function () {
            var options = {
                start: this.selectedBookingStart.clone().format('YYYY-MM-DD HH:mm:ss'),
                end: this.selectedBookingEnd.clone().format('YYYY-MM-DD HH:mm:ss'),
            }

			if (this.settings.bookingType === 0 || this.settings.mode === 1) {
                options.staff = 1;
            }
            if (parseInt(this.settings.bookingClass) > 0) {
                options.class_id = this.settings.bookingClass;
            }

            var self = this;
            this._getJSON(this.settings.apiServer + '/v2/' + this.settings.client + '/rooms/assets/' + this.settings.room.location_id + '/' + this.settings.room.id, options).then(function (json) {
                var resourcesTitle = $('.resources-title', self.holder);
                var col4 = $('.col4', self.holder).empty().show();
                self.bookableAssets = {};
                json.forEach(function (asset) {
                    self.bookableAssets[asset.id] = asset;
                });
                if (Object.keys(self.bookableAssets).length > 0) {
                    resourcesTitle.show();
                    var assetList = $('<ul class="amnp-bookable-assets-list"></ul>').appendTo(col4);
                    $.each(self.bookableAssets, function (index, val) {
                        if (parseInt(val.quantity) > 0) {
                            var li = $('<li><label><input id="input-' + val.id + '" data-id="' + val.id + '" type="checkbox">&nbsp;&nbsp;' + val.name + ' </label></li>').data('details', val).appendTo(assetList);
                            $("#input-" + val.id).change(function () {
                                if (parseInt($('#select-' + val.id + ' option:eq(0)').val(), 10) == 0) {
                                    if (this.checked) {
                                        $('#select-' + val.id + ' option:eq(1)').prop('selected', true);
                                    } else {
                                        $('#select-' + val.id + ' option:eq(0)').prop('selected', true);
                                    }
                                }
                            });
                            if (parseInt(val.quantity) < parseInt(val.booking_max)) val.booking_max = val.quantity;
                            if (parseInt(val.booking_max) > 1) {
                                var s = $('<select id="select-' + val.id + '" data-id="' + val.id + '"></select>').appendTo(li);
                                for (var i = parseInt(val.booking_min); i <= parseInt(val.booking_max); i++) {
                                    $('<option>' + i + '</option>').appendTo(s);
                                }
                            }
                        } else {
                            var li = $('<li class="amnp-none-available"><label><input type="checkbox" disabled>&nbsp;&nbsp;' + val.name + ' (none available at the chosen time)</label></li>').data('details', val).appendTo(assetList);
                        }
                        if (self.settings.chargingEnabled) {
                            if (val.cost > 0) {
                                if (parseInt(val.booking_max) > 1) {
                                    $('<span> (' + self.settings.payment_currency_symbol + '' + val.cost + ' each)</span>').appendTo(li);
                                } else {
                                    $('<span> (' + self.settings.payment_currency_symbol + '' + val.cost + ')</span>').appendTo(li);
                                }
                            }
                        }
                    });
                    assetList.children().detach().sort(function (a, b) {
                        return $(a).text().localeCompare($(b).text());
                    }).appendTo(assetList);

                    self.bookedAssets.forEach(function (asset) {
                        assetList.find('input[data-id=' + asset.id + ']').prop('checked', true);
                        if (asset.qty > 1) {
                            assetList.find('select[data-id=' + asset.id + ']').val(asset.qty);
                        }
                    });
                } else {
                    resourcesTitle.hide();
                }
            }).catch(function (err) {
                console.error(err);
            });

        },
        _getRoomDetails: function (room, location) {
            var self = this;
            var details = $('<div/>');
            var row1 = $('<div class="row1"/>').addClass('row').appendTo(details);

            if (room.layouts.length > 0) {
                $('<div class="amnp-title link">Room layout options</div>').appendTo(details);
                var layoutRow = $('<div class="layoutRow"/>').addClass('row').appendTo(details);
                var layouts = $('<ul class="amnp-layouts"/>').appendTo(layoutRow);
                room.layouts.forEach(function (layout) {
                    var l = $('<li></li>').appendTo(layouts).data('layout', layout);
                    var label = $('<label class="amnp-layout-name"></label>').text(' ' + layout.name).appendTo(l);
                    if (parseFloat(layout.cost) > 0) {
                        label.append(' (' + self.settings.payment_currency_symbol + '' + self._formatCurrency(parseFloat(layout.cost)) + ')');
                    }
                    $('<input type="checkbox"/>').prependTo(label);
                    $('<img>').attr('src', 'https://' + self.settings.client + '.libnet.info/images/roomlayouts/' + layout.image).attr('alt', 'Room Layout Image').appendTo(l);
                    $('<span class="amnp-layout-capacity"></span>').text('capacity ' + layout.capacity).appendTo(l);
                    // Fix for CH#3429
                    if (layout.description !== '' && layout.description !== null) {
                        l.qtip({
                            content: {
                                text: layout.description
                            },
                            style: {
                                classes: 'qtip-bootstrap events-popup',
                                def: false
                            },
                            position: {
                                target: 'mouse',
                                adjust: {
                                    mouse: false
                                }
                            }
                        });
                    }
                });
            }

            $('<div class="amnp-title link resources-title">Additional resources</div>').appendTo(details).hide();
            var row2 = $('<div class="row2"/>').addClass('row').appendTo(details);
            var col1 = $('<div class="col1"/>').addClass('col-md-6').appendTo(row1);
            var col2 = $('<div class="col2"/>').addClass('col-md-6').appendTo(row1);

            var col4 = $('<div class="col4"/>').addClass('col-md-12').appendTo(row2);
            var row3 = $('<div class="row3"/>').addClass('row').appendTo(details);
            var col5 = $('<div class="col1"/>').addClass('col-md-6').appendTo(row3);
            var col6 = $('<div class="col2"/>').addClass('col-md-6').appendTo(row3);

            if (room.image && room.image.length > 0) {
                $('<img/>').attr('src', '//' + this.settings.client + '.libnet.info/images/roombooking/' + this.settings.client + '/' + room.image).attr('alt', room.title).appendTo(col1);
            }

            $('<div><b class="with-margin">Location</b></div>').appendTo(col1);
            $('<div class=""><i class="am-locations"/> ' + location.name + '</div>').appendTo(col1);
            if (parseInt(room.length, 10) > 0 || parseInt(room.width, 10) > 0 || parseInt(room.area, 10) > 0) {
                $('<div><b class="with-margin">Room size</b></div>').appendTo(col1);
            }

            if (typeof (self.clientSettings.client_use_metric) !== 'undefined') {
                self.settings.useMetric = self.clientSettings.client_use_metric;
                if (self.settings.useMetric == 1) {
                    self.settings.units = 'm';
                }
            }

            if (parseInt(room.length, 10) > 0) $('<span class="room-size-descriptors">length:&nbsp;<span class="room-size-descriptors-value">' + room.length + '' + self.settings.units + ' </span></span>').appendTo(col1);
            if (parseInt(room.width, 10) > 0) $('<span class="room-size-descriptors">width:&nbsp;<span class="room-size-descriptors-value">' + room.width + '' + self.settings.units + ' </span></span>').appendTo(col1);
            if (parseInt(room.area, 10) > 0) $('<span class="room-size-descriptors">area:&nbsp;<span class="room-size-descriptors-value">' + room.area + ' sq ' + self.settings.units + '</span></span>').appendTo(col1);
            if (parseInt(room.length, 10) > 0 && parseInt(room.width, 10) > 0 && parseInt(room.area, 10) <= 0) $('<span class="room-size-descriptors">area:&nbsp;<span class="room-size-descriptors-value">' + (room.length * room.width) + ' sq ' + self.settings.units + '</span></span>').appendTo(col1);
            if (room.description && room.description.length > 0) {
                $('<div><b>Room description</b></div>').appendTo(col2);
                $('<div/>').html(room.description).appendTo(col2);
                $('<div class="amnp-layout-details"/>').appendTo(col2);
            }

            // #4762 - CK
            var maxCap = Math.max(room.capacity_standing, room.capacity_chairs, room.capacity_tables, 0);

            $('<div><b class="with-margin">Room Capacity</b></div>').appendTo(col5);
            $('<span id="total_capacity">Total Capacity: ' + maxCap + '</span><br>').appendTo(col5);

            var breakdownTime = (room.breakdown_time ? room.breakdown_time : 0);
            var setupTime = (room.setup_time ? room.setup_time : 0);

            if (self.clientSettings.rooms_use_setup) {
                $('<div><b class="with-margin">Setup Times</b></div>').appendTo(col6);
                $('<span id="breakdown_time">Breakdown Time: ' + breakdownTime + '<br></span>').appendTo(col6);
                $('<span id="setup_time">Setup Time: ' + setupTime + '</span>').appendTo(col6);
            }

            if (room.assets && room.assets.length > 0) {
                $('<div><b class="with-margin">Included resources</b></div>').appendTo(col2);

                $.each(room.assets, function (index, asset) {
                    var a = $('<div class="amnp-resources-asset"></div>').appendTo(col2);
                    $('<span class="amnp-resources-asset-name">' + asset.name + '</span>').appendTo(a);
                    if (asset.qty > 1) {
                        $('<span class="amnp-resources-asset-qty"> (' + asset.qty + ')</span>').appendTo(a);
                    }
                    if (asset.description) {
                        $('<div class="amnp-resources-asset-description">' + asset.description + '</div>').appendTo(a);
                    }
                });
            }
            return details;
        },
        _getLayoutDetailView: function (layout) {
            var view = $('<div class="amnp-room-layout-details"></div>');
            $('<img>').attr('src', 'http://' + this.settings.client + '.libnet.info/images/roomlayouts/' + layout.image).attr('alt', 'Room Layout Image').appendTo(view);
            $('<div class="amnp-room-layout-title"></div>').text(layout.name).appendTo(view);
            $('<div class="amnp-room-layout-capacity"><span>Capacity</span> ' + layout.capacity + '</div>').appendTo(view);
            if (parseInt(layout.setup_time, 10) > 0) $('<div class="amnp-room-layout-capacity"><span>Setup</span> ' + layout.setup_time + '</div>').appendTo(view);
            if (parseInt(layout.breakdown_time, 10) > 0) $('<div class="amnp-room-layout-capacity"><span>Breakdown</span> ' + layout.breakdown_time + '</div>').appendTo(view);
            $('<div class="amnp-room-layout-description"></div>').text(layout.description).appendTo(view);
            return view;
        },
        _reset: function () {
            this.selected = { start: null, end: null };
            this.selectedLayout = false;
            this.holder.removeClass('amnp-room-active amnp-room-selection amnp-has-error');
            this.details.empty();
            this.bookingButton.hide();
            this._update();
        },
        _updateBookedAssets: function () {
            var self = this;
            self.bookedAssets = [];

            $('.amnp-bookable-assets-list li', self.details).each(function (index, el) {
                if ($(this).find('input').is(':checked')) {
                    var details = $(this).data('details');
                    var qty = parseInt(details.booking_max) > 1 ? $(this).find('select').val() : 1;

                    self.bookedAssets.push({
                        id: details.id,
                        qty: parseInt(qty),
                        cost: details.cost,
                        name: details.name,
                        assetData: details
                    });
                }
            });
        },
        _makeActive: function () {
            if (!this.barsAdded) {
                this.dayHolder.mCustomScrollbar({
                    axis: 'x',
                    theme: 'rounded-dark',
                    mouseWheel: { enable: true, axis: 'x' },
                    snapAmount: this.settings.segmentWidth,
                    scrollbarPosition: 'outside'
                });
                this.dayHolder.mCustomScrollbar('update').mCustomScrollbar("scrollTo", $('.amnp-segment-open:not(.amnp-segment-booked)', this.day), { scrollInertia: 0 });
                this.barsAdded = true;
            }
            if (!this.holder.hasClass('amnp-room-active')) {
                $('.amnp-room-active').each(function (index, el) {
                    $(el).parent().data('plugin_amReserveRoom')._reset();
                });
                this.holder.addClass('amnp-room-active');
                this.details.empty().append(this._getRoomDetails(this.settings.room, this.settings.location));
            }
        },
        _render: function () {
            this.day.find('.amnp-segment').removeClass('amnp-segment-selected amnp-segment-setup-breakdown');
            this.chargeDetails.empty();
			if (this.selected.start && this.selected.end) {
				this.selectedBookingStart = this.selected.start.clone();
				this.selectedBookingEnd = this.selected.end.clone();

				if (this.settings.useSetupBreakdown) {
					this.selectedBookingStart = this.selectedBookingStart.add((this.selectedLayout ? this.selectedLayout.setup_time : this.settings.room.setup_time) * -1, 'minutes');
					this.selectedBookingEnd = this.selectedBookingEnd.add(this.selectedLayout ? this.selectedLayout.breakdown_time : this.settings.room.breakdown_time, 'minutes');
                    if (this.settings.adjustSetupBreakdown) {
                        if (this.selectedBookingEnd > this.libraryCloseTime) {
                            this.selectedBookingEnd = this.libraryCloseTime.clone();
                        }
                        if (this.selectedBookingStart < this.libraryOpenTime) {
                            this.selectedBookingStart = this.libraryOpenTime.clone();
                        }
                    }
                }
				this._updateAssets();

                if (this.settings.chargingEnabled) {
                    var charge = this._calculateRoomCharge();
                    if (charge > 0) {
                        var non_refundable = typeof (this.settings.room.restrictions.non_refundable_amount) !== 'undefined' ? this._formatCurrency(parseFloat(this.settings.room.restrictions.non_refundable_amount)) : 0.00;
                        var $chargeMessage = $('<div />').addClass('amnp-charge-message');
                        var $chargeIcon = $('<div />').addClass('amnp-charge-icon').append($('<span class="amnp-currency link fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-usd fa-stack-1x fa-inverse"></i></span>'));
                        var $chargeText = $('<div />').addClass('amnp-charge-text').html('Room charge <b>' + this.settings.payment_currency_symbol + '' + this._formatCurrency(charge) + '</b>');

                        $chargeMessage.append($chargeIcon).append($chargeText);
                        if (non_refundable > 0) {
                            $chargeIcon.css('padding-left', '10%');
                            $chargeMessage.css('line-height', '28px');
                        } else {
                            $chargeIcon.css('padding-left', '10%');
                            $chargeMessage.css('line-height', '28px');
                        }

                        $chargeMessage.appendTo(this.chargeDetails);
                    }
                }

                var self = this;
                this.day.find('.amnp-segment').each(function (idx, el) {
                    var segmentStartTime = $(el).data('segmentTime');
                    var segmentTimeEnd = moment(segmentStartTime).add(self.settings.segmentSize, 'minutes');

                    if (segmentStartTime >= self.selected.start && segmentStartTime < self.selected.end) {
                        $(el).addClass('amnp-segment-selected');
                    } else if(self.settings.useSetupBreakdown) {
                        var startInSegment = (segmentStartTime.isSameOrBefore(self.selectedBookingStart) && segmentTimeEnd.isAfter(self.selectedBookingStart));
                        var endInSegment = (segmentStartTime.isBefore(self.selectedBookingEnd) && segmentTimeEnd.isSameOrAfter(self.selectedBookingEnd));
                        if(startInSegment || endInSegment || (segmentStartTime >= self.selectedBookingStart && segmentStartTime < self.selectedBookingEnd))  {
                            $(el).addClass('amnp-segment-setup-breakdown');
                        }
                    }
                });
            }
            this.bookingDetails.empty();
            if (this.selected.start && this.selected.end) {
                this.bookingDetails.text(this.selected.start.format('h:mma') + ' - ' + this.selected.end.clone().format('h:mma, MMMM Do YYYY'));
            }
            this._updateTotal();
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
        _updateButton: function () {
            this.message.empty();
            this.holder.removeClass('amnp-has-error anmp-layout-required');
            var roomData = this.settings.room;
            var locationData = this.settings.location;
            this.checkoutNowButton.removeClass('btn-info btn-edit btn-primary').addClass('btn-info').removeProp('disabled').hide();
            //debugger;
            if (this.selected.start && this.selected.end) {
                try {
                    var roomData = this.settings.room;
                    var locationData = this.settings.location;
                    var bookingStart = this.selected.start.clone();
                    var bookingEnd = this.selected.end.clone();
                    var rawDuration = moment.duration(bookingEnd.diff(bookingStart)).asMinutes();
                    var roomOpens = this.roomOpenTime.clone();
                    var roomCloses = this.roomCloseTime.clone();
                    var self = this;
                    var min = parseInt(roomData.restrictions.minimum_booking_time, 10) || 0;
                    var max = parseInt(roomData.restrictions.maximum_booking_time, 10) || 0;
                    var near = parseInt(roomData.restrictions.nearest_booking_days, 10) || 0;
                    var far = parseInt(roomData.restrictions.furthest_booking_days, 10) || 0;
                    var breakdown = this.selectedLayout ? this.selectedLayout.breakdown_time : roomData.breakdown_time;
                    var setup = (this.selectedLayout ? this.selectedLayout.setup_time : roomData.setup_time) * -1;

                    if (self.settings.useSetupBreakdown) {
                        roomOpens.add(setup, 'minutes');
                        roomCloses.add(breakdown, 'minutes');

                        bookingEnd.add(breakdown, 'minutes');
                        bookingStart.add(setup, 'minutes');

                        if (self.settings.adjustSetupBreakdown) {
                            if (bookingStart < roomOpens) {
                                bookingStart = roomOpens.clone();
                            }

                            if (bookingEnd > roomCloses) {
                                bookingEnd = roomCloses.clone();
                            }

                            if (bookingStart < self.libraryOpenTime) {
                                bookingStart = self.libraryOpenTime.clone();
                            }

                            if (bookingEnd > self.libraryCloseTime) {
                                bookingEnd = self.libraryCloseTime.clone();
                            }
                        }
                    }

                    this.settings.room.bookings.forEach(function (booking) {
                        var lStart = moment(booking.start_time);
                        var lEnd = moment(booking.end_time);
                        if (self.settings.useSetupBreakdown && booking.event_id === null) {
                            // Fix for wrong setup/breakdown times being used
                            // #4575 - Cknapp
                            var useLayout = false;
                            if (parseInt(booking.layout_id) > 0 && self.settings.room.layouts.length > 0) {
                                self.settings.room.layouts.forEach(function (layout) {
                                    if (parseInt(layout.id) === parseInt(booking.layout_id)) {
                                        lEnd.add(layout.breakdown_time, 'minutes');
                                        lStart.add(layout.setup_time * -1, 'minutes');
                                        useLayout = true;
                                    }
                                });
                            }

                            if (!useLayout) {
                                lEnd.add(booking.breakdown_time, 'minutes');
                                lStart.add(booking.setup_time * -1, 'minutes');
                            }

                            if (self.settings.adjustSetupBreakdown) {
                                if (lStart < roomOpens) {
                                    lStart = roomOpens.clone();
                                }

                                if (lEnd > roomCloses) {
                                    lEnd = roomCloses.clone();
                                }

                                if (lStart < self.libraryOpenTime) {
                                    lStart = self.libraryOpenTime.clone();
                                }

                                if (lEnd > self.libraryCloseTime) {
                                    lEnd = self.libraryCloseTime.clone();
                                }
                            }
                        }

                        // #4033 - CK
                        // Moved this and the var declarations to the top, because booking clash is more important than layout.
                        if (lStart.isBefore(bookingEnd) && lEnd.isAfter(bookingStart)) {
                            self.bookingButton.removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                            throw ('There is a clash with an existing booking.');
                        }
                    });



                    if (this.settings.enabledCart && this.storage && JSON.parse(this.storage.getItem('communicoReserveCart') || '[]').length === 0) {
                        this.checkoutNowButton.show();
                    }
                    this.bookingButton.removeClass('btn-info btn-edit btn-primary').addClass('btn-info').removeProp('disabled').show();

                    if (this.settings.mode === 0 && !roomData.restrictions.bookable) {
                        this.checkoutNowButton.hide();
                        this.bookingButton.text('Please call').removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw (this.settings.roomsNotBookableMessage.replace('{{branch_number}}', locationData.tel));
                    }

                    if (this.settings.layoutRequired && !this.selectedLayout && this.settings.room.layouts && this.settings.room.layouts.length > 0) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        this.holder.addClass('anmp-layout-required');
                        throw ('A layout is required for this room.');
                    }

                    if (bookingStart < roomOpens || bookingEnd > roomCloses) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw ('The room is closed at this time.');
                    }

                    if (bookingStart < this.libraryOpenTime || bookingEnd > this.libraryCloseTime) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw ('The library is closed at this time.');
                    }
                    if (max > 0 && rawDuration > max) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw (this.settings.roomsMaxBookingMessage.replace('{{branch_number}}', locationData.tel).replace('{{amount}}', this._formatMinsAsString(max)));
                    }
                    if (min > 0 && rawDuration < min) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw (this.settings.roomsMinBookingMessage.replace('{{branch_number}}', locationData.tel).replace('{{amount}}', this._formatMinsAsString(min)));
                    }
                    var when = Math.round(moment.duration(bookingEnd.diff(moment())).asDays());
                    if (near > 0 && when < near) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw (this.settings.roomsNearBookingMessage.replace('{{branch_number}}', locationData.tel).replace('{{amount}}', near));
                    }
                    if (far > -1 && when > far) {
                        if (this.settings.mode === 0) $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw (far != 0 ? this.settings.roomsFarBookingMessage.replace('{{branch_number}}', locationData.tel).replace('{{amount}}', far) : "This room may only be booked for the current day");
                    }
                    if (bookingStart.isBefore(moment())) {
                        if (this.settings.mode === 0) {
                            $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        }
                        throw ('The start of your booking is in the past.');
                    }
                    if (rawDuration % this.settings.blockSize !== 0) {
                        $('.btn', this.footer).removeClass('btn-info btn-edit btn-primary').addClass('btn-edit').prop('disabled', true);
                        throw (' Bookings must be in multiples of ' + this._formatMinsAsString(this.settings.blockSize) + '.');
                    }
                } catch (message) {
                    this.message.html('<i class="fa fa-exclamation-circle"/> ' + message);
                    this.holder.addClass('amnp-has-error');
                }
            }
        },
        _update: function () {
            this._updateButton();
            this._render();
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
