'use strict';

const contentful = require('contentful-management');

const fs = require('fs');
const bluebird = require('bluebird');
const path = require('path');

const fsStatAsync = bluebird.promisify(fs.stat);
const fsMkdirAsync = bluebird.promisify(fs.mkdir);
const fsWriteFileAsync = bluebird.promisify(fs.writeFile);

const migrationDir = 'migrations';

function getContentModel(accessToken, space_id) {
  var client = contentful.createClient({accessToken});
  return client.getSpace(space_id).then((space) => {
    return bluebird.props({
      contentTypes: space.getContentTypes().then(data => data.items),
      locales:      space.getLocales().then(data => data.items),
      webhooks:     space.getWebhooks().then(data => data.items),
      roles:        space.getRoles().then(data => data.items)
    }).then((response) => {
      if (response.contentTypes.length != 0) {
        response.editorInterfaces = bluebird.all(response.contentTypes.map((contentType) => {
          return contentType.getEditorInterface();
        }));
        return bluebird.props(response);
      }
      return response;
    }).then((response) => {
      return response;
    });
  });
}

module.exports = bluebird.coroutine(function * (accessToken, space_id) {
  const dir = path.join(process.cwd(), migrationDir);

  try {
    yield fsStatAsync(dir);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }

    yield fsMkdirAsync(dir);
  }

  let filename = `${Date.now()}-initial-content-model.json`;
  let content_model = yield getContentModel(accessToken, space_id);
  yield fsWriteFileAsync(path.join(dir, filename), JSON.stringify(content_model, null, 2));
  return content_model;
});
