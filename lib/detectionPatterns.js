// lib/detectionPatterns.js
module.exports = {
  identitySolutions: {
    id5: {
      name: 'ID5',
      patterns: ['id5-sync.com', 'id5-api', 'ID5.init', '_id5']
    },
    identityLink: {
      name: 'LiveRamp IdentityLink',
      patterns: ['liveramp.com', 'idl_sync', 'IdentityLink']
    },
    sharedID: {
      name: 'SharedID',
      patterns: ['sharedid', '_pubcid', 'pubcid.org']
    }
    // add more here
  },
  prebid: {
    patterns: ['prebid.js', 'pbjs', 'window.pbjs']
  }
};
