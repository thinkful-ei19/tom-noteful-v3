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
    .then(() => {
      const { searchTerm } = req.query;
      let filter = {};

      if (searchTerm) {
        const re = new RegExp(searchTerm, 'i');
        filter.title = { $regex: re };
      }

      return Note.find(filter)
        .sort('created')
        .then(results => {
          console.log(results);
          res.json(results);
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

  console.log('Get a Note');
  res.json({ id: 2 });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2 });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 2 });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();

});

module.exports = router;