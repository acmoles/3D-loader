"use strict";

var site = {
	init: function() {
		this.sizes = {};
		this.w = $(window);
		this.b = $('body');
		this.d = $(document);
		this.m = $('#main');
		this.nt = this.w.scrollTop();
		this.changed = false;
		this.tran = false;
		this.page = this.b.attr('data-start-page');
		this.pageTitle = "Common Works";
		this.clientImgs = [];
		this.clientImgCount = 0;
		this.currentClientImg = 0;
		this.msgs = [["We Promise...", "...There will be more"], ["Honest to God...", "...We are working on it!"], ["In the meantime...", "...enjoy this 👽"]];
		this.m_count = 0;
		this.visited = {pages:[]};
		this.autoScolling = true;
		this.lastM = {x:0, y:0};
		this.currentM = {x:0, y:0}
		this.dimensions();
		this.states = {};
		this.states[window.location] = this.page;
		this.timer = 0;
		this.wait = 1000;
		this.cancelTime = 1500;
		this.interval;

		window.lazySizesConfig = {expand:800};

		if($('body').attr('data-start-page') == 'Common Works'){
			console.log("%c 👀 🏁 No Peeking 🏁 👀 ", "background: rgba(14,14,14,1); color: white; font-size: x-large;");
		}
		// console.log("%chttps://youtu.be/Q5mtrWlv-n0", "background: rgba(14,14,14,1); color: rgba(14,14,14,1); font-size: x-large;");
		if(!localStorage.Peace) {
			localStorage.setItem('Peace', 'Love: https://youtu.be/OGJAUnNzbhE');
		} else {
			$(".loading-page-title").html('Welcome Back!');
			// console.log('%cWelcome Back!', 'font-weight: bold; font-size: 50px;color: black; text-shadow: 3px 3px 3px rgb(217,31,38) , 6px 6px 3px rgb(226,91,14) , 9px 9px 3px rgb(245,221,8) , 12px 12px 3px rgb(5,148,68) , 15px 15px 3px rgb(2,135,206) , 18px 18px 3px rgb(4,77,145) , 21px 21px 3px rgb(42,21,113)');
		}
		if(!localStorage.Hey) {
			localStorage.setItem('Hey', '');
		} else if(localStorage.Hey != '') {
			this.visited = JSON.parse(localStorage.Hey);
			this.checkVisited();
		}
		if($('.js-ajax-wrapper').hasClass('invert')) {
			this.b.addClass('invert');
		} else {
			this.b.removeClass('invert');
		}

		$('.content').css({'height': '100vh', 'overflow': 'hidden'});

		// this.canDraw = false;

		// this.drawColor = "#4438ff";
		// this.slice = 0;

		// this.drawCanvas = document.getElementById("drawing-canvas");
		// this.drawCanvas.width = window.innerWidth;
		// this.drawCanvas.height = window.innerHeight;
		// this.drawCTX = this.drawCanvas.getContext("2d");

		// this.drawCTX.lineWidth = 1;
		// this.drawCTX.lineJoin = 'round';
		// this.drawCTX.lineCap = 'round';
		// this.drawCTX.strokeStyle = this.drawColor;

		// this.mouse = {x: 0, y: 0};
		// this.last_mouse = {x: 0, y: 0};


		this.bindings();
		this.rebind();
		site.delay();


	},
	dimensions: function() {
		site.sizes.w = window.innerWidth;
		site.sizes.h = window.innerHeight;
		site.sizes.header = $('header').height();
	},
	bindings: function() {

		site.w.on('resize', site.resize);
		site.w.on("popstate", site.popped);
		site.d.on('click', 'a', site.navigate );
		Pace.on('hide', site.paceHide);

		setTimeout(function() {
			Pace.stop();
			// console.log('manually hidden');
		}, site.cancelTime);

		$('.loading-screen').on('animationend webkitAnimationend oAnimationend', site.transition);
		site.w.scroll( site.scrolled );
		$('.metal-mode').click(site.goMetal);
		$('a.phone-number').mouseenter(function() {
			$(this).text($(this).attr('data-num'));
		}).mouseleave(function() {
			$(this).text($(this).attr('data-fake'));
		});
		// site.drawCTX.beginPath();
		// $('body').mousemove(site.draw);

		document.querySelector(".hamburger").addEventListener("click", function() {
			document.body.classList.toggle("menu-active");
		});

	},
	rebind: function() {
		// var thresh = (window.innerWidth / 6)*-1
		// var myLazyLoad = new LazyLoad({
		// 	threshold:thresh,
		// 	callback_load: function(el) {
		// 		$(el).parent().parent().addClass('reveal');
		// 	}
		// });

		$('.hero').css('height', site.sizes.h);

		if($('.hp-clients').length && !site.clientImgs.length) {

			for(var i=0; i < client_images.length; i++) {
				if(client_images[i] != "") {
					var img = new Image();
					img.src = client_images[i];
					site.clientImgs.push(img);
					site.clientImgCount++;
				}
			}

			site.clientCanvas = document.getElementById("clientsCanvas");
			site.clientCanvas.width = site.sizes.w * 2;
			site.clientCanvas.height = $('.hp-clients').height() * 2;
			site.clientCTX = site.clientCanvas.getContext("2d");
			$(document).on('mousemove', site.drawMouse);

		} else if($('.hp-clients').length) {

			site.clientCanvas = document.getElementById("clientsCanvas");
			site.clientCanvas.width = site.sizes.w * 2;
			site.clientCanvas.height = $('.hp-clients').height() * 2;
			site.clientCTX = site.clientCanvas.getContext("2d");
			$(document).on('mousemove', site.drawMouse);

		}

		site.m_count = 0;

		$('.more-coming-soon').click(function() {

			if(site.m_count > site.msgs.length-1) return;

			if(site.m_count > site.msgs.length-2) {
				$(this).find('.hp-img-wrap').html('<iframe src="https://www.youtube.com/embed/Q5mtrWlv-n0?autoplay=1&cc_load_policy=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>')
				$(this).find('.hp-project-description div').html(site.msgs[site.m_count][0]);
				$(this).find('.hp-project-description span').html(site.msgs[site.m_count][1]);
				$(this).find('.black-overlay').remove();
				site.m_count++;
				return;
			}

			$(this).find('.hp-project-description div').html(site.msgs[site.m_count][0]);
			$(this).find('.hp-project-description span').html(site.msgs[site.m_count][1]);
			site.m_count++;

		});

		var $grid = $('.journal-list').isotope({
			itemSelector: '.grid-item',
			percentPosition: true,
			resizesContainer: true,
			masonry: {
				columnWidth: $('.journal-list').find('.grid-item')[0],
			}
		});

		$grid.imagesLoaded().progress( function() {
			$grid.isotope('layout');
		});

		var thisText;

		$('.nextprev-link').mouseenter(function() {
			var tempW = $(this).width();
			thisText = $(this).find('h3').html();
			$(this).find('h3').html($(this).attr('data-ref'));
			$(this).css('min-width', tempW+'px')
		}).mouseleave(function() {
			$(this).find('h3').html(thisText);
			$(this).css('min-width', '');
			// if($(this).hasClass('prev')) {
			// 	$(this).find('h3').html('Previous');
			// } else {
			// 	$(this).find('h3').html('Next');
			// 	$(this).css('min-width', '')
			// }
		});

		// Autoplay video on AJAX
		//-----------------------

		if($('video').length){
			$('video').each(function(index, el) {
				$(this).get()[0].play();
			});
		}

		// New Map stuff
		//--------------

		var img = $('.map-cursor');
		if(img.length > 0){

			var center_x = $(window).width()/2;
			var center_y = ($('.map-container').height()/2);

			function mouse(evt){
				var mouse_x = evt.offsetX;
				var mouse_y = evt.offsetY;
				var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
				var degree = (radians * (180 / Math.PI) * -1) ;
				img.css({
					transform: 'rotate('+degree+'deg)',
					top: mouse_y+'px',
					left: mouse_x+'px'
				});;
			}

			$('.map-container').mousemove(mouse);

		}

		$('.show-previous-screenings').click(function(event) {
			// $('html, body').animate({
			// 	'scrollTop': $('#previous-screenings').offset().top
			// }, 1500);
			$('.expandable-screenings').addClass('expanded');
			$('.show-previous-screenings').addClass('disappear');
		})

		$('.down').click(function() {
			var sp = $(window).scrollTop() / site.sizes.h;
			var speed = 500 * (1-sp);
			$("html, body").animate({ scrollTop: site.sizes.h }, speed);
			return false;

		});

		// Make homepage links scroll you about ( disabled till we go live I guess )
		//-------------------------------------

		if (site.b.attr('id') == 'common-works') {
			// console.log('home');
			$('.projects-link').attr('href', '#projects');
			$('.home-link').attr('href', '#common-works');
		} else {
			// console.log('not home');
			$('.projects-link').attr('href', '/#projects');
			$('.home-link').attr('href', '/');
		}

		//-------------------------------------

		// this.projects = [];

		// $('.nextprev-link a').each(function() {
		// 	var i = $(this).index();
		// 	$this.projects[i] = new ShuffleText($(this).find('h3'));
		// 	$(this).data('index', i)
		// 	.hover(function () {
		// 		$this.projects[$(this).data('index')].setText($(this).attr('data-ref'));
		// 		$this.projects[$(this).data('index')].start();
		// 	}, function () {
		// 		if($(this).parent().hasClass('prev')) {
		// 			var w = 'Previous';
		// 		} else {
		// 			var w = 'Next';
		// 		}
		// 		$this.projects[$(this).data('index')].setText(w);
		// 		$this.projects[$(this).data('index')].start();
		// 	});
		// });


		$('.hero-info-button').click(function() {
			$('.hero-info-content').toggleClass('open');
		});

		$('.close').click(function() {
			$('.hero-info-content').removeClass('open');
		});

		$('.external-video').click(function() {
			var e = $(this).attr('data-embed');
			$(this).append(e);
			$(this).find('.play-overlay').delay(100).fadeOut();
			$(this).find('img').delay(100).fadeOut();
		});

	},
	resize: function() {
		site.sizes.w = window.innerWidth;
		site.sizes.h = window.innerHeight;
		site.sizes.header = $('header').height();
		if($('.hp-clients').length) {
			site.clientCanvas.width = window.innerWidth * 2;
			site.clientCanvas.height = $('.hp-clients').height() * 2;
		}
	},
		scrolled: function(e) {
			var st = site.w.scrollTop();
			if($('.hp-clients').length) {
				if(site.currentM.y > $('.hp-clients').offset().top - st && $('.hp-clients').offset().top - st > -$('.hp-clients').height()) {
					site.drawLogo(site.lastM.x,  site.currentM.y, ($('.hp-clients').offset().top - st));
				}
			}

			if(!site.autoScolling) {
				var h = $('header');
				var b = $('.hamburger')
				var hs = site.sizes.header;
				var ho = h.offset().top;

				if (st < site.nt && site.direction != 'up') {
					site.direction = 'up';
					if((st-hs) >= ho) {
						h.css({'position':'absolute', 'top':st - hs})
					}
				}
				if(st <= ho) {
					h.css({'position':'fixed', 'top': '0px'})
				}
				if(st > site.nt && site.direction != 'down') {
					if(ho < 0) return;
					h.css({'position':'absolute', 'top':ho});
					site.direction = 'down';
				}
				if(st > site.sizes.h - (site.page == 'Journal' ? site.sizes.h : hs)) {
					h.addClass('white');
				} else if(site.page != 'Journal') {
					h.removeClass('white');
				}
				site.nt = st;
			}
		},
		delay: function() {
			site.interval = setInterval(function() {
				site.timer++;
				var w = ((site.sizes.w * 0.9) / site.wait) * site.timer;
				$('.loading-bar').css('width', w + 'px');
				if(w == (site.sizes.w * 0.9)) {
					clearInterval(site.interval);
					site.timer=0;
				}
			}, 1);
		},
		navigate: function() {

			if($(this).hasClass('mailto')) return true;

			var href = $(this).attr("href");

			if ((href.indexOf(document.domain) > -1 || href.indexOf(':') === -1) && href.charAt(0) !== "#") {

				site.href = href;
				// site.canDraw = false;
				// site.drawColor = $(this).attr("data-color") || "#4438ff";
				site.pageTitle = $(this).attr("data-ref") || site.states[site.href] || "Common Works";
				var id = $(this).attr("data-id");

				if($(this).attr("data-ref")) {
					site.states[site.href] = site.pageTitle;
				}

				$('.loading-screen .loading-page-title').html(site.pageTitle);

				if(id) {
					if($.inArray(id, site.visited.pages) < 0) {
						site.visited.pages.push(id);
						localStorage.setItem('Hey', JSON.stringify(site.visited));
					}
				}

				site.autoScolling = true;
				history.pushState({}, '', site.href);
				$('.loading-bar').removeClass('done')
				site.b.addClass('running');
				site.b.removeClass('complete');

				return false;

			} else if(href.charAt(0) == "#") {
				console.log('lll');
				ga('send', 'pageview', {
				 'page': window.location.pathname+href
				});
				// console.log(window.location.href+href);
				// var sp = $(window).scrollTop() / ($(href).offset().top - site.sizes.header);
				// var speed = 500 * (1-sp);
				// $("html, body").animate({ scrollTop: $(href).offset().top - site.sizes.header}, speed);
				// return false;
				var pixels_per_second = 2000;
				var distance = Math.abs($(window).scrollTop( ) - ($(href).offset( ).top - site.sizes.header));
				var scroll_duration = (distance / pixels_per_second) * 1000;
				$("html, body").animate({ 'scrollTop':   $(href).offset().top - site.sizes.header }, scroll_duration);
				return false;
			}

		},
	ajaxLoad: function() {
		site.changedPage = true;
		if(site.pageTitle == 'Projects' || site.pageTitle == 'Design & Technology Studio') {
			site.pageTitle = 'Common Works';
		}
		clearInterval(site.interval);
		if(site.timer >= site.wait) {
			// console.log('longer');
			site.b.addClass('reveal').removeClass('running');
			site.timer = 0;
		} else {
			// console.log('less');
			setTimeout(function() {
				site.b.addClass('reveal').removeClass('running');
				site.timer = 0;
			}, site.wait - site.timer);
		}
		$('.loading-bar').addClass('done').attr('style', '');

		if (site.pageTitle == 'Common Works'){
			document.title = site.pageTitle;
		} else {
			document.title = site.pageTitle+' — Common Works';
		}

		var pageSlug = site.href.replace('https://commonworks.co.uk/','');
		// gtag('config', 'UA-86268158-1', {'page_path': pageSlug });

		ga('send', 'pageview', {
		 'page': pageSlug
		});

		console.log(window.location.pathname);

		site.rebind();
		site.getSong();
	},
	popped: function(e) {
		if (site.changedPage) {

			site.href = location.href;
			site.autoScolling = true;
			site.pageTitle = site.states[site.href] || 'Common Works';

			$('.loading-screen .loading-page-title').html(site.pageTitle);
			// history.pushState({}, '', site.href);
			site.b.addClass('running');
			site.b.removeClass('complete');
			return false;
		}
	},
	paceHide: function() {
		if(site.tran) return;

		$(window).scrollTop(0);
		site.b.addClass('reveal').removeClass('running');
		$('.loading-screen').removeClass('init');
		site.checkVisited();
		clearInterval(site.interval);
		if(site.timer >= site.wait) {
			// console.log('longer');
			site.b.addClass('reveal').removeClass('running');
			site.timer = 0;
		} else {
			// console.log('less');
			setTimeout(function() {
				site.b.addClass('reveal').removeClass('running');
				site.timer = 0;
			}, site.wait - site.timer);
		}
		$('.loading-bar').addClass('done').attr('style', '');
		// $('.content').css({'height': '', 'overflow': ''});
		site.tran = true;
		site.getSong();
	},
	transition: function() {
		if(site.b.hasClass('running')) {
			// site.canDraw = true;

			// site.drawCTX.beginPath();

			if (site.tran) {
				$(window).scrollTop(0);
				site.autoScolling = true;
				// $('.content').css({'height': '100vh', 'overflow': 'hidden'});
				site.b.removeClass('reveal');
				$('header').css('display', 'none');
				site.delay();
				site.loadPage(site.href);
			}

		} else {

			$('.content').css({'height': '', 'overflow': ''});
			site.m.css('height', '');
			site.autoScolling = false;
			site.b.addClass('complete');

		}
	},
	loadPage: function(href) {
		document.body.classList.remove("menu-active");
		this.m.wrapInner('<div class="new-results-div" />');
		var newResultsHeight = $('.new-results-div').outerHeight();
		this.m.height(newResultsHeight);
		$.ajax({
			type: 'GET',
			url: href,
			data: {},
			success: function(result){
				site.m.html(result);
				site.m.wrapInner('<div class="new-results-div" />');
				var newResultsHeight = $('.new-results-div').outerHeight();
				site.m.height(newResultsHeight);

				site.page = site.pageTitle.replace(/\s+/g, '-').toLowerCase();
				site.b.attr('id', site.page);

				site.checkVisited();

				if($('.js-ajax-wrapper').hasClass('invert')) {
					site.b.addClass('invert');
					$('header').attr('style', '');
				} else {
					site.b.removeClass('invert');
					$('header').attr('style', '');
				}

				$('header').removeClass('white');

				var cancel = false;

				setTimeout(function() {
					if(cancel) return;
					// console.log('canceled');
					cancel = true;
					site.ajaxLoad();
				}, site.cancelTime);

				$('.hero').imagesLoaded().done( function( instance ) {
					if(cancel) return;
					// console.log('lazy loaded');
					cancel = true;
					site.ajaxLoad();
				});

				if(window.location.href.indexOf("#") != -1) {
					// var newHash = window.location.href.split('#');
					// var projectTop = $('#'+newHash[1]).offset().top
					// console.log(projectTop);
					var projectTop = site.sizes.h + 616 - 40;
					$(window).scrollTop(projectTop);
				} else {
					console.log('nop');
					$(window).scrollTop(0);
				}

			},
			error: function(){
				// console.log("error.");
				location.reload();
			}
		});
	},
	checkVisited: function() {
		for(var i = 0; i<site.visited.pages.length; i++) {
			var the_id = site.visited.pages[i];
			$('.grid-item[data-id="'+the_id+'"]').removeClass('unread');
		}
		if($('.grid-item').length) {
			var u = $('.grid-item').length - site.visited.pages.length;
			if(u > 20) {u='*'};
			site.pageTitle += ' ('+u+')';
			$('.journal-title').attr('data-unread-count', u);
		}
	},
	isInViewport: function(element) {
		var rect = element.getBoundingClientRect();
		var html = document.documentElement;
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (site.sizes.h || html.clientHeight) &&
			rect.right <= (site.sizes.w || html.clientWidth)
		);
	},
	windowToCanvas : function(x, y) {
		var bbox = site.clientCanvas.getBoundingClientRect();
		return {
			x: x - bbox.left * (site.clientCanvas.width / bbox.width),
			y: y - bbox.top * (site.clientCanvas.height / bbox.height)
		}
	},
	drawLogo: function(x,y,o) {
		var c = site.currentClientImg;
		var imgs = site.clientImgs;
		var l = site.windowToCanvas(x*2, y*2);

		var a = site.currentM.x - site.lastM.x;
		var b = (y - o) - site.lastM.y;
		var d = Math.sqrt( a*a + b*b );

		var randomX = l.x + (Math.random()*300 - 150);

		if(d / 100 > 0.4) {
			site.clientCTX.drawImage(imgs[Math.floor(c)], randomX - (imgs[Math.floor(c)].width/2), (l.y - (o/2)) - (imgs[Math.floor(c)].height/2));
			site.currentClientImg += 1;
			if(site.currentClientImg >= site.clientImgCount) {
				site.currentClientImg = 0;
			}
			site.lastM.y = y - o;
		}
	},
	drawMouse: function(e) {
		if(!$('.hp-clients').length) return;

		if(!$('.hp-clients .text-overlay').hasClass('fade')) {
			if(site.isInViewport($('.hp-clients .text-overlay')[0])) {
				$('.hp-clients .text-overlay').addClass('fade');
			}
		}

		var newMx = e.clientX;
		var newMy = e.clientY;

		site.currentM.x = newMx;
		site.currentM.y = newMy;

		var c = site.currentClientImg;
		var imgs = site.clientImgs;
		var l = site.windowToCanvas(newMx*2, newMy*2);

		var a = newMx - site.lastM.x;
		var b = newMy - site.lastM.y;
		var d = Math.sqrt( a*a + b*b );

		if(d / 100 > 0.5) {
			site.clientCTX.drawImage(imgs[Math.floor(c)], l.x - (imgs[Math.floor(c)].width/2), l.y - (imgs[Math.floor(c)].height/2));
			site.currentClientImg += 1;
			if(site.currentClientImg >= site.clientImgCount) {
				site.currentClientImg = 0;
			}
			site.lastM.x = e.clientX;
			site.lastM.y = e.clientY;
		}
	},
	draw: function(e) {

		// 1200 / 15

		// var l = site.windowToCanvas(e.clientX, e.clientY);
		// var i = document.getElementById('wait');
		// site.drawCTX.drawImage(i, 0, site.slice, 56, 80, e.clientX - 4, e.clientY - 5, 56/2, 80/2);

		// site.drawCTX.drawImage(i, 0, site.slice, 56, 80, site.sizes.w - e.clientX - 4, site.sizes.h - e.clientY - 5, 56/2, 80/2);

		// site.drawCTX.drawImage(i, 0, site.slice, 56, 80, e.clientX - 4, site.sizes.h - e.clientY - 5, 56/2, 80/2);

		// site.drawCTX.drawImage(i, 0, site.slice, 56, 80, site.sizes.w - e.clientX - 4, e.clientY - 5, 56/2, 80/2);



		// site.slice = site.slice+80;
		// if(site.slice > 1200) {
		// 	site.slice = 0;
		// }

		// DRAW LINES

		// if(site.canDraw && site.mouse.x !=0 && site.mouse.y !=0) {

		// 	site.drawCTX.strokeStyle = site.drawColor;

		// 	site.drawCTX.moveTo(site.last_mouse.x, site.last_mouse.y);

		// 	site.drawCTX.lineTo(site.mouse.x, site.mouse.y);

		// 	site.drawCTX.closePath();
		// 	site.drawCTX.stroke();

	 //    }

	 //    site.last_mouse.x = site.mouse.x;
	 //    site.last_mouse.y = site.mouse.y;

		// site.mouse.x = e.clientX;
  //       site.mouse.y = e.clientY;
	},
	getSong: function() {
		$.ajax({
			url: "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=transmission000&api_key=d0232fcdc6f5f7646bb7b00f4457544b&format=json&limit=1&nowplaying=true",
			dataType: "json",
			success: function(res) {
				$('.studio-song').html(res.recenttracks.track[0].name +' – '+ res.recenttracks.track[0].artist['#text']);
			}
		});
	},
	goMetal: function() {
		site.b.append('<div class="metal-thing"></div>');
		$('.metal-thing').click(function() {
			$(this).remove();
		})
	}
}

function ShuffleText(element) {
	this.sourceRandomCharacter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz!@£$%^&*()¡€#¢∞§¶•ªº–≠{}:"|<>?[];,./';
	this.emptyCharacter = '-';
	this.speed = 40;
	this.duration = 500;
	this._isRunning = false;
	this._originalStr = '';
	this._originalLength = 0;
	this._timeCurrent = 0;
	this._timeStart = 0;
	this._randomIndex = [];
	this._requestAnimationFrameId = 0;
	this._element = element[0];
}
ShuffleText.prototype.setText = function(text) {
	this._originalStr = text;
	this._originalLength = text.length;
}
;
Object.defineProperty(ShuffleText.prototype, "isRunning", {
	get: function() {
		return this.isRunning;
	},
	enumerable: true,
	configurable: true
});
ShuffleText.prototype.start = function() {
	var _this = this;
	this.stop();
	this._randomIndex = [];
	var str = '';
	for (var i = 0; i < this._originalLength; i++) {
		var rate = i / this._originalLength;
		this._randomIndex[i] = Math.random() * (1 - rate) + rate;
		str += this.sourceRandomCharacter.charAt(Math.floor(Math.random() * (this.sourceRandomCharacter.length)));
	}
	this._timeStart = new Date().getTime();
	this._isRunning = true;
	this._requestAnimationFrameId = setInterval(function() {
		_this._onInterval();
	}, _this.speed);
	this._element.innerHTML = str;
};
ShuffleText.prototype.stop = function() {
	this._isRunning = false;
	clearInterval(this._requestAnimationFrameId);
};
ShuffleText.prototype.dispose = function() {
	this.sourceRandomCharacter = null;
	this.emptyCharacter = null;
	this._isRunning = false;
	this.duration = 0;
	this._originalStr = null;
	this._originalLength = 0;
	this._timeCurrent = 0;
	this._timeStart = 0;
	this._randomIndex = null;
	this._element = null;
	this._requestAnimationFrameId = 0;
};
ShuffleText.prototype._onInterval = function() {
	var _this = this;
	this._timeCurrent = new Date().getTime() - this._timeStart;
	var percent = this._timeCurrent / this.duration;
	var str = '';
	for (var i = 0; i < this._originalLength; i++) {
		if (percent >= this._randomIndex[i]) {
			str += this._originalStr.charAt(i);
		} else {
			str += this.sourceRandomCharacter.charAt(Math.floor(Math.random() * (this.sourceRandomCharacter.length)));
		}
	}
	if (percent > 1) {
		str = this._originalStr;
		this._isRunning = false;
	}
	this._element.innerHTML = str;
}

$(function() {
	site.init();
});

