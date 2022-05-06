const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

//  middleware
app.use(cors());
app.use(express());

async function run() {
    try {

    }
    catch { }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running for warehouse managemet');
});

app.listen(port, () => {
    console.log('Server is running on port', port);
});