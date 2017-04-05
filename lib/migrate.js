'use strict';

const path = require('path');
const Umzug = require('umzug');
const Bluebird = require('bluebird');

const contentful = require('contentful-management');

const migrationDir = 'migrations';

module.exports = Bluebird.coroutine(function * (accessToken, spaceId) {
  const client = contentful.createClient({ accessToken });
  const space = yield client.getSpace(spaceId);

  const umzug = new Umzug({
    storage: require.resolve('./umzug-storage'),
    storageOptions: { space: space, contentTypeId: 'migrations', fieldId: 'name' },
    logging: console.log,
    migrations: {
      params: [ space ],
      path: path.join(process.cwd(), migrationDir)
    }
  });

  return umzug.up().then((migrations) => {console.log('migrations:', migrations);});
  // return umzug.pending().then((migrations) => {console.log('migrations:', JSON.stringify(migrations, null, 2));});
});
