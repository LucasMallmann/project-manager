'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class File extends Model {
  static get computed () {
    return ['url']
  }
}

module.exports = File
