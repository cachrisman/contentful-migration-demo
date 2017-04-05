'use strict';

const Bluebird = require('bluebird');

class UmzugStorage {
  constructor (options) {
    options = options || {};
    const storageOptions = options.storageOptions || {};

    this.space = storageOptions.space;
    this.contentTypeId = storageOptions.contentTypeId;
    this.fieldId = storageOptions.fieldId;
  }

  /**
   * Store migration to be considered as executed.
   */
  logMigration (migrationName) {
    const self = this;

    return Bluebird.coroutine(function * () {
      yield self._createContentTypeIfNotExists();

      yield self.space.createEntry(self.contentTypeId, {
        fields: {
          [self.fieldId]: {
            'en-US': migrationName
          }
        }
      });
    })();
  }

  /**
   * Remove migration to be considered as pending.
   */
  unlogMigration (migrationName) {
    const self = this;

    return Bluebird.coroutine(function * () {
      yield self._createContentTypeIfNotExists();

      const entries = yield self.space.getEntries({
        content_type: self.contentTypeId,
        [self.fieldId]: {
          'en-US': migrationName
        }
      });

      // TOOD Ensure this is only 1
      yield entries[0].delete();
    })();
  }

  /**
   * Gets list of executed migrations.
   */
  executed () {
    const self = this;

    return Bluebird.coroutine(function * () {
      yield self._createContentTypeIfNotExists();

      const entries = yield self.space.getEntries({ content_type: self.contentTypeId });

      return entries.items.map((e) => e.fields[self.fieldId]['en-US']);
    })();
  }

  /*
   * Create the migration table if note exists
   */
  _createContentTypeIfNotExists () {
    const self = this;

    return Bluebird.coroutine(function * () {
      let contentType;

      try {
        contentType = yield self.space.getContentType(self.contentTypeId);
      } catch (e) {
        // TODO only not found
        contentType = yield self.space.createContentTypeWithId(self.contentTypeId, {
          name: 'migrations',
          fields: [{ id: self.fieldId, name: 'Migration', type: 'Symbol' }]
        });

        yield contentType.publish();
      }

      return contentType;
    })();
  }
}

module.exports = UmzugStorage;
