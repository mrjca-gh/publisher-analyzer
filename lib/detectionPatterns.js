// lib/detectionPatterns.js
module.exports = {
  identitySolutions: {
    id5: {
      name: 'ID5',
      patterns: [
        'id5-api.com',
        'id5-sync.com',
        'id5PartnerId',
        'id5id',
        'ID5.init',
        'window.ID5'
      ]
    },
    liveRamp: {
      name: 'LiveRamp',
      patterns: [
        'ats-wrapper',
        'atscdn.net',
        'liveramp.com',
        'lr_env',
        'ats.js',
        'ATS.init'
      ]
    },
    lotame: {
      name: 'Lotame',
      patterns: [
        'crwdcntrl.net',
        'lotame.com',
        'ltm.js',
        'lotame_*',
        'cc.js',
        '_cc*'
      ]
    },
    uid2: {
      name: 'UID2',
      patterns: [
        'uid2.com',
        'unifiedid.com',
        '__uid2',
        'uid2Token',
        'uid2-sdk',
        'UID2.init'
      ]
    }
  },
  prebid: {
    name: 'Prebid',
    patterns: [
      'pbjs',
      'prebid.js',
      'pbjs.que',
      'pbjs.version',
      'prebid-universal-creative',
      'pbjs.adUnits'
    ]
  }
};
