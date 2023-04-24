// 특정 DOM 의 절대 위치 정보를 조회한다.
function getAbsolutePosition(elem) {
  var r = elem.getBoundingClientRect();
  return {
    top: r.top + window.scrollY,
    bottom: r.bottom + window.scrollY
  }
}

// 특정 DOM 의 Top 을 조회한다.
function getAbsoluteTop(elem) {
  return getAbsolutePosition(elem).top
}

(function() {
  var $body = document.body;
  var $pgHolder = document.getElementById("playground-holder");
  var $pg = document.getElementById("playground");
  var $storyEach = document.getElementById("story-each");
  var $storyTogether = document.getElementById("story-together");
 
  var $cbThumb = document.getElementById("changbae-thumb");
  var $cbIcon = $cbThumb.children[0];
  var $cbContents = Array.from(document.getElementsByClassName("content changbae"));
  var $yrThumb = document.getElementById("yerin-thumb");
  var $yrIcon = $yrThumb.children[0];
  var $yrContents = Array.from(document.getElementsByClassName("content yerin"));
  var $togetherContent = document.getElementsByClassName("content together")[0];

  var cbIconHolders = ['boy', 'man', 'man-with-tuxido', 'couple'];
  var yrIconHolders = ['girl', 'woman', 'woman-with-veil', 'couple'];

  // 동적으로 Dom 의 사이즈가 변경될 수 도 있으니 (이미지 로딩 등),
  // 그냥 매번 계산한다. 현대의 브라우져를 구동하는 단말기들은 생각보다 강력하다.
  function updatePlayground(e) {
    // Playground Holder 의 위치를 정의
    var pgHolderPosition = getAbsolutePosition($pgHolder);

    // Story 의 영역을 결정하는 위치가 story 영역 안쪽에 있을 때 Placeholder 노출을 결정
    var storyEachToken = "on-story-each";
    var storyAfterToken = "after-story-each";
    var storyEachDecider = window.innerHeight + window.scrollY;
    var storyEachPosition = getAbsolutePosition($storyEach);
    if (storyEachDecider > storyEachPosition.top + 1 && storyEachDecider <= pgHolderPosition.bottom) {
      $body.classList.add(storyEachToken);
      $body.classList.remove(storyAfterToken);
    } else if (storyEachDecider > pgHolderPosition.bottom) {
      $body.classList.remove(storyEachToken);
      $body.classList.add(storyAfterToken);
    } else {
      $body.classList.remove(storyEachToken);
      $body.classList.remove(storyAfterToken);
     }

    var togetherContentTop = getAbsoluteTop($togetherContent);

    var cbTops = $cbContents.map(getAbsoluteTop);
    var cbLevel = cbTops.findLastIndex(function(value) { return value < storyEachDecider; });
    $cbIcon.classList.remove(...cbIconHolders);
    if (cbLevel < 0) {
      $cbThumb.style.display = "none";
      $cbThumb.style.left = 0;
      $cbThumb.style.transform = "none";
      $cbyIcon.classList.add(cbIconHolders[0]);
    } else if (storyEachDecider >= togetherContentTop) {
      $yrThumb.style.display = "block";
      $cbThumb.style.left = "50%";
      $cbThumb.style.transform = "translateX(-50%)";
      $cbIcon.classList.add(cbIconHolders[cbIconHolders.length - 1]);
    } else {
      $cbThumb.style.display = "block";
      $cbThumb.style.left = cbLevel / (cbTops.length * 2) * 100 + "%";
      $cbThumb.style.transform = "none";
      $cbIcon.classList.add(cbIconHolders[cbLevel]);
    }

    var yrTops = $yrContents.map(getAbsoluteTop);
    var yrLevel = yrTops.findLastIndex(function(value) { return value < storyEachDecider; });
    $yrIcon.classList.remove(...yrIconHolders);
    if (yrLevel < 0) {
      $yrThumb.style.display = "none";
      $yrThumb.style.right = 0;
      $yrThumb.style.transform = "none";
      $yrIcon.classList.add(yrIconHolders[0]);
    } else if (storyEachDecider >= togetherContentTop) {
      $yrThumb.style.display = "block";
      $yrThumb.style.right = "50%";
      $yrThumb.style.transform = "translateX(50%)";
      $yrIcon.classList.add(yrIconHolders[yrIconHolders.length - 1]);
    } else {
      $yrThumb.style.display = "block";
      $yrThumb.style.right = yrLevel / (yrTops.length * 2) * 100 + "%";
      $yrThumb.style.transform = "none";
      $yrIcon.classList.add(yrIconHolders[yrLevel]);
    }
  }

  var $photosetRows = Array.from(document.getElementsByClassName("photoset-row"));
  var photoMargin = 2;
  function resizeImages(e) {
    $photosetRows.forEach(function($row) {
      var $photoSet = $row.parentNode,
          wholeWidth = $photoSet.offsetWidth,
          n = $row.children.length,
          exactWidth = wholeWidth - (n - 1) * 2 * photoMargin,
          $images = [],
          totalRatio = 0;

      Array.from($row.children).forEach(function($figure) {
        var image = $figure.children[0].children[0];
        totalRatio += parseFloat(image.getAttribute("data-ratio"));
        $images.push(image);
      });

      $images.forEach(function($image) {
        var ratio = parseFloat($image.getAttribute("data-ratio"));
        var width = exactWidth * ratio / totalRatio;
        $image.width = width;
        $image.height = width / ratio;
        $image.src = $image.getAttribute("data-src");

        var parent = $image.parentNode;
        parent.dataset.pswpWidth = wholeWidth;
        parent.dataset.pswpHeight = wholeWidth / ratio;
      });
    });
  }

  var throttler;
  function throttle(e, func) {
    if (!throttler) {
      throttler = setTimeout(function() {
        throttler = null;
        func(e)
      }, 66) // 15fps
    }
  }

  document.addEventListener("scroll", function(e) {
    throttle(e, updatePlayground);
  });

  window.addEventListener("resize", function(e) {
    throttle(e, function(e2) {
      resizeImages(e2);
      updatePlayground(e2);
    });
  });

  document.addEventListener("DOMContentLoaded", function(e) {
    throttle(e, function(e2) {
      resizeImages(e2);
      updatePlayground(e2);
    });
  });

  // goto
  document.addEventListener('click', function(e) {
    if (!e.target) { return }

    var $a = e.target.closest('a');
    if (!$a) { return }


    if ($a.classList.contains('go-to')) {
      e.preventDefault();

      var href = $a.getAttribute('href');
      var marginTop = $a.getAttribute('data-margin-top');
      var $target = document.getElementById(href.replace('#', ''));
      if ($target) {
        var targetTop = getAbsolutePosition($target).top;
        if (marginTop) { targetTop -= parseFloat(marginTop) }

        scroll({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    } else if ($a.classList.contains('share')) {
      e.preventDefault();
      window.navigator.share({
        title: '2023.09.09. 전창배♥정예린 결혼합니다',
        text: '2023년 9월 9일\n전창배 ♥ 정예린 결혼합니다.\n\n서로를 보듬어주고 지켜주며 다져온 인연을\n이제는 부부로서 이어가고자 합니다.\n눈부시게 푸르른 가을 하늘 아래\n새로이 함께하는 저희 두 사람의 모습을\n축복의 박수로 격려 부탁드립니다.\n\n2023년 9월 9일\nW스퀘어 스카이홀',
        url: 'https://jeonchangbae.github.io/changbaeyerin',
      });
    }
  });

}).call(this);
