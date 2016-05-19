export class TBConnection {
  constructor(prop) {
    this.connectionId = prop.connectionId;
    this.creationTime = prop.creationTime;
    this.data = prop.data;
  }

  toJSON() {
    return {
      connectionId: this.connectionId,
      creationTime: this.creationTime,
      data: this.data
    };
  }
}

window.TBConnection = TBConnection;
