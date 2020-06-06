const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const listRouter = require('./list.router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('server/public'));

// ROUTES
app.use('/list', listRouter);

// Start listening for requests on a specific port
app.listen(PORT, () => {
  console.log('Running on port', PORT);
});
