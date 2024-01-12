const mongoose = require('mongoose');
const url = "mongodb://127.0.0.1:27017/SnabbTechDb";

mongoose.connect(url, )
  .then(() => console.log('Connected to database'))
  .catch(error => console.error('Connection error:', error));



