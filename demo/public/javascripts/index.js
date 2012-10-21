$(function(){
	
	$('.app-setup').submit(function(e){
		var $this = $(this);
		$.post($this.attr('action'), $this.serialize(), function(res){
			if (res.status == 200){
				$('.app-setup button.btn').popover('hide');
				$('.access').removeClass('hide');
				$('.appAccessLink').attr('href', res.request_token.authorize_url);
			} else {
				$('.app-setup button.btn').popover({
					title: 'Wrong info',
					content: "The app key or app secret is wrong.",
					trigger: 'manual', 
				}).popover('show');
				$('.access').addClass('hide');
			}
		});
		e.preventDefault();
		return false;
	});

	$('.access-token button.btn').click(function(){
		var $this = $(this);
		$this.button('loading');
		$.post($this.attr('href'), {}, function(res){
			console.log("response",res);
			if (res.status == 200){
				$('.appAccessLink').tooltip('hide');
				window.location.href = "/view";
			} else {
				$('.access-token').popover({
					title: 'No access',
					content: "You have still not given access for the app to your account.",
					trigger: 'manual', 
				}).popover('show');
				$('.appAccessLink').tooltip('show');
			}
			$this.button('reset');

		});
	})

	$('.appAccessLink').tooltip();


})