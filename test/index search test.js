'use strict';
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/notes');

mongoose.connect(MONGODB_URI)
  .then(() => Note.createIndexes(
    {
      weights: {
        title: 10,
        content: 5
      },
    }
  ))
  .then(() => {
    return Note.find(
      { $text: { $search: 'ways' } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } })
      .then(results => {
        console.log(results);
      });
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => {
        console.info('Disconnected');
      });
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });