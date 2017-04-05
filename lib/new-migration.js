'use strict';

const fs = require('fs');
const Bluebird = require('bluebird');
const path = require('path');

const fsStatAsync = Bluebird.promisify(fs.stat);
const fsMkdirAsync = Bluebird.promisify(fs.mkdir);
const fsWriteFileAsync = Bluebird.promisify(fs.writeFile);

const migrationDir = 'migrations';

const _migrationContent = `'use strict';

module.exports = {
  up: function (space) {

  },

  down: function (space) {

  }
};
`;

module.exports = Bluebird.coroutine(function * (name, migrationContent = _migrationContent) {
  const dir = path.join(process.cwd(), migrationDir);

  try {
    yield fsStatAsync(dir);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }

    yield fsMkdirAsync(dir);
  }

  yield fsWriteFileAsync(path.join(dir, `${Date.now()}-${name}.js`), migrationContent);
});
