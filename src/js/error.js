const codesToTitle = {
  1004: 'OTAuthorizationFailure',
  1005: 'OTErrorInvalidSession',
  1006: 'OTConnectionFailed    ',
  1011: 'OTNullOrInvalidParameter',
  // 1010: 'OTNotConnected ',
  1015: 'OTSessionIllegalState ',
  1503: 'OTNoMessagingServer    ',
  1023: 'OTConnectionRefused    ',
  1020: 'OTSessionStateFailed   ',
  1403: 'OTP2PSessionMaxParticipants',
  1021: 'OTSessionConnectionTimeout ',
  // 2000: 'OTSessionInternalError  ',
  1461: 'OTSessionInvalidSignalType',
  1413: 'OTSessionSignalDataTooLong',
  1022: 'OTConnectionDropped',
  1112: 'OTSessionSubscriberNotFound',
  1113: 'OTSessionPublisherNotFound',
  // 0: 'OTPublisherSuccess',
  1010: 'OTSessionDisconnected',
  // 2000: 'OTPublisherInternalError',
  1610: 'OTPublisherWebRTCError',
  0: 'OTSubscriberSuccess$',
  1542: 'OTConnectionTimedOut',
  1541: 'OTSubscriberSessionDisconnected',
  1600: 'OTSubscriberWebRTCError',
  1604: 'OTSubscriberServerCannotFindStream',
  2000: 'OTSubscriberInternalError'
};

export class OTError {

  constructor(errCode, errMsg) {
    this.code = errCode;
    if (errMsg) {
      this.message = errMsg;
    } else if (codesToTitle[errCode]) {
      this.message = codesToTitle[errCode];
    } else {
      this.message = 'OpenTok Error';
    }
  }
}
