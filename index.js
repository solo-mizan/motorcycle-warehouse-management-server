const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

//  middleware
app.use(cors());
app.use(express.json());

// mongodb config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.udusb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function checkJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorize access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

console.log(uri);

async function run() {
    try {
        await client.connect();
        const warehouseCollection = client.db('warehouse').collection('items');

        // json web token for login
        app.post('/login', async (req, res) => {
            const user = req.body;
            const tempToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ tempToken });
        })


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

        // get my products api
        app.get('/myitem', async (req, res) => {
            const userid = req.query.uid;
            const query = { userid };
            const cursor = warehouseCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // get my item verification api
        app.get('/myitem', checkJWT, async (req, res) => {
            const emailDecoder = req.decoded.email;
            const email = req.query.email;
            if (email === emailDecoder) {
                const query = { email: email };
                const cursor = warehouseCollection.find(query);
                const myitem = await cursor.toArray();
                res.send(myitem);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })
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