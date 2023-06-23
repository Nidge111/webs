const express = require('express');
const cors = require('cors');
const fs - require('fs');

const app = express();

app.get('/.well-known/pki-validation/D7475779BF8C3489838FBEADA7719A46.txt', (req, res) => {
  res.sendFile(./D7475779BF8C3489838FBEADA7719A46.txt)
});

const backport = 5000; // Choose a suitable port number
app.listen(backport, () => {
  console.log(`Server is running on port ${backport}`);
});
