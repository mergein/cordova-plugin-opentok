/* global Cordova, OT, TB, TBStream, TBStreamConnection */
import { TBConnection } from './connection';
import {
  OTPlugin
} from './constants';
import { OTError } from './error';
import { TBEvent } from './event';
import {
  pdebug,
  streamElements,
  tbError,
  tbGenerateDomHelper,
  tbSuccess,
  tbUpdateObjects
} from './helpers';
import { TBStream } from './stream';
import { TBSubscriber } from './subscriber';

export class TBSession {
  constructor(apiKey, sessionId) {
    this.apiKey = apiKey;
    this.sessionId = sessionId;
    this.capabilities = {
      forceDisconnect: 0, // not implemented
      forceUnpublish: 0, // not implemented
      // assuming all mobile devices have a camera and microphone (and app is trusted to use them)
      publish: 1,
      subscribe: 1 // assuming always possible
    };
    this.apiKey = this.apiKey.toString();
    this.connections = {};
    this.streams = {};
    this.alreadyPublishing = false;
    OT.getHelper().eventing(this);
    Cordova.exec(tbSuccess, tbError, OTPlugin, 'initSession', [this.apiKey, this.sessionId]);
  }

  connect(token, connectCompletionCallback) {
    this.token = token;
    if (typeof connectCompletionCallback !== 'function' && connectCompletionCallback) {
      TB.showError('Session.connect() takes a token and an optional completionHandler');
      return;
    }
    if (connectCompletionCallback) {
      this.on('sessionConnected', connectCompletionCallback);
    }
    Cordova.exec(this.eventReceived.bind(this), tbError, OTPlugin, 'addEvent', ['sessionEvents']);
    Cordova.exec(tbSuccess, tbError, OTPlugin, 'connect', [this.token]);
    return;
  }

  disconnect() {
    Cordova.exec(tbSuccess, tbError, OTPlugin, 'disconnect', []);
  }

  forceDisconnect(/* connection */) {
    return this;
  }

  forceUnpublish(/* stream */) {
    return this;
  }

  getPublisherForStream(/* stream */) {
    return this;
  }

  getSubscribersForStream(/* stream */) {
    return this;
  }

  publish(publisher, completionHandler) {
    if (this.alreadyPublishing) {
      pdebug('Session is already publishing', {});
      return publisher;
    }
    this.alreadyPublishing = true;
    this.publisher = publisher;
    publisher.setSession(this);
    const onSuccess = (result) => {
      if (completionHandler) {
        completionHandler();
      }
      tbSuccess(result);
    };
    const onError = (result) => {
      if (completionHandler) {
        completionHandler(result);
      }
      tbError(result);
    };
    Cordova.exec(onSuccess, onError, OTPlugin, 'publish', []);
    return publisher;
  }

  signal(signal/* , signalCompletionHandler*/) {
    // signal payload: [type, data, connection( separated by spaces )]
    const type = signal.type ? signal.type : '';
    const data = signal.data ? signal.data : '';
    let to = signal.to ? signal.to : '';
    to = typeof to === 'string' ? to : to.connectionId;
    Cordova.exec(tbSuccess, tbError, OTPlugin, 'signal', [type, data, to]);
    return this;
  }

  subscribe(one, two, three, four) {
    this.subscriberCallbacks = {};
    if (four) {
      // stream,domId, properties, completionHandler
      const domId = two || tbGenerateDomHelper();
      const subscriber = new TBSubscriber(one, domId, three);
      this.subscriberCallbacks[one.streamId] = four;
      return subscriber;
    }
    if (three) {
      // stream, domId, properties
      // || stream, domId, completionHandler
      // || stream, properties, completionHandler
      if ((typeof two === 'string' || two.nodeType === 1) && typeof three === 'object') {
        console.log('stream, domId, props');
        const subscriber = new TBSubscriber(one, two, three);
        return subscriber;
      }
      if ((typeof two === 'string' || two.nodeType === 1) && typeof three === 'function') {
        console.log('stream, domId, completionHandler');
        this.subscriberCallbacks[one.streamId] = three;
        const domId = two;
        const subscriber = new TBSubscriber(one, domId, {});
        return subscriber;
      }
      if (typeof two === 'object' && typeof three === 'function') {
        console.log('stream, props, completionHandler');
        this.subscriberCallbacks[one.streamId] = three;
        const domId = tbGenerateDomHelper();
        const subscriber = new TBSubscriber(one, domId, two);
        return subscriber;
      }
    }
    if (two) {
      // stream, domId || stream, properties || stream,completionHandler
      if (typeof two === 'string' || two.nodeType === 1) {
        const subscriber = new TBSubscriber(one, two, {});
        return subscriber;
      }
      if (typeof two === 'object') {
        const domId = tbGenerateDomHelper();
        const subscriber = new TBSubscriber(one, domId, two);
        return subscriber;
      }
      if (typeof two === 'function') {
        this.subscriberCallbacks[one.streamId] = two;
        const domId = tbGenerateDomHelper();
        const subscriber = new TBSubscriber(one, domId, {});
        return subscriber;
      }
    }
    // stream
    const domId = tbGenerateDomHelper();
    const subscriber = new TBSubscriber(one, domId, {});
    return subscriber;
  }

  unpublish(publisher) {
    if (publisher !== this.publisher) {
      pdebug('Wrong publisher specified', {});
      return null;
    }
    this.alreadyPublishing = false;
    this.publisher = null;
    console.log('JS: Unpublish');
    const element = publisher.element;
    if (element) {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      tbUpdateObjects();
    }
    const onSuccess = (result) => {
      publisher.destroy();
      tbSuccess(result);
    };
    const onError = (result) => {
      publisher.destroy();
      tbError(result);
    };
    return Cordova.exec(onSuccess, onError, OTPlugin, 'unpublish', []);
  }

  unsubscribe(subscriber) {
    console.log('JS: Unsubscribe');
    const streamId = subscriber.streamId;
    const element = subscriber.element || document.getElementById(`TBStreamConnection${streamId}`);
    console.log('JS: Unsubscribing');
    if (element) {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      delete streamElements[streamId];
      tbUpdateObjects();
    }
    return Cordova.exec(tbSuccess, tbError, OTPlugin, 'unsubscribe', [streamId]);
  }

  cleanUpDom() {
    let objects = document.getElementsByClassName('OT_root');
    while (objects.length > 0) {
      const e = objects[0];
      if (e && e.parentNode && e.parentNode.removeChild) {
        e.parentNode.removeChild(e);
      }
      objects = document.getElementsByClassName('OT_root');
    }
  }

  // event listeners
  // todo - other events: connectionCreated, connectionDestroyed, signal?, streamPropertyChanged,
  //   signal:type?
  eventReceived(response) {
    pdebug('session event received', response);
    const { data, eventType } = response;
    const { [eventType]: handler } = this;
    if (handler) {
      return handler.bind(this)(data);
    }
    console.log(`handler for event ${eventType} not found`);
    return null;
  }

  connectionCreated(event) {
    const connection = new TBConnection(event.connection);
    const connectionEvent = new TBEvent({ connection });
    this.connections[connection.connectionId] = connection;
    this.trigger('connectionCreated', connectionEvent);
    return this;
  }

  connectionDestroyed(event) {
    pdebug('connectionDestroyedHandler', event);
    const connection = this.connections[event.connection.connectionId];
    const connectionEvent = new TBEvent({ connection, reason: 'clientDisconnected' });
    this.trigger('connectionDestroyed', connectionEvent);
    delete this.connections[connection.connectionId];
    return this;
  }

  sessionConnected(event) {
    pdebug('sessionConnectedHandler', event);
    this.trigger('sessionConnected');
    this.connection = new TBConnection(event.connection);
    this.connections[event.connection.connectionId] = this.connection;
    return this;
  }

  sessionDisconnected(event) {
    pdebug('sessionDisconnected event', event);
    this.alreadyPublishing = false;
    const sessionDisconnectedEvent = new TBEvent({ reason: event.reason });
    this.trigger('sessionDisconnected', sessionDisconnectedEvent);
    this.cleanUpDom();
    return this;
  }

  streamCreated(event) {
    pdebug('streamCreatedHandler', event);
    const stream = new TBStream(event.stream, this.connections[event.stream.connectionId]);
    this.streams[stream.streamId] = stream;
    const streamEvent = new TBEvent({ stream });
    this.trigger('streamCreated', streamEvent);
    return this;
  }

  streamDestroyed(event) {
    pdebug('streamDestroyed event', event);
    const stream = this.streams[event.stream.streamId];
    const streamEvent = new TBEvent({ stream, reason: 'clientDisconnected' });
    this.trigger('streamDestroyed', streamEvent);
    // remove stream DOM
    if (stream) {
      const element = streamElements[stream.streamId];
      if (element) {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        delete streamElements[stream.streamId];
        tbUpdateObjects();
      }
      delete(this.streams[stream.streamId]);
    }
    return this;
  }

  subscribedToStream(event) {
    const { streamId } = event;
    const callbackFunc = this.subscriberCallbacks[streamId];
    if (callbackFunc) {
      if (event.errorCode) {
        const error = new OTError(event.errorCode);
        callbackFunc(error);
      } else {
        callbackFunc();
      }
    }
  }

  signalReceived(event) {
    pdebug('signalReceived event', event);
    const streamEvent = new TBEvent({
      type: event.type,
      data: event.data,
      from: this.connections[event.connectionId]
    });
    this.trigger('signal', streamEvent);
    this.trigger(`signal:${event.type}`, streamEvent);
  }

  // deprecating
  addEventListener(event, handler) {
    this.on(event, handler);
    return this;
  }

  removeEventListener(event, handler) {
    this.off(event, handler);
    return this;
  }
}
