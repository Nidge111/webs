const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Create a proxy server instance
const proxy = httpProxy.createProxyServer();

// Forward requests from port 80 to port 3000
app.all('*', (req, res) => {
  proxy.web(req, res, { target: 'http://localhost:3000' });
});

// Handle errors from the proxy server
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.status(500).send('Something went wrong.');
});

// Add your existing routes below this line
app.get('/.well-known/pki-validation/11223558199E9123ED7987B4B399C906.txt', (req, res) => {
  console.log("It's working, breh");
  res.sendFile('/home/ec2-user/webs/11223558199E9123ED7987B4B399C906.txt');
});

// Start the proxy server
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
