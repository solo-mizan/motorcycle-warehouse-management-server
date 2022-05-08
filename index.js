const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//  middleware
app.use(cors());
app.use(express.json());

// mongodb config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.udusb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(uri);

async function run() {
    try {
        await client.connect();
        const warehouseCollection = client.db('warehouse').collection('items');

        // items api
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = warehouseCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // post 
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            console.log(newItem);
            const result = await warehouseCollection.insertOne(newItem);
            res.send(result);
        });

        // get specific item
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await warehouseCollection.findOne(query);
            res.send(item);
        })

        // delete 
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await warehouseCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });
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