// struzan.js - custom previews for embedded movies
// Copyright (c) 2015 Sander Dijkhuis <mail@sanderdijkhuis.nl>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(function() {

  function forEach(list, cb) { Array.prototype.forEach.call(list, cb); }
  function str() { return Array.prototype.slice.call(arguments).join(''); }
  function firstMatch(regexp, str) { return regexp.exec(str)[0]; }
  function createNode(name, attrs) {
    var node = document.createElement(name);
    for (var key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  }

  function createVideoFrame(id, w, h, color) {
    return createNode('iframe', {
      src: str('https://player.vimeo.com/video/', id, '?color=',
               color, '&title=0&byline=0&portrait=0&autoplay=1'),
      width: w,
      height: h,
      frameborder: '0',
      webkitallowfullscreen: 'true',
      mozallowfullscreen: 'true',
      allowfullscreen: 'true'
    });
  }
  function replaceLinkWithVideoFrame(node, id, w, h, color) {
    var frame = createVideoFrame(id, w, h, color);

    node.parentNode.insertBefore(frame, node);
    frame.style.display = 'none';
    node.className += ' loading';
    frame.addEventListener('load', function() {
      frame.style.display = 'inline-block';
      node.parentNode.removeChild(node);
    })
  }
  function backgroundImageHandler(node, id, w, h) {
    return function(e) {
      if (e.target.status == 404) {
        cancel(node);
      } else {
        var data = JSON.parse(e.target.response);
        var thumbnail = data[0].thumbnail_large;
        var id = firstMatch(/(\d+)/, thumbnail);

        node.style.backgroundImage = str('url(https://i.vimeocdn.com/video/',
                                         id, '.jpg?mw=', w, '&mh=', h, ')');
      }
    };
  }
  function clickHandler(node, id, w, h, color) {
    return function(e) {
      if (!node.dataset.canceled) {
        e.preventDefault();
        replaceLinkWithVideoFrame(node, id, w, h, color);
      }
    };
  }
  function cancel(node) {
    node.dataset.canceled = 'true';
  }
  function addPreviewToLink(node) {
    var id = firstMatch(/(\d+)$/, node.href);
    var w = node.clientWidth;
    var h = node.clientHeight;
    var color = node.dataset.color;
    var req = new XMLHttpRequest();

    req.addEventListener('load', backgroundImageHandler(node, id, w, h));
    req.open('GET', str('https://vimeo.com/api/v2/video/', id, '.json'));
    req.send();

    node.dataset.cvimeo = 'true';
    node.addEventListener('click', clickHandler(node, id, w, h, color));
  }
  function struzan(selector) {
    var adv = str(selector, ':not([data-cvimeo])');
    var links = document.querySelectorAll(adv);
    forEach(links, addPreviewToLink);
  }

  window.struzan = struzan;

})();
