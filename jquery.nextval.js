/***************************************************************
 * jQuery.nextVal 1.7.5    3/25/2011
 * Author: John Norton - jukebox42@gmail.com
 * This version works best with jquery 1.4+
 ***************************************************************/
if(typeof jQuery != 'function'){ alert('You need to include jQuery 1.4.x first.'); }
(function($) {
	var nextVal = function($f, opts) {
		var self = this;
		var opt = {
			useSummary:          false,
			useInline:           true,
			useStyles:           true,
			styleParent:         false,
			summaryStyle:        'validation-summary',
			messageStyle:        'validation-message',
			placeholderStyle:	 'validation-placeholder',
			passedStyle:         'validation-passed',
			failedStyle:         'validation-failed',
			ignoreFieldClass:    'validation-ignore',
			useTitles:           false,
			useErrorText:        true,
			summaryId:           'vsummary-',
			messageId:           'vmessage-',
			validationTag:       'ul',
			submitButton:        '', // jQuery Selector
			itemCallback:        function($o, r){return r;},
			formCallback:        function(r){return r;},
			onCall:              function() {return true;},
			onBlur:              false,
			placeholder:         true,
			attach:              'top',
			attachInline:        'bottom',
			customRules:         Array() // Array(Array(NAME, COMPARE FUNCTION, DEFAULT MESSAGE), ... )
		};
		$.extend(opt, opts ? opts : {});
		var init = function(){
			var r = !$f.is('form') ? Math.floor(Math.random()*200) : $('form').index($f);
			$f.attr('nextVal', r);
			if(opt.submitButton != '')
			    $(opt.submitButton).click(function(){return doValidation();});
			else{
			    var $p = !$f.is('form') ? $f.parents('form:first') : $f;
			    $p.bind('submit', function(){return doValidation();});
			}
			if(opt.placeholder && ph)
				$('input[placeholder], textarea[placeholder]', $f).each(function() {
					attachPlaceholders($(this));
				});
			if(opt.onBlur){
				$('input[validate]:checkbox, input[validate]:radio', $f).each(function() {
					var $c = $(this);
					var n = $c.attr('name');
					var v = $c.attr('validate');
					var t = $c.attr('title');
					$('input[name="'+escN(n)+'"]', $f).attr({validate: v, title: t});
				});
				$('input[validate], textarea[validate], select[validate]', $f).bind('blur', function(){return validateItem($(this));});
			}
			$f.data('nextVal', self);
			$f.data('nextVal.validate', function() {doValidation();});
			$f.data('nextVal.validateField', function($o) {validateItem($o);});
			$f.data('nextVal.attachField', function($o) {attachField($o);});
		};
		var attachPlaceholders = function($t){
			if($t.val() == '' || $t.val() == $t.attr('placeholder'))
				if(opt.styleParent)
					$t.val($t.attr('placeholder')).parent().addClass(opt.placeholderStyle);
				else
					$t.val($t.attr('placeholder')).addClass(opt.placeholderStyle);
			$t.bind('focus', function() {
					var $o = $(this);
					if($o.val() == $o.attr('placeholder'))
						if(opt.styleParent)
							$o.val('').parent().removeClass(opt.placeholderStyle);
						else
							$o.val('').removeClass(opt.placeholderStyle);
				}).bind('blur', function() {
					var $o = $(this);
					if($o.val() == '')
						if(opt.styleParent)
							$o.val($o.attr('placeholder')).parent().addClass(opt.placeholderStyle);
						else
							$o.val($o.attr('placeholder')).addClass(opt.placeholderStyle);
				});
		};
		var attachField = function($o){
			if(ph && opt.placeholder && $o.has['placeholder'])
					attachPlaceholders($o);
			if(opt.onBlur){
				if($o.is(':checkbox') || $o.is(':radio'))
				{
					var n = $o.attr('name');
					var v = $o.attr('validate');
					var t = $o.attr('title');
					$('input[name="'+escN(n)+'"]', $f).attr({validate: v, title: t});
				}
				$o.bind('blur', function(){return validateItem($(this));});
			}
		};
		var doValidation = function(){
			if(!opt.onCall)
				return false;
			var r = true;
			var n = $f.attr('nextVal');
			$('#'+opt.summaryId+n).remove();
			var $p = [];
			if(opt.placeholder && ph){
				$p = $('input[placeholder], textarea[placeholder]', $f);
				$.each($p,function(){
					var $o = $(this);
					if($o.attr('placeholder') == $o.val())
						if(opt.styleParent)
							$o.val('').parent().removeClass(opt.placeholderStyle);
						else
							$o.val('').removeClass(opt.placeholderStyle);
				});
			}
			$.each($('input[validate], textarea[validate], select[validate]', $f), function(){
				var V = validateItem($(this));
				if(!V)
					r = false;
			});
			var cb = opt.formCallback(r);
			r = cb == undefined ? r : cb;
			if(opt.placeholder && !r && ph)
				$.each($p,function(){
					var $o = $(this);
					var p = $o.attr('placeholder');
					if($o.val() == '')
						if(opt.styleParent)
							$o.val(p).parent().addClass(opt.placeholderStyle);
						else
							$o.val(p).addClass(opt.placeholderStyle);
				});
			return r;
		};
		var validateItem = function($o){
			var f = $f.attr('nextVal');
			if($o.hasClass(opt.ignoreFieldClass))
				return true;
			var V = true;
			if(opt.styleParent)
				$o.parent().removeClass(opt.passedStyle+' '+opt.failedStyle);
			else
				$o.removeClass(opt.passedStyle+' '+opt.failedStyle);
			$('#'+opt.messageId+f+'-'+escN($o.attr('name'))).remove();
			var validators = [['isempty', function($o){return $o.val()!='';}, 'Please leave this field blank.'],
							  ['empty', function($o){return $o.val()=='';}, 'Please enter the appropriate text in this field..'],
							  ['checked', function($o){return !$o.is(':checked');}, 'It is required that you check this check box.'],
							  ['alpha', function($o){return !$o.val().match(/^[a-zA-Z]+$/);}, 'Please use letters only. For example Sketchy.'],
							  ['decimal', function($o){return !$o.val().match(/^[0-9]+$/);}, 'Please use decimal numbers only. For example 42.'],
							  ['number', function($o){return !$o.val().match(/^[-]?([1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|\.[0-9]{1,2})$/);}, 'Please use numbers only. For example -4.2.'],
							  ['email', function($o){return !$o.val().match(/^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/);}, 'Please enter a valid email address. For example john@somedomain.com.'],
							  ['phone', function($o){return !$o.val().match(/^[01]?[- .]?\(?(?!\d[1]{2})[2-9]\d{2}\)?[- .]?(?!\d[1]{2})\d{3}[- .]?\d{4}$/);}, 'Please enter a valid US/Canada phone number. For example (603) 555-5555.'],
							  ['phone-intl', function($o){return !$o.val().match(/^(\(?\+?[0-9]*\)?)?[0-9_\-\. \(\)]*$/);}, 'Please enter a valid domestic or international phone number.'],
							  ['postal', function($o){return !$o.val().match(/^\d{5}-\d{4}|\d{5}|[A-Z]\d[A-Z] \d[A-Z]\d$/);}, 'Please enter a valid US/Canada postal code. For example 03102.'],
							  ['date', function($o){return !$o.val().match(/^(((((((0?[13578])|(1[02]))[\.\-/]?((0?[1-9])|([12]\d)|(3[01])))|(((0?[469])|(11))[\.\-/]?((0?[1-9])|([12]\d)|(30)))|((0?2)[\.\-/]?((0?[1-9])|(1\d)|(2[0-8]))))[\.\-/]?(((19)|(20))?([\d][\d]))))|((0?2)[\.\-/]?(29)[\.\-/]?(((19)|(20))?(([02468][048])|([13579][26])))))$/);}, 'Please enter a valid date. For example 7/3/1987.'],
							  ['url',function($o){return !$o.val().match(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/);},'Please enter a valid url. For example http://www.example.com'],
							  ['domain',function($o){return !$o.val().match(/^[a-zA-Z0-9\-\.]+\.(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b$/);},'Please enter a valid domain. For example example.com']];
			validators = validators.concat(opt.customRules);
			var l = validators.length;
			if($o.is(':checkbox') && $o.attr('validate') != 'checked' ){
				var a = $o.attr('validate');
				var n = a.match(/.*min\[([\d]*)\].*/) ? a.match(/.*min\[([\d]*)\].*/)[1] : 0;
				var k = a.match(/.*max\[([\d]*)\].*/) ? a.match(/.*max\[([\d]*)\].*/)[1] : 99999;
				var t = $('input[name="'+escN($o.attr('name'))+'"]:checked', $f).size();
				V = t >= n && t <= k ? V : false;
				if(!V)
					doReport($o, 'You have not met the selection requirements.');
			}else{
				var v = ($o.attr('validate')).split(' ');
				var c = null;
				for(var i=0;i<l;i++){
					if(hasValidator($o, validators[i][0])){
						if(validators[i][1]($o)){
							if(v[0] == validators[i][0])
								c = i;
						}
						else
							break;
					}
				}
				if(c !== null){
					doReport($o, validators[c][2]);
					V = false;
				}
			}
			if(opt.useStyles)
				if(opt.styleParent)
					$o.parent().addClass((V ? opt.passedStyle : opt.failedStyle));
				else
					$o.addClass((V ? opt.passedStyle : opt.failedStyle));
			var cb = opt.itemCallback($o, V);
			V = cb == undefined ? V : cb;
			return V;
		};
		var doReport = function($o, m){
			if($o.is(':checkbox') || $o.is(':radio')){
				var $c = $('input[name="'+escN($o.attr('name'))+'"]', $f);
				switch(opt.attach){
					case 'top': case 'custom': $o = $c.first(); break;
					case 'bottom': $o = $c.last(); break;
					default: $o = $c.first(); break;
				}
			}
			if(opt.useInline )
				writeMessage($o, m);
			if(opt.useSummary)
				writeSummary($o, m);
		};
		var writeMessage = function($o, m){
			var o = '<'+opt.validationTag+' class="'+opt.messageStyle+'" id="'+opt.messageId+$f.attr('nextVal')+'-'+$o.attr('name')+'">'+(opt.validationTag=='ul' ? '<li>' : '')+(opt.useErrorText==true&&$o.attr('errorText') ? $o.attr('errorText') : m)+(opt.validationTag=='ul' ? '</li>' : '')+'</'+opt.validationTag+'>';
			switch(opt.attachInline){
				case 'top': return $o.before(o); break;
				case 'bottom': return $o.after(o); break;
				case 'custom': return $o.attr('attach') ? $($o.attr('attach')).first().prepend(o) : $o.before(o); break;
				default: return $(opt.attach).first().prepend(o); break;
			}
		};
		var writeSummary = function($o, m){
			var f = opt.summaryId+$f.attr('nextVal');
			if($('#'+f).size() < 1) {
				var s = '<'+opt.validationTag+' class="'+opt.summaryStyle+'" id="'+f+'"></'+opt.validationTag+'>';
				switch(opt.attach){
					case 'top': $f.prepend(s); break;
					case 'bottom': $f.append(s); break;
					case 'custom': $f.attr('attach') ? $($f.attr('attach')).first().prepend(s) : $f.prepend(s); break;
					default: $(opt.attach).first().prepend(s); break;
				}
			}
			return $('#'+f).append('<'+(opt.validationTag=='ul' ? 'li' : opt.validationTag)+'>'+(opt.useTitles==true&&$o.attr('title') ? $o.attr('title') : m)+'</'+(opt.validationTag=='ul' ? 'li' : opt.validationTag)+'>');
		};
		var hasValidator = function($o, s){
			var v = ($o.attr('validate')).split(' ');
			var l = v.length;
			for(var i=0;i<l;i++)
			{
				if(v[i] == s)
					return true;
			}
			return false;
		};
		var escN = function(n){
			var a = new Array('#', ';', '&', ',', '.', '+', '*', '~', '\'', ':', '"', '!', '^', '$', '[', ']', '(', ')', '=', '>', '|', '/');
			var l = a.length;
			for(var i=0;i<l;i++)
				n = n.replace(a[i], '\\'+a[i]);
			return n;
		};
		var ph = !('placeholder' in document.createElement('input'));
		init();
		return self;
	};

	$.fn.nextVal = function(opt) {
		return this.each(function() {
			(new nextVal($(this), opt));
		});
	};
	$.fn.nextVal.validate = function() {
		return this.each(function() {
			$(this).data('nextVal.validate')();
		});
	};
	$.fn.nextVal.validateField = function() {
		return this.each(function($o) {
			$(this).data('nextVal.validateField')($o);
		});
	};
	$.fn.nextVal.attachField = function() {
		return this.each(function($o) {
			$(this).data('nextVal.attachField')($o);
		});
	};
})(jQuery);