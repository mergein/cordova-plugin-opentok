export class TBEvent {
  constructor(prop) {
    for (const key of Object.keys(prop)) {
      this[key] = prop[key];
    }
    this.defaultPrevented = false;
  }

  isDefaultPrevented() {
    return this.defaultValue;
  }

  preventDefault() {
    // todo: implement preventDefault
    return;
  }
}

window.TBEvent = TBEvent;
