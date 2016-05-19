export class TBStream {
  constructor( prop, @connection ) {
    for (const key of Object.keys(prop)) {
      this[key] = prop[key];
    }
    this.videoDimensions = { width: 0, height: 0 };
  }
}
