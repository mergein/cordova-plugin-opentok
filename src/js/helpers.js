/* globals Cordova, WebKitCSSMatrix */
import {
  OTPlugin,
  PublisherStreamId,
  PublisherTypeClass,
  SubscriberTypeClass,
  VideoContainerClass
} from './constants';

export const streamElements = {}; // keep track of DOM elements for each stream

// Whenever updateViews are involved, parameters passed through will always have:
// TBPublisher constructor, tbUpdateObjects, TBSubscriber constructor
// [id, top, left, width, height, zIndex, ... ]

//
// Helper methods
//
export const getPosition = (divName) => {
  // Get the position of element
  let pubDiv = document.getElementById(divName);
  if (!pubDiv) { return {}; }
  const computedStyle = window.getComputedStyle ? getComputedStyle(pubDiv, null) : {};
  let transform = new WebKitCSSMatrix(window.getComputedStyle(pubDiv).transform || '');
  const width = pubDiv.offsetWidth;
  const height = pubDiv.offsetHeight;
  let curtop = pubDiv.offsetTop + transform.m41;
  let curleft = pubDiv.offsetLeft + transform.m42;
  pubDiv = pubDiv.offsetParent;
  while (pubDiv) {
    transform = new WebKitCSSMatrix(window.getComputedStyle(pubDiv).transform || '');
    curleft += pubDiv.offsetLeft + transform.m41;
    curtop += pubDiv.offsetTop + transform.m42;
    pubDiv = pubDiv.offsetParent;
  }
  const marginTop = parseInt(computedStyle.marginTop, 10) || 0;
  const marginBottom = parseInt(computedStyle.marginBottom, 10) || 0;
  const marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
  const marginRight = parseInt(computedStyle.marginRight, 10) || 0;
  return {
    top: curtop + marginTop,
    left: curleft + marginLeft,
    width: width - (marginLeft + marginRight),
    height: height - (marginTop + marginBottom)
  };
};

export const replaceWithVideoStream = (divName, streamId, properties) => {
  const typeClass = streamId === PublisherStreamId ? PublisherTypeClass : SubscriberTypeClass;
  const element = document.getElementById(divName);
  element.setAttribute('class', `OT_root ${typeClass}`);
  element.setAttribute('data-streamid', streamId);
  element.style.width = `${properties.width}px`;
  element.style.height = `${properties.height}px`;
  element.style.overflow = 'hidden';
  element.style['background-color'] = '#000000';
  streamElements[streamId] = element;

  const internalDiv = document.createElement('div');
  internalDiv.setAttribute('class', VideoContainerClass);
  internalDiv.style.width = '100%';
  internalDiv.style.height = '100%';
  internalDiv.style.left = '0px';
  internalDiv.style.top = '0px';

  const videoElement = document.createElement('video');
  videoElement.style.width = '100%';
  videoElement.style.height = '100%';
  // TODO:
  //   js change styles or append css stylesheets? Concern: users will not be able to change via css

  internalDiv.appendChild(videoElement);
  element.appendChild(internalDiv);
  return element;
};

export const tbError = (error) => {
  if (window.OT.errorCallback) {
    window.OT.errorCallback(error);
  } else {
    console.error(error);
  }
};

export const tbSuccess = () => {
  // console.log('success');
};

export const tbGetZIndex = (element) => {
  let ele = element;
  while (ele) {
    const val = document.defaultView.getComputedStyle(ele, null).getPropertyValue('z-index');
    // console.log val
    if (parseInt(val, 10)) {
      return val;
    }
    ele = ele.offsetParent;
  }
  return 0;
};

// Ratio between browser window size and viewport size
export const tbGetScreenRatios = () => ({
  widthRatio: window.outerWidth / window.innerWidth,
  heightRatio: window.outerHeight / window.innerHeight
});

export const tbGetBorderRadius = (element) => {
  let ele = element;
  while (ele) {
    const val = document.defaultView.getComputedStyle(ele, null).getPropertyValue('border-radius');
    if (val && (val.length > 1) && (val !== '0px')) {
      if (val.indexOf('%') === (val.length - 1)) {
        return Math.round(ele.offsetWidth * (parseFloat(val.substring(0, val.length - 1)) / 100));
      } else if (val.indexOf('px') === (val.length - 2)) {
        return parseInt(val.substring(0, val.length - 2), 10);
      }
    }
    ele = ele.offsetParent;
  }
  return 0;
};

export const tbUpdateObjects = () => {
  // console.log('JS: Objects being updated in tbUpdateObjects')
  const objects = document.getElementsByClassName('OT_root');

  const ratios = tbGetScreenRatios();

  for (const e of objects) {
    // console.log('JS: Object updated')
    const streamId = e.dataset.streamid;
    // console.log('JS sessionId: ' + streamId )
    const id = e.id;
    const position = getPosition(id);
    const cordovaParams = [
      streamId,
      position.top,
      position.left,
      position.width,
      position.height,
      tbGetZIndex(e),
      ratios.widthRatio,
      ratios.heightRatio,
      tbGetBorderRadius(e)
    ];
    Cordova.exec(tbSuccess, tbError, OTPlugin, 'updateView', cordovaParams);
  }
  return;
};

export const tbGenerateDomHelper = () => {
  const domId = `PubSub ${Date.now()}`;
  const div = document.createElement('div');
  div.setAttribute('id', domId);
  document.body.appendChild(div);
  return domId;
};

export const pdebug = (msg, data) => {
  console.log(`JS Lib: ${msg}:`, data);
};
