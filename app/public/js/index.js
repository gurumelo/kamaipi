$('#crear').on('click', function() {
	$('#invi').slideDown(500,function() { $('#contrasena').focus(); });
	$('#crear').slideUp();
}); 

$('#menu').on('click', function() {
	$('#cbp-spmenu-s1').toggleClass('cbp-spmenu-open');
	$('body').toggleClass('cbp-spmenu-push-toright');
});

$(document).on('click', '#recuerda', function() {
	$(this).fadeOut('slow', function() {
		$(this).html(':)').fadeIn('slow');
	});
	$('#cbp-spmenu-s1').toggleClass('cbp-spmenu-open');
	$('body').toggleClass('cbp-spmenu-push-toright');
});


$('#t').submit( function(e) {
	e.preventDefault();
	var crypt = new JSEncrypt();
	crypt.setKey('-----BEGIN PUBLIC KEY-----BORRAESTOypegaAQUítuCLAVEpública-----END PUBLIC KEY-----');
	var contrasena = $('#contrasena').val();
	var paso = $('#paso').val();
	var aleatori = $('#aleatori').val();
	var enccontrasena = crypt.encrypt(contrasena);
	var encpaso = crypt.encrypt(paso);
	var encaleatori = crypt.encrypt(aleatori);

	$.ajax({
		dataType: 'json',
		type: 'POST',
		cache: false,
		url: '/t',
		data: { contrasena: enccontrasena, paso: encpaso, aleatori: encaleatori },
		beforeSend: function() {
			$('#carga').show();
			$('#crearsubmit, #contrasena').attr('disabled', 'disabled');
			$('#crearsubmit').css('padding-right', '10px');
		}
	}).done( function(queviene) {
		if (queviene.estado == 1) {
			var resultante = 'Tu número<span class="azul">.</span><div style="font-size: 40px; text-shadow: 2px 1px 1px #000;">'+ queviene.n +'</div>Tu contraseña<span class="azul">.</span><div style="font-size: 45px; text-shadow: 2px 1px 1px #000;">*****</div><div id="recuerda" class="blinkime azul"><img src="img/menu.png" /></div>';
			$('#cajaf').html(resultante);

		}
		if (queviene.estado == 0) {
			$('#err').html('Clave errónea<span class="azul">!</span>').css('display','inline-block');
			$('#carga').hide();
			$('#crearsubmit, #contrasena').removeAttr('disabled');
			$('#crearsubmit').css('padding-right', '28px');
			$('#err').on('click', function() {
				$(this).hide();
			});
		}
	}).fail(function() {
		$('#err').html('<span class="azul">¡</span>Error<span class="azul">!</span>').css('display','inline-block');
		$('#carga').hide();
		$('#crearsubmit, #contrasena').removeAttr('disabled');
		$('#crearsubmit').css('padding-right', '28px');
		$('#err').on('click', function() {
			$(this).hide();
		});
	});	

});

$('#configlinux').on('click', function() {
	$('#configs').show();
});
$('#cerrar').on('click', function() {
	$('#configs').hide();
});
