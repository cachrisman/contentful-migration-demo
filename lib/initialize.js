'use strict';

const getContentModel = require('./get-content-model');
const newMigration = require('./new-migration');
const migrate = require('./migrate');
const Bluebird = require('bluebird');

module.exports = Bluebird.coroutine(function * (accessToken, space_id) {
  let content_model = yield getContentModel(accessToken, space_id);

  const migrationContent = `'use strict';

let spaceImport = require('contentful-import');

module.exports = {
  up: function () {
    let options = {
      content: {
        contentTypes:     ${JSON.stringify(content_model.contentTypes)},
        locales:          ${JSON.stringify(content_model.locales)},
        webhooks:         ${JSON.stringify(content_model.webhooks)},
        roles:            ${JSON.stringify(content_model.roles)},
        editorInterfaces: ${JSON.stringify(content_model.editorInterfaces)}
      },
      spaceId: '${space_id}',
      managementToken: '${accessToken}'
    };
    console.log('3');
    return spaceImport(options).then((output) =>{
      console.log('4');
      console.log('Data Imported successfully.', output);
    }).catch((err) => {
      console.log('5');
      throw new Error( 'argh! oh no! errors occurred! ' + err);
    });
  },

  down() {

  }
};
`;

  console.log('1');
  newMigration('initial-migration', migrationContent);
  console.log('2');
  migrate(accessToken, space_id);
});

