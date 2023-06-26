const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());


app.get('/api/', async (req, res) => {
  try {
    console.log("Hello");
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ message: 'An error occurred while proxying the request' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
