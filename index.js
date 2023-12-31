const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fz8oxax.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db('technovisionDB').collection('users');
    const taskCollection = client.db('technovisionDB').collection('tasks');



// user 
app.post('/users', async (req, res) => {
    const user = req.body;
    const query = { email: user.email }
    const existUser = await userCollection.findOne(query);
    if (existUser) {
      return res.send({ message: 'user exist' })
    }
    const result = await userCollection.insertOne(user);
    res.send(result)
  })

  app.get('/users',async(req,res)=>{
    const result = await userCollection.find().toArray()
    res.send(result)
})


//   tasks 

app.post('/tasks',async(req,res)=>{
    const task = req.body;
    const result = await taskCollection.insertOne(task)
    res.send(result)
  })

  app.get('/tasks',async(req,res)=>{
    const email = req.query?.email
    const result = await taskCollection.find({email:email}).toArray()
    res.send(result)
  })

  app.put('/tasks/:id',async(req,res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const status = req.body.status;
    const updatedDoc = {
      $set:{
        status: status
      }
    }
    const result = await taskCollection.updateOne(filter,updatedDoc,options)
    res.send(result)
  })

  app.delete('/tasks/:id',async(req,res)=>{
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)}
    const result = await taskCollection.deleteOne(filter)
    res.send(result)
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('techvision is running')
  })
  
  app.listen(port, () => {
    console.log(`techvision is running on port ${port}`);
  })