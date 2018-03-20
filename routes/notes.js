'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');

const Note = require('../models/notes');


/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  console.log('Get All Notes');
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
      const { searchTerm } = req.query;
      let filter = {};
      let metaScore = {};
      let sort = 'created'; 

      if (searchTerm) {
        filter.$text = { $search: searchTerm };
        metaScore.score = { $meta: 'textScore' };
        sort = metaScore;
      }

      Note.find(filter, metaScore)
        .sort(sort)
        .then(results => {
          res.status(200).json(results);
        })
        .catch(console.error);
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
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  mongoose.connect(MONGODB_URI)
    .then(() => {
      return Note.findById(noteId)
        .then(results => {
          res.status(200).json(results);
        });
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id, tags } = req.body;
  const newItem = { title, content, folder_id };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  mongoose.connect(MONGODB_URI);
  return Note.create({
    title,
    content,
    folder_id,
    tags,
  })
    .then(results => {
      res.location(`${req.originalUrl}`).status(201).json({ results });
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  mongoose.connect(MONGODB_URI);
  return Note.findByIdAndUpdate(noteId, updateObj)
    .then(results => {
      res.location(`${req.originalUrl}`).status(200).json({ results });
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  mongoose.connect(MONGODB_URI);
  return Note.findByIdAndRemove(noteId)
    .then(results => {
      res.status(204).json(results);
    });
});

module.exports = router;