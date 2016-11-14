/* global Cordova, OT */
import { DefaultHeight, DefaultWidth, OTPlugin, PublisherStreamId } from './constants';
import { TBEvent } from './event';
import {
  getPosition,
  pdebug,
  replaceWithVideoStream,
  tbError,
  tbGenerateDomHelper,
  tbGetBorderRadius,
  tbGetScreenRatios,
  tbGetZIndex,
  tbSuccess,
  tbUpdateObjects
} from './helpers';
import { TBStream } from './stream';

export class TBPublisher {
  constructor(targetElement, properties, completionHandler) {
    if (!targetElement) {
      this.domId = tbGenerateDomHelper();
      this.element = document.getElementById(this.domId);
    } else if (typeof targetElement === 'string') {
      this.domId = targetElement;
      this.element = document.getElementById(this.domId);
    } else {
      this.element = targetElement;
      this.domId = targetElement.id;
    }
    let position = getPosition(this.domId);
    let name = '';
    let publishAudio = 'true';
    let publishVideo = 'true';
    let cameraName = 'front';
    const zIndex = tbGetZIndex(this.element);
    const ratios = tbGetScreenRatios();
    const borderRadius = tbGetBorderRadius(this.element);
    let height;
    let width;

    if (properties) {
      width = properties.width || position.width;
      height = properties.height || position.height;
      name = properties.name || '';
      cameraName = properties.cameraName || 'front';
      if (properties.publishAudio !== undefined && !properties.publishAudio) {
        publishAudio = 'false';
      }
      if (properties.publishVideo !== undefined && !properties.publishVideo) {
        publishVideo = 'false';
      }
    }

    if (!width || !height) {
      width = DefaultWidth;
      height = DefaultHeight;
    }
    pdebug('creating publisher', properties, this.domId, PublisherStreamId, width, height);

    const obj = replaceWithVideoStream(this.domId, PublisherStreamId, { width, height });
    position = getPosition(obj.id);
    tbUpdateObjects();
    OT.getHelper().eventing(this);
    const onSuccess = (result) => {
      pdebug('init publisher success:', result);
      if (completionHandler) {
        completionHandler();
      }
      return tbSuccess(result);
    };
    const onError = (result) => {
      pdebug('init publisher error:', result);
      if (completionHandler) {
        completionHandler(result);
      }
      return tbError(result);
    };
    const initPublisherParams = [
      name,
      position.top,
      position.left,
      width,
      height,
      zIndex,
      publishAudio,
      publishVideo,
      cameraName,
      ratios.widthRatio,
      ratios.heightRatio,
      borderRadius
    ];
    Cordova.exec(onSuccess, onError, OTPlugin, 'initPublisher', initPublisherParams);
    Cordova.exec(
      this.eventReceived.bind(this),
      tbSuccess,
      OTPlugin,
      'addEvent',
      ['publisherEvents']
    );
  }

  setSession(session) {
    this.session = session;
  }

  eventReceived(response) {
    pdebug('publisher event received', response);
    const { data, eventType } = response;
    const { [eventType]: handler } = this;
    if (handler) {
      return handler.bind(this)(data);
    }
    console.log(`handler for event ${eventType} not found`);
    return null;
  }

  streamCreated(event) {
    pdebug('publisher streamCreatedHandler', event);
    pdebug('publisher streamCreatedHandler', this.session);
    pdebug('publisher streamCreatedHandler', this.session.sessionConnection);
    this.stream = new TBStream(event.stream, this.session.sessionConnection);
    const streamEvent = new TBEvent({ stream: this.stream });
    this.trigger('streamCreated', streamEvent);
    return this;
  }

  streamDestroyed(event) {
    pdebug('publisher streamDestroyed event', event);
    const streamEvent = new TBEvent({ stream: this.stream, reason: 'clientDisconnected' });
    this.trigger('streamDestroyed', streamEvent);
    // remove stream DOM?
    return this;
  }

  removePublisherElement() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = undefined;
  }

  destroy() {
    const onSuccess = (result) => {
      this.removePublisherElement();
      return tbSuccess(result);
    };
    if (this.element) {
      Cordova.exec(onSuccess, tbError, OTPlugin, 'destroyPublisher', []);
    }
  }

  getImgData() {
    return '';
  }

  getStyle() {
    return {};
  }

  publishAudio(state) {
    this.publishMedia('publishAudio', state);
    return this;
  }

  publishVideo(state) {
    this.publishMedia('publishVideo', state);
    return this;
  }

  setCameraPosition(cameraPosition) {
    pdebug('setting camera position', { cameraPosition });
    Cordova.exec(tbSuccess, tbError, OTPlugin, 'setCameraPosition', [cameraPosition]);
    return this;
  }

  setStyle(/* style, value */) {
    return this;
  }

  publishMedia(media, state) {
    if (!['publishAudio', 'publishVideo'].contains(media)) {
      return;
    }
    let publishState = 'true';
    if (!state || state === 'false') {
      publishState = 'false';
    }
    pdebug('setting publishstate', { media, publishState });
    Cordova.exec(tbSuccess, tbError, OTPlugin, media, [publishState]);
  }
}
