const express = require('express');
const listRouter = express.Router();

const pool = require('../modules/pool');

// Get the elements in the table with an optional sort by parameter.
listRouter.get('/:order?/:sort?', (req, res) => {
  const order = req.params.order;
  const sort = req.params.sort;
  // Default sort by.
  let sortBy = 'completed';
  if (sort === 'title') {
    sortBy = 'title';
  } else if (sort === 'priority') {
    sortBy = 'priority';
  } else if (sort === 'due') {
    sortBy = 'due';
  } else if (sort === 'notes') {
    sortBy = 'notes';
  }
  let orderBy = 'ASC';
  if (order === 'DESC') {
    orderBy = 'DESC';
  }
  // create our SQL query (since the input can only be select options it doesn't have to be
  // filtered further).
  const queryText = `SELECT * FROM "list" ORDER BY ${sortBy} ${orderBy}`;
  // send our query to the pool (to postgres).
  pool
    .query(queryText)
    .then((result) => {
      res.status(200).send(result.rows);
    })
    .catch((error) => {
      console.log(`Error making query: ${queryText} ${error}`);
      res.sendStatus(500);
    });
});

// Post a new task to the database table.
listRouter.post('/', (req, res) => {
  // An object of the new task to add.
  const newTask = req.body;
  // Remove any whitespace from the different "!" values.
  const inputs = [newTask.title, newTask.priority.trim(), newTask.due, newTask.notes];
  // Since it's a POST null defaults to an empty string, but to work correctly SQL
  // needs a null value so if the input is an empty string add it as null.
  const filtered = [];
  for (const attribute of inputs) {
    if (attribute === '' || attribute === undefined) {
      filtered.push(null);
    } else {
      filtered.push(attribute);
    }
  }
  // Sanitize the input.
  const queryText = 'INSERT INTO "list" ("title", "priority", "due", "notes") VALUES ($1, $2, $3, $4);';
  pool.query(queryText, [
    filtered[0],
    filtered[1],
    filtered[2],
    filtered[3]
  ])
    .then(() => {
      console.log('Added task!');
      res.sendStatus(201);
    })
    .catch((error) => {
      console.log(`Error adding new task: "${error}"`);
      res.sendStatus(500);
    });
});

// Delete a task from the table based on its unique id.
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

// Toggle the completed status.
listRouter.put('/:id/:completed', (req, res) => {
  const taskId = req.params.id;
  const completed = req.params.completed;
  // Set the queryText to update to either "true" or "false".
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
