const express = require('express');
const listRouter = express.Router();

// DB CONNECTION
const pool = require('../modules/pool');

// GET /koalas/ (see server.js on how this koalaRouter is mounted to /koalas)
// GET /koalas/?sort=id
listRouter.get('/', (req, res) => {
  const sort = req.query.sort; // name (or whatever gets passed in)
  let sortBy = 'title'; // default
  if (sort === 'id') {
    sortBy = 'id';
  } else if (sort === 'status') {
    sortBy = 'status';
  }
  // create our SQL -- just a string
  const queryText = `SELECT * FROM "list" ORDER BY ${sortBy}`;
  // send our query to the pool (to postgres)
  pool
    .query(queryText)
    .then((result) => {
      res.status(200).send(result.rows);
    })
    .catch((error) => {
      console.log(`Error making query: ${queryText} ${error}`);
      res.sendStatus(500);
    });
  // no return, no res.send -- its all taken care of in the pool handlers
});

listRouter.post('/', (req, res) => {
  const newTask = req.body;
  console.log('Adding koala', newTask);
  const queryText = 'INSERT INTO "list" ("title", "completed", "priority", "due", "notes") VALUES ($1, $2, $3, $4, $5);';
  let completed;
  if (newTask.completed === undefined) {
    completed = false;
  } else {
    completed = newTask.completed;
  }
  pool.query(queryText, [
    newTask.title,
    completed,
    newTask.priority,
    newTask.due,
    newTask.notes
  ])
    .then(() => {
      res.sendStatus(201);
    })
    .catch((error) => {
      console.log(`Error adding new task: "${error}"`);
      res.sendStatus(500);
    });
});

listRouter.delete('/:id', (req, res) => {
  const taskId = req.params.id;
  const queryText = 'DELETE FROM "list" WHERE task_id=$1';
  pool
    .query(queryText, [taskId])
    .then(() => {
      console.log('Deleted task.');
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(`An error occurred while trying to delete task with task_id ${taskId}, "${err}"`);
      res.sendStatus(500);
    });
});

// PUT --> update the transfer status
listRouter.put('/:id/:completed', (req, res) => {
  const taskId = req.params.id;
  const completed = req.params.completed;
  // Set the queryText to update to "true" or "false" depending on
  // what it currently is at the specific id
  const queryText = 'UPDATE "list" SET "completed"=$1 WHERE task_id=$2;';
  pool.query(queryText, [completed, taskId])
    .then(() => {
      console.log('Successfully updated completed status!');
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('Error updating task completed status:', err);
      res.sendStatus(500);
    });
});

// export this router so server.js can use it
module.exports = listRouter;
