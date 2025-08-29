$(document).ready(function () {
	if ($('.librarycard-form').length > 0) {
		initLibraryCardForm();
	}
});

function initLibraryCardForm() {
	var $form = $('.librarycard-form');
	if ($form.data('done') === true) return;
	$form.data('done', true);
	var phoneInputs = new coPhoneInput();
	phoneInputs.init();

	$(".librarycard_submit").on('click', function (event) {
		var errFields = [];
		var OK = true;
		var caOK = true;
		var cbOK = true;

		event.preventDefault();

		$(this).prop('disabled', true);
		$('[data-required]', $form).each(function (index, field) {
			var type = $(field).attr('type');
			if (field.tagName.toLowerCase() === 'select') {
				var selected = $(field).children('option:selected').val();
				OK = (typeof selected !== 'undefined' && selected !== null) ? selected.length > 0 : false;
				if (!OK) errFields.push($(field));
			} else {
				switch (type) {
					case 'number':
					case 'text':
					case 'password':
					case 'tel':
						if ($.trim($(field).val()).length === 0) {
							OK = false;
							errFields.push($(field));
						}
						break;
				}
			}
		});

		if (!OK) {
			for (var e = 0; e < errFields.length; e++) {
				var $field = errFields[e];
				$($field).closest('.form-group').addClass('has-error has-feedback').delay(5000).queue(function () {
					$(this).removeClass("has-error has-feedback").dequeue();
				});
				$($field).closest('.form-group').find('.error').text('This field is required.');

			}
			$(".librarycard_submit").removeProp('disabled');
			return;
		}

		if ($('#lc_pin').length > 0) {
			var pin = $('#lc_pin').val();
			var reg = /^\d+$/;
			var nonNumericPin = $('#lc_pin').attr('data-type') === 'text';

			var repeats = pin.match(/(\w)\1+/);
			if (repeats && repeats[0].length > 2) {
				$('#lc_pin').closest('.form-group').find('.error').text('Please choose a more complex PIN').show().delay(5000).fadeOut();
				$(".librarycard_submit").removeProp('disabled');
				return;
			}
			var parts = [];
			for (var index = 0; index < pin.length; index++) {
				if (index + 1 < pin.length) parts.push(pin[index] + pin[index + 1]);
				if (index + 2 < pin.length) parts.push(pin[index] + pin[index + 1] + pin[index + 2]);
				if (index + 3 < pin.length) parts.push(pin[index] + pin[index + 1] + pin[index + 2] + pin[index + 3]);

			}
			var unique = parts.filter(function (x, i, a) {
				return a.indexOf(x) === i;
			});
			if (unique.length < parts.length) {
				$('#lc_pin').closest('.form-group').find('.error').text('Please choose a more complex PIN').show().delay(5000).fadeOut();
				$(".librarycard_submit").removeProp('disabled');
				return;
			}

			if (nonNumericPin) {
				if (pin.length < 6) {
					$('#lc_pin').closest('.form-group').find('.error').text('Your PIN must be at least 6 characters long').show().delay(5000).fadeOut();
					$(".librarycard_submit").removeProp('disabled');
					return;
				}
			} else {
				if (pin.length !== 4) {
					$('#lc_pin').closest('.form-group').find('.error').text('Your PIN must be 4 digits long').show().delay(5000).fadeOut();
					$(".librarycard_submit").removeProp('disabled');
					return;
				}
				if (!reg.test(pin)) {
					$('#lc_pin').closest('.form-group').find('.error').text('PIN may only be numbers').show().delay(5000).fadeOut();
					$(".librarycard_submit").removeProp('disabled');
					return;
				}
			}
		}

		var email = $('#lc_email').val();
		var re = /\S+@\S+\.\S+/;
		var eOK = re.test(email);
		if (!eOK) {
			$("#lc_email").closest('.form-group').addClass('has-error has-feedback').delay(5000).queue(function () {
				$(this).removeClass("has-error has-feedback").dequeue();
			});
			$("#lc_email").closest('.form-group').find('.error').text('Please enter a valid email address.');
			$(".librarycard_submit").removeProp('disabled');
			return;
		}

		var ca = document.querySelector('co-address');
		if (ca) {
			caOK = ca.requiredOK;
		}

		if (!caOK) {
			$form.parent().find('.error-address').text('Please check address information is correct.').show().delay(5000).fadeOut();
			$(".librarycard_submit").removeProp('disabled');
			return;
		}

		var cb = document.querySelector('co-birthdate');
		if (cb) {
			var min = cb.getAttribute('min-age');
			if (min) {
				var bd = moment(cb.birthdate);
				var now = moment();

				if (now.diff(bd, 'years') < min) {
					$form.parent().find('.error-birthdate').text('You do not meet minimum age requirement to register for a card.').show().delay(5000).fadeOut();
					$(".librarycard_submit").removeProp('disabled');
					return;
				}
			}
			if (cb.birthdateRequired) {
				cbOK = cb.requiredOK && cb.isValid;
			} else {
				cbOK = cb.requiredOK;
			}
		}

		if (!cbOK) {
			$form.parent().find('.error-birthdate').text('Please check birthdate information is correct.').show().delay(5000).fadeOut();
			$(".librarycard_submit").removeProp('disabled');
			return;
		}
		if ($('#ip_check').val() !== '1') {
			$form.parent().find('#main-error').text('Sorry you are unable to register from your current location.').show().delay(5000).fadeOut();
			$(this).prop('disabled', false);
			return;
		}

		var address_required = $('co-address').attr('address-required');
		if (parseInt(address_required) === 1) {
			checkLibraryCardAddress($form).then(function (response) {
				if (response.ok) {
					sendLibraryCard($form)
				} else {
					$(".librarycard_submit").prop('disabled', false);
					$form.parent().find('#main-error').text('You are unable to register from your current location.').show().delay(5000).fadeOut();
				}
			});
		} else {
			sendLibraryCard($form);
		}

		return;
	});
}

function sendLibraryCard($form) {
	sendLibraryCardForm($form).then(function (data) {
		$(".librarycard_submit").prop('disabled', false);
		// Maybe some kind of special success?
		var status = '';
		var response_html = '';
		status = (typeof data.status === 'undefined') ? 'failed' : data.status;
		response_html = (typeof data.response_html === 'undefined') ? '' : data.response_html;

		showLibraryCardResponse($form, status, response_html);
	});
}

function checkLibraryCardAddress($form) {
	return new Promise(function (resolve, reject) {
		var formId = $form.attr('id');
		var widgetId = formId.substr(formId.indexOf("_") + 1);
		var ca = document.querySelector('co-address');
		var cd = new CoDataFunctions($('meta[name=client]').attr('content'));
		var addr = ca.address;
		cd.options = { postcode: addr.postcode, widgetid: widgetId, state: addr.state };
		cd.mapcheck.then(function (response) {
			resolve(response);
		})
			.catch(function (reason) {
				reject(reason);
			});
	});
}

function sendLibraryCardForm($form) {
	return new Promise(function (resolve, reject) {
		var postString = $form.serialize();
		var ca = document.querySelector('co-address');
		var cb = document.querySelector('co-birthdate');
		var address_required = $('co-address').attr('address-required');
		if (ca) {
			var address = ca.address;
			if (address) {
				for (var key in address) {
					postString += '&lc_' + key + '=' + address[key];
				}
			}
		}

		if (cb) {
			// We could wind up here with a non-valid birthdate, so let's just double check
			// We won't stop anything because we just want to exclude birthdate if it isn't valid
			// If it isn't valid and it is required it will be stopped above.
			if (cb.isValid) {
				postString += '&lc_birthdate=' + cb.formattedBirthdate;
			}
		}

		$.ajax({
			type: "POST",
			url: $form.attr('action'),
			data: postString,
			success: function (data) {
				resolve(data);
			},
			error: function (xhr, status, errorThrown) {
				reject(errorThrown);
			}
		});
	});
}

function showLibraryCardResponse($form, status, html) {
	$form.slideUp(400, function () {
		var msg = status === 'ok' ? 'Successfully Created Library Card!' : 'I\'m sorry there was an problem creating your library card, please check your information and try again. If you are still unable to create a card please contact us.';
		var animationHTML = '';
		var errorHTML = "<div class='row card-message-row'>" +
			"	<div class='col-xs-12 col-sm-12'>" +
			"		<div class='amnp-paypal-loader' style='text-align:center;width:100%;height:100%'>" +
			"			<div class='svg-box'>" +
			"				<svg class='circular red-stroke'>" +
			"					<circle class='path' cx='75' cy='75' r='50' fill='none' stroke-width='5' stroke-miterlimit='10'/>" +
			"				</svg>" +
			"				<svg class='cross red-stroke'>" +
			"					<g transform='matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)'>" +
			"						<path class='first-line' d='M634.087,300.805L673.361,261.53' fill='none'/>" +
			"					</g>" +
			"					<g transform='matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)'>" +
			"						<path class='second-line' d='M634.087,300.805L673.361,261.53'/>" +
			"					</g>" +
			"				</svg>" +
			"			</div>" +
			"		</div>" +
			"	</div>" +
			"</div>" +
			"<div class='row'><div class='col-md-12'><p class='amnp-processing-final' style='text-align:center;font-size: 1.2em;'>" + msg + "</p></div></div>";

		var successHTML = "<div class='row card-message-row'>" +
			"	<div class='col-xs-12'>" +
			" 		<div class='amnp-paypal-loader' style='text-align:center;width:100%;height:100%'>" +
			"				<div class='svg-box'>" +
			"					<svg class='circular green-stroke'>" +
			"						<circle class='path' cx='75' cy='75' r='50' fill='none' stroke-width='5' stroke-miterlimit='10'/>" +
			"					</svg>" +
			"					<svg class='checkmark green-stroke'>" +
			"						<g transform='matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)'>" +
			"							<path class='checkmark__check' fill='none' d='M616.306,283.025L634.087,300.805L673.361,261.53'/>" +
			"						</g>" +
			"					</svg>" +
			"				</div>" +
			"			</div>" +
			"			<p class='amnp-processing-final' style='text-align:center;font-size: 1.2em;'>" + msg + "</p>" +
			"		</div>" + // End col-md-2
			" 	<div class='col-xs-12'>" + html + "</div>"
		"</div>";  // End row

		if (status === 'ok') {
			animationHTML = successHTML;
		} else {
			animationHTML = errorHTML;
		}

		var $animation = $(animationHTML);
		var $continue = $("<div class='row card-button-row'><div class='col-xs-6 col-xs-offset-3'><button class='btn btn-primary btn-block' id='continue'>Continue</button></div></div>");
		var ca = document.querySelector('co-address');
		var cb = document.querySelector('co-birthdate');

		$form.parent().append($animation).append($continue);

		$('#continue').on('click', function () {
			$form.trigger('reset');
			$form.slideDown();
			$('.card-button-row, .card-message-row').remove();
			$('.amnp-processing-final').remove();

			if (ca) {
				ca.reset();
			}

			if (cb) {
				cb.reset();
			}

			if (grecaptcha) {
				grecaptcha.reset();
			}
		});
	});

}