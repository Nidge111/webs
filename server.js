const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());


app.get('/.well-known/pki-validation/11223558199E9123ED7987B4B399C906.txt', (req, res) => {
    console.log ("its working breh");
    res.sendFile('ec2-user@ip-172-31-32-186/home/ec2-user/webs/11223558199E9123ED7987B4B399C906.txt');
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});


http://16.16.117.214:3000/home/ec2-user/webs/11223558199E9123ED7987B4B399C906.txt
