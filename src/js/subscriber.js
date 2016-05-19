/* globals
 *   Cordova, DefaultHeight, DefaultWidth, getPosition, OTPlugin, pdebug, replaceWithVideoStream,
 *   TBGetBorderRadius, TBGetScreenRatios, TBSuccess, TBError, TBGetZIndex,
 */
export class TBSubscriber {
  constructor(stream, divName, properties) {
    const element = document.getElementById(divName);
    this.id = divName;
    this.element = element;
    pdebug('creating subscriber', properties);
    this.streamId = stream.streamId;

    if (properties && properties.width === '100%' && properties.height === '100%') {
      element.style.width = '100%';
      element.style.height = '100%';
      properties.width = '';
      properties.height = '';
    }
    const divPosition = getPosition(divName);
    let subscribeToVideo = 'true';
    const zIndex = TBGetZIndex(element);
    let width;
    let height;
    // let name;
    let subscribeToAudio;

    if (properties) {
      width = properties.width || divPosition.width;
      height = properties.height || divPosition.height;
      // name = properties.name || '';
      subscribeToVideo = 'true';
      subscribeToAudio = 'true';
      if (properties.subscribeToVideo && properties.subscribeToVideo === false) {
        subscribeToVideo = 'false';
      }
      if (properties.subscribeToAudio && properties.subscribeToAudio === false) {
        subscribeToAudio = 'false';
      }
    }
    if (!width || !height) {
      width = DefaultWidth;
      height = DefaultHeight;
    }
    const obj = replaceWithVideoStream(divName, stream.streamId, { width, height });
    const position = getPosition(obj.id);
    const ratios = TBGetScreenRatios();
    const borderRadius = TBGetBorderRadius(element);
    pdebug('final subscriber position', position);
    const cordovaParams = [
      stream.streamId,
      position.top,
      position.left,
      width,
      height,
      zIndex,
      subscribeToAudio,
      subscribeToVideo,
      ratios.widthRatio,
      ratios.heightRatio,
      borderRadius
    ];
    Cordova.exec(TBSuccess, TBError, OTPlugin, 'subscribe', cordovaParams);
  }

  getAudioVolume() {
    return 0;
  }

  getImgData() {
    return '';
  }

  getStyle() {
    return {};
  }

  off(/* event, handler */) {
    return this;
  }

  on(/* event, handler */) {
    // todo - videoDisabled
    return this;
  }

  setAudioVolume(/* value */) {
    return this;
  }

  setStyle(/* style, value */) {
    return this;
  }

  subscribeToAudio(/* value */) {
    return this;
  }
  subscribeToVideo(/* value */) {
    return this;
  }

  // deprecating
  removeEventListener(/* event, listener */) {
    return this;
  }
}

window.TBSubscriber = TBSubscriber;
