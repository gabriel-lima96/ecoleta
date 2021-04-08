/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint prettier/prettier: "off" */
import knex from 'knex';

const config = require('../../knexfile');

const connection = process.env.NODE_ENV === 'test' ? knex(config.test) : knex(config.production);

export default connection;
