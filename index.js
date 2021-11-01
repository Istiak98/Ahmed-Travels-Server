const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kydip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("ahmedTravel");
    const tourCollection = database.collection("tours");
    const orderCollection = database.collection("orders");

    //GET Tours API
    app.get("/tours", async (req, res) => {
      const cursor = tourCollection.find({});
      const tours = await cursor.toArray();
      res.send(tours);
    });

    // GET Single Tour
    app.get("/tours/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const tour = await tourCollection.findOne(query);
      res.json(tour);
    });
    // GET API (get all orders)
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // GET API (get orders by email)
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = await orderCollection.find(query);
      const myOrders = await cursor.toArray();
      res.send(myOrders);
    });

    // POST API(add new tour)
    app.post("/tours", async (req, res) => {
      const tour = req.body;
      // console.log("hit the post api", tour);
      const result = await tourCollection.insertOne(tour);
      console.log(result);
      console.log(tour);
      res.json(result);
    });

    // DELETE API
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // POST API
    app.post("/placeOrder", async (req, res) => {
      const orderDetails = req.body;
      const result = await orderCollection.insertOne(orderDetails);
      res.json(result);
    });
    // UPDATE API
    app.put("/approve/:id", async (req, res) => {
      const id = req.params.id;
      const approvedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: approvedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Ahmed Travels listening at http://localhost:${port}`);
});
