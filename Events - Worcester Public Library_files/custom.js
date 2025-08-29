/*jslint browser: true*/
/*global $, jQuery*/
var googleAutocompleteMapObject = null;
$(document).ready(function () {
	if (!readCookie('s'))
		createCookie('s', getGUID());

	$('div#tabs ul.menu li ul').addClass('subnav');
	$('div#tabs ul.menu li a').mouseover(function () {
		$(this).parent().find('ul.subnav').slideDown('fast').show();
		$(this).parent().hover(function () { }, function () {
			$(this).parent().find('ul.subnav').slideUp('slow');
		});
	}).hover(function () {
		$(this).addClass('subhover');
	}, function () {
		$(this).removeClass('subhover');
	});
	if ($('.err404').length === 0) logView();
	initStats();
	selectTab();

	$('.emailform').each(function () {
		var $form = $(this);
		$form.on('submit', function (event) {
			event.preventDefault();
			ok = true;
			$('.required input, .required select, .required textarea', $form).each(function (index, field) {
				if ($(field).val().length === 0) {
					ok = false;
					$(field).closest('.form-group').addClass('has-error has-feedback').delay(3000).queue(function () {
						$(this).removeClass("has-error has-feedback").dequeue();
					});
					$form.parent().find('.error').text('Missing required fields').show().delay(3000).fadeOut();
				}
			});
			if (ok) {
				$.ajax({
					type: "POST",
					url: $form.attr('action'),
					data: $form.serialize(),
					success: function (data) {
						if (data.status === 'error') {
							if (typeof Recaptcha !== 'undefined' && Recaptcha.reload) {
								Recaptcha.reload();
							}
							$form.parent().find('.error').text(data.message).show().delay(3000).fadeOut();
						} else {
							$form.parent().find('.message').show();
							$form[0].reset();
						}
					}
				});
			}
			return false;
		});
	});
	$('div#body.mobile .widgetheader').on('click', function (event) {
		event.preventDefault();
		if ($(window).width() <= 768) {
			if ($(this).closest('.widget').hasClass('open')) {
				$(this).closest('.widget').removeClass('open');
			} else {
				$('.widget.open').removeClass('open');
				$(this).closest('.widget').toggleClass('open');
			}
		}
	});
	initSideloadLinks();

	// Handling for credit card transaction returns. PayPal PayFlow.
	$(window).on('message onmessage', function (e) {
		var data = e.originalEvent.data;
		if (typeof data.type !== 'undefined') {
			if (data.type === 'attend') {
				if (typeof data.ok !== 'undefined' && typeof data.regCache !== 'undefined') {
					completeEventTransaction(data.ok, data.regCache);
				}
			}

			if (data.type === 'reserve') {
				if (typeof data.ok !== 'undefined' && typeof data.bookings !== 'undefined' && typeof data.transactionData !== 'undefined') {
					completeRoomTransaction(data.ok, data.bookings, data.transactionData);
				}
			}
		}
	});

	$(window).on('resize', function () {
		$('.popupwidget').each(function (index, el) {
			$(this).position({
				of: $(window)
			});
			$(this).css('top', $(window).scrollTop() + 'px');
		});

		$('.temp_mask').css({
			height: $(document).height(),
			width: $(document).width()
		});
		resizeDates();
	});

	try {
		init();
	} catch (e) {
		if (console) console.log('init error', e);
	}

});
navigator.sayswho = (function () {
	var data = {};
	var ua = navigator.userAgent,
		tem,
		M = ua.match(/(opera|chrome|safari|firefox|msie|trident|adobeair|mobile(?=\/))\/?\s*([\d\.]+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
		data.n = 'MSIE';
		data.v = tem[1] || '';
	} else {
		M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
		//        if((tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
		data.n = M[0];
		data.v = M[1];
	}

	if (navigator.appVersion.indexOf("Win") != -1) data.o = "Windows";
	if (navigator.appVersion.indexOf("Mac") != -1) data.o = "MacOS";
	if (navigator.appVersion.indexOf("X11") != -1) data.o = "UNIX";
	if (navigator.appVersion.indexOf("Linux") != -1) data.o = "Linux";

	return data;
})();

function getWidgetContent(id, loc) {
	var ret = "";
	var l = "";
	if (loc && loc.length > 0) {
		l = '&location=' + loc;
	}
	$.ajax({
		url: '/widget?contentonly=yes&id=' + id + l,
		success: function (html) {
			ret = html;
		},
		async: false
	});
	return ret;
}

function getGUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
function initRegButtons() {
	$('.registerForEvent').regButton();
}
function init() {
	var menuTimer = false;
	$('ul.dropdown-menu').on('mouseleave', function (event) {
		event.preventDefault();
		menuTimer = setTimeout(function () {
			$('.dropdown.open').removeClass('open');
			$(":focus").blur();
		}, 500);
	}).on('mouseenter', function (event) {
		event.preventDefault();
		if (menuTimer) clearTimeout(menuTimer);
	});

	$('.font-down').on('click', function (event) {
		event.preventDefault();
		var newSize = parseInt($('body').css('font-size'), 10) - 1;
		if (newSize >= $(this).data('base-size')) {
			$('body').css('font-size', newSize + 'px');
		}
	}).data('base-size', parseInt($('body').css('font-size')));

	$('.font-up').on('click', function (event) {
		event.preventDefault();
		var newSize = parseInt($('body').css('font-size'), 10) + 1;
		if (newSize < 30) {
			$('body').css('font-size', newSize + 'px');
		}
	});

	// $('.dynamic-widget').each(function() {
	//     $(this).html(getWidgetContent($(this).attr('data-fill-with'), $(this).attr('data-location')));
	// });
	$('.amfaq-section-question').on('click', function (event) {
		event.preventDefault();
		if ($(this).parent().find('.amfaq-section-answer-selected').length > 0) {
			$('.amfaq-section-answer-selected').removeClass('amfaq-section-answer-selected');
		} else {
			$('.amfaq-section-answer-selected').removeClass('amfaq-section-answer-selected');
			$(this).parent().find('.amfaq-section-answer').addClass('amfaq-section-answer-selected');
		}

	});
	$('[data-link]').each(function (index, el) {
		var url = decodeURIComponent($(el).attr('data-link'));
		$(this).on('click', function (event) {
			event.preventDefault();
			if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
				window.open(url, '_blank');
			} else {
				window.open(url, '_top');
			}
		}).css('cursor', 'pointer');
	});
	$('[data-broadcast-show]').each(function (index, el) {
		var apiserver = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
		$.getJSON(apiserver + '/v1/broadcasts/show/' + $(el).attr('data-broadcast-show'), function (json, textStatus) {
			$(el).amShow({ scenes: json });
		});
	});
	$('[data-tile-url]').each(function (index, el) {
		var url = decodeURIComponent($(this).attr('data-tile-url'));
		var pat = /^https?:\/\//i;
		if (pat.test(url)) {
			$(this).wrap('<a target="_blank" href="' + url + '"></a>');
		} else {
			$(this).wrap('<a target="_top" href="' + url + '"></a>');
		}
	});
	// $('[data-tile-url]').on('click', function(event) {
	// 	event.preventDefault();
	// 	var url = decodeURIComponent($(this).attr('data-tile-url'));
	// 	var pat = /^https?:\/\//i;
	// 	if (pat.test(url)){
	// 		window.open(url, '_blank');
	// 	}else{
	// 		window.open(url, '_top');
	// 	}
	// });
	$('.amsb-tabs>li').on('click', function (event) {
		event.preventDefault();
		$(this).closest('.amsb-tabs').find('.amsb-tab-active').removeClass('amsb-tab-active');
		var c = $(this).attr('class');
		$(this).addClass('amsb-tab-active');
		$(this).closest('.amsb-tabs').parent().find('.amsb-tab-content').hide();
		$(this).closest('.amsb-tabs').parent().find('.' + c + '-content').show();

	});
	$('.amsc-tabs>li').on('click', function (event) {
		event.preventDefault();
		$(this).closest('.amsc-tabs').find('.amsc-tab-active').removeClass('amsc-tab-active');
		var c = $(this).attr('class');
		$(this).addClass('amsc-tab-active');
		$(this).closest('.amsc-tabs').parent().find('.amsc-tab-content').hide();
		$(this).closest('.amsc-tabs').parent().find('.' + c + '-content').show();

	});
	setTimeout(function () {
		$('.ame-events-slideshow').cycle().on('cycle-after', function (event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
			$(".ame-events-slideshow-desc", incomingSlideEl).trigger("update");
		}).on('cycle-initialized', function (event) {
		});
		$(".ame-events-slideshow .ame-events-slideshow-desc").dotdotdot({
			callback: function (isTruncated, orgContent) {
				//			console.log(isTruncated, orgContent);
			}
		});

	}, 500);

	$('.amh-tile').on('mouseover', function (event) {
		event.preventDefault();
		// $(this).css('max-height', $(this).outerHeight());
		$(this).addClass('amh-hover-state');
	}).on('mouseout', function (event) {
		event.preventDefault();
		$(this).removeClass('amh-hover-state');
		// $(this).css('max-height', '');

	});
	$('.amev-cal').amEVWidget();

	$('.amev-event-list').on('click', '.amev-show-full', function (event) {
		event.preventDefault();
		var $desc = $(this).closest('.amev-event-description');
		$desc.find('.amev-event-description-truncated').hide();
		$desc.find('.amev-event-description-full').show();
	});

	$('.recreads-list').amRecReads();
	$('.ambl-list').amBookList();
	$('.amsre-list').amSierraRecReads();
	$('.amsire-list').amSirsiRecReads();
	$('.circulation_wrapper').amCirculation();
	$('.regbtn').each(function () {
		if (!$(this).data('reg')) {
			$(this).data('reg', true);
			var event_id = $(this).data('eventid');
			var location_id = $(this).data('locationid');
			var regstatus = parseInt($(this).data('total_registrants'), 10) >= parseInt($(this).data('max_attendee'), 10) ? '0' : '1';

			$(this).on('click', function () {
				var $data = $('<div class="eventregform"></div>');
				$data.append($('.eelisttitle', $(this).closest('.eelistevent')).clone());
				$data.append($('.eelisttime', $(this).closest('.eelistevent')).clone());
				$data.append($('.eelistgroup', $(this).closest('.eelistevent')).clone());
				$data.append($('.eelisttags', $(this).closest('.eelistevent')).clone());
				$data.append($('.eelistdesc', $(this).closest('.eelistevent')).clone());

				var $form = $('<div class="popupform"></div>');
				$data.append($form);
				$form.append(formPair('name', 'Name'));
				$form.append(formPair('tel', 'Telephone'));
				$form.append(formPair('email', 'Email'));

				$form.append($('<div class="button eventRegButton">Submit</div>').on('click', function () {
					var btn = this;
					$('.formerr', $form).remove();
					var ok = true;
					if ($('#name', $form).val().length === 0) {
						$('#name', $form).parent().append('<div class="formerr">Name is required</div>');
						ok = false;
					}
					if ($('#tel', $form).val().length === 0 && $('#email', $form).val().length === 0) {
						$('#email', $form).parent().append('<div class="formerr">A telephone number or email address is required</div>');
						ok = false;
					}

					if (ok) {
						$.post('/eeventcaldata', {
							name: $('#name', $form).val(),
							tel: $('#tel', $form).val(),
							email: $('#email', $form).val(),
							event_id: event_id,
							status: regstatus,
							location_id: location_id
						}, function (data, textStatus, xhr) {
							$('.popupwidgetclose').trigger('click');
						});
					}
				}));

				$popupwidget = showPopupWidget('Register for event', $data);
				$popupwidget.css('width', '460px');
				$popupwidget.position({
					of: $(window)
				});
			});
		}
	});

	$('.accordion').each(function () {
		if (!$(this).attr('done')) {
			$(this).attr('done', true);
			initAccordion('#' + $(this).attr('id'));
			$(this).find('[open=yes]').trigger('click');
		}
	});
	$('.rsswidget').each(function () {
		if (!$(this).attr('done')) {
			$(this).attr('done', true);
			iniRSSWidgets('#' + $(this).attr('id'));
		}
	});

	if ($('.librarycard-form').length > 0) {
		initLibraryCardForm();
	}

	initToggles();
	iniResItems();
	initButtonWidgets();
	initPopupLinks();
	initBookmarkItems();
	initeEventPopupLinks();
	initOpeningHoursTables();
	initRegButtons();
	try {
		initTwitter();
		initVideo();
	} catch (e) { }
	initFlickr();
	initSlideShows();
	initSearchBoxes();
	initNYPLCollections();

	$('.advanced-slideshow-widget').amAdvancedSlideshow();

	$('.eeventmoreless').click(function () {
		var $desc = $(this).parent().children('.eeventdesc');
		if ($desc.is(':hidden')) {
			$(this).text('Close');
			$desc.fadeIn();
		} else {
			$(this).text('More info');
			$desc.fadeOut();
		}
	});

	$('.date').each(function () {
		var $box = $(this);
		$box.html(getDateTime());
		setInterval(function () {
			$box.html(getDateTime());
		}, 1000);
	});

	if ($('.subscribeToEvent').length > 0) {
		$('.subscribeToEvent').on('click', function () {
			showInterestedPopup($(this).attr('data-eventid'), $(this).attr('data-recurringid'), {
				'title': $(this).attr('data-event-title') + ' - ' + $(this).attr('data-event-subtitle'),
				'datestring': $(this).attr('data-event-datestring') + ' - ' + $(this).attr('data-event-timestring'),
				'location': $(this).attr('data-event-location')
			});
		});
	}
}

function showInterestedPopup(dateId, recurringId, event) {
	var self = this;
	var eventInfo = {
		title: event.title,
		datestring: event.datestring,
		location: event.location
	};

	var interested = new EventBillingSubscriptions(dateId, recurringId, eventInfo, false);
	var interestedForm = interested.subscriptionForm;
	interestedForm.appendTo('body');
	$('.Event_Full-dialog').modal({
		backdrop: 'static',
		keyboard: false
	}).modal('show');
}

function addSearch() {
	if (window.external && ('AddSearchProvider' in window.external)) {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		}
		window.external.AddSearchProvider(window.location.origin + "/opensearch.xml");
	}
}

function logView() {
	try {
		var data = {};
		data.p = $('[data-pageid]').attr('data-pageid');
		data.c = $('meta[name=client]').attr('content');
		data.u = window.location.href.split('?')[0].toString().split(window.location.host)[1];
		logStat('view', data);
	} catch (e) { }
}

function initStats() {
	$(document.body).on('click', function (e) {
		try {
			if (typeof e.pageX === "undefined" || typeof e.pageY === "undefined") return true; //no click info so bail
			var pid = $('[data-pageid]').attr('data-pageid');
			if (typeof pid === "undefined" || pid.length === 0) return true;
			var data = {};
			data.p = pid;
			data.x = e.pageX;
			data.y = e.pageY;
			data.s = $(document).width();
			data.c = $('meta[name=client]').attr('content');
			data.u = window.location.href.split('?')[0].toString().split(window.location.host)[1];
			var w = $(e.target).closest('.widget').attr('id');
			if (w) data.w = w;
			logStat('click', data);
		} catch (e) { }
		return true;
	});
	$(document.body).on('click', 'a', function (e) {
		try {
			var pid = $('[data-pageid]').attr('data-pageid');
			if (typeof pid === "undefined" || pid.length === 0) return true;
			var data = {};
			data.p = pid;
			data.l = $(this).attr('href');
			var text = $(this).text();
			if (text.length > 0) data.t = text;
			data.c = $('meta[name=client]').attr('content');
			data.u = window.location.href.split('?')[0].toString().split(window.location.host)[1];
			var w = $(e.target).closest('.widget').attr('id');
			if (w) data.w = w;
			logStat('link', data);
			return true;
		} catch (e) { }
		return true;
	});
}

function resizeDates() {
	$('.eecallistheaderdate p').each(function () {
		var d = $('#datepicker', $(this).closest('.widgetbody')).datepicker('getDate');
		$(this).text(getSizedDate(d));
	});
}

function getSizedDate(d) {
	if ($(window).width() >= 1024) {
		return moment(d).format('ddd, MMM Do YYYY');
	} else if ($(window).width() >= 768) {
		return moment(d).format('ddd, MMM Do YYYY');
	} else if ($(window).width() >= 480) {
		return moment(d).format('MMM Do YY');
	} else {
		return moment(d).format('MMM YYYY');
	}
}

function initSearchBoxes() {
	$('.wsearchbox input').keypress(function (e) {
		if (e.which == 13) {
			$('.wsearchbutton button', $(this).closest('.searchwidget')).trigger('click');
		}
	});

	$('.wsearchbutton button').on('click', function () {
		var term = $('.wsearchbox input', $(this).closest('.searchwidget')).val();
		if (term.length === 0) return;

		var url = decodeURIComponent($(this).attr('data-url'));
		window.open(url.replace(/{.*}/, term), '_blank');
	});
}

function selectTab() {
	var pageid = $('[data-pageid]').data('pageid');

	$('.current').removeClass('current');
	$('.navbar-top .navbar-nav a').each(function (index, el) {
		var href = $(this).attr("href");
		if (href) {
			var id = href.substr(href.lastIndexOf('/') + 1).replace(/^\D+/g, '');
			if (parseInt(id, 10) === parseInt(pageid, 10)) {
				$(this).addClass('current');
				$(this).closest('.dropdown').find('.dropdown-toggle').addClass('current');
			} else if (window.location.pathname == href) {
				$(this).addClass('current');
				$(this).closest('.dropdown').find('.dropdown-toggle').addClass('current');
			}
		}
	});
	if ($('.current').length === 0) {
		$('.navbar-top .navbar-nav a:first()').addClass('current');
	}

	var parts = window.location.pathname.split('/');
	var portal = $('[data-portal]').attr('data-portal');
	var index = portal && portal.length > 0 && portal == parts[1] ? 2 : 1;
	var p = parts[index];
	if (p) {
		$('.tab').each(function () {
			var $tab = $(this);
			if ($(this).attr('href').split('/')[index] === p) {
				$tab.addClass('tab_selected');
			} else {
				$tab.removeClass('tab_selected');
			}
		});
	} else {
		$('.tab:first').addClass('tab_selected');
	}
}

function initSideloadLinks() {
	if (typeof history.pushState !== "undefined") {
		$('.sideload_fade').on('click', function () {
			var pages = [];
			$('.sideload_fade').each(function () {
				pages.push($(this).attr('href').split('/')[1]);
			});
			var o = pages.indexOf(window.location.pathname.split('/')[1]);
			var n = pages.indexOf($(this).attr('href').split('/')[1]);
			history.pushState({
				state: 1
			}, $(this).text(), $(this).attr('href'));
			document.title = $(this).text();
			selectTab();
			$.ajax({
				url: $(this).attr('href') + '?sideload=1',
				success: function (data) {
					$('#body').fadeOut(100, function () {
						$(this).html(data).fadeIn(100, function () {
							logView();
							init();
						});
					});
				}
			});
			return false;
		});

		$('.sideload_slide').on('click', function () {
			var pages = [];
			$('.sideload_slide').each(function () {
				pages.push($(this).attr('href').split('/')[1]);
			});
			var o = pages.indexOf(window.location.pathname.split('/')[1]);
			var n = pages.indexOf($(this).attr('href').split('/')[1]);
			history.pushState({
				state: 1
			}, $(this).text(), $(this).attr('href'));
			document.title = $(this).text();
			selectTab();
			$.ajax({
				url: $(this).attr('href') + '?sideload=1',
				success: function (data) {
					var width = $('#body').width();
					if (o > n) {
						$('#body').parent().append('<div id="newbody"></div>');
						$("#newbody").hide().html(data);

						$("#body").hide("slide", {
							direction: "right"
						}, 500, function () {
							$(this).remove();
						});
						$("#newbody").show("slide", {
							direction: "left"
						}, 500).attr('id', 'body');
					} else if (o < n) {
						$('#body').parent().append('<div id="newbody"></div>');
						$("#newbody").hide().html(data);


						$("#newbody").show("slide", {
							direction: "right"
						}, 500).attr('id', 'body');
						$("#body").hide("slide", {
							direction: "left"
						}, 500, function () {
							$(this).remove();
						});

					} else {
						$('#body').fadeOut(100, function () {
							$(this).html(data).fadeIn(100, function () {
								logView();
								init();
							});
						});
					}
				}
			});
			return false;
		});
	}
}

function initSlideShows() {
	$('.slidelist img').each(function (idx, img) {
		$(img).css('width', $(img).closest('.slideshowwidget').width() + 'px');
	});
	$('.slidelist').cycle();
}

function initFlickr() {
	$('.flikr_widget').each(function () {
		$(this).hide();
		var hid = 'flickr_holder_' + $(this).attr('id');
		$holder = $('<div ="flickr_over"></div>');
		$(this).parent().prepend($holder);
		$holder.append('<img src="/images/common/flikr/flickr.png">');
		$enlarge = $('<i class="icon-zoom-in icon-2x"></i><img src="/images/common/flikr/flickr-e.png">');
		$enlarge.css('cursor', 'pointer');
		$enlarge.css('float', 'right');
		$enlarge.on('click', function () {
			flickrEnlarge(hid);
		});
		$holder.append($enlarge);
		$holder.append($('<div id="' + hid + '" class="flickr_holder"></div>'));

		$controls = $('<div class="flickr_controls"></div>');
		$holder.append($controls);

		$back = $('<i class="icon-backward icon-2x"></i>');
		$back.on('click', function () {
			flickrPrev(hid);
		});


		$fwd = $('<i class="icon-forward icon-2x"></i>');
		$fwd.on('click', function () {
			flickrNext(hid);
		});


		$pause = $('<i class="icon-pause icon-2x"></i>');
		$pause.on('click', function () {
			flickrPauseToggle(hid);
			if ($(this).hasClass('icon-pause')) {
				$(this).removeClass('icon-pause').addClass('icon-youtube-play');
			} else {
				$(this).addClass('icon-pause').removeClass('icon-youtube-play');
			}
		});


		$controls.append($back).append($pause).append($fwd);

		var flickr_list = [];
		$('li', this).each(function () {
			var itm = {};
			itm.url = $(this).text();
			itm.large = $(this).attr('data-large');
			itm.small = $(this).attr('data-small');
			itm.title = $(this).attr('data-title');
			itm.desc = $(this).attr('data-desc');
			flickr_list.push(itm);
		});

		flickrShow(flickr_list, hid);
	});
}

function getLocation() {
	if ($('meta[name=location]').length > 0) {
		return $('meta[name=location]').attr('content');
	}
	var input = window.location.href;
	if (!input) return false;
	var parts = input.split('/');
	for (var i = 0; i < parts.length; i++) {
		if (parts[i] == 'location') return parts[i + 1];
	}
	return false;
}

function initOpeningHoursTables() {
	var location = getLocation();
	if (!location) return;
	$('.openingtimes').each(function () {
		var $p = $(this);
		// Added by CK 12/12/17 - #3478 -
		// All opening times tables were being updated with same branch data on Next/Prev. This adds ID of parent to be passed.
		var location_id = $p.attr("id");
		if (!$p.attr('week')) $p.attr('week', 0);
		$p.find('.prev_openingtimes').click(function (event) {
			event.preventDefault();
			var l = $(this).attr('data-location-keyword') || location;
			if ($p.attr('week') > 0) $p.attr('week', parseInt($p.attr('week'), 10) - 1);
			updateOpeningHours($p, l, location_id);
		});
		$p.find('.curr_openingtimes').click(function (event) {
			event.preventDefault();
			var l = $(this).attr('data-location-keyword') || location;
			$p.attr('week', 0);
			updateOpeningHours($p, l, location_id);
		});
		$p.find('.next_openingtimes').click(function (event) {
			event.preventDefault();
			var l = $(this).attr('data-location-keyword') || location;
			$p.attr('week', parseInt($p.attr('week'), 10) + 1);
			updateOpeningHours($p, l, location_id);
		});
	});
}

function updateOpeningHours($target, location, location_id) {
	$.get('/openingtimes/location/' + location + '?week=' + $target.attr('week'), function (data) {
		// Fix from above, continued. Using ID get correct table and replace HTML.
		var newel = $target.data("new-element");
		data = data.replace(/(\r\n\t|\n|\r\t)/gm, "");
		if (newel) {
			newel.children('.openingtimes_table').empty().append(data);
		} else {
			$('#' + location_id).children(".openingtimes_table").html(data);
		}
	});
}
function getSearchResults(ils, term, start) {
	var client = $('meta[name=client]').attr('content');
	var apiserver = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';

	var results = { start: start, limit: 3, total: 0, term: term, entries: [] };

	return new Promise(function (resolve, reject) {
		switch (ils) {
			case 'polaris':
				$.getJSON(apiserver + '/v1/' + client + '/polaris/search/', { q: term, page: (start / results.limit) + 1, bibsperpage: results.limit, keyword: 'KW', sortby: 'RELEVANCE', limit: 'TOM=*' }, function (json, textStatus) {
					results.total = json.data.TotalRecordsFound;
					$.each(json.data.BibSearchRows, function (index, result) {
						var server = index % 10;
						var coverUrl = 'https://covers' + server + '.communico.co/' + client + '/cover/?';

						if (result.ISBN) {
							coverUrl += 'type=isbn&id=' + result.ISBN.replace(/[^\dx]/g, '') + '&';
						} else if (result.UPC) {
							coverUrl += 'type=upc&id=' + result.UPC.replace(/[^\dx]/g, '') + '&';
						} else if (result.OCLC) {
							coverUrl += 'type=oclc&id=' + result.OCLC.replace(/[^\dx]/g, '') + '&';
						}

						coverUrl += 'title=' + encodeURIComponent(result.Title || "No Cover Image Available");

						results.entries.push({
							id: result.ControlNumber,
							title: result.Title,
							author: result.Author,
							year: result.PublicationDate,
							image: coverUrl
						});
					});
					resolve(results);
				});
				break;
			case 'iii':
				$.getJSON(apiserver + '/v2/' + client + '/sierra/search?type=Rightresultfull&start=' + start + '&limit=' + results.limit + '&q=' + term, function (json, textStatus) {
					results.total = json.data.total;
					$.each(json.data.entries, function (index, result) {

						var server = index % 10;
						var coverUrl = 'https://covers' + server + '.communico.co/' + client + '/cover/?';

						if (result.upcs[0]) {
							coverUrl += 'type=upc&id=' + result.upcs[0] + '&';
						} else if (result.isbns[0]) {
							coverUrl += 'type=isbn&id=' + result.isbns[0] + '&';
						}

						coverUrl += 'title=' + encodeURIComponent(result.title || "No Cover Image Available");

						results.entries.push({
							id: result.id,
							title: result.title,
							author: result.author,
							year: result.publishYear + '',
							image: coverUrl
						});
					});
					resolve(results);
				});

				break;
			default:
				reject('unknown ILS');
				break;
		}
	});
}
function initToggles() {
	$('[id^=toggle_]').each(function () {
		if ($(this).data('toggle')) return;
		$(this).data('toggle', true);
		var targetid = $(this).attr('id').substring(7);
		$(this).css('cursor', 'pointer');
		$(this).click(function () {
			$('#' + targetid).fadeToggle();
		});
	});
	$('[id^=togglepopup_]').each(function () {
		if ($(this).data('toggle')) return;
		$(this).data('toggle', true);
		var title = $(this).data('title');
		var max = $(this).data('max');
		var targetid = $(this).attr('id').substring(12);
		$(this).css('cursor', 'pointer');
		$(this).click(function () {
			var t = $('#' + targetid);
			var tc = t.clone(true).show();
			t.data("new-element", tc);

			var $popupwidget = showPopupWidget(title, tc, null);
			$popupwidget.css('max-width', max);
			$popupwidget.position({
				of: $(window)
			});
		});
	});
	$('[id^=mappopup_]').each(function () {
		if ($(this).data('toggle')) return;
		$(this).data('toggle', true);
		var title = $(this).data('title');
		var max = $(this).data('max');
		var lat = $(this).data('lat');
		var lon = $(this).data('lon');

		$(this).css('cursor', 'pointer');
		$(this).click(function () {
			var $data = $('<iframe width="100%" height="400" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q=' + lat + ',' + lon + '&key=AIzaSyBIswHRc1E1cJ0rOY7JpZIo-KPCh9OMgJY"></iframe>');
			var $popupwidget = showPopupWidget(title, $data);
			$popupwidget.css('max-width', max);
			$popupwidget.position({
				of: $(window)
			});
		});
	});


}

function getDateTime() {
	var bits = moment().format('LLLL').split(' ');
	return bits[0] + ' ' + bits[2] + ' ' + bits[1] + ' ' + bits[3] + ' <b>' + bits[4] + '' + bits[5] + '</b>';
}

function initBookmarkItems() {
	$('.bookmark_list').each(function () {
		var style = $(this).attr('viewstyle');
		var $bookmark_body = $('<div class="bookmark_body toprule"/>');
		$(this).after($bookmark_body);
		$(this).children('li').each(function () {
			$(this).addClass('widget_tab');
			var $section_list = $(this).children('ul');
			$(this).click(function () {
				$(this).parent().children('li').removeClass('widget_tab_selected');
				$bookmark_body.children('ul').hide();
				$(this).addClass('widget_tab_selected');
				$section_list.show();
			});
			$section_list.hide();
			$section_list.addClass('bookmark_item_list');
			if (style == 1) {
				var pageid = $('[data-pageid]').data('pageid');
				$section_list.children('li').addClass('button-strip');
				$section_list.find('a').each(function (index, el) {
					var href = $(this).attr("href");
					if (href) {
						var id = href.substr(href.lastIndexOf('/') + 1).replace(/^\D+/g, '');
						if (parseInt(id, 10) === parseInt(pageid, 10)) {
							$(this).parent().addClass('button-strip-active');
						}
					}
				});
			} else {
				$section_list.children('li').addClass('bottomrule');
			}
			$bookmark_body.append($section_list);
		});
		$(this).children('li').first().trigger('click');
		if ($(this).children('li').length == 1) {
			$(this).hide();
			$bookmark_body.css('padding-top', 0);
		}
	});
}

function setStyleSheet(url) {
	$('#contrastsheet').attr('href', url);
}

function setFontSize(size) {
	document.body.style.fontSize = size;
}

function openAccessibility() {
	$('#accessibility').slideToggle();
	return false;
}

function eEventPopup(link) {
	var $me = $(link);
	var event_type = $me.attr('data-type');
	$.get('/eeventcal?event_type=' + event_type, function (data) {

		$popupwidget = showPopupWidget('Events Calendar', data, function () {
			$me.attr('open', 'no');
		});

		initToggles();

		$popupwidget.find('#type_all').change(function () {
			if ($(this).is(':checked')) $popupwidget.find('#types_list [id^=type_]').attr('checked', false);
		});
		$popupwidget.find('#types_list [id^=type_]').change(function () {
			if ($(this).is(':checked')) $popupwidget.find('#type_all').attr('checked', false);
		});
		$popupwidget.find('#group_all').change(function () {
			if ($(this).is(':checked')) $popupwidget.find('#groups_list [id^=group_]').attr('checked', false);
		});
		$popupwidget.find('#groups_list [id^=group_]').change(function () {
			if ($(this).is(':checked')) $popupwidget.find('#group_all').attr('checked', false);
		});
		$popupwidget.find('#loc_all').change(function () {
			if ($(this).is(':checked')) $popupwidget.find('#location_list [id^=loc_]').attr('checked', false);
		});
		$popupwidget.find('#location_list [id^=loc_]').change(function () {
			if ($(this).is(':checked')) $popupwidget.find('#loc_all').attr('checked', false);
		});
		$me.attr('open', 'yes');

		var onupdate = function () {
			var options = {};
			var currentDate = $popupwidget.find('#datepicker').datepicker('getDate');

			$popupwidget.find('.eecallistheaderdate p').text(getSizedDate(currentDate));

			$popupwidget.find('.eedate').text($.datepicker.formatDate('dd', currentDate));


			options.date = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
			if (!$popupwidget.find('#loc_all').is(':checked')) {
				options.locations = [];
				$popupwidget.find('#location_list [id^=loc_]').each(function () {
					if ($(this).is(':checked')) options.locations.push($(this).attr('id').substr(4));
				});
			}
			if (!$popupwidget.find('#group_all').is(':checked')) {
				options.groups = [];
				$popupwidget.find('#groups_list [id^=group_]').each(function () {
					if ($(this).is(':checked')) options.groups.push(encodeURIComponent($(this).attr('value')));
				});
			}
			if (!$popupwidget.find('#type_all').is(':checked')) {
				options.types = [];
				$popupwidget.find('#types_list [id^=type_]').each(function () {
					if ($(this).is(':checked')) options.types.push(encodeURIComponent($(this).attr('value')));
				});
			}
			$.getJSON('/eeventcaldata?event_type=' + event_type + '&req=' + encodeURIComponent(JSON.stringify(options)), function (data) {
				var $list = $popupwidget.find('#eecallistbody');
				$list.empty();
				$.each(data, function (value, key) {
					var $item = $('<div class="eelistevent"></div>');

					$item.append('<div class="eelisttitle">' + key.title + '</div>');
					$item.append('<div class="linkcolour eelocation"><i class="am-locations"></i> ' + key.location + '</div>');
					$item.append('<div class="eelisttime headingtext">' + key.start_time + ' - ' + key.end_time + '</div>');
					if (key.ages) $item.append('<div class="eelistgroup">' + key.ages + '</div>');
					if (key.tags) $item.append('<div class="eelisttags">' + key.tags + '</div>');
					$item.append('<div class="eelistdesc">' + key.description + '</div>');
					if (parseInt(key.allow_reg, 10) === 1) {
						if (moment(key.close_registration).diff() < 0) {
							$item.append('<div class="regclosed">Registration now closed</div>');
						} else {
							if (parseInt(key.staff_only_registration, 10) === 1) {
								$item.append('<div class="regclosed eventStaffRegMessage">Please contact the library to register for this event</div>');
							} else if (parseInt(key.total_registrants, 10) >= parseInt(key.max_attendee, 10) && parseInt(key.allow_waitlist, 10) === 0) {
								$item.append('<div class="regclosed">This event is full</div>');
							} else {
								var event_id = key.id;
								var location_id = key.location_id;
								var m = parseInt(key.total_registrants, 10) >= parseInt(key.max_attendee, 10) ? 'Join the wait list' : 'Register';
								var regstatus = parseInt(key.total_registrants, 10) >= parseInt(key.max_attendee, 10) ? '0' : '1';

								$item.append($('<div class="button eventRegButton">' + m + '</div>').on('click', function () {
									var $data = $('<div class="eventregform"></div>');
									$data.append($('.eelisttitle', $(this).closest('.eelistevent')).clone());
									$data.append($('.eelisttime', $(this).closest('.eelistevent')).clone());
									$data.append($('.eelistgroup', $(this).closest('.eelistevent')).clone());
									$data.append($('.eelisttags', $(this).closest('.eelistevent')).clone());
									$data.append($('.eelistdesc', $(this).closest('.eelistevent')).clone());

									var $form = $('<div class="popupform"></div>');
									$data.append($form);
									$form.append(formPair('name', 'Name'));
									$form.append(formPair('tel', 'Telephone'));
									$form.append(formPair('email', 'Email'));

									$form.append($('<div class="button eventRegButton">Submit</div>').on('click', function () {
										var btn = this;
										$('.formerr', $form).remove();
										var ok = true;
										if ($('#name', $form).val().length === 0) {
											$('#name', $form).parent().append('<div class="formerr">Name is required</div>');
											ok = false;
										}
										if ($('#tel', $form).val().length === 0 && $('#email', $form).val().length === 0) {
											$('#email', $form).parent().append('<div class="formerr">A telephone number or email address is required</div>');
											ok = false;
										}
										if (ok) {
											$.post('/eeventcaldata', {
												name: $('#name', $form).val(),
												tel: $('#tel', $form).val(),
												email: $('#email', $form).val(),
												event_id: event_id,
												status: regstatus,
												location_id: location_id
											}, function (data, textStatus, xhr) {
												$('.popupwidgetclose').trigger('click');
											});
										}
									}));

									$popupwidget = showPopupWidget('Register for event', $data);
									$popupwidget.css('width', '460px');
									$popupwidget.position({
										of: $(window)
									});
								}));
							}
						}
					}
					$list.append($item);
				});
				if (data.length === 0) $list.html('<div class="eelisttitle" style="margin-left:20px">Sorry there are no events that match your selection.</div>');
				$('.temp_mask').css({
					height: $(document).height()
				});
			});
		};
		$popupwidget.find('#datepicker').datepicker({
			onSelect: onupdate,
			minDate: '0'
		});
		$popupwidget.find(':checkbox').change(onupdate);

		$popupwidget.find('.eeback').disableSelection();
		$popupwidget.find('.eeback').click(function () {
			var d = $popupwidget.find('#datepicker').datepicker('getDate');
			d.setDate(d.getDate() - 1);
			$popupwidget.find('#datepicker').datepicker('setDate', d);
			onupdate();
		});
		$popupwidget.find('.eenext').disableSelection();
		$popupwidget.find('.eenext').click(function () {
			var d = $popupwidget.find('#datepicker').datepicker('getDate');
			d.setDate(d.getDate() + 1);
			$popupwidget.find('#datepicker').datepicker('setDate', d);
			onupdate();
		});

		$popupwidget.find('.eetoday').disableSelection();
		$popupwidget.find('.eetoday').click(function () {
			$popupwidget.find('#datepicker').datepicker('setDate', new Date());
			onupdate();
		});

		$popupwidget.find('.eetomorrow').disableSelection();
		$popupwidget.find('.eetomorrow').click(function () {
			var d = new Date();
			d.setDate(d.getDate() + 1);
			$popupwidget.find('#datepicker').datepicker('setDate', d);
			onupdate();
		});
		$('.eefilter', $popupwidget).on('click', function () {
			var $col = $('.eecalleftcol', $(this).closest('.widgetbody'));
			if ($col.is(':visible')) {
				$col.fadeOut(function () {
					$(this).removeAttr('style');
				});
			} else {
				var pos = $(this).position();
				var width = $(this).outerWidth();
				$col.css({
					'z-index': 1,
					top: pos.top + "px",
					left: (pos.left + width) + "px"
				}).slideDown();

				//                $col.position({ my: "left top", at: "right top", of: $(this)}).slideDown();
			}
		});
		$('.eeclosefilter', $popupwidget).on('click', function () {
			$('.eecalleftcol', $(this).closest('.widgetbody')).fadeOut(function () {
				$(this).removeAttr('style');
			});
		});
		var def = $me.attr('default');
		if (!def) def = 'all';
		if (def && def != 'all') $popupwidget.find('#loc_' + def).trigger('click');
		if (def && def == 'all') $popupwidget.find('#loc_all').trigger('click');

		if ($me.attr('date')) $popupwidget.find('#datepicker').datepicker('setDate', new Date(parseInt($me.attr('date')) * 1000));

		onupdate();

		$popupwidget.position({
			of: $(window)
		});
		if ($popupwidget.position().top < 0) $popupwidget.css('top', '0px');
		if ($(window).scrollTop() > $popupwidget.position().top) $popupwidget.css('top', $(window).scrollTop() + 'px');

	});
}

function formPair(name, label, type) {
	if (!type) type = 'text';
	return $('<div class="formpair"><label for="' + name + '">' + label + '</label><input name="' + name + '" id="' + name + '" type="' + type + '"></input></div>');
}

function initeEventPopupLinks() {
	$('.eeventlink').click(function () {
		var $me = $(this);
		if ($me.attr('open') == 'yes') return;
		eEventPopup(this);
		return false;
	});
}

function initPopupLinks() {
	$('.popup_widget').click(function () {

		$.get('/wget?' + $(this).attr('id'), function (data) {
			$popupwidget = $(data);
			$popupwidget.addClass('popupwidget');
			$close = $('<div class="popupwidgetclose"><i class="fa fa-times"></i></div>');
			$popupwidget.find('.widgetheader').append($close);

			var maskHeight = $(document).height();
			var maskWidth = $(window).width();

			var $mask = $('<div class="temp_mask"></div>').hide();
			$mask.css({
				'z-index': 15,
				'width': maskWidth,
				'height': maskHeight,
				backgroundColor: '#000000',
				position: 'absolute',
				top: '0px',
				left: '0px'
			});
			$('body').append($mask);

			var closefunc = function () {
				$mask.last().fadeOut(200, function () {
					$(this).remove()
				});
				$popupwidget.last().fadeOut(200, function () {
					$(this).remove()
				});
			};
			$mask.click(closefunc);
			$close.click(closefunc);


			$('body').append($popupwidget);
			$popupwidget.position({
				of: $(window)
			});


			$popupwidget.fadeIn(200);
			$mask.fadeTo('slow', 0.5);
			if ($popupwidget.position().top < 0) $popupwidget.css('top', '0px');

		});
		return false;
	});
}

function initButtonWidgets() {
	$('.buttontable').each(function () {
		$(this).find('tr').each(function () {
			var $button = $(this).find('button');
			var $link = $(this).find('a');
			$link.mouseover(function () {
				$button.addClass('button_open');
			});
			$link.mouseout(function () {
				$button.removeClass('button_open');
			});
		});
	});
}
function initNYPLCollections() {
	$('ul.nyplcollection').each(function () {
		var $nyplcollections = $(this);
		$nyplcollections.hide();
		var items = [];
		$('li', $nyplcollections).each(function (idx, item) {
			items.push({ id: $(item).data('id') });
		});
		var pos = 0;

		var stage = $('<div>').addClass('nyplcollection-stage').css({ 'position': 'relative', 'height': '100%', 'width': '100%' }).appendTo($nyplcollections.closest('.widgetbody'));
		var image = $('<div class="nyplcollection-image"><div></div></div>').appendTo(stage);
		var info = $('<div class="nyplcollection-info"></div>').appendTo(stage);
		var description = $('<div class="nyplcollection-description"></div>').appendTo(info);
		var title = $('<div class="nyplcollection-title"></div>').appendTo(description);
		var creator = $('<div class="nyplcollection-creator"></div>').appendTo(description);
		var dateCreated = $('<div class="nyplcollection-date-created"></div>').appendTo(description);
		var division = $('<div class="nyplcollection-division"></div>').appendTo(description);
		var imageId = $('<div class="nyplcollection-image-id"></div>').appendTo(description);
		var footer = $('<div class="nyplcollection-footer"></div>').appendTo(stage);
		var qrcode = $('<div class="nyplcollection-qrcode"><div></div></div>').appendTo(footer);
		$('<div class="nyplcollection-message"><div class="nyplcollection-message-title">Explore NYPL\'s Digital Collections</div><div>Get free access to more than 900,000 items digitized from our world-renowned collections, including prints, photographs, maps, manuscripts, video, and more, with new materials added every day.</div></div>').appendTo(footer);

		function render(item) {
			$(title).text(item.data.title);
			$(creator).text(item.data.creator);
			$(dateCreated).text(item.data.dateCreated);
			$(division).text(item.data.division);
			$(imageId).text('Image ID:' + item.data.imageId);
			$('>div', image).css({ 'background-image': 'url("https://images.nypl.org/index.php?id=' + item.data.imageId + '&t=w")' });
			$('>div', qrcode).css({ 'background-image': 'url("https://chart.googleapis.com/chart?cht=qr&chl=' + encodeURIComponent(item.data.url) + '&chs=150x150&chf=bg,s,58595b&chco=58595b&chld=L|0")' });
		}
		function setItem(item) {
			if (!item.data) {
				$.getJSON('/nyplitem?id=' + item.id).then(function (data) {
					if (data.numResults.$ === '0') {
						item.notFound = true;
						pos++;
						setItem(items[pos]);
						return;
					}
					var capture = Array.isArray(data.capture) ? data.capture.shift() : data.capture;

					var division = Array.isArray(data.mods.location) ? data.mods.location.filter(function (l) { l.type === 'division' }).map(function (c) {
						return c.physicalLocation.$
					}).shift() : data.mods.location.physicalLocation.$;

					var originInfo = Array.isArray(data.mods.originInfo) ? data.mods.originInfo[0] : data.mods.originInfo;

					var name = Array.isArray(data.mods.name) ? data.mods.name[0] : data.mods.name;
					if (name) name = name.namePart.$;

					var titleInfo = Array.isArray(data.mods.titleInfo) ? data.mods.titleInfo[0] : data.mods.titleInfo;
					item.data = {
						title: titleInfo.title.$,
						dateCreated: originInfo.dateCreated ? originInfo.dateCreated.$ : originInfo.dateIssued.$,
						creator: name,
						division: division,
						imageUUID: capture.uuid.$,
						imageId: capture.imageID.$,
						url: 'https://digitalcollections.nypl.org/items/' + capture.uuid.$ + '#/?uuid=' + capture.uuid.$,
					}
					render(item);
				});
			} else {
				render(item);
			}
		}

		setItem(items[pos]);
		setInterval(function () {
			pos++;
			if (pos >= items.length) {
				pos = 0;
			}
			while (items[pos].notFound) {
				pos++;
			}
			setItem(items[pos]);
		}, parseInt($nyplcollections.data('delay')));
	});
}
function iniResItems() {
	$('.resitem').each(function () {
		var style = $(this).attr('viewstyle');
		switch (style) {
			case '1':
			case '2':
			case '3':
				$(this).click(function () {
					var $content = $('<div class="popupres"/>');
					$(this).children('.resbody').children('.ressection').each(function () {
						var $item = $(this).clone();
						$item.show();
						$content.append($item);
					});
					showPopupWidget($(this).children('.resource_item_header').text(), $content);
					$content.shapeshift({
						enableDrag: false
					});
				});
				break;
			default:
				$(this).click(function (e) {
					if (!$(e.target).hasClass('resource_item_header')) return;
					if ($(this).hasClass('resource_item_open')) {
						var $sec = $(this);
						$(this).children('.resbody').slideUp(300, function () {
							$sec.removeClass('resource_item_open');
						});
						return;
					}
					$('.resource_item_open').each(function () {
						var $sec = $(this);
						$(this).children('.resbody').slideUp(300, function () {
							$sec.removeClass('resource_item_open');
						});
					});
					$(this).addClass('resource_item_open');
					$(this).children('.resbody').slideDown();
				});
				break;
		}
	});
}

function initVideo() {
	var self = this;
	$('.video_player').each(function () {

		function videoIdFromURL(url) {
			var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			var match = url.match(regExp);
			if (match && match[2].length == 11) {
				return match[2];
			} else {
				return false;
			}
		}

		var config_obj = $(this).data('video');

		if (typeof config_obj.video_service !== 'undefined' && config_obj.video_service == "Vimeo") {

			var this_widget = $(this)[0].parentNode.parentNode;

			var vidHeight = $(this_widget).css('height');
			var vidWidth = $(this_widget).css('width');

			var tag = document.createElement('script');
			tag.src = "https://player.vimeo.com/api/player.js";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			// Working around bug
			var waitForVimeo = function (callback) {
				var checkVimeo = function () {
					if (typeof window.Vimeo === 'undefined') {
						return false;
					} else {
						return true;
					}
				};
				if (checkVimeo()) {
					callback();
				} else {
					var interval = setInterval(function () {
						if (checkVimeo()) {
							clearInterval(interval);
							callback();
						}
					}, 700);
				}
			};

			waitForVimeo(function () {

				var result = config_obj.vimeo_url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i);

				if (!(result && Array.isArray(result) && result[1])) {
					return;
				}

				var video_id = result[1];

				var options = {
					id: video_id,
					height: (window.innerHeight - (window.innerHeight * .05)), // 95% height
					loop: false,
				};

				var player = new Vimeo.Player('player', options);

				// Autostart
				player.on("loaded", function () {
					if (typeof config_obj.vimeo.start !== 'undefined' && config_obj.vimeo.start > 0) {
						player.setCurrentTime(config_obj.vimeo.start);
					} else {
						player.setCurrentTime(0);
					}
					if (config_obj.vimeo.autostart == "1") {
						player.play();
					}
				});

				player.on("play", function (e) {

					var endPoint = e.duration;
					if (typeof config_obj.vimeo.end !== 'undefined' && config_obj.vimeo.end) {
						endPoint = config_obj.vimeo.end;
					}


					player.addCuePoint(endPoint, {
						customKey: 'customValue'
					});

				});

				player.on("cuepoint", function (e) {
					player.removeCuePoint(e.id).then(function (id) {
						player.pause();
					});
				});

				if (config_obj.vimeo.captions == "1") {
					player.enableTextTrack('en').then(function (track) {
					});
				} else if (config_obj.vimeo.captions == "0") {
					player.disableTextTrack().then(function () {
					});
				}

				if (config_obj.vimeo.mute == "1") {
					player.setVolume(0);
				}

			});

		} else if (typeof config_obj.video_service === 'undefined' || config_obj.video_service == "YouTube") {

			config_obj.yt['playlist'] = videoIdFromURL(config_obj.youtube_url);

			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/player_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			var this_widget = $(this)[0].parentNode.parentNode;

			var play_yt = function () {

				var vidHeight = $(this_widget).css('height');
				var vidWidth = $(this_widget).css('width');

				var player = new YT.Player('player', {
					enablejsapi: "1",
					playerVars: config_obj.yt,
					height: (window.innerHeight - (window.innerHeight * .05)), // 95% height
					width: "100%",
					videoId: videoIdFromURL(config_obj.youtube_url),
					events: {
						'onApiChange': function (event) {
						},
						'onReady': function (event) {
						},
						'onStateChange': function (event) {

							if (event.data == YT.PlayerState.PLAYING) {
								if (typeof config_obj.caption_size !== 'undefined' && config_obj.caption_size !== 0) {
									if (typeof player.setOption == 'function') {
										player.setOption('captions', 'fontSize', config_obj.caption_size);
									}
								}
							}
							if (event.data == YT.PlayerState.ENDED) {
								if (config_obj.youtube_loop != "1") {
									if (typeof player.stopVideo() == 'function') {
										player.stopVideo();
									}
								}
							}
						}
					}
				});
			}
		}

		// This is to work around buggy youtube api
		if (window.initialPlay == false) {
			play_yt();
		}

		window.onYouTubePlayerAPIReady = function () {
			window.initialPlay = false;
			play_yt();
		}
	});
}

function initTwitter() {
	$('.twitter').each(function () {
		var username = $(this).attr('id');
		if (username.length === 0) return;
		$(this).tweet({
			modpath: '/tw/index.php',
			username: username,
			avatar_size: 48,
			count: 5,
			loading_text: 'loading twitter feed...'
		});
	});
}

function iniRSSWidgets(id) {
	var $list = $(id).find('.rssslist');
	var feedstyle = $list.attr('data-viewstyle') ? parseInt($list.attr('data-viewstyle'), 10) : 0;
	var count = $list.attr('data-count') ? parseInt($list.attr('data-count'), 10) : 5;

	$list.hide();
	var multi = ($list.find('a').length > 1) ? true : false;
	var $rsstabbar = $('<div class="widget_tab_bar"></div>');
	if (multi) {
		$(id).append($rsstabbar);
	}
	var i = 0;
	$list.find('a').each(function () {
		var $tab = $('<div id="id_' + i + '" class="widget_tab">' + $(this).text() + '</div>');
		var $feed = $('<div class="feed" id="id_' + i + '_feed"></div>');
		$.getJSON('/rss', { feed: $(this).attr('href') }, function (json) {
			var $body = $('<div class="rssBody"></div>').appendTo($feed);
			var $rssList = $('<ul></ul>').appendTo($body);
			if (json.result) {
				$feed.addClass('rssFeed');
				var t = 'even';
				var i = 0;
				$.each(json.data.item, function (idx, item) {
					i++;
					if (i > count) return;
					var $item = $('<li class="rssRow ' + t + '"></li>');
					if (item.description) {
						$item.attr('data-desc', item.description).appendTo($rssList).qtip({
							content: {
								attr: 'data-desc'
							},
							position: {
								my: 'left top',
								at: 'right top',
								viewport: $(window),
								target: 'mouse',
								adjust: {
									mouse: false
								}
							},
							events: {
								show: function (event, api) {
									if ($(window).width() <= 768) {
										return false;
									}
								}
							}
						});
					}
					$('<h4><a target="_system" href="' + item.link + '">' + item.title + '</a></h4>').appendTo($item);
					if (item.date) {
						$('<div>' + moment(item.date).format('LLL') + '</div>').appendTo($item);
					}
					t = t == "odd" ? "even" : "odd";
				});
			} else {
				$feed.html('Error loading feed');
			}
		});
		// $feed = $('<div class="feed" id="id_' + i + '_feed"></div>').rssfeed($(this).attr('href'), {
		// 		limit: count,
		// 		header: true,
		// 		snippet: feedstyle === 0,
		// 		linktarget: '_system'
		// 	}, function(feed) {
		// 		if (feedstyle === 1) $(feed).find('.rssBody').addClass('imgfeed');
		// 		$(feed).find('.rssHeader').appendTo(feed);
		// 		$(feed).find('.rssRow').each(function() {
		// 			if (feedstyle === 0) {
		// 				$(this).attr('desc', $('p:first', this).html());
		// 			} else {
		// 				var link = $('h4:first a', this);
		// 				link.html($('img:first', this));
		// 				$(this).empty().append(link);
		// 			}
		// 		});
		// 		if (feedstyle === 0) {
		// 			$('.widgetbody').find('.rssRow[desc]').qtip({
		// 				content: {
		// 					attr: 'desc'
		// 				},
		// 				position: {
		// 					my: 'left top',
		// 					at: 'right top',
		// 					viewport: $(window)
		// 				},
		// 				events: {
		// 					show: function(event, api) {
		// 						if ($(window).width() <= 768) {
		// 							return false;
		// 						}
		// 					}
		// 				}
		// 			});
		// 		}
		// 	});
		if (multi) {
			$feed.hide();
			$tab.click(function () {
				$(this).parent().find('.widget_tab_selected').removeClass('widget_tab_selected');
				$(this).addClass('widget_tab_selected');
				$(this).parent().parent().find('.feed').hide();
				$(this).parent().parent().find('#' + $(this).attr('id') + '_feed').fadeIn();
			});
		}
		$rsstabbar.append($tab);
		$(id).append($feed);
		i++;
	});
	$(id).find('.widget_tab:first').addClass('widget_tab_selected');
	$(id).find('.feed:first').show();
}

function showPopupWidget(title, content, closedCallback) {
	var $popupwidget = $('<div class="popupwidget widget"></div>').hide();
	$popupwidget.css('z-index', 200 * ($('.popupwidget').length + 1));

	$header = $('<div class="widgetheader">' + title + '</div>');
	$close = $('<div class="popupwidgetclose"><i class="fa fa-times"></i></div>');

	$header.append($close);
	$popupwidget.append($header);

	$popupwidgetbody = $('<div class="widgetbody"></div>');
	$popupwidgetbody.append(content);
	$popupwidget.append($popupwidgetbody);

	var maskHeight = $(document).height();
	var maskWidth = $(window).width();

	var zindex = 150 * ($('.temp_mask').length + 1);

	var $mask = $('<div class="temp_mask"></div>').hide();
	$mask.css({
		'z-index': zindex,
		'width': maskWidth,
		'height': maskHeight,
		backgroundColor: '#000000',
		position: 'absolute',
		top: '0px',
		left: '0px'
	});
	$('body').append($mask);

	var closefunc = function () {
		$mask.last().fadeOut(200, function () {
			$(this).remove()
		});
		$popupwidget.last().fadeOut(200, function () {
			$(this).remove()
		});
		if (closedCallback) closedCallback();
	};
	$mask.click(closefunc);
	$close.click(closefunc);


	$('body').append($popupwidget);
	$popupwidget.position({
		of: $(window)
	});
	$popupwidget.css('top', $(window).scrollTop() + 'px');

	$popupwidget.fadeIn(200);
	$mask.fadeTo('slow', 0.5);
	//    if ($popupwidget.position().top < 0)$popupwidget.css('top', '0px');
	//    if ($(window).scrollTop() > $popupwidget.position().top)$popupwidget.css('top', $(window).scrollTop() + 'px');
	return $popupwidget;
}
function bingtype(type, span) {
	$('.span_link_s').removeClass('span_link_s');
	$(span).addClass('span_link_s');
	$('#bingtype').val(type);
}
function dosearchv2(action, sid, span) {
	/*  if(document.getElementById('q').value=='Search the web here...'||)return;
window.location.href=url+document.getElementById('q').value;*/
	for (var i = 0; i < span.parentNode.childNodes.length; i++) {
		if (span.parentNode.childNodes[i].nodeName == 'SPAN') {
			span.parentNode.childNodes[i].className = 'span_link';
		}
	}
	span.className = 'span_link_s';
	var q = document.getElementById('q');
	var search_from = document.getElementById('search_from');
	search_from.action = action;
	q.name = sid;
	document.forms['search_from'].submit();
	//  if(q.value!='Search the web here...'&&q.value!='')q.form.submit();
}

function initAccordion(id) {
	$(id).find('.wbody').hide();
	$(id).find('.wtitle').off('click');
	$(id).find('.wtitle').on('click', function (e) {
		if ($(this).hasClass('button_open')) {
			$(id).find('.button_open').removeClass('button_open');
			$(id).find('.wopen').removeClass('wopen');
			$(id).find('.wbody').slideUp();
			return;
		}
		$(id).find('.button_open').removeClass('button_open');
		$(id).find('.wopen').removeClass('wopen');
		$(id).find('.wbody').slideUp();
		$('#' + $(this).attr('id') + '_body').slideDown();
		$('#' + $(this).attr('id') + '_body').addClass('wopen');
		$(this).addClass('button_open');
	});
}

function logStat(type, data) {
	// try {
	// 	if (navigator.sayswho) data.b = navigator.sayswho;
	// 	var portal = $('[data-portal]').attr('data-portal');
	// 	if (portal && portal.length > 0) data.portal = portal;
	// 	data.sid = readCookie('s');
	// 	$.post('/l', JSON.stringify([{
	// 		type: type,
	// 		time: new Date(),
	// 		data: data
	// 	}]));
	// } catch (e) {}
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}

function createCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	}
	document.cookie = name + "=" + value + expires + "; path=/; SameSite=Strict; Secure";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}
/*todo: rewirte flickr support!!!*/
var flickrLists = new Object();

function flickrShow(list, id) {
	flickrLists[id] = list;
	var holder = document.getElementById(id);
	var img = document.createElement('img');
	holder.appendChild(img);
	var title = document.createElement('div');
	title.className = 'flickr_mini_title';
	title.id = id + '_mini_title';
	holder.appendChild(title);

	img.setAttribute('nextimg', 0);
	img.setAttribute('timerstate', 1);

	var changeFunc = function () {
		if (img.getAttribute('timerstate') == 0) return;
		var n = img.getAttribute('nextimg');
		if (!list[n]) n = 0;
		img.src = list[n].url;
		title.innerHTML = list[n].title;
		n++;
		img.setAttribute('nextimg', n);
	};
	changeFunc();
	setInterval(changeFunc, 5000);
}

function flickrPauseToggle(id) {
	var holder = document.getElementById(id);
	var img = holder.firstChild;
	if (img.getAttribute('timerstate') == 0) {
		img.setAttribute('timerstate', 1);
	} else {
		img.setAttribute('timerstate', 0);
	}
}

function flickrPrev(id) {
	var holder = document.getElementById(id);
	var img = holder.firstChild;
	var n = img.getAttribute('nextimg');
	if (n > 1) {
		n = n - 2;
	} else {
		n = flickrLists[id].length - 1;
	}
	img.src = flickrLists[id][n].url;
	var title = document.getElementById(id + '_mini_title');
	title.innerHTML = flickrLists[id][n].title;
	n++;
	img.setAttribute('nextimg', n);
}

function flickrNext(id) {
	var holder = document.getElementById(id);
	var img = holder.firstChild;
	var n = img.getAttribute('nextimg');
	if (!flickrLists[id][n]) n = 0;
	img.src = flickrLists[id][n].url;
	var title = document.getElementById(id + '_mini_title');
	title.innerHTML = flickrLists[id][n].title;
	n++;
	img.setAttribute('nextimg', n);
}

function flickrEnlarge(id) {
	var cover = isis.screenCover();
	cover.setColour('#FFFFFF');
	var holder = document.createElement('div');

	holder.className = 'flickrPopup';
	holder.style.position = 'absolute';
	isis.fx(holder).opacity(0);
	document.body.appendChild(holder);

	var popupbody = document.createElement('div');
	popupbody.className = 'flickrPopupBody';
	holder.appendChild(popupbody);


	var title = document.createElement('div');
	title.id = id + '_title';
	title.className = 'flickrTitle';
	popupbody.appendChild(title);



	$close = $('<i class="icon-zoom-out icon-2x"></i>');
	$close.css('float', 'right');
	$close.css('cursor', 'pointer');

	$(popupbody).append($close);
	$close.on('click', function () {
		isis.fx(holder, {
			'finishedCallback': function () {
				if (holder.parentNode) holder.parentNode.removeChild(holder);
			}
		}).tween("opacity:0");
		cover.distroy();
	});

	var closet = document.createElement('img');
	closet.src = '/images/common/flikr/flickr-c.png';
	closet.style.cssFloat = 'right';
	closet.style.styleFloat = 'right';
	popupbody.appendChild(closet);

	var stage = document.createElement('div');
	stage.className = 'flickrStage';
	popupbody.appendChild(stage);

	var canvas = document.createElement('div');
	canvas.className = 'flickrCanvas';
	canvas.id = id + '_canvas';
	stage.appendChild(canvas);


	var thumbs = document.createElement('div');
	thumbs.className = 'flickrThumbs';
	stage.appendChild(thumbs);


	for (var i = 0; i < flickrLists[id].length; i++) {
		var img = document.createElement('img');
		img.src = flickrLists[id][i].small;
		thumbs.appendChild(img);
		var img_n = i;
		img.setAttribute('img_n', i);
		img.setAttribute('set_id', id);
		isis.addEventHandler(img, 'click', function (e) {
			if (!e.currentTarget) e.currentTarget = e.srcElement;
			showFlickrImage(e.currentTarget);
		});
	}


	var footer = document.createElement('div');
	footer.className = 'flickrFooter';
	stage.appendChild(footer);

	var logo = document.createElement('img');
	logo.src = '/images/common/flikr/flickr.png';
	logo.style.marginTop = '15px';
	logo.style.cssFloat = 'right';
	logo.style.styleFloat = 'right';
	footer.appendChild(logo);

	holder.style.top = (isis.getScrollTop() + (isis.getClientHeight() - holder.offsetHeight) / 2) + 'px';
	holder.style.left = (isis.getScrollLeft() + (isis.getClientWidth() - holder.offsetWidth) / 2) + 'px';


	isis.addEventHandler(cover.holder, 'click', function (e) {
		isis.fx(holder, {
			'finishedCallback': function () {
				if (holder.parentNode) holder.parentNode.removeChild(holder);
			}
		}).tween("opacity:0");
		cover.distroy();
	});

	var h = document.getElementById(id);
	var img = h.firstChild;
	var n = img.getAttribute('nextimg');
	n--;
	if (!flickrLists[id][n]) n = 0;
	_showFlickrImage(id, n);

	cover.show();
	isis.fx(holder).tween("opacity:1");

}

function _showFlickrImage(id, img_n) {
	var canvas = document.getElementById(id + '_canvas');
	var title = document.getElementById(id + '_title');

	while (canvas.firstChild) canvas.removeChild(canvas.firstChild);
	var img = document.createElement('img');
	img.src = flickrLists[id][img_n].large;
	img.style.border = '1px solid #a1a1a1';
	canvas.appendChild(img);
	canvas.appendChild(document.createElement('br'));
	var desc = document.createElement('div');
	desc.innerHTML = flickrLists[id][img_n].desc;
	canvas.appendChild(desc);

	title.innerHTML = flickrLists[id][img_n].title;

}

function showFlickrImage(img) {
	var img_n = img.getAttribute('img_n');
	var id = img.getAttribute('set_id');
	_showFlickrImage(id, img_n);
}

function getFormatClassFromName(name) {
	name = name.toLowerCase();
	switch (name) {
		case 'book': return "am-book-format";
		case 'dvd': return "am-dvd-format";
		case 'video': return "am-video-format";
		case 'ebook': return "am-ebook-format";
		case 'audiobook': return "am-audiobook-format";
		default: return "";
	}
}
function getIconClassFromName(name) {
	name = name.toLowerCase();
	switch (name) {
		case 'book': return "cover-book-format";
		case 'dvd': return "cover-dvd-format";
		case 'video': return "cover-video-format";
		case 'ebook': return "cover-ebook-format";
		case 'audiobook': return "cover-audiobook-format";
		default: return "";
	}
}

function coverLoaded(img) {
	if (img.clientWidth == 1) {
		$(img).attr('src', '/images/item-placeholder-back.png');
	}
}

function polarisReserve(book_id) {
	var client = $('meta[name=client]').attr('content');
	var login = readCookie('loginData');
	if (login) {
		login = $.parseJSON(decodeURIComponent(login));

	} else {

	}
}
function editRegistration() {

}
$.fn.amEditReg = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		if (!self.data('amEditReg')) {
			self.data('amEditReg', true);
			self.options = $.extend({}, $.fn.amEditReg.defaults, options);
			self.element = el;
			self.$element = $(el);
			self.apiServer = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
			self.keyword = $('meta[name=client]').attr('content');
			self.guests = [];
			self.master_id = $(this).closest('.row').prev('.ammev-reservation').attr('data-id');

			self.$element.on('click', function (event) {
				event.preventDefault();
				self.master_id = $(this).closest('.row').prev('.ammev-reservation').attr('data-id');
				$.getJSON('/myevents', { masterid: self.master_id, ref: self.options.ref, action: 'list' }, function (json, textStatus) {
					self.initialGuestsCount = json.length;
					self.guests = json;
					var popup = $('<div class="events2-reg-popup"></div>').amPopup({ title: 'Guest registrations' });
					var stage = $('<div class="events2-reg-stage"></div>').appendTo(popup);
					var footer = $('<div class="events2-reg-footer"></div>').appendTo(popup);
					var button = $('<button class="btn btn-primary"></button>').text('save').on('click', function (event) {
						event.preventDefault();
						$.getJSON('/myevents', { masterid: self.master_id, ref: self.options.ref, action: 'save', guests: JSON.stringify(self.guests) }, function (json, textStatus) {
							console.log(json);
							if (json.status == 'ok') {
								popup.data('plugin_amPopup').close();
								var url = '/myevents?reference=' + self.options.ref;
								if (self.options.lastName && self.options.lastName.length > 0) url += '&last_name=' + self.options.lastName;
								window.location.href = url;
							} else {
								alert(json.message);
							}
						});
					}).appendTo(footer);

					var row = $('<div class="row"></div>').appendTo(stage);
					var left = $('<div class="col-sm-6"></div>').appendTo(row);
					self.right = $('<div class="col-sm-6"></div>').appendTo(row);
					$('<div></div>').text('Guest registrants').appendTo(self.right);
					$('<ul class="events2-more-people-list"></ul>').appendTo(self.right);

					var person = $('<div class="form-horizontal">');
					var firstName = $('<div class="form-group">' +
						'<label for="first_name" class="col-sm-5 control-label">First name <span class="required-field"></span></label>' +
						'<div class="col-sm-7">' +
						'<input type="email" class="form-control" id="first_name">' +
						'</div>' +
						'</div>');

					var lastName = $('<div class="form-group">' +
						'<label for="last_name" class="col-sm-5 control-label">Last name</label>' +
						'<div class="col-sm-7">' +
						'<input type="email" class="form-control" id="last_name">' +
						'</div>' +
						'</div>');

					var ageSelect = $('<div class="form-group">' +
						'<label for="age" class="col-sm-5 control-label">Age <span class="required-field"></span></label>' +
						'<div class="col-sm-7">' +
						'<select class="form-control" id="age">' +
						'</select>' +
						'</div>');

					var add = $('<div class="ammev-add-guest"><button class="btn btn-info">add</button></div>');
					person.append(firstName).append(lastName);
					if (+self.options.enableAgeGroups === 1) {
						person.append(ageSelect);
					}
					person.append(add);
					if (+self.options.enableBilling === 0 && +self.options.enableMultipleTypes === 0) {
						$('<div></div>').text('Add a guest').appendTo(left);
						person.appendTo(left);
					}

					$.getJSON(self.apiServer + '/v1/' + self.keyword + '/eventsages', { type: 'singular' }, function (json, textStatus) {
						$select = $('#age', left).empty().append('<option value="">Select age group</option>');
						$.each(json, function (index, val) {
							$('<option>' + val.name + '</option>').appendTo($select);
						});

					});


					popup.on('click', '.events2-more-people-list .btn', function (event) {
						event.preventDefault();
						var gi = $(this).closest('li').index();
						self.guests.splice(gi, 1);

						if (typeof self.tickets !== 'undefined') {
							for (var t = 0; t < self.tickets.length; t++) {
								if (self.tickets[t].id === 'g' + gi) {
									var removed = self.tickets.splice(t, 1);
									// We need to update the available counts in ticketInfo
									updateTicketData(removed, self.details.ticketInfo, self.enableBilling, self.details.recurring_id, self.screens.regForm, 1, 'add');
									refreshTicketList();
									break;
								}
							}
						}

						renderList();
					}).on('click', '.ammev-add-guest .btn', function (event) {
						event.preventDefault();

						//max guests is incorrectly named, this should include the user that registered for the event
						//in the control panel maxGuests is named 'Limit seats per registration'
						//booking specific seat limit
						var booking_registrationSeatCount = (/* the patron that registered */ 1) + self.guests.length;
						var booking_maxRegistrationSeatLimit = parseInt(self.options.maxGuests, 10);

						//Total registrants is not accurate once guests have been added or removed in this booking
						var total_currentEventRegistrants = parseInt(self.options.totalRegistrants, 10) - self.initialGuestsCount + self.guests.length;
						var total_maxEventAttendees = parseInt(self.options.maxAttendee, 10);

						//seats available to the patron for booking
						var booking_availableSeats = booking_maxRegistrationSeatLimit - booking_registrationSeatCount;
						var total_availableSeatsForEvent = total_maxEventAttendees - total_currentEventRegistrants;

						if (total_availableSeatsForEvent < 1) {
							var n = total_maxEventAttendees - total_currentEventRegistrants;
							switch (n) {
								case 0:
									alert('Sorry there are no seats left for this event. You cannot add any more registrants.');
									break;
								case 1:
									alert('Sorry there is only 1 seat left for this event. You cannot add any more registrants.');
									break;
								default:
									alert('Sorry there are only ' + n + ' seats left for this event. You cannot add any more registrants.');
									break;
							}
							return;
						}

						if (booking_maxRegistrationSeatLimit > 0 && booking_availableSeats < 1) {
							alert('Sorry, we were unable to add this guest. There is a limit of ' + booking_maxRegistrationSeatLimit + ' seats per registration for this event.');
							return;
						}

						var age = (+self.options.enableAgeGroups === 1) ? $('#age', person).val() : '';
						var first_name = $('#first_name', person).val();
						var last_name = $('#last_name', person).val();
						var ticketName = '';
						var ticketType = 0;

						if (typeof details !== 'undefined' && details.ticketInfo) {
							ticketType = parseInt($('#ticket-dd', person).attr('data-typeid'));
							ticketName = $('#ticket-dd :selected', person).text();
							ticketCost = parseFloat($('#ticket-dd > option:selected', person).attr('data-cost'));
						}

						if (first_name.length > 0) {
							var guestData = { first_name: first_name, last_name: last_name, age: age };
							if (ticketType > 0) {
								guestData.ticketType = ticketType;
								guestData.ticketName = ticketName;
								guestData.ticketCost = ticketCost;
								self.tickets.push({ cost: ticketCost, type: ticketType, name: ticketName, id: 'guest-' + self.guests.length });
							}

							self.guests.push(guestData);
							$('#age', person).val('');
							$('#first_name', person).val('');
							$('#last_name', person).val('');
							renderList();
						} else {
							footer.find('.events2-error-message').text('Please enter information for all required fields').fadeIn().delay(3000).fadeOut();
							if (first_name.length === 0) $('#first_name', person).addClass("hightlight-field").delay(3000).queue(function () {
								$(this).removeClass("hightlight-field").dequeue();
							});
							if (age.length === 0) $('#age', person).addClass("hightlight-field").delay(3000).queue(function () {
								$(this).removeClass("hightlight-field").dequeue();
							});
						}
					});
					renderList();
					popup.data('plugin_amPopup').open();

				});
			});
			function renderList() {
				var list = $('.events2-more-people-list', self.right).empty();

				$.each(self.guests, function (index, val) {
					var guestLine = $('<li />');
					var gBtn = $('<div class="btn btn-default"><i class="fa fa-times"></i></div>');
					var gAge = $('<div><i>' + val.age + '</i></div>');
					var gTicket = '';

					if (+self.options.enableBilling === 1 || +self.options.enableMultipleTypes === 1) {
						guestLine.append(val.first_name + ' ' + val.last_name);
					} else {
						guestLine.append(gBtn).append(val.first_name + ' ' + val.last_name);
					}


					if ((typeof self.eventSettings !== 'undefined' && self.eventSettings.events_age_enabled) || val.age !== '') {
						guestLine.append(gAge);
					}

					if (val.ticketType) {
						gTicket = $('<div><i class="fa fa-ticket"></i>&nbsp;&nbsp;<i>' + val.ticketType + '</i></div>');
						guestLine.append(gTicket);
					}

					guestLine.appendTo(list);
				});
			}

		}
	});
	return this;
};

function polarisFindACopy(book_id, lat, lng) {
	var client = $('meta[name=client]').attr('content');
	var apiserver = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';

	$.get(apiserver + '/v1/' + client + '/polaris/bibgetholdings/' + book_id, function (data) {
		if (data.result === 'ok' && data.data.BibHoldingsGetRows.length > 0) {
			var $data = $('<div class="fluid-container"/>');
			var $row = $('<div class="row"/>').appendTo($data);
			$('<div class="fc-details polaris-book col-sm-12"/>').appendTo($row);
			$('<div class="fc-map col-sm-6"/>').append('<div id="map-canvas" class="copies-map"></div>').appendTo($row);
			$('<div class="fc-list col-sm-6"/>').append('<h4>Available in these branches now</h4>').appendTo($row);
			var $table = $('<table class="polaris-copies-table"/>').appendTo($('.fc-list', $data));

			// $('div[data-book='+book_id+']').clone().appendTo($('.fc-details', $data));
			// $('.find-button', $data).remove();
			// $('.summary', $data).remove();

			var mapOptions = {
				center: new google.maps.LatLng(lat, lng),
				zoom: 9
			};
			var $popupwidget = showPopupWidget('Find a copy', $data);

			$.get(apiserver + '/v1/' + client + '/polaris/bibget/' + book_id, function (data) {
				if (data.result === 'ok') {
					var itemdetails = {};
					$.each(data.data.BibGetRows, function (index, val) {
						itemdetails[val.Label.trim().slice(0, -1)] = val.Value.trim();
					});
					if (itemdetails['ISBN'] && itemdetails['ISBN'].length > 0) {
						itemdetails['ISBN'] = itemdetails['ISBN'].match(/\d+/)[0];
						$('<div class="cover"><img class="polaris-list-image" onload="coverLoaded(this)" src="http://www.syndetics.com/index.aspx?isbn=' + itemdetails['ISBN'] + '/SC.GIF&amp;client=monpolusg"></div>').appendTo($('.fc-details', $data));
					} else {
						$('<div class="cover"><img class="polaris-list-image" src="http://placehold.it/75x100"></div>').appendTo($('.fc-details', $data));
					}
					var $info = $('<div class="clearfix"></div>').appendTo($('.fc-details', $data));
					$('<div class="title headingtext">' + itemdetails['Title'] + '</div>').appendTo($info);
					$('<div class="author"><span class="polaris-profile-title">By</span> ' + itemdetails['Author'] + '</div>').appendTo($info);
					$('<div class="publisher"><span class="polaris-profile-title">Publisher, date</span> ' + itemdetails['Publisher, Date'] + '</div>').appendTo($info);
					var formatClass = getFormatClassFromName(itemdetails['Format']);
					$('<div class="format"><span class="polaris-profile-title">Format</span> <i class="' + formatClass + '"></i> ' + itemdetails['Format'] + '</div>').appendTo($info);

					var $btns = $('<div class="book-buttons"></div>').appendTo($('.fc-details', $data));
					$('<button class="button" disabled="disabled">Reserve</button>').appendTo($btns);
					$('<span class="polaris-profile-title">&nbsp; ' + itemdetails['System Items Available'] + ' of ' + itemdetails['System Availability'] + ' available</span>').appendTo($btns);
				}
			});

			setTimeout(function () {
				var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
				var done = [];
				$.each(data.data.BibHoldingsGetRows, function (index, val) {
					if (done.indexOf(val.LocationID) === -1) {
						done.push(val.LocationID);
						if (val.ItemsIn > 0) {
							$table.append('<tr><td><a target="_blank" class="location-link">' + val.LocationName + '</a></td><td class="polaris-copies-total">' + val.ItemsIn + ' of ' + val.ItemsTotal + '</td></tr>');
						}
						if (val.location && val.ItemsIn > 0) {
							var position = new google.maps.LatLng(val.location.lat, val.location.lon);

							var marker = new google.maps.Marker({
								position: position,
								map: map,
								title: val.LocationName
							});

							var iw = new google.maps.InfoWindow({
								content: val.LocationName + ', ' + val.ItemsIn + ' available',
								maxWidth: 300
							});
							google.maps.event.addListener(marker, 'mouseover', function () {
								iw.open(map, this);
							});

							google.maps.event.addListener(marker, 'mouseout', function () {
								iw.close();
							});
						}
						$.get(apiserver + '/v1/' + client + '/locations', function (data) {
							var locations = {};
							$.each(data, function (index, val) {
								locations[val.evanced_name] = val;
							});
							$('.location-link', $table).each(function () {
								$(this).attr('href', locations[$(this).text()].about_url);
							});
						});

					}
				});

			}, 500);

		} else {
			alert('Sorry this item is currently unavailable');
		}
	});
}
$.fn.amSearchBox = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		if (!self.data('amSearchBox')) {
			self.data('amSearchBox', true);
			self.options = $.extend({}, $.fn.amSearchBox.defaults, options);
			self.element = el;
			self.$element = $(el);
			var showText = function (target, message, index, interval) {
				if (index < message.length) {
					$(target).append(message[index++]);
					setTimeout(function () { showText(target, message, index, interval); }, interval);
				}
			}
		}
	});
	return this;
};
$.fn.amAdvancedSlideshow = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		if (!self.data('amAdvancedSlideshow')) {
			self.data('amAdvancedSlideshow', true);
			self.options = $.extend({}, $.fn.amAdvancedSlideshow.defaults, options);
			self.element = el;
			self.$element = $(el);
			self.$element.find('[data-style]').each(function (index, el) {
				$(this).css($.parseJSON($(this).attr('data-style')));
			});
			$('.advanced-slideshow', self.element).show().cycle();
		}
	});
	return this;
};

$.fn.amEVWidget = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		if (!self.data('amEVWidget')) {
			self.data('amEVWidget', true);
			self.options = $.extend({}, $.fn.amEVWidget.defaults, options);
			self.element = el;
			self.$element = $(el);
			self.locationID = self.$element.attr('data-location-id');
			self.locationName = self.$element.attr('data-location-name');
			self.fullWidth = parseInt(self.$element.attr('data-full-width'), 10);
			self.popupAll = parseInt(self.$element.attr('data-popup-all'), 10);
			self.eventType = self.$element.attr('data-type');
			self.eventType = self.$element.attr('data-type');
			self.portal = self.$element.attr('data-portal');
			self.private = self.$element.attr('data-private');
			self.includePrivate = self.$element.attr('data-include-private');
			self.featured = self.$element.attr('data-featured');
			self.tags = $.parseJSON(self.$element.attr('data-tags')) || [];
			self.ages = $.parseJSON(self.$element.attr('data-ages')) || [];
			self.searchTags = $.parseJSON(self.$element.attr('data-search-tags')) || [];

			var size = 5;
			var c = self.$element.closest("div[class*='col-']").attr('class');
			if (c) {
				size = parseInt(c.match(/col-[\w]*-[0-9]*/g)[0].match(/(\d+)/g)[0], 10);
			}
			self.$element.addClass('row');
			var $cRow = $('<div class="amev-cal-row"></div>').appendTo(self.element);
			if (size >= 4 && self.fullWidth === 0) {
				self._display = $('<div class="amev-cal-date col-sm-6 linkcolour"></div>').appendTo($cRow);
				$('<div class="col-sm-6"><div class="amev-cal-inline"></div></div>').appendTo($cRow);
			} else {
				self._display = $('<div class="amev-cal-date col-sm-12 linkcolour"></div>').appendTo($cRow);
				$('<div class="col-sm-12"><div class="amev-cal-inline"></div></div>').appendTo($cRow);
			}
			$('<div class="amev-cal-date-title">Events</div>').appendTo(self._display);

			var $lRow = $('<div class="amev-list-row"></div>').appendTo(self.element);
			self._list = $('<div class="amev-event-list col-sm-12"></div>').appendTo($lRow);

			self._date = $('<div class="amev-date headingtext"></div>').appendTo(self._display);
			if (self.locationID) {
				$('<div class="amev-location"></div>').text(self.locationName).appendTo(self._display);
			}
			if (self.popupAll === 1) {
				$("<div default='all' data-type='" + self.eventType + "' class='amev-all-events-link eeeventall eeventlink link col-sm-12'>See all events</div>").appendTo(self.element);
			} else {
				$("<div class='amev-all-events-link'><a href='/events'>See all events</a></div>").appendTo(self.element);
			}

			function updateCalendar(date) {
				var m = moment(date);
				self._date.text(m.format('MMM DD'));
				self._list.empty().append('<div class="amev-message">Loading...</div>');
				var req = { date: date };
				if (self.locationID) {
					req.locations = [self.locationID];
				}
				req.types = self.tags || false;
				req.groups = self.ages || false;
				req.searchTags = self.searchTags || false;
				req.includePrivate = self.includePrivate || false;
				req.private = self.private || false;
				req.featured = self.featured || false;

				$.getJSON('/eeventcaldata', { event_type: self.eventType, req: JSON.stringify(req) }, function (json, textStatus) {
					if (json.length > 0) {
						self._list.empty();
						$.each(json, function (index, val) {
							createEvent(val).appendTo(self._list);
						});
					} else {
						if (self.locationID) {
							self._list.empty().append('<div class="amev-message">' + self.locationName + ' has no events for this day</div>');
						} else {
							self._list.empty().append('<div class="amev-message">No events for this day</div>');
						}
						if (self.popupAll === 1) {
							self._list.append('<div default="all" data-type="' + self.eventType + '" class="linkcolour amev-all-branches"><i class="am-events"></i><span>Check for events at our other branches</div>');
						} else {
							$("<div class='amev-all-branches'><a href='/" + self.portal + "/events'><i class='am-events'></i><span>Check for events at our other branches</a></div>").appendTo(self._list);
						}
					}
				});
			}
			self.cal = rome($('.amev-cal-inline', self)[0], {
				appendTo: 'parent',
				dayFormat: 'D',
				styles: { container: 'amev-cal-container widgetbg' },
				time: false
			}).on('ready', function (value) {
				$('.rd-back', self.element).attr('title', 'Previous month');
				$('.rd-next', self.element).attr('title', 'Next month');
				$('.rd-back', self.element).html('<span class="sr-only">Previous month</span>');
				$('.rd-next', self.element).html('<span class="sr-only">Next month</span>');
			}).on('data', function (value) {
				$('.rd-back', self.element).attr('title', 'Previous month');
				$('.rd-next', self.element).attr('title', 'Next month');
				$('.rd-back', self.element).html('<span class="sr-only">Previous month</span>');
				$('.rd-next', self.element).html('<span class="sr-only">Next month</span>');
				updateCalendar(value);
			});
			self.$element.on('click', '.amev-all-branches', function (event) {
				event.preventDefault();
				var $me = $(this);
				if ($me.attr('open') == 'yes') return;
				eEventPopup(this);
				return false;
			});


			updateCalendar(moment().format('YYYY-MM-DD'));

			function createEvent(data) {
				// console.log(data);
				var $e = $('<div class="amev-event"></div>');

				// #1408CH, #3346
				// Proper fix for event widget showing cancellations - rather than deleting them.

				if (data.changed == 3) {
					$e.addClass('amev-event-postponed');
				}
				if (data.changed == 3 || data.changed == 2) {
					$e.append($('<div class="eelist-changed-message">Rescheduled</div>'));
				} else if (data.changed == 1) {
					$e.addClass('amev-event-canceled');
					$e.append($('<div class="eelist-changed-message">Cancelled</div>'));
				}

				if (data.link) {
					var link = $('<a target="_top" href="' + data.link + '"> ' + $('<div></div>').html(data.title).text() + '</a>');
				} else {
					var link = $('<a target="_top" href="/' + self.portal + '/event/' + data.id + '"> ' + data.title + '</a>');
				}

				if (data.sub_title) {
					link.append('<span> - ' + data.sub_title + '</span>');
				}

				$('<div class="amev-event-title"></div>').append(link).appendTo($e);

				$('<div class="amev-event-time headingtext">' + data.time_string + '</div>').appendTo($e);
				if (!self.locationID) {
					$('<div class="amev-event-location headingtext"><i class="am-locations"></i>' + data.location + '</div>').appendTo($e);
				}
				if (data.ages) {
					$('<div class="amev-event-ages headingtext"><b>AGE GROUP: </b>' + data.ages + '</div>').appendTo($e);
				}
				$('<div class="amev-event-description"></div>').html(data.description).appendTo($e);
				$('<hr>').appendTo($e);
				return $e;
			}
		}
	});
	return this;
};

(function ($, window, document, undefined) {
	var pluginName = "amPopup",
		defaults = {
			title: '',
			popUpClass: '',
			showTitle: true
		};
	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.refreshOnClose = false;
		this.init();
	}

	$.extend(Plugin.prototype, {
		init: function () {
			var self = this;

			self.cover = $('<div class="amPopupCover"></div>').appendTo('body');

			var popupwrapper = (window.popupwrapper || '');
			if ('' != popupwrapper) {
				self.cover.wrap('<div class="' + popupwrapper + '"></div>')
			}

			self.popUp = $('<div role="dialog" aria-modal="true" class="amPopup"></div>').addClass(self.settings.popUpClass).appendTo('body').hide();
			if ('' != popupwrapper) {
				self.popUp.wrap('<div class="' + popupwrapper + '"></div>')
			}

			if (self.settings.width) {
				self.popUp.css('width', self.settings.width);
			}
			if (self.settings.showTitle) {
				self.titleBar = $('<div class="amPopupTitleBar"></div>').appendTo(self.popUp);
				$('<button aria-label="close dialog" class="btn btn-default pull-right">&nbsp;<i class="fa fa-times"></i>&nbsp;</button>').appendTo(self.titleBar).on('click', function (event) {
					event.preventDefault();
					self.close();
				});
			}
			if (self.settings.title) {
				$('<span class="amPopupTitle"></span>').text(self.settings.title).appendTo(self.titleBar);
				self.popUp.attr('aria-label', self.settings.title);
			}

			self.content = $('<div class="amPopupContent"></div>').appendTo(self.popUp);

		},
		setupTabTrap: function () {
			var self = this;
			var focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
			var $modal = $(self.popUp);

			var focusableContent = $modal
				.find('.screen:visible,.events2-reg-footer,.amPopupTitleBar')
				.find(focusableElements)
				.filter(':visible');

			var firstFocusableElement = focusableContent[0]; // get first element to be focused inside modal
			var lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

			document.addEventListener('keydown', function (e) {

				var isTabPressed = e.key === 'Tab' || e.keyCode === 9;

				if (!isTabPressed) {
					return;
				}

				if (e.shiftKey) { // if shift key pressed for shift + tab combination
					if (document.activeElement === firstFocusableElement) {
						lastFocusableElement.focus(); // add focus for the last focusable element
						e.preventDefault();
					}
				} else { // if tab key is pressed
					if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
						firstFocusableElement.focus(); // add focus for the first focusable element
						e.preventDefault();
					}
				}
			});

			if (firstFocusableElement) { firstFocusableElement.focus(); }
		},
		open: function (refreshOnClose) {
			var self = this;
			self.$element.appendTo(self.content);
			self._position();

			if (typeof refreshOnClose === 'undefined') {
				refreshOnClose = false;
			}

			self.refreshOnClose = refreshOnClose;
			// #2661 - Colin K.
			// Fix for popover issue
			// Essentially just hide all quick tips on 'click mouseleave'
			if ($('.qtip').length > 0) {
				$('.qtip').qtip('api').hide();
			}

			self.popUp.show();
			self.setupTabTrap();
		},
		close: function () {
			var self = this;

			self.popUp.remove();
			self.cover.remove();
			$('.eventRegButton').prop('disabled', false);

			if (self.refreshOnClose) {
				location.reload(true);
			}
		},
		_position: function () {
			var self = this;
			// self.popUp.position({
			// 	of: $(window)
			// });
			if (self.popUp.height() + 300 > $(window).height()) {
				var pos = ($(window).height() - self.popUp.height()) / 2;
				self.popUp.css('top', $(window).scrollTop() + (pos > 0 ? pos : 0) + 'px');
			} else {
				self.popUp.css('top', $(window).scrollTop() + 300 + 'px');
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

/***********************************start regButton*******************************************/

$.fn.regButton = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		$.extend(true, self, $.fn['amShared']);

		if (!self.data('regButton')) {
			self.data('regButton', true);
			self.apiServer = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
			self.keyword = $('meta[name=client]').attr('content');
			self.options = $.extend({}, $.fn.regButton.defaults, options);
			self.eventid = $(this).attr('data-eventid');
			self.regtype = parseInt($(this).attr('data-regtype'), 10);
			self.recurringid = $(this).attr('data-recurringid');
			self.attendanceType = $(this).attr('data-attendancetype');
			self.registration = null;
			self.popup = false;
			self.extraDates = [];
			self.extraDatesFutureOpenReg = [];
			self.stage = '';
			self.footer = '';
			self.details = null;
			self.eventSettings = null;
			self.tickets = [];
			self.showPayment = false;
			self.showOffline = true;
			self.ticketTotal = 0.00;
			self.screens = {};
			self.guests = [];
			self.screenPos = 1;
			self.isOffline = false;
			self.backButton = null;
			self.regBtn = null;
			self.eventDetails = null;
			self.enableBilling = false;
			self.enableMultipleTypes = false;
			self.selectedDates = [];
			self.disableGuestDetails = 0;
			self.availablePaymentTypes = [];
			self.bookingPaymentType = 'card';
			self.ppTestMode = $(this).attr('data-testmode');
			self.mayOptForWaitlist = false;
			self.excessGuests = 0;
			try {
				self.PayPalPayFlow = new PayPalPayFlow('S', $(this).attr('data-testmode'), $("meta[name='client']").attr('content'));
			} catch (e) {
				self.PayPalPayFlow = null;
			}

			self.on('click', function (event) {
				event.preventDefault();
				self.prop('disabled', true);
				if (typeof event.originalEvent == "undefined") {
					// This window was called via script, not a human button-press
					self.attendanceType = 'UNKNOWN';
				};
				if (inIframe()) {
					window.parent.location.href = '/event/' + self.eventid + '?registration=true';
				} else {
					$.getJSON(self.apiServer + '/v1/' + self.keyword + '/eventsettings', function (json) {
						self.eventSettings = json;
						openPopup();
					});
				}
			});
		}
		function inIframe() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		}

		function hideScreens() {
			var screenCnt = Object.keys(self.screens).length;
			if (screenCnt > 0) {
				for (var screen in self.screens) {
					self.screens[screen].hide();
				}
			}
		}

		function checkPayment(payData) {

			if (!self._isFormClean($('#reg-screen3'))) {
				$('.amnp-error-message', self.screens.paymentScreen).text('Please enter information for all required fields').fadeIn().delay(6000).fadeOut();
				updateButtonLoading(false);
				return;
			}

			if (!$.payment.validateCardNumber(payData.card_number)) {
				$('.amnp-error-message', self.screens.paymentScreen).text('Invalid card number').fadeIn().delay(6000).fadeOut();
				updateButtonLoading(false);
				return;
			}

			if (!$.payment.validateCardExpiry(payData.expiration.month, payData.expiration.year)) {
				$('.amnp-error-message', self.screens.paymentScreen).text('Invalid expiration date').fadeIn().delay(6000).fadeOut();
				updateButtonLoading(false);
				return;
			}
			if (!$.payment.validateCardCVC(payData.cvc)) {
				$('.amnp-error-message', self.screens.paymentScreen).text('Invalid cvc').fadeIn().delay(6000).fadeOut();
				updateButtonLoading(false);
				return;
			}

			return true;
		}

		function saveRegistration(payData) {
			if (payData != undefined) {
				if (!self.eventSettings.payment_new_method) {
					self.registration.payment = payData;
				} else {
					// PayFlow, do NOT send card details to the backend!
					self.registration.payment = { mode: 'card' };
				}
			}
			if (self.registration.payment) {
				self.registration.markBookingAsPending = self.eventSettings.payment_new_method;
			}

			if (self.enableMultipleTypes || self.enableBilling) self.registration.tickets = self.tickets;
			if (self.disableGuestDetails === 1) {
				self.registration.guests = self.guests;
			}

			self.registration.booking_source = 'WEB_V1';

			$.post(self.apiServer + '/v2/registration', { data: JSON.stringify(self.registration) }, function (json, textStatus) {
				if (json.result == 'error') {
					$('.events2-error-message').text(json.data).fadeIn().delay(3000).fadeOut();
					var thanksPopupStage = $('<div class="events2-reg-person-popup">' +
						'<div class="events2-reg-thanks-stage">' +
						'<div class="events2-reg-thanks-title">Unable to register for event.</div>' +
						'<div class="events2-reg-thanks-head">' +
						'<div class="events2-reg-thanks-evtitle">' + self.details.title + '</div>' +
						'<div class="events2-reg-thanks-evlocation"><i class="fa fa-map-marker"></i>&nbsp;' + self.details.location + '</div>' +
						'</div>' +
						'<div class="events2-reg-thanks-online">' +
						'<div class="events2-reg-thanks-online-title">Error message:</div>' +
						'<div>' + json.data + '</div>' +
						'<div>You can view and register for other events at:</div>' +
						'<div><a href="/events">' + (window.websiteUrl || window.location.hostname) + '/events</a></div>' +
						'</div>' +
						'</div>' +
						'</div>');
					updateButtonLoading(false);
					thanksPopupStage.appendTo(self.screens.thanksScreen);
				} else {
					// Label for additional dates.
					self.registration = json;

					if (payData != undefined) {
						if (self.eventSettings.payment_new_method) {
							// Start the processing animation, we have everything we want
							self.PayPalPayFlow.showProcessingAnimation(self.screens.thanksScreen);
							updateButtonLoading(false);
							screenNav('thanksScreen');

							self.ticketTotal = 0.00;
							for (var t = 0; t < self.tickets.length; t++) {
								var tkt = self.tickets[t];
								self.ticketTotal += parseFloat(tkt.cost);
							}

							/* the value of CURRENCY seems to be ignored by paypal, we might want to remove the parameter */
							var transactionData = {
								'AMT': self.ticketTotal.toFixed(2) * (self.selectedDates.length + 1),
								'CVV2': payData.cvc,
								'EXPDATE': ("0" + payData.expiration.month.toString() + payData.expiration.year.toString().substr(2)).slice(-4),
								'ACCT': payData.card_number.replace(/ /g, ''),
								'BILLTOFIRSTNAME': payData.first_name,
								'BILLTOLASTNAME': payData.last_name,
								'EMAIL': payData.email,
								'CURRENCY': self.eventSettings.payment_currency
							};

							$.post((window.websiteUrl || "") + '/events', { registrationCache: { registrations: json.registrations, registrationId: json.registrationId, extraDates: self.extraDates, master: json.master, ref: json.ref, details: self.details, tickets: json.tickets } }, function (session) {
								if (session.id) {
									self.PayPalPayFlow.sendEventTransaction(transactionData, session.id, false, false, false);
								}
								return;
							}, 'json');
						} else {
							// If not new method then payment has already occurred.
							var thanksPopupStage = '';
							if (json.registrations.length > 0) {
								// #3620, 4651, CH#575 - CK
								// Fix to display all waitlist registered events
								// Additional sorting going on so that we can build two lists if we registered and waitlisted.

								// No need to repeat the drawing code anymore, just use the event summary to get the HTML
								if (self.PayPalPayFlow === null) {
									self.PayPalPayFlow = new PayPalPayFlow('', self.ppTestMode, $("meta[name='client']").attr('content'));
								}

								var registrationData = { registrations: json.registrations, extraDates: self.extraDates, master: json.master, ref: json.ref, details: self.details };
								thanksPopupStage = self.PayPalPayFlow.showEventSummary(registrationData)
							}

							thanksPopupStage.appendTo(self.screens.thanksScreen);
							updateButtonLoading(false);
							screenNav('thanksScreen');
						}
					} else {
						// If paydata is null, then behave as normal...
						var thanksPopupStage = '';
						if (json.registrations.length > 0) {
							// #3620, 4651, CH#575 - CK
							// Fix to display all waitlist registered events
							// Additional sorting going on so that we can build two lists if we registered and waitlisted.

							// No need to repeat the drawing code anymore, just use the event summary to get the HTML
							if (self.PayPalPayFlow === null) {
								self.PayPalPayFlow = new PayPalPayFlow('', self.ppTestMode, $("meta[name='client']").attr('content'));
							}

							var registrationData = { registrations: json.registrations, extraDates: self.extraDates, master: json.master, ref: json.ref, details: self.details };
							thanksPopupStage = self.PayPalPayFlow.showEventSummary(registrationData)
						}

						thanksPopupStage.appendTo(self.screens.thanksScreen);
						updateButtonLoading(false);
						screenNav('thanksScreen');
					}
				}
				//reload events in background
				$eventsHolder = $('.events-holder');
				if ($eventsHolder.length > 0) {
					$eventsHolder.data('plugin_amEvents').reload();
				}
			}, 'json');
		}

		function screenNav(screen) {
			if (typeof screen === 'undefined') return;

			hideScreens();
			self.screens[screen].show();
			self.backButton.hide();

			switch (screen) {
				case 'thanksScreen':
					if (self.isOffline) {
						if (+self.enableBilling === 1) {
							self.footer.empty()
								.append('<div class="row"><div class="col-md-12 amnp-booking-summary-offline-message">' + self.eventSettings.events_offline_payments_message + '</div></div>');
						} else {
							self.footer.empty()
								.append('<div class="row"><div class="col-md-12 amnp-booking-summary-offline-message">Thank you for registering</div></div>');
						}
					}

					resetValues();
					self.regBtn.hide();
					break;

				case 'regForm':
					refreshTicketList();
					self.screenPos = 1;
					updateButtonText(true);
					break;

				case 'paymentScreen':
					refreshTicketList();
					self.screenPos = 2;
					self.isOffline = false;
					self.backButton.show();
					updateButtonText(true);
					break;

				case 'offlineScreen':
					refreshTicketList();

					if (self.screenPos !== 2) {
						self.screenPos = 3;
					} else {
						self.screenPos = 4;
					}

					self.isOffline = true;
					self.backButton.show();
					updateButtonText(true);
					break;

				case 'payLaterScreen':
					refreshTicketList();

					self.screenPos = 5; // 4 might be taken by offlineScreen
					self.isOffline = true;
					self.backButton.show();
					updateButtonText(true);
					break;
			}

			self.popup.data('plugin_amPopup').setupTabTrap();
		}

		function calculateTickets() {
			var totalTickets = 0;
			var noTicketsAllocated = true;
			self.tickets = [];
			self.guests = [];

			$('.list-ticket-qty-dd').each(function () {
				var typeid = parseInt($(this).attr('data-typeid'));
				var limit = parseInt($(this).attr('data-limit'));
				var left = parseInt($(this).attr('data-left'));
				var cost = $(this).attr('data-cost');
				var type = $(this).attr('data-type');
				var qty = parseInt($(this).val());

				if (qty > 0) {
					noTicketsAllocated = false;
					totalTickets += qty;
				}

				if (totalTickets > limit && limit > 0) {
					self.tickets = [];
					self.guests = [];
					return false;
				} else {

					for (var t = 0; t < qty; t++) {
						var hasGuests = self.tickets.length > 0;
						var id = self.tickets.length === 0 ? 'main' : 'g-' + (self.tickets.length - 1).toString();

						if (hasGuests) {
							var guestData = { first_name: 'Guest', last_name: (self.guests.length + 1), age: 0, id: id };
							guestData.ticketType = typeid;
							guestData.ticketName = name;
							guestData.ticketCost = cost;
							self.guests.push(guestData);
						}

						self.tickets.push({
							type: typeid,
							cost: cost,
							name: type,
							id: id
						});
					}
				}
			});

			if (self.tickets.length > 0) {
				refreshTicketList();
				return true;
			}

			if(noTicketsAllocated) {
				refreshTicketList();
			}
			return noTicketsAllocated;
		}

		function refreshTicketList() {
			if ($('.amnp-ticket-details', self.screens.regForm).length > 0) $('.amnp-ticket-details', self.screens.regForm).remove();
			if ($('.amnp-ticket-details', self.screens.paymentScreen).length > 0) $('.amnp-ticket-details', self.screens.paymentScreen).remove();
			if ($('.amnp-ticket-details', self.screens.offlineScreen).length > 0) $('.amnp-ticket-details', self.screens.offlineScreen).remove();
			if ($('.amnp-ticket-details', self.screens.payLaterScreen).length > 0) $('.amnp-ticket-details', self.screens.payLaterScreen).remove();
			if (self.tickets.length > 0) {
				var dateMod = 1;
				var wholeOnly = false;
				if (self.details) {
					if (self.details.whole_serires_only) {
						wholeOnly = parseInt(self.details.whole_serires_only, 10) == 1;
					}
				}

				// Check selected date length and add one for the current date you are registering for
				var sdl = self.selectedDates.length + 1;
				if (sdl > 1) {
					dateMod = sdl;
				}
				var coTicketList = new EventBillingTicketList(self.tickets, dateMod, wholeOnly, parseInt(self.details.enable_billing) === 1, self.eventSettings.payment_currency_symbol).list;
				$('.events2-reg-details', self.screens.regForm).after(coTicketList);
			}
		}

		function resetValues() {
			self.registration = null;
			self.enableMultipleTypes = false;
			self.enableBilling = false;
			self.showPayment = false;
			self.showOffline = true;
			self.ticketTotal = 0.00;
			self.screenPos = 1;
			self.isOffline = false;
			self.availablePaymentTypes = [];
			self.bookingPaymentType = 'card';
		}

		function updateButtonText(visible) {
			switch (self.screenPos) {
				case 1:
					self.regBtn.text('Next');

					if (!self.showPayment && self.showOffline) {
						if (self.regtype == 1 && self.excessGuests == 0) {
							self.regBtn.text('Register');
						} else {
							self.regBtn.text('Join the waitlist');
						}
					}
					break;

				case 2:
				case 3:
				case 4:
				case 5:
					self.regBtn.addClass('btn-success').removeClass('btn-primary');
					if (!self.isOffline && self.bookingPaymentType === 'card') {
						self.regBtn.text('Pay');
					} else {
						self.regBtn.text('Register');
					}
					break;
			}

			if (!visible) {
				self.regBtn.hide();
			} else {
				if (!self.regBtn.is(":visible")) {
					self.regBtn.show();
				}
			}
		}

		function updateButtonLoading(on) {
			if (on) {
				self.regBtn.prop('disabled', 'disabled');
				self.regBtn.append($('<i class="fa fa-circle-o-notch fa-spin"></i>'));
			} else {
				self.regBtn.removeProp('disabled');
				$('.fa-spin', self.regBtn).remove();
			}

			updateButtonText(true);
		}

		function ticketDropdownEvent(context) {
			var s = $('#ticket-dd :selected', context).val();
			if (s !== '') {
				var ticket = {
					type: parseInt($('#ticket-dd > option:selected', context).attr('data-typeid')),
					cost: parseFloat($('#ticket-dd > option:selected', context).attr('data-cost')),
					name: $('#ticket-dd > option:selected', context).text(),
					id: 'main'
				};

				var found = 0;
				if (typeof self.tickets === 'undefined') return;
				if (self.tickets.length > 0) {
					for (var t = 0; t < self.tickets.length; t++) {
						var tkt = self.tickets[t];
						if (typeof tkt.id !== 'undefined') {
							if (tkt.id === 'main') {
								// If the types don't match then we need to do two things:
								// 1. Increase the tickets available for the previous type selected by 1
								// 2. Overwrite the ticket stored for saving.
								if (tkt.type !== ticket.type) {
									// This shouldn't ever happen, but we want to check, jic.
									if (typeof self.details.ticketInfo === 'undefined' && typeof self.details.ticketData === 'undefined') return;

									// Find the previously saved type within ticket info
									var typeIdx = self.details.ticketInfo.ticketData.findIndex(
										function (ticketData) {
											return parseInt(ticketData.typeId) === parseInt(tkt.type)
										}
									);

									// We found it.
									if (typeIdx >= 0) {
										self.details.ticketInfo.ticketData[typeIdx].available++;
									}

									self.tickets[t] = ticket;
								}

								found = 1;
								break;
							}
						}
					}
				}

				if (!found) {
					self.tickets.push(ticket);
				}

				if (typeof self.details !== 'undefined' && typeof self.details.ticketInfo !== 'undefined' && typeof self.details.recurring_id !== 'undefined') {
					drawEventBillingDropDown(self.details.ticketInfo, [ticket], self.enableBilling, self.details.recurring_id, context, 0, 1, 0);
				}

				refreshTicketList();
			}
		}

		function updateTicketData(ticket, ticketInfo, enableBilling, dateId, context, isGuest, type, updateOnly) {
			if (typeof type === 'undefined') var type = 'add';
			if (typeof ticketInfo !== 'undefined' && typeof ticketInfo.ticketData !== 'undefined') {
				// Then there is class/ticketdata info
				var tkt = ticket[0];
				var ti = ticketInfo;
				var td = Array.isArray(ti.ticketData) && ti.ticketData.length > 0 ? ti.ticketData : [];

				var typeIdx = td.findIndex(
					function (ticketData) {
						return parseInt(ticketData.typeId) === parseInt(tkt.type)
					}
				);

				if (typeIdx >= 0) {
					if (type === 'add') {
						td[typeIdx].available++;
					} else {
						td[typeIdx].available--;
					}
					if (td[typeIdx].available < 0) td[typeIdx].available = 0;
					ti.ticketData[typeIdx] = td[typeIdx];
				}

				ticketInfo = ti;
			}

			if (updateOnly) {
				drawEventBillingDropDown(ticketInfo, [ticket], enableBilling, dateId, context, 0, 0, 0);
				return ticketInfo;
			}

			return;
		}


		function drawEventBillingDropDown(ticketInfo, tickets, enableBilling, dateId, context, guestPopup, updateCount, adjusted) {
			// Ticket dd for guests
			var coEventBillingDD = null;
			if (typeof ticketInfo !== 'undefined' && typeof ticketInfo.ticketData !== 'undefined') {
				// Then there is class/ticketdata info
				var ti = ticketInfo;
				var td = Array.isArray(ti.ticketData) && ti.ticketData.length > 0 ? ti.ticketData : [];

				if (updateCount && !adjusted) {
					// Have to add a check to exlude the ticket already selected by the registrant.
					if (Array.isArray(tickets) && tickets.length > 0) {
						// We want to do this for each ticket, including guests.
						for (var t = 0; t < tickets.length; t++) {
							var ticket = tickets[t];
							var typeIdx = td.findIndex(function (ticketData) { return parseInt(ticketData.typeId) === parseInt(ticket.type) });

							if (typeIdx >= 0) {
								td[typeIdx].available--;

								if (td[typeIdx].available < 0) td[typeIdx].available = 0;
								ti.ticketData[typeIdx] = td[typeIdx];
							}
						}
					}
				}

				if (guestPopup) {
					coEventBillingDD = new EventBillingDropdown(dateId, 1, ti, enableBilling).dropdown;
					coEventBillingDD.appendTo(context);
				} else {
					coEventBillingDD = new EventBillingDropdown(dateId, 1, ti, enableBilling).dropdown;
					coEventBillingDD.appendTo(context);

					if ($("#ticket-dd", context).length > 0) {
						var v = $("#ticket-dd :selected", context).val();
						var trow = $("#ticket-dd", context).closest('.row').prev();
						$("#ticket-dd", context).closest('.row').remove();
						trow.after(coEventBillingDD);

						if (v !== '') {
							$("#ticket-dd", context).val(v);
						}

						$('#ticket-dd', context).on('change', function () {
							ticketDropdownEvent(context);
						});
					}
				}
			}


		}

		function openPopup() {
			var website = (window.websiteUrl || "");
			$.getJSON(website + '/eventdetails', { eventid: self.eventid }, function (details, textStatus) {
				self.details = details;
				self.patron = self.details.patron;
				self.guests = [];
				self.screenPos = 1;
				self.disableGuestDetails = parseInt(details.disable_guest_details);

				// Set 'force' to a var
				var force = parseInt(details.force_series_registration, 10) == 1;
				var whole = parseInt(details.whole_serires_only, 10) == 1;
				var allowWaitlist = parseInt(details.allow_waitlist, 10) == 1;
				var limitWaitlist = self.eventSettings.events_limit_waitlist;
				var maxWaitlist = parseInt(details.max_waitlist);
				var totalWaitlist = parseInt(details.total_waitlist);
				var waitlistClosed = limitWaitlist && (totalWaitlist >= maxWaitlist && maxWaitlist > 0);
				// Age Restrictions - CK
				var age_min = parseInt(details.age_restriction_min);
				var age_max = parseInt(details.age_restriction_max);
				var seat_limit = parseInt(details.seat_limit, 10);
				var age_restriction = (age_min > 0 || age_max > 0) ? true : false;
				var coEventBillingDD = null;
				var ticket = {};

				self.personPopup = false;
				self.popup = $('<div class="events2-reg-popup"></div>').amPopup({ title: details.title });
				self.stage = $('<div class="events2-reg-stage"></div>').appendTo(self.popup);
				self.footer = $('<div class="events2-reg-footer"></div>').appendTo(self.popup);
				self.screens = {
					errForm: $('<div class="screen" id="reg-screen1"></div>').appendTo(self.stage),
					regForm: $('<div class="screen" id="reg-screen2"></div>').appendTo(self.stage).hide(),
					paymentScreen: $('<div class="screen" id="reg-screen3"></div>').appendTo(self.stage).hide(),
					paymentError: $('<div class="screen" id="reg-screen4"></div>').appendTo(self.stage).hide(),
					thanksScreen: $('<div class="screen" id="reg-screen5"></div>').appendTo(self.stage).hide(),
					offlineScreen: $('<div class="screen" id="reg-screen6"></div>').appendTo(self.stage).hide(),
					payLaterScreen: $('<div class="screen" id="reg-screen7"></div>').appendTo(self.stage).hide(),
				};


				self.mainTicketAdjusted = false;
				self.tickets = [];
				self.ticketTotal = 0.00;
				self.enableMultipleTypes = typeof details.enable_multiple_types !== 'undefined' && typeof details.ticketInfo !== 'undefined' && typeof details.ticketInfo.ticketData !== 'undefined' ? parseInt(details.enable_multiple_types) : 0;
				self.enableBilling = typeof details.enable_billing !== 'undefined' ? parseInt(details.enable_billing) : 0;
				self.showOffline = true;
				self.showPayment = false;
				self.showSMSPrompt = details.allow_sms_optout;
				self.SMSOptMode = details.sms_opt_mode;
				self.SMSPromptMessage = details.sms_optout_message;

				self.PayPalPayFlow = null;
				self.backButton = $('<button class="btn btn-edit btn-back amnp-booking-summary-buttons">Back</button>').appendTo(self.footer);
				self.backButton.on('click', function () {
					switch (self.screenPos) {
						case 2: //cardScreen
						case 3: //offlineScreen
						case 5: //payLaterScreen
							screenNav('regForm');
							updateButtonText(true);
							break;

						case 4: //offlineScreen occasionally??
							screenNav('paymentScreen');
							updateButtonText(true);
							break;

						default: break;
					}
				});

				self.backButton.hide();

				if (details.guests_allowed === null) {
					details.guests_allowed = self.eventSettings.events_patron_guests_default;
				} else {
					details.guests_allowed = parseInt(details.guests_allowed, 10) === 1;
				}

				if (details.login_required === null) {
					details.login_required = self.eventSettings.events_login_required_default;
				} else {
					details.login_required = parseInt(details.login_required, 10) === 1;
				}

				if (self.regtype == 1 && parseInt(details.total_registrants, 10) >= parseInt(details.max_attendee, 10)) {
					alert('Sorry this event is now full, a wait list may be available.');
					if (typeof self.popup.data('plugin_amPopup') !== 'undefined') {
						self.popup.data('plugin_amPopup').close();
					}

					return;
				}

				self.regBtn = $('<button data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-default reg-btn amnp-booking-summary-buttons">next</button>').on('click', function (event) {
					//self.regBtn.button('loading');
					updateButtonLoading(true);
					event.preventDefault();
					switch (self.screenPos) {
						case 1:
							var form = $(this).closest('.events2-reg-popup').find('.events2-reg-form');

							if (self.disableGuestDetails === 1 && +self.enableMultipleTypes === 1) {
								calculateTickets();
							}

							var data = {
								additional_dates: [],
								eventid: self.eventid,
								first_name: $('#first_name', form).val().trim(),
								last_name: $('#last_name', form).val().trim(),
								email: $('#email', form).val().trim(),
								phone: $('#phone', form).val().trim(),
								allow_sms: $('#allow_sms', form).length > 0 ? $('#allow_sms', form).is(":checked") : 0,
								age: self.eventSettings.events_age_enabled ? $('#age', form).val() : null,
								librarycard: $('#librarycard', form).val().trim(),
								others: self.guests,
								regtype: self.regtype,
								attendanceType: ((self.attendanceType == undefined || self.attendanceType == 'UNKNOWN') ? $('#attendance', form).val() : self.attendanceType),
								custom_questions: {}
							}

							var seats = parseInt(details.max_attendee, 10);
							var total = parseInt(details.total_registrants, 10);

							if (limitWaitlist) {
								var gl = self.guests.length;
								var left = 0;

								if (seats > 0) {
									left = seats - total;
								}

								if ((left - (gl + 1)) < 0) {
									left = 0;
									data.regtype = 2;
								}

								var theoreticalWaitlist = gl + totalWaitlist + (parseInt(data.regtype) === 2 ? 1 : 0) - left;

								if (maxWaitlist > 0 && theoreticalWaitlist > maxWaitlist) {
									var over = theoreticalWaitlist - maxWaitlist;
									$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Unable to register, maximum wait list size will be exceeded. Remove ' + over + ' guest(s) to continue, or cancel registration.').fadeIn().delay(3000).fadeOut();
									updateButtonLoading(false);
									return;
								}
							}

							if (seat_limit > 0) {
								var seatCount = self.guests.length + 1; // Add 1 for the registrant
								if (seatCount > seat_limit) {
									$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Event has a registration limit of ' + seat_limit + ' seats. To continue, reduce number of registrants to limit.').fadeIn().delay(3000).fadeOut();
									updateButtonLoading(false);
									return;
								}
							}

							var clean = true;
							var registrationType = $(this).closest('.events2-reg-popup').find('.ticket-list');
							if(registrationType.length > 0) {
								var regType = registrationType.data('regType');
								clean = regType.hasSelection();
								if(!clean) {
									regType.highlightFields();
								}
							}

							if (!self._isFormClean(self.customQuestions) || !self._isFormClean(self.Questions)) {
								clean = false;
							}

							if (!clean) {
								$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter information for all required fields').fadeIn().delay(3000).fadeOut();
								updateButtonLoading(false);
								return;
							}

							var reemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
							var rephone = new RegExp(self.eventSettings.phone_number_regex, "i");
							if (data.first_name.length === 0) {
								$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter a first name').fadeIn().delay(3000).fadeOut();
								updateButtonLoading(false);
								return;
							}

							if (data.last_name.length === 0) {
								$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter a last name').fadeIn().delay(3000).fadeOut();
								updateButtonLoading(false);
								return;
							}

							if (!$('#email', form).prop('disabled') && data.email.length > 0 && !reemail.test(data.email)) {
								$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter a valid email address').fadeIn().delay(3000).fadeOut();
								//self.regBtn.button('reset');
								updateButtonLoading(false);
								$('#email', form).addClass('amrp-missing-field');
								return;
							}

							if (!$('#phone', form).prop('disabled') && data.phone.length > 0 && !rephone.test(data.phone)) {
								$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter a valid phone number').fadeIn().delay(3000).fadeOut();
								//self.regBtn.button('reset');
								updateButtonLoading(false);
								$('#phone', form).addClass('amrp-missing-field');
								return;
							}

							if (details.registration_fields && details.registration_fields.fields) {
								for (var i = details.registration_fields.fields.length - 1; i >= 0; i--) {
									var field = details.registration_fields.fields[i];
									var val = null;
									switch (field.type) {
										case 'checkbox':
											val = $('#' + field.name, self.customQuestions).is(':checked');
											break;
										default:
											val = $('#' + field.name, self.customQuestions).val();
											val = val.trim();
											break;
									}
									switch (field.validate) {
										case 'custom':
											var flags = field.regex.replace(/.*\/([gimy]*)$/, '$1');
											var pattern = field.regex.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
											var regex = new RegExp(pattern, flags);
											if (val.length > 0 && !regex.test(val)) {
												$(this).closest('.events2-reg-popup').find('.events2-error-message').text('The information entered is not valid').fadeIn().delay(3000).fadeOut();
												//self.regBtn.button('reset');
												updateButtonLoading(false);
												$('#' + field.name, self.customQuestions).addClass('amrp-missing-field');
												return;
											}
											break;
										case 'email':
											if (val.length > 0 && !reemail.test(val)) {
												$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter a valid email address').fadeIn().delay(3000).fadeOut();
												//self.regBtn.button('reset');
												updateButtonLoading(false);
												$('#' + field.name, self.customQuestions).addClass('amrp-missing-field');
												return;
											}
											break;
										case 'phone':
											if (val.length > 0 && !rephone.test(val)) {
												$(this).closest('.events2-reg-popup').find('.events2-error-message').text('Please enter a valid phone number').fadeIn().delay(3000).fadeOut();
												//self.regBtn.button('reset');
												updateButtonLoading(false);
												$('#' + field.name, self.customQuestions).addClass('amrp-missing-field');
												return;
											}
											break;
									}
									if (null !== val) data.custom_questions[field.name] = val;
								}
							}

							if (self.additionalDates) {
								$("input:checked", self.additionalDates).each(function (index, el) {
									// Data-waitlist + 1 = regtype. 1 = Reg, 2 = wait.
									data.additional_dates.push({ id: $(el).val(), intent: ($(this).attr("data-waitlist") === "true") ? 2 : 1 });
								});
							}

							data.custom_questions = JSON.stringify(data.custom_questions);
							self.registration = data;

							if (+self.enableMultipleTypes === 0 && +self.enableBilling === 0) {
								saveRegistration();
							} else {
								//Only possible after coming 'back' from this screen.
								updateButtonLoading(false);

								if (self.availablePaymentTypes.includes(self.bookingPaymentType)) {
									var selectedPayment = paymentTypes.find(function(elem) {
										return elem.string == self.bookingPaymentType;
									});
									screenNav(selectedPayment.screen);
									return;
								}
								// No payment methods available, defaulting to offline
								self.isOffline = true;
								self.showOffline = true;
								self.registration.payment = {
									mode: 'offline'
								};

								saveRegistration();
								screenNav('thanksScreen');
							}

							break;
						case 2:
							var payData = null;
							if (self.showPayment && !self.isOffline) {
								self.ticketTotal = 0.00;
								for (var t = 0; t < self.tickets.length; t++) {
									var tkt = self.tickets[t];
									self.ticketTotal += parseFloat(tkt.cost);
								}

								payData = {
									first_name: $('input#card_first_name', self.screens.paymentScreen).val(),
									last_name: $('input#card_last_name', self.screens.paymentScreen).val(),
									card_number: $('input#card_number', self.screens.paymentScreen).val(),
									expiration: $('input#expiration', self.screens.paymentScreen).payment('cardExpiryVal'),
									cvc: $('input#CVV2', self.screens.paymentScreen).val(),
									amount: self.ticketTotal,
									mode: 'card'
								}

								if (!checkPayment(payData)) {
									return;
								}
							}

							saveRegistration(payData);
							screenNav('thanksScreen');
							break;

						// Show the thanks screen
						case 3:
						case 4:
							saveRegistration();
							screenNav('thanksScreen');
							break;

						case 5:
							self.registration.payment = {
								mode: 'pay_later'
							};
							saveRegistration();
							screenNav('thanksScreen');
							break;
					}
				}).appendTo(self.footer);

				function renderList() {
					var list = $('.events2-more-people-list', self.screens.regForm).empty();


					$.each(self.guests, function (index, val) {
						var typeid = (typeof self.guests[index].ticketType !== 'undefined') ? self.guests[index].ticketType : -1;
						var guestLine = $('<li />');
						var gBtn = $('<div class="btn btn-default" d><i class="fa fa-times"></i></div>');
						var gAge = $('<div><i>' + val.age + '</i></div>');
						var gTicket = '';

						gBtn.on('click', function () {
							var tid = $(this).attr('data-typeid');
							for (var t = 0; t < self.tickets.length; t++) {
								var tkt = self.tickets[t];

								if (parseInt(tkt.type) === parseInt(tid)) {
									// There is only one...
									spliced = true;

									var removed = self.tickets.splice(t, 1);
									// We need to update the available counts in ticketInfo
									updateTicketData(removed, self.details.ticketInfo, self.enableBilling, self.details.recurring_id, self.screens.regForm, 1, 'add');
									break;
								}
							}

							refreshTicketList();
						});

						guestLine.append(gBtn).append(val.first_name + ' ' + val.last_name);

						if (self.eventSettings.events_age_enabled) {
							guestLine.append(gAge);
						}

						if (val.ticketTypes) {
							gTicket = $('<div><i class="fa fa-ticket"></i>&nbsp;&nbsp;<i>' + val.ticketName + '</i></div>');
							guestLine.append(gTicket);
						}

						guestLine.appendTo(list);
					});
				}

				$('<div class="events2-spacer"><div class="events2-error-message"></div></div>').appendTo(self.screens.errForm);
				$('<div class="events2-reg-info"><i class="fa fa-fw fa-phone"></i>Register by phone: call <b>' + self.details.tel + '</b></div>').appendTo(self.screens.errForm);
				$('<div class="events2-reg-info"><i class="fa fa-fw am-branches"></i>Register in branch: visit <b>' + self.details.location + '</b></div>').appendTo(self.screens.errForm);
				self.eventDetails = $('<div class="events2-reg-details"><div class="events2-reg-thanks-evlocation">' + self.details.location + '</div><div class="events2-reg-thanks-evdate">' + details.datestring + '</div><div class="events2-reg-thanks-evtime">' + details.time_string + '</div></div>');

				self.screens.regForm.append(self.eventDetails.clone());
				self.screens.paymentScreen.append(self.eventDetails.clone());
				self.screens.offlineScreen.append(self.eventDetails.clone());
				self.screens.payLaterScreen.append(self.eventDetails.clone());

				if (self.details.ezProxyShowLoginButton) {
					var loginForm = $('<div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid;"></div>').appendTo(self.screens.regForm);
					$('<a href=' + self.details.ezProxyLoginButtonLink + ' class="btn btn-primary">' + self.details.ezProxyLoginButtonText + '</a>').appendTo(loginForm);
				} else if (self.eventSettings.events_patron_auth_enabled) {
					var loginForm = $('<div class="events2-reg-card-form"><input aria-label="Enter your library card number" class="events2-reg-card" placeholder="Library card number"/></div>').appendTo(self.screens.regForm);
					if (!self.eventSettings.client_pinless_auth) {
						$('<input aria-label="Enter you PIN number or password" class="events2-reg-pin" type="password" placeholder="PIN/password"/>').appendTo(loginForm);
					}
					var btnText = details.login_required ? 'login' : 'find details';
					$('<button data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i>" class="btn btn-primary reg-btn">' + btnText + '</button>').appendTo(loginForm);

					if (!self.details.login_required && self.eventSettings.client_pinless_auth) {
						loginForm.hide();
					}
				}

				var detailsForm = $('<div class="row">' +
					'<div class="col-sm-7">' +
					'<div class="form-horizontal events2-reg-form">' +
					'</div>' +
					'</div>' +
					'<div class="col-sm-5 guests"></div>' +
					'</div>').appendTo(self.screens.regForm);

				if (self.eventSettings.events_patron_auth_enabled && self.details.login_required) {
					loginForm.show();
					detailsForm.hide();
					self.regBtn.hide();
				}

				if (self.details.guests_allowed && +self.disableGuestDetails === 0) {
					$('<div>' +
						'<b>Register more people?</b>' +
						'<span class="events2-add-more btn btn-info pull-right">add more people</span>' +
						'</div>' +
						'<ul class="events2-more-people-list"></ul>').appendTo($('.guests', self.screens.regForm));
				}

				self.Questions = $('<div class="amrp-questions"></div>').appendTo($('.events2-reg-form', self.screens.regForm));
				$('<p class="amrp-key" style="margin-bottom: 2rem;"><span style="margin-right: 0.5rem; font-size: 18px;">&#9432;</span> Required fields are marked with an asterisk (<span class="required-field"></span>)</p>').prependTo(self.Questions);
				self.customQuestions = $('<div class="amrp-questions amrp-custom-questions"></div>').appendTo($('.events2-reg-form', self.screens.regForm));
				$('<div class="events2-error-message"></div>').appendTo(self.screens.regForm);

				self._createField('first_name', 'text', 'First name', true).appendTo(self.Questions);
				self._createField('last_name', 'text', 'Last name', true).appendTo(self.Questions);

				if (!self.details.login_required && self.eventSettings.client_pinless_auth) {
					self._createField('librarycard', 'text', 'Library card number').appendTo(self.Questions);
				} else {
					$('<input type="hidden" class="form-control" id="librarycard">').appendTo($('.events2-reg-form', detailsForm));
				}

				self._createField('email', 'text', 'Email', self.eventSettings.events_require_email, false, 'We\'ll only use this email address to send confirmation and any notifications about the event.').appendTo(self.Questions);
				self._createField('phone', 'text', 'Phone', self.eventSettings.events_require_phone, false, 'We\'ll only use the phone number to contact you about the event.').appendTo(self.Questions);

				if (self.showSMSPrompt) {
					var checked = parseInt(self.SMSOptMode) === 1 ? 'checked="checked"' : '';
					var cbx = $('<div class="row amf-row">' +
						'<label for="phone" class="col-sm-4 control-label">&nbsp;</label>' +
						' <div class="col-sm-8 field">' +
						' 	<div class="checkbox"><label style="font-size:12px;"><input style="width:auto !important;" type="checkbox" id="allow_sms"' + checked + '/>' + self.SMSPromptMessage + '</label></div>' +
						' </div></div>');
					cbx.appendTo(self.Questions);
				}

				if (self.attendanceType == undefined || self.attendanceType == 'UNKNOWN') {
					if (
						parseInt(self.details.virtual_registration_enabled) == 1 ||
						parseInt(self.details.in_branch_registration_enabled) == 1
					) {
						self._createField('attendance', 'select', 'Attendance location').appendTo(self.Questions);
						if (parseInt(self.details.max_attendee_virtual) > 0) $('#attendance', self.screens.regForm).append('<option value="ONLINE">Online</option>');
						if (parseInt(self.details.max_attendee_in_branch) > 0) $('#attendance', self.screens.regForm).append('<option value="INPERSON">In-person at the ' + self.details.location + ' branch</option>');
					}
				}

				if (self.details.librarycardnumber) $('#librarycard', self.screens.regForm).val(self.details.librarycardnumber);
				if (self.details.patron && self.details.patron.data && self.details.patron.data.names[0]) $('#first_name', self.screens.regForm).val(self.details.patron.data.names[0].first_name);
				if (self.details.patron && self.details.patron.data && self.details.patron.data.names[0]) $('#last_name', self.screens.regForm).val(self.details.patron.data.names[0].last_name);
				if (self.details.patron && self.details.patron.data && self.details.patron.data.emails[0]) $('#email', self.screens.regForm).val(self.details.patron.data.emails[0]);
				if (self.details.patron && self.details.patron.data && self.details.patron.data.phones[0]) $('#phone', self.screens.regForm).val(self.details.patron.data.phones[0]);

				if (self.eventSettings.events_age_enabled) {
					var age = self._createField('age', 'select', 'Age', self.eventSettings.events_require_age).appendTo(self.Questions);
					$('#age', self.screens.regForm).empty().append('<option value="">Select age group</option>');
				}

				// Event Tickets Drop Down....
				if (typeof self.details.ticketInfo !== 'undefined') {
					if (+self.details.enable_multiple_types === 1) {
						// Then there is class/ticketdata info
						var lastTicketCost = 0.00;
						var coEventBillingDD = null;
						var coEventBillingList = null;
						var enableBilling = parseInt(self.details.enable_billing) === 1;

						//var paymentForm =


						if (!isNaN(self.disableGuestDetails) && +self.disableGuestDetails === 0) {
							coEventBillingDD = new EventBillingDropdown(self.details.recurring_id, 1, self.details.ticketInfo, enableBilling).dropdown;
							coEventBillingDD.appendTo(self.Questions);
							$('#ticket-dd', self.screens.regForm).on('change', function () {
								ticketDropdownEvent(self.screens.regForm);
							});
						} else {
							coEventBillingList = new EventBillingMultipleSelector(self.details.recurring_id, 1, self.details.ticketInfo, enableBilling, parseInt(self.details.seat_limit), 1).selector;
							coEventBillingList.appendTo($('.guests', self.screens.regForm));

							$('.list-ticket-qty-dd', self.screens.regForm).off().on('change', function () {
								var calculated = calculateTickets();
								if (!calculated) {
									alert('Cannot add selected quantity of registration types, it will exceed seat limit per registration');
								}
							});
						}
					} else {
						if (+self.details.enable_billing === 1) {
							var cost = parseFloat(self.details.ticketInfo.amount).toFixed(2);
							ticket = {
								type: self.details.ticketInfo.typeId,
								cost: cost,
								name: 'Fixed Registration Cost - ' + self.eventSettings.payment_currency_symbol + '' + cost,
								id: 'main'
							};

							var found = -1;
							if (self.tickets.length > 0) {
								for (var t = 0; t < self.tickets.length; t++) {
									var tkt = self.tickets[t];
									if (typeof tkt.id !== 'undefined') {
										if (tkt.id === 'main') {
											self.tickets[t] = ticket;
											refreshTicketList();
											return;
										}
									}
								}
							}

							self.tickets.push(ticket);
							refreshTicketList();
						}
					}
					var offlineFormText = 'Thank you for registering.';
					if (+self.enableBilling === 1) {
						offlineFormText = self.eventSettings.events_offline_payments_message;
					}

					self.showPayment = self.eventSettings.events_ecommerce_enabled && parseInt(self.details.enable_billing, 10) === 1;
					self.showOffline = self.eventSettings.events_patron_offline_payments_enabled;


					//var coEventBillingForm = new EventBillingPaymentForm({ off: false, txt: ''}, self.showOffline).form;
					self.PayPalPayFlow = new PayPalPayFlow('', self.ppTestMode, $("meta[name='client']").attr('content'));
					var coEventBillingOfflineForm = new EventBillingPaymentForm({ off: true, txt: offlineFormText }, self.showOffline).form;
					coEventBillingOfflineForm.appendTo(self.screens.offlineScreen);
					var coEventBillingPayLaterForm = new EventBillingPaymentForm({ off: true, txt: self.eventSettings.rooms_later_payments_message }, self.showOffline).form;
					coEventBillingPayLaterForm.appendTo(self.screens.payLaterScreen);
				}

				if (self.details.registration_fields && self.details.registration_fields.fields) {
					$.each(self.details.registration_fields.fields, function (index, val) {
						var field = self._createFieldWithObject(val).data('fieldSettings', val).addClass('amrp-custom-field').appendTo(self.customQuestions);
						if (val.type === 'select') {
							var select = $('select', field);
							$('<option value="">Please choose...</option>').appendTo(select);
							var options = val.options.trim().split(/\r?\n/);
							for (var i = 0; i < options.length; i++) {
								$('<option>' + options[i] + '</option>').appendTo(select);
							}
						}
					});
				}

				if (self.patron && self.patron.data) {
					if (!self.eventSettings.client_pinless_auth) {
						if (self.patron.data.names.length > 0) {
							self.screens.regForm.find('#first_name').val(self.patron.data.names[0].first_name);
							self.screens.regForm.find('#last_name').val(self.patron.data.names[0].last_name);
						}
						if (self.patron.data.phones.length > 0) {
							self.screens.regForm.find('#phone').val(self.patron.data.phones[0]);
						}
						if (self.patron.data.emails.length > 0) {
							self.screens.regForm.find('#email').val(self.patron.data.emails[0]);
						}
					}

					if (self.patron.data.barcodes.length > 0) {
						self.screens.regForm.find('#librarycard').val(self.patron.data.barcodes[0]);
					}

					loginForm.hide();
					detailsForm.show();
					self.regBtn.show();
				}

				if (self.eventSettings.events_age_enabled) {
					$.getJSON(self.apiServer + '/v1/' + self.keyword + '/eventsages', { type: 'singular' }, function (json, textStatus) {
						$select = $('#age', self.screens.regForm).empty().append('<option value="">Select age group</option>');
						$.each(json, function (index, val) {
							$('<option>' + val.name + '</option>').appendTo($select);
						});
					});
				}

				var paymentTypes = [
					{
						string: 'card',
						cond: self.eventSettings.events_ecommerce_enabled && parseInt(self.details.enable_billing, 10) === 1 && self.eventSettings.events_card_enabled,
						buttonText: 'Card',
						screen: 'paymentScreen'
					},
					{
						string: 'pay_later',
						cond: self.eventSettings.events_ecommerce_enabled && self.eventSettings.events_patron_pay_later_enabled,
						buttonText: self.eventSettings.rooms_pay_later_button_text || 'Pay Later',
						screen: 'payLaterScreen'
					},
					{
						string: 'offline',
						cond: self.eventSettings.events_patron_offline_payments_enabled,
						buttonText: self.eventSettings.rooms_offline_button_text || 'Offline',
						screen: 'offlineScreen'
					}
				];

				self.paymentOptions = $('<div class="events2-additional-dates"></div>');

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

				$('<div class="row amf-row amnp-payment-toggle">'
				+ '<div class="row amf-row">'
				+ '<div class="col-sm-4">'
				+ '<label class="control-label">Payment type</label>'
				+ '</div>'
				+ '<div class="col-sm-7 field">'
				+ '<div class="btn-group" data-toggle="buttons" style="display:flex">'
				+ buttonHtml
				+ '</div>'
				+ '</div>'
				+ '</div>'
				+ '</div>'
				+ '</div>').appendTo(self.paymentOptions);

				$('input[name="options"]', self.paymentOptions).on('change', function () {
					if ($(this).val() === 'card') {
						self.isOffline = false;
						self.showOffline = false;
					} else if ($(this).val() === 'pay_later') {
						self.isOffline = true;
						self.showOffline = true;
					} else {
						self.isOffline = true;
						self.showOffline = true;
					}
				});

				self.paymentOptions.on('change', ':input', function () {
					self.bookingPaymentType = $(this).val();
				});

				if (self.availablePaymentTypes.length > 1 && parseInt(self.details.enable_billing)) {
					(self.paymentOptions).appendTo(self.screens.regForm);
				}

				// Get event series information
				$.getJSON(self.apiServer + '/v1/' + self.keyword + '/eventsseries/' + self.recurringid, function (json, textStatus) {
					self.extraDates = [];
					self.extraDatesFutureOpenReg = [];
					$.each(json, function (index, val) {
						val.changed = parseInt(val.changed, 10);
						if (val.changed === 1) {
							return;
						}
						if (moment(val.close_registration).diff(moment()) > 0 && (moment(val.open_registration).diff(moment()) < 0 || val.open_registration == "0000-00-00 00:00:00") && val.id != self.eventid) {
							var seatsAvailable = {
								'INPERSON': function(){ return (self.details.max_attendee_in_branch - val.total_registrants); },
								'ONLINE': function(){ return (self.details.max_attendee_virtual - val.total_registrants); },
								'HYBRID': function() { return (self.details.max_attendee - val.total_registrants); },
								'': function() { return (self.details.max_attendee - val.total_registrants); }
							};
							self.extraDates.push({
								id: val.id,
								total_registrants: val.total_registrants,
								datestring: (val.changed === 2) ? val.changed_datestring : val.datestring,
								time_string: (val.changed === 2) ? val.changed_time_string : val.time_string,
								seats_available: seatsAvailable['' + val.event_type]()
							});
						}
						if (moment(val.open_registration).diff(moment()) > 0) {
							self.extraDatesFutureOpenReg.push({
								datestring: (val.changed === 2) ? val.changed_datestring : val.datestring,
								time_string: (val.changed === 2) ? val.changed_time_string : val.time_string,
								reg_opens: val.open_registration
							})
						}
					});


					if (self.extraDates.length > 0) {
						self.additionalDates = $('<div class="events2-additional-dates"></div>').appendTo(self.screens.regForm);
						var announce = "You will also be registered for these additional dates";
						if (self.regtype == 2) {
							announce = "You will also be wait-listed for these additional dates";
						}

						if (parseInt(self.details.force_series_registration, 10) == 1) {
							$('<h4>' + announce + '</h4>').appendTo(self.additionalDates);
						} else {
							$('<h4>Also register for these additional dates</h4>').appendTo(self.additionalDates);
							$('<span class="events2-additional-dates-all">(<a href="#">check all</a>)</span>').appendTo(self.additionalDates);
						}

						// Modify list to show context, or rather, intent
						// CH8320 - Added space to 'seats remaining and join waitlist to prevent seat number from overlapping.
						$.each(self.extraDates, function (index, val) {
							$('<label class="c-input c-checkbox" data-seatsavailable="' + val.seats_available + '">' +
								'<input type="checkbox" value="' + val.id + '" data-waitlist="' + (val.seats_available <= 0) + '">' +
								'<span class="c-indicator"></span>' +
								' ' + val.datestring + ': ' + val.time_string + ' <i>( ' + (val.seats_available > 0 ? val.seats_available + ' Seats remaining' : ' Join Waitlist') + ' )</i>' +
								'</label>').appendTo(self.additionalDates);
						});

						/*$.each(self.extraDatesFutureOpenReg, function (index, val) {
							$('<label>' +
								'<span class="c-indicator"></span>' +
								' ' + val.datestring + ': ' + val.time_string + ' <i>(Registration opens: ' + val.reg_opens + ')</i>' +
								'</label>').appendTo(self.additionalDates);
						});*/

						$('.c-checkbox', self.additionalDates).off().on('click', function () {
							var input = $(this).children('input').first();
							var checked = input.is(":checked");
							var v = input.val();
							if (checked) {
								if (self.selectedDates.length > 0) {
									for (var s = 0; s < self.selectedDates.length; s++) {
										if (self.selectedDates[s].id === v) {
											self.selectedDates[s].intent = input.attr("data-waitlist") === "true" ? 2 : 1;
											return;
										}
									}
								}
								// If we are out here we didn't find an existing one
								self.selectedDates.push({ id: v, intent: (input.attr("data-waitlist") === "true") ? 2 : 1 });
							} else {
								if (self.selectedDates.length > 0) {
									var index = -1;
									for (var s = 0; s < self.selectedDates.length; s++) {
										if (self.selectedDates[s].id === v) {
											index = s;
										}
									}

									if (index > -1) {
										self.selectedDates.splice(index, 1);
									}
								}
							}

							if (self.enableMultipleTypes || self.enableBilling) {
								refreshTicketList();
							}
						});

						$('input', self.additionalDates).prop({ 'checked': force, 'disabled': force });
						if (force) {
							self.selectedDates = [];
							$('input', self.additionalDates).each(function () {
								self.selectedDates.push({ id: $(this).val(), intent: ($(this).attr("data-waitlist") === "true") ? 2 : 1 });
							});
							refreshTicketList();
						}

						// Set date checkboxes to disabled ONLY if waitlist not allowed.
						$("input", self.additionalDates).filter(function () {
							return parseInt($(this).closest('label').attr("data-seatsavailable"), 10) <= 0;
						}).prop({ 'checked': (force || whole), 'disabled': (force || whole) });
					}
				});

				self.screens.regForm.on('click', '.events2-add-more', function (event) {
					event.preventDefault();
					var form = $(this).closest('.events2-reg-popup').find('.events2-reg-form');
					var attendanceType = ((self.attendanceType == undefined || self.attendanceType == 'UNKNOWN') ? $('#attendance', form).val() : self.attendanceType);

					self.mayOptForWaitlist = false;
					if (self.regtype == 1 &&
						((((attendanceType !== 'ONLINE' && parseInt(self.details.in_branch_registration_enabled) == 1)) && (parseInt(self.details.max_attendee_in_branch, 10) - parseInt(self.details.total_inperson_registrants, 10) - self.guests.length) <= 1)) ||
						((((attendanceType === 'ONLINE' && parseInt(self.details.virtual_registration_enabled) == 1)) && (parseInt(self.details.max_attendee_virtual, 10) - parseInt(self.details.total_online_registrants, 10) - self.guests.length) <= 1))
					) {
						var n = attendanceType === 'ONLINE' ?
							(parseInt(self.details.max_attendee_virtual, 10) - parseInt(self.details.total_registrants, 10)) :
							(parseInt(self.details.max_attendee_in_branch, 10) - parseInt(self.details.total_registrants, 10));
						var canWaitlist = allowWaitlist && !waitlistClosed;
						var remainingSeatsMessage = "";
						switch (n) {
							case 0:
								remainingSeatsMessage = "There are no seats left for this event.";
								break;
							case 1:
								remainingSeatsMessage = "There is only 1 seat left for this event.";
								break;
							default:
								remainingSeatsMessage = "There are " + n + " seats left for this event.";
								break;
						}
						if (!canWaitlist) {
							alert(remainingSeatsMessage + " You cannot add any more registrants.");
							return;
						} else {
							self.mayOptForWaitlist = true;
							alert(remainingSeatsMessage + " You will be waitlisted if you add more registrants.");
						}
					}

					if (parseInt(self.details.seat_limit, 10) > 0) {
						if (self.guests.length + 1 > parseInt(self.details.seat_limit, 10)) {
							alert('Sorry you cannot book more than ' + self.details.seat_limit + ' seats at once.');
							return;
						}
					}

					var list = $('.events2-more-people-list', self.screens.regForm);
					self.personPopup = $('<div class="events2-reg-person-popup"></div>').amPopup({ title: 'Add person', popUpClass: 'events2-person-popup' });

					var stage = $('<div class="events2-reg-person-stage"></div>').appendTo(self.personPopup);
					var footer = $('<div class="events2-reg-person-footer"><div class="events2-error-message"></div></div>').appendTo(self.personPopup);
					var person = $('<div class="form-horizontal amrp-questions"></div>').appendTo(stage);
					$('<p class="amrp-key" style="margin-bottom: 2rem;"><span style="margin-right: 0.5rem; font-size: 18px;">&#9432;</span> Required fields are marked with an asterisk (<span class="required-field"></span>)</p>').prependTo(person);

					self._createField('first_name', 'text', 'First name', true).appendTo(person);
					self._createField('last_name', 'text', 'Last name', false).appendTo(person);

					if (parseInt(self.details.enable_multiple_types) === 1) {
						var enableBilling = parseInt(self.details.enable_billing) === 1;
						var updateCount = (self.tickets.findIndex(function (t) { return t.id === 'main'; })) === 0;
						if (!self.mainTicketAdjusted && updateCount) self.mainTicketAdjusted = true;
						drawEventBillingDropDown(self.details.ticketInfo, self.tickets, enableBilling, self.details.recurring_id, person, 1, updateCount, self.mainTicketAdjusted);
					}

					if (self.eventSettings.events_age_enabled) {
						var age = self._createField('age', 'select', 'Age', self.eventSettings.events_require_age).appendTo(person);


						$.getJSON(self.apiServer + '/v1/' + self.keyword + '/eventsages', { type: 'singular' }, function (json, textStatus) {
							$select = $('#age', stage).empty().append('<option value="">Select age group</option>');
							$.each(json, function (index, val) {
								$('<option>' + val.name + '</option>').appendTo($select);
							});
						});
					}

					$('<button class="btn btn-info">add</button>').on('click', function (event) {
						event.preventDefault();

						if (self.mayOptForWaitlist) {
							self.excessGuests += 1;
						}
						updateButtonText(true);

						if (parseInt(seat_limit, 10) == 0 || (parseInt(seat_limit, 10) >= 0 && self.guests.length < (parseInt(seat_limit, 10) - 1))) {
							var age = null;
							if (self.eventSettings.events_age_enabled) {
								age = $('#age', person).val();
							}

							var first_name = $('#first_name', person).val().trim();
							var last_name = $('#last_name', person).val().trim();
							var ticketName = '';
							var ticketType = 0;
							var ticketCost = 0.00;
							var ticketCostId = 0;
							var ticketSet = false;

							if (typeof self.details.ticketInfo !== 'undefined') {
								if (+self.details.enable_multiple_types === 1) {
									ticketType = parseInt($('#ticket-dd', person).val());
									ticketName = $('#ticket-dd :selected', person).text();
									ticketCost = parseFloat($('#ticket-dd > option:selected', person).attr('data-cost'));
									ticketSet = true;
								} else {
									if (+self.details.enable_billing === 1) {
										ticketType = -1;
										ticketName = 'Guest - Fixed Registration Cost - ' + self.eventSettings.payment_currency_symbol + '' + parseFloat(self.details.ticketInfo.amount).toFixed(2);
										ticketCost = parseFloat(self.details.ticketInfo.amount).toFixed(2);
										ticketSet = true;
									}
								}
							}

							if (!ticketSet && +self.details.enable_multiple_types === 1) {
								alert('Select a registration type before adding guests.');
								return;
							}

							if (self._isFormClean(person)) {
								var guestData = { first_name: first_name, last_name: last_name, age: age, id: 'g' + self.guests.length };
								// -1 = Single cost, 0 > = multiple reg types
								if (ticketType > 0 || ticketType === -1) {
									guestData.ticketType = ticketType;
									guestData.ticketName = ticketName;
									guestData.ticketCost = ticketCost;
									var guestTicket = {
										cost: ticketCost, type: ticketType, name: ticketName, id: 'g' + self.guests.length
									};
									self.tickets.push(guestTicket);
								}

								self.guests.push(guestData);

								$("input", self.additionalDates).filter(function () {
									return parseInt($(this).closest('label').attr("data-seatsavailable"), 10) - self.guests.length <= 0;
								}).prop({ 'checked': (force || whole), 'disabled': (force || whole) });

								self.personPopup.data('plugin_amPopup').close();
								drawEventBillingDropDown(self.details.ticketInfo, [guestTicket], enableBilling, self.details.recurring_id, self.screens.regForm, 0, 1, 0);
								refreshTicketList();
								renderList();
							}
						} else if (parseInt(seat_limit, 10) > 0) {
							// This is the "add" button for new registrants
							var guestSeats = parseInt(seat_limit);
							alert('Sorry, we were unable to add this guest. There is a limit of ' + guestSeats + ' guests per registration for this event.');
						}
					}).appendTo(footer);

					self.personPopup.data('plugin_amPopup').open();
				}).on('click', '.events2-more-people-list .btn', function (event) {
					event.preventDefault();

					self.excessGuests -= 1;
					updateButtonText(true);

					var gi = $(this).closest('li').index();
					self.guests.splice(gi, 1);

					for (var t = 0; t < self.tickets.length; t++) {
						if (self.tickets[t].id === 'g' + gi) {
							var removed = self.tickets.splice(t, 1);
							// We need to update the available counts in ticketInfo
							updateTicketData(removed, self.details.ticketInfo, self.enableBilling, self.details.recurring_id, self.screens.regForm, 1, 'add');
							refreshTicketList();
							break;
						}
					}

					renderList();
				}).on('click', '.events2-additional-dates-all a', function (event) {
					event.preventDefault();
					self.selectedDates = [];
					$(this).closest('.events2-additional-dates').find('input[type=checkbox]:enabled').each(function () {
						self.selectedDates.push({ id: $(this).val(), intent: ($(this).attr("data-waitlist") === "true") ? 2 : 1 });
						$(this).prop('checked', true);
					});

					if (self.enableMultipleTypes || self.enableBilling) {
						refreshTicketList();
					}

					return false;
				}).on('click', '.events2-reg-card-form button', function (event) {
					event.preventDefault();
					self.regBtn.button('loading');
					var p = $(this).closest('.events2-reg-popup');

					// CH#1942 - Trim the card/pin fields to prevent blanks.
					var card = $.trim(p.find('.events2-reg-card').val());
					if (card.length == 0) {
						p.find('.events2-error-message').text('Card number is required').fadeIn().delay(3000).fadeOut();
						//self.regBtn.button('reset');
						return;
					}

					if (!self.eventSettings.client_pinless_auth) {
						var pin = $.trim(p.find('.events2-reg-pin').val());
						if (pin.length == 0) {
							p.find('.events2-error-message').text('Pin is required').fadeIn().delay(3000).fadeOut();
							//self.regBtn.button('reset');
							return;
						}
					}

					var loginData = { u: card, p: pin, 'type': 'attend', eventid: self.eventid }
					if (!self.eventSettings.client_pinless_auth) {
						loginData.p = pin;
					}

					if (age_restriction) {
						loginData['age'] = { min: age_min, max: age_max };
					}

					loginData['event_login_required'] = self.details.login_required;

					$.getJSON(self.apiServer + '/v1/' + self.keyword + '/patron', loginData, function (json, textStatus) {
						if (json.result == 'ok') {
							if (self.eventSettings.events_patron_auth_enabled && self.details.login_required) {
								loginForm.hide();
								detailsForm.show();
							}

							if (!self.eventSettings.client_pinless_auth) {
								if (json.data.names.length > 0) {
									p.find('#first_name').val(json.data.names[0].first_name);
									p.find('#last_name').val(json.data.names[0].last_name);
									if (self.eventSettings.events_patron_details_readonly) {
										p.find('#first_name').prop('disabled', true);
										p.find('#last_name').prop('disabled', true);
									}
								}
								if (json.data.phones.length > 0) {
									p.find('#phone').val(json.data.phones[0]);
									if (self.eventSettings.events_patron_details_readonly) {
										p.find('#phone').prop('disabled', true);
									}
								}
								if (json.data.emails.length > 0) {
									p.find('#email').val(json.data.emails[0]);
									if (self.eventSettings.events_patron_details_readonly) {
										p.find('#email').prop('disabled', true);
									}
								}
							}
							if (json.data.barcodes.length > 0) {
								p.find('#librarycard').val(json.data.barcodes[0]);
							}
							p.find('.events2-reg-card').val('');
							p.find('.events2-reg-pin').val('');
						} else {
							var msg = self.eventSettings.client_pinless_auth ? 'Sorry, card number not found' : 'Sorry, pin or card number not found';
							if (json.message && json.message.length > 0) {
								msg = json.message;
							}
							p.find('.events2-error-message').text(json.message || msg).fadeIn().delay(3000).fadeOut();
						}

						self.regBtn.button('reset');
					}).error(function () {
						p.find('.events2-error-message').text('Sorry, there was a problem making the request').fadeIn().delay(3000).fadeOut();
						self.regBtn.button('reset');
					});

				});

				self.screens.errForm.hide();
				self.screens.regForm.show();

				self.popup.on('focus', '.amrp-missing-field', function (event) {
					$(this).removeClass('amrp-missing-field');
				});
				self.popup.data('plugin_amPopup').open();

				if (self.regtype == 2) {
					if (!allowWaitlist) {
						self.regBtn.removeClass('btn-default').addClass('btn-primary');
						updateButtonText('Registration not available', true);
					} else {
						self.regBtn.removeClass('btn-default').addClass('btn-primary');
						updateButtonText('Join the wait list', true);
					}
				} else {
					self.regBtn.removeClass('btn-default').addClass('btn-primary');
					updateButtonLoading(false);
				}

				self.popup.on('focus', '.amrp-missing-field', function (event) {
					$(this).removeClass('amrp-missing-field');
				});

				if (+self.showPayment === 1) {
					self.PayPalPayFlow.buildForm(self.keyword).then(function (form) {
						form.appendTo(self.screens.paymentScreen);
						self.popup.data('plugin_amPopup').open();
					});
				} else {
					self.popup.data('plugin_amPopup').open();
				}
			});
		}
	});
	return this;
};
/*************************************end regButton*******************************************/

/************************************start  amRecReads****************************************/
$.fn.amRecReads = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		if (!self.data('amRecReads')) {
			self.data('amRecReads', true);
			self.options = $.extend({}, $.fn.amRecReads.defaults, options);
			self.hide();
			self.holder = $('<div class="recreads-holder"></div>').insertAfter(self);
			self.stage = $('<div class="recreads-stage"></div>').appendTo(self.holder);
			self.sections = $('<div class="recreads-sections"></div>').appendTo(self.holder);
			self.currentSection = $('<div class="recreads-current-section"></div>').appendTo(self.holder);

			$('<div class="recreads-section-title vtab"></div>').append('<span>Categories</span>').on('mouseenter', function (event) {
				event.preventDefault();
				openSections();
			}).appendTo(self.sections);
			var i = 1;
			$('>li', self).each(function (id, sectionInfo) {
				var list = $('>ul', this);
				$('<div class="recreads-section-title vtab"></div>')
					.append('<span>' + $(sectionInfo).text().trim() + '</span>')
					.addClass('bg-colour' + i)
					.on('click', function (event) {
						event.preventDefault();
						var v = $(this).clone()
						v.addClass('vtab_selected');

						self.currentSection.empty().append(v);
						self.stage.empty().append(list.clone());
						closeSections();
					})
					.appendTo(self.sections);
				i++;
			});
			$('.recreads-section-title', $(self).parent()).first().next().trigger('click');
		}
		self.sections.on('mouseleave', function (event) {
			event.preventDefault();
			closeSections();
		});
		function closeSections() {
			self.sections.animate({
				left: '100%',
			}).removeClass('recreads-sections-open');

		}
		function openSections() {
			self.sections.animate({
				left: self.holder.outerWidth(true) - self.sections.outerWidth(),
			}).addClass('recreads-sections-open');
		}
	});
	return this;
};
/*************************************end amRecReads*******************************************/

/************************************start  amBookList****************************************/
$.fn.amBookList = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		self.defaults = {
			title: 'Our Recommended Reads'
		};
		if (!self.data('amBookList')) {
			self.data('amBookList', true);
			self.options = $.extend({}, self.defaults, options);
			self.hide();
			self.show = false;
			self.recordSets = [];
			var title = self.attr('data-title') || self.options.title;
			self.holder = $('<div class="ambl-holder"></div>').insertAfter(self);
			self.holder.append('<img class="ambl-events-slideshow-button ' + self.attr('id') + ' ambl-events-slideshow-left" alt="left" title="left" caption="false" src="/images/next-left.png">');
			self.holder.append('<img class="ambl-events-slideshow-button ' + self.attr('id') + ' ambl-events-slideshow-right" alt="right" title="right" caption="false" src="/images/next-right.png"></div>');
			self.catList = $('<div class="ambl-catlist"><div class="ambl-cat-title">' + title + '</div></div>').appendTo(self.holder);
			self.linkBase = self.attr('data-polaris-server') + '/view.aspx?cn=';
			self.vegaUrl = self.attr('data-vega-server') || false;
			self.orgID = parseInt(self.attr('data-org-id')) > 0 ? parseInt(self.attr('data-org-id')) : 1;
			self.perPage = self.attr('data-count');
			init();

			function init() {
				self.catList.on('click', '>span', function (event) {
					event.preventDefault();
					event.stopPropagation();
					self.holder.removeClass('open');
					showSet($(this).data('list'));
				}).on('mouseenter', function (event) {
					event.preventDefault();
					self.holder.addClass('open');
				}).on('mouseleave', function (event) {
					event.preventDefault();
					self.holder.removeClass('open');
				}).on('click', function (event) {
					event.preventDefault();
					self.holder.toggleClass('open');
				});

				$('>li', self).each(function (id, recordSet) {
					self.recordSets.push({ id: $(recordSet).find('>a').attr('data-set-id'), title: $(recordSet).find('>a').text() });
				});
				$.each(self.recordSets, function (index, val) {
					$('<span></span>').text(val.title).data('list', val).appendTo(self.catList);
				});

				if (self.recordSets.length < 2) {
					self.catList.hide();
				}
				showSet(self.recordSets[0]);
			}

			function showSet(recordSet) {
				var w = 75 / self.perPage;
				var client = $('meta[name=client]').attr('content');
				var apiserver = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
				$.getJSON(apiserver + '/v1/' + client + '/polaris/search/', { q: 'brs=' + recordSet.id, page: 1, bibsperpage: 120, keyword: '', sortby: 'AU', limit: '' }, function (json, textStatus) {
					if (json.result !== 'ok' || json.data.TotalRecordsFound <= 0) return;//TODO: fail better
					if (self.show) self.show.cycle('destroy').remove();
					self.show = $('<div class="ambl-show" data-cycle-fx="scrollHorz" data-cycle-log="false" data-cycle-next=".' + self.attr('id') + '.ambl-events-slideshow-right" data-cycle-pause-on-hover="true" data-cycle-prev=".' + self.attr('id') + '.ambl-events-slideshow-left" data-cycle-slides=">div" data-cycle-timeout="15000"></div>').appendTo(self.holder);
					var c = 0;
					var $section = $('<div></div>');
					$.each(json.data.BibSearchRows, function (index, val) {
						if (c >= self.perPage) {
							c = 0;
							$section.appendTo(self.show);
							$section = $('<div></div>');
						}
						c++;

						var server = index % 10;
						var coverUrl = 'https://covers' + server + '.communico.co/' + client + '/cover/?';

						if (val.ISBN) {
							coverUrl += 'type=isbn&id=' + val.ISBN + '&';
						} else if (val.UPC) {
							coverUrl += 'type=upc&id=' + val.UPC + '&';
						} else if (val.OCLC) {
							coverUrl += 'type=oclc&id=' + val.OCLC + '&';
						}

						coverUrl += 'title=' + encodeURIComponent(val.Title || "No Cover Image Available");

						//create link
						var url = self.linkBase + val.ControlNumber + '&orgID=' + self.orgID;
						if (self.vegaUrl && self.vegaUrl.length > 0) {
							url = self.vegaUrl.replace('{{bibid}}', val.ControlNumber);
						}
						var $el = $('<a href="' + url + '">'
							+ '<img alt="' + val.Title + '" title="' + val.Title + '" caption="false" style="width:' + w + '%" src="' + coverUrl + '">');
						$el.appendTo($section);
					});
					$section.appendTo(self.show);
					self.show.cycle();
				});
			}
		}
	});
	return this;
};
/*************************************end amBookList*******************************************/

/************************************start  amCirculation****************************************/

$.fn.amCirculation = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		if (!self.data('amCirculation')) {
			self.data('amCirculation', true);
			self.options = $.extend({}, $.fn.amCirculation.defaults, options);

			// $('.circulation_details', self).qtip({
			// 		content: {
			// 			attr: 'data-desc'
			// 		},
			// 		position: {
			// 			my: 'left top',
			// 			at: 'right bottom',
			// 			viewport: $(window)
			// 		}
			// 	});
			self.footer = $('<div class="circulation_footer">| </div>').insertAfter(self);
			self.children().hide().first().show();
			self.children().each(function (index, el) {
				var c = $(this);
				$('<span class="link">' + $(this).data('category') + '</span>').appendTo(self.footer).on('click', function () {
					$(this).closest('.circulation_footer').find('.active').removeClass('active');
					$(this).addClass('active');
					self.children().hide();
					c.fadeIn();
				});
				self.footer.append(' |');
			});
			self.footer.children().first().addClass('active');

			$('.circulation_details', self).on('click', function (event) {
				event.preventDefault();
				var $data = $('<div class="circulation_popup"/>');

				var author = $(this).closest('.circulation_info').data('author');
				var title = $(this).closest('.circulation_info').data('title');
				$data.append('<h3>' + title + '</h3>');
				$data.append('<h4>By ' + author + '</h4>');
				$(this).closest('.circulation_book').find('.circulation_poster img').clone().appendTo($data);
				$data.append($(this).data('desc'));
				var $popupwidget = showPopupWidget(title, $data);
				$popupwidget.css('width', '460px');
				$popupwidget.position({
					of: $(window)
				});
			});

			$('.circulation_reserve', self).on('click', function (event) {
				event.preventDefault();
				var title = $(this).closest('.circulation_info').data('title');
				var $data = getLoginForm();
				$data.prepend('<p>Reserved your items are held for 7 days, you can collect anytime within this period.</p>');
				var $popupwidget = showPopupWidget('Reserve ' + title, $data);
				$popupwidget.css('width', '460px');
				$popupwidget.position({
					of: $(window)
				});
			});
			$('.circulation_pickup', self).on('click', function (event) {
				event.preventDefault();
				var title = $(this).closest('.circulation_info').data('title');
				var $data = getLoginForm();
				$data.prepend('<p>You can collect your item on your way out of the branch (please allow 15 minutes after your request)</p>');

				var $popupwidget = showPopupWidget('Pickup ' + title, $data);
				$popupwidget.css('width', '460px');
				$popupwidget.position({
					of: $(window)
				});
			});

			function getLoginForm() {
				var $form = $('<div/>');
				$('<p><b>Log in with either your Library Card Number or EZ Login</b></p>').appendTo($form);
				$('<div class="form-group"><label for="libid">Library ID or EZ Username</label><input type="text" class="form-control input-sm" name="libid" id="libid"></div>').appendTo($form);
				$('<div class="form-group"><label for="password">Phone (Last four digits) or EZ Password</label><input type="password" class="form-control input-sm" name="password" id="password"></div>').appendTo($form);
				$('<button class="button">Log in</button>').appendTo($form);
				return $form;
			}
		}
	});
	return this;
};
/*************************************end amCirculation*******************************************/

/************************************start  amSierraRecReads****************************************/
$.fn.amSierraRecReads = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		self.defaults = {
			title: 'Our Recommended Reads'
		};
		if (!self.data('amSierraRecReads')) {
			self.data('amSierraRecReads', true);
			self.options = $.extend({}, self.defaults, options);
			self.hide();
			self.show = false;
			self.sections = [];
			var title = self.attr('data-title') || self.options.title;
			self.holder = $('<div class="ambl-holder"></div>').insertAfter(self);
			self.holder.append('<img class="ambl-events-slideshow-button ' + self.attr('id') + ' ambl-events-slideshow-left" alt="left" title="left" caption="false" src="/images/next-left.png">');
			self.holder.append('<img class="ambl-events-slideshow-button ' + self.attr('id') + ' ambl-events-slideshow-right" alt="right" title="right" caption="false" src="/images/next-right.png"></div>');
			self.catList = $('<div class="ambl-catlist"><div class="ambl-cat-title">' + title + '</div></div>').appendTo(self.holder);
			self.linkBase = self.attr('data-sierra-server');
			self.perPage = self.attr('data-count');

			self.catList.on('click', '>span', function (event) {
				event.preventDefault();
				event.stopPropagation();
				self.holder.removeClass('open');
				showSet($(this).data('list'));
			}).on('mouseenter', function (event) {
				event.preventDefault();
				self.holder.addClass('open');
			}).on('mouseleave', function (event) {
				event.preventDefault();
				self.holder.removeClass('open');
			}).on('click', function (event) {
				event.preventDefault();
				self.holder.toggleClass('open');
			});

			$('>li', self).each(function (sIndex, section) {
				self.sections[sIndex] = { title: $('span', section).text(), items: [] };
				$('ul>li', section).each(function (iIndex, item) {
					self.sections[sIndex].items[iIndex] = $(this).attr('data-bibid');
				});
			});
			$.each(self.sections, function (index, val) {
				$('<span></span>').text(val.title).data('list', val.items).appendTo(self.catList);
			});
			function showSet(items) {
				var w = 75 / self.perPage;
				var client = $('meta[name=client]').attr('content');
				var apiserver = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
				$.getJSON(apiserver + '/v2/' + client + '/sierra/bibs/' + items.join(','), function (json, textStatus) {
					if (json.status !== 'success') return;

					if (self.show) self.show.cycle('destroy').remove();
					self.show = $('<div class="ambl-show" data-cycle-fx="scrollHorz" data-cycle-log="false" data-cycle-next=".' + self.attr('id') + '.ambl-events-slideshow-right" data-cycle-pause-on-hover="true" data-cycle-prev=".' + self.attr('id') + '.ambl-events-slideshow-left" data-cycle-slides=">div" data-cycle-timeout="15000"></div>').appendTo(self.holder);
					var c = 0;
					var $section = $('<div></div>');
					$.each(json.data.entries, function (index, val) {
						if (c >= self.perPage) {
							c = 0;
							$section.appendTo(self.show);
							$section = $('<div></div>');
						}
						c++;

						var server = index % 10;
						var coverUrl = 'https://covers' + server + '.communico.co/' + client + '/cover/?';

						if (val.upcs[0]) {
							coverUrl += 'type=upc&id=' + val.upcs[0] + '&';
						} else if (val.isbns[0]) {
							coverUrl += 'type=isbn&id=' + val.isbns[0] + '&';
						}

						coverUrl += 'title=' + encodeURIComponent(val.title || "No Cover Image Available");

						$('<a target="_blank" href="' + self.linkBase.replace('{{bibid}}', val.id) + '"><img caption="false" title="' + val.title + '" alt="' + val.title + '" style="width:' + w + '%" src="' + coverUrl + '"></a>').appendTo($section);
					});
					$section.appendTo(self.show);
					self.show.cycle();
				});
			}
			if (self.sections.length < 2) {
				self.catList.hide();
			}
			showSet(self.sections[0].items);
		}
	});
	return this;
};
/************************************end  amSierraRecReads****************************************/

/************************************start  amSirsiRecReads****************************************/
$.fn.amSirsiRecReads = function (options) {
	this.each(function (index, el) {
		var self = $(this);
		self.defaults = {
			title: 'Our Recommended Reads'
		};
		if (!self.data('amSirsiRecReads')) {
			self.data('amSirsiRecReads', true);
			self.options = $.extend({}, self.defaults, options);
			self.hide();
			self.show = false;
			self.sections = [];
			var title = self.attr('data-title') || self.options.title;
			self.holder = $('<div class="ambl-holder"></div>').insertAfter(self);
			self.holder.append('<img class="ambl-events-slideshow-button ' + self.attr('id') + ' ambl-events-slideshow-left" alt="left" title="left" caption="false" src="/images/next-left.png">');
			self.holder.append('<img class="ambl-events-slideshow-button ' + self.attr('id') + ' ambl-events-slideshow-right" alt="right" title="right" caption="false" src="/images/next-right.png"></div>');
			self.catList = $('<div class="ambl-catlist"><div class="ambl-cat-title">' + title + '</div></div>').appendTo(self.holder);
			self.linkBase = self.attr('data-sirsi-server');
			self.perPage = self.attr('data-count');

			self.catList.on('click', '>span', function (event) {
				event.preventDefault();
				event.stopPropagation();
				self.holder.removeClass('open');
				showSet($(this).data('list'));
			}).on('mouseenter', function (event) {
				event.preventDefault();
				self.holder.addClass('open');
			}).on('mouseleave', function (event) {
				event.preventDefault();
				self.holder.removeClass('open');
			}).on('click', function (event) {
				event.preventDefault();
				self.holder.toggleClass('open');
			});

			$('>li', self).each(function (sIndex, section) {
				self.sections[sIndex] = { title: $('span', section).text(), items: [] };
				$('ul>li', section).each(function (iIndex, item) {
					self.sections[sIndex].items[iIndex] = $(this).attr('data-bibid');
				});
			});
			$.each(self.sections, function (index, val) {
				$('<span></span>').text(val.title).data('list', val.items).appendTo(self.catList);
			});
			function showSet(items) {
				var w = 75 / self.perPage;
				var client = $('meta[name=client]').attr('content');
				var apiserver = $('meta[name=apiserver]').attr('content') || 'https://api.communico.co';
				$.getJSON(apiserver + '/v2/' + client + '/sirsidynix/bibs/' + items.join(','), function (json, textStatus) {
					if (json.status !== 'success') return;

					if (self.show) self.show.cycle('destroy').remove();
					self.show = $('<div class="ambl-show" data-cycle-fx="scrollHorz" data-cycle-log="false" data-cycle-next=".' + self.attr('id') + '.ambl-events-slideshow-right" data-cycle-pause-on-hover="true" data-cycle-prev=".' + self.attr('id') + '.ambl-events-slideshow-left" data-cycle-slides=">div" data-cycle-timeout="15000"></div>').appendTo(self.holder);
					var c = 0;
					var $section = $('<div></div>');
					$.each(json.data, function (index, val) {
						if (c >= self.perPage) {
							c = 0;
							$section.appendTo(self.show);
							$section = $('<div></div>');
						}
						c++;

						var server = index % 10;
						var coverUrl = 'https://covers' + server + '.communico.co/' + client + '/cover/?';

						if (val.upc) {
							coverUrl += 'type=upc&id=' + val.upc + '&';
						} else if (val.isbns[0]) {
							coverUrl += 'type=isbn&id=' + val.isbns[0] + '&';
						}

						coverUrl += 'title=' + encodeURIComponent(val.title || "No Cover Image Available");

						var bibLink = self.linkBase + val.id + '/a';
						if (self.linkBase && self.linkBase.indexOf('{{bibid}}') > -1) {
							bibLink = self.linkBase.replace('{{bibid}}', val.id);
						}
						$('<a target="_blank" href="' + bibLink + '"><img caption="false" title="' + val.title + '" alt="' + val.title + '" style="width:' + w + '%" src="' + coverUrl + '"></a>').appendTo($section);
					});
					$section.appendTo(self.show);
					self.show.cycle();
				});
			}
			if (self.sections.length < 2) {
				self.catList.hide();
			}
			showSet(self.sections[0].items);
		}
	});
	return this;
};
/************************************end  amSirsiRecReads****************************************/

function completeEventTransaction(ok, registrationCache) { // PayPal PayFlow
	$('#pp-iframe').remove();
	$('#PayPalForm').remove();
	var pppf = new PayPalPayFlow('', false, $("meta[name='client']").attr('content'));

	// 'Thanks screen' for events with context.
	var thanksScreen = $('#reg-screen5', $('.events2-reg-stage'));
	var storage = window.sessionStorage || false;
	thanksScreen.empty();

	if (ok) {
		pppf.showProcessingSuccessAnimation(thanksScreen, 'attend');
		setTimeout(function () {
			// clear the cart. We have success.
			var summary = pppf.showEventSummary(registrationCache);
			thanksScreen.empty().append(summary);
			//window.location.hash = "reserve";
		}, 2000);
	} else {
		pppf.showProcessingErrorAnimation(thanksScreen, 'attend');
		setTimeout(function () {
			//  We failed. Data has been cleared from the db.
			// Let's just leave the cart intact and go back to the rooms page.
			//window.location.hash = "#rooms/action/new";
			window.location.hash = "events";
		}, 5000);
	}
}

function completeRoomTransaction(ok, bookings, transactionData) {
	$('#pp-iframe').remove();
	$('#PayPalForm').remove();
	//var $piframe = $('#pp-iframe');
	var pppf = new PayPalPayFlow('', false, $("meta[name='client']").attr('content'));
	$('.events2-reg-thanks-body').empty();
	var storage = window.sessionStorage || false;
	if (ok) {
		pppf.showProcessingSuccessAnimation($('.amnp-thanks-screen'), 'reserve');
		setTimeout(function () {
			// clear the cart. We have success.
			storage.removeItem('communicoReserveCart');
			pppf.showReserveSummary(bookings, transactionData);
			//window.location.hash = "reserve";
		}, 2000);
	} else {
		pppf.showProcessingErrorAnimation($('.amnp-thanks-screen'), 'reserve');
		setTimeout(function () {
			//  We failed. Data has been cleared from the db.
			// Let's just leave the cart intact and go back to the rooms page.
			//window.location.hash = "#rooms/action/new";
			window.location.hash = "reserve";
		}, 5000);
	}
}
