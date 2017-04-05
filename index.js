#!/usr/bin/env node
'use strict';
require('dotenv').config();
const initialize = require('./lib/initialize');
const newMigration = require('./lib/new-migration');
const migrate = require('./lib/migrate');

require('yargs')
  .env('CONTENTFUL')
  .usage('Usage: $0 <cmd> [args]')
  .command('init', 'init', {}, (argv) => {
    return initialize(argv.cmaToken, argv.spaceId);
  })
  .command('new-migration [name]', 'new-migration', {
    name: {
      default: 'default name'
    }
  }, (argv) => {
    return newMigration(argv.name);
  })
  .command('migrate', 'migrate', {}, (argv) => {
    return migrate(argv.CMA_TOKEN, argv.SPACE_ID);
  })
  // .strict()
  .help()
  .argv;
