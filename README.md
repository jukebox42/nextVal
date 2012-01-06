# jquery.nextVal

Javascript form validation plugin for jQuery

## Usage

	$(function() {
	   $('form[name=FORM_NAME]').nextVal({
		  ...options...
	   });
	});

## Documentation

	$(function() {
		$('form[name=contact]').nextVal({});
	});

	<h3 id="example0">My Basic Login Form</h3>
	<form name="contact" method="post" action="#example0">
		<p>
			<input type="text" placeholder="E-mail Address" validate="email" name="email" /><br />
			<input type="text" placeholder="Password" validate="empty" name="password" /><br />
			<input type="submit" />
		</p>
	</form>

see http://jukebox42.github.com/nextVal for full documentation.