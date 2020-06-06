## Requirements:
Create a front-end user experience.
Store in the database.
When a task is added refresh (call a function to get every item.)
Each task needs a delete or complete button.

Give each task a different CSS class based on if it's complete or not. (change to bootstrap later.)
Give each task a check mark to indicate it it's done or not.

Confirm the user has filled in every box before submitting.

## My stretch goals:
## Realistic:
Assign an optional "tag" parameter.
Give a "notes" field to add notes about a task.
Assign a "Priority" option for each task (None, !, !!, or, !!! which can be
changed by clicking a button and it rotates through those different values.)
Assign a date/time a task should be completed.
Set a location for a task to be completed?

## Unsure how realistic these are in the time I have:
Allow a task to repeat automatically
Click on a category/attribute to toggle between sorting by that ASC or DESC
Play sound effects when a task is completed, deleted, etc.
Assign a category for a task.
Edit any attribute by clicking it and changing it.
Filter viewing options such as only showing !!! tasks.

## Setup:
npm init --yes
npm install express --save
npm install pg --save

## Routes:
method: delete /:id
delete the task with ID "id"
method: post /add
Pass in an object for a new task.
method: get /
Get all of the tasks in the table (add a sorting option?).
