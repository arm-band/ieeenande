var $shutterA = $("#shutter");
$(function() {
    //iPhone・iPad背景画像バグ対処
    mobileSafariRequiem();

    //ページトップへ戻る
    pageTop();

    //ページ内スクロール
    pageScroll();

    //トップページか判定し、navbarMenuのリンクを書き換え
    navPathReplace();

//    $.getJSON(jsonFile, {ts: new Date().getTime()}, function(data) {
//    }).done(function(data, status, xhr) {
//    }).fail(function(xhr, status, error) {
//	});

    //geometryangle
    geometryangle();

    //鬚を生やす
    Barba.Pjax.start();
    Barba.Prefetch.init();
});

//mobile Saffari対策
function mobileSafariRequiem() {
    var $eyeCatch = $(".eyecatch");
    var device = navigator.userAgent;
    if (device.indexOf("iPhone") !== -1 || device.indexOf("iPad") !== -1) {
        //iPhoneかiPadならば
        $eyeCatch.addClass("mobile_Safari");
    }
}

//ページトップへ戻る
function pageTop() {
    var returnPageTop = $(".returnPageTop");

	var startPos = 0;
	$(window).on("scroll", function(){
        //スクロール距離が400pxより大きければページトップへ戻るボタンを表示
		var currentPos = $(this).scrollTop();
		if (currentPos > 400) {
			returnPageTop.addClass("active");
		} else {
			returnPageTop.removeClass("active");
		}
	});

	//ページトップへスクロールして戻る
	returnPageTop.on("click", function () {
		$("body, html").animate({ scrollTop: 0 }, 1000, "easeInOutCirc");
		return false;
	});
}

//ページ内スクロール
function pageScroll() {
    $("#barba-wrapper").on("click", "#navbar a", function() { //イベントがクリアされてしまうので親要素(セレクタ)の下の要素(onの第二引数)と書くことで回避
        var speed = 1000;
        var href = $(this).attr("href");
        if($("#indexMain").length) { //トップページの場合のみ動作
            var navbarHeight = parseInt($("#indexPage").attr("data-offset"));
            var $navbar = $("#navbar");
            var target = $(href == "#" || href == "" ? "html" : href);
            var position = target.offset().top - navbarHeight;
            $("body, html").animate({ scrollTop:position }, speed, "easeInOutCirc");
            $navbar.find(".navbar-toggle[data-target=\"#navbarMenu\"]").click(); //移動したらハンバーガーを折りたたむ
            return false;
        }
    });
}

//トップページか判定し、navbarMenuのリンクを書き換え
function indexJadge() {
    var path = "";
    if(!$("#indexMain").length) { //トップページでない場合
        var path = "";
        if($("#newsMain").length) { //新着情報の場合
           path = "../"; //1段階階層を戻る
        }
    }

    return path;
}

//navbarMenuのリンクを書き換え
function navPathReplace() {
    var path = indexJadge();

    if(!$("#indexMain").length) { //トップページでない場合
        $("#navbar a").each(function(index, element){
            var href = $(this).attr("href").slice(1);
            $(this).attr("href", path + "index.html?anchor=" + href);
        });
    }
}

//geometryangle
function geometryangle() {
    $(".eyecatch").Geometryangle({
        mesh: {background:'rgba(30, 187, 238, 1)'},
        lights: [{'ambient':'rgba(24, 184, 230, 1)', 'diffuse':'rgba(49, 83, 241, 1)',autopilot:true}],
        line: {fill:'rgba(30, 187, 238, 1)',draw:true},
        vertex: {radius:0, fill:'rgba(30, 187, 238, 1)', draw:false}
    });
}

//Barba
Barba.Dispatcher.on("newPageReady", function(currentStatus, oldStatus, container, newPageRawHTML) {
//console.log("in");
    //head内のタグを更新
    if (Barba.HistoryManager.history.length === 1) { //ファーストビュー
        return;
    }
    var $newPageHead = $('<head />').html(
        $.parseHTML(
            newPageRawHTML.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0],
            document,
            true
        )
    );
    var headTags = [ // 更新が必要なタグ
        "meta[name='keywords']",
        "meta[name='description']",
        "meta[property^='og']",
        "meta[name^='twitter']",
        "meta[itemprop]",
        "link[rel='icon']"
    ].join(",");
    $("head").find(headTags).remove(); //タグを削除
    $newPageHead.find(headTags).appendTo("head"); //タグを追加

    return false;
});

var shutterA = document.querySelector("#shutter");
//var shutterB = document.querySelector('.shutter-b');

var ShutterAnimation = Barba.BaseTransition.extend({

  start: function() {
//console.log("inin");
    this.shutter(400)
      .then(this.newContainerLoading)
      .then(this.finish.bind(this));
  },

  shutter: function(timer) {
    return new Promise( function (resolve) {
//        if(location.pathname.match(/\/$/gi) || location.pathname.match(/index\.html/gi)) {
            if($shutterA.hasClass("moved")) {
                shutterA.classList.toggle("moved");
            }
//        }
        else {
//            if(!$shutterA.hasClass("moved")) {
                shutterA.classList.toggle("moved");
//            }
        }
//      shutterB.classList.toggle('moved');

      setTimeout(function () {
        resolve();
      }, timer);

    });
  },

  finish: function() {
    //URLのアンカー（?以降の部分）を取得、加工してアンカーに移動する
    var urlSearch = location.search;
    urlSearch = getGET(); //「?」を除去

    if ("scrollingElement" in document) { //Chromeだけプロパティが違うので、オブジェクトをブラウザごとにセット
        tgt = document.scrollingElement;
    }
    else if (this.browser.isWebKit !== undefined) {
        tgt = document.body;
    }
    else {
        tgt = document.documentElement;
    }

    if(urlSearch.anchor === undefined || urlSearch.anchor.length === 0) {
        tgt.scrollTop = 0;
    }
    else {
        var anchor = escapeHtml(urlSearch.anchor);
        var target = $("#" + anchor).offset().top; //アンカーの位置情報を取得
        var navbarHeight = 0;
        if($("#indexMain").length) { //トップページの場合のみ動作
            navbarHeight = parseInt($("#indexPage").attr("data-offset"));
        }
        tgt.scrollTop = Math.floor(target) - navbarHeight; //ナビゲーションバーの高さ分引く
    }
    this.done();

    //トップページか判定し、navbarMenuのリンクを書き換え(DOMクリアのdone走った後に実行)
    navPathReplace();
    //geometryangle
    geometryangle();
  }

});

Barba.Pjax.getTransition = function() {
//console.log("ininin");
  return ShutterAnimation;
};

//HTMLエスケープ
function escapeHtml(string) {
    if(typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, function(match) {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });
}

//GETパラメータ取得
function getGET() {
    var vars = {};
    var param = location.search.substring(1).split('&');
    for(var i = 0; i < param.length; i++) {
        var keySearch = param[i].search(/=/);
        var key = '';
        if(keySearch != -1) key = param[i].slice(0, keySearch);
        var val = param[i].slice(param[i].indexOf('=', 0) + 1);
        if(key != '') vars[key] = decodeURI(val);
    } 
    return vars; 
}