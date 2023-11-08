const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s65cmwk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db("excessEats").collection("foods");
    const foodRequestCollection = client
      .db("excessEats")
      .collection("food_requests");

    app.get("/foods", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    //food add
    app.post("/add-food", async (req, res) => {
      const addFood = req.body;
      // console.log(addFood);
      const result = await foodCollection.insertOne(addFood);
      res.send(result);
    });

    //food-request
    app.post("/request/:id", async (req, res) => {
      const requestFood = req.body;
      // console.log(requestFood);
      const result = await foodRequestCollection.insertOne(requestFood);
      res.send(result);
    });

    //update food

    app.patch("/manage-my-foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateFood = req.body;
      const foodProduct = {
        $set: {
          foodName: updateFood.foodName,
          foodImage: updateFood.foodImage,
          foodQuantity: updateFood.foodQuantity,
          pickupLocation: updateFood.pickupLocation,
          expiredDate: updateFood.expiredDate,
          additionalNotes: updateFood.additionalNotes,
        },
      };

      const result = await foodCollection.updateOne(
        filter,
        foodProduct,
        updateFood
      );

      res.send(result);
    });

    app.get("/food-requests", async (req, res) => {
      const result = await foodRequestCollection.find().toArray();
      res.send(result);
    });

    app.get("/food-requests/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await foodRequestCollection.find(query).toArray();
      res.send(result);
    });

    //updateStatus
    app.patch("/food-requests/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newStatus = req.body.status;
      const updateStatus = {
        $set: { status: newStatus },
      };
      const result = await foodRequestCollection.updateOne(
        filter,
        updateStatus
      );
      console.log(result);
      res.send(result);
    });

    //Delete
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("community-food-sharing server is running");
});

app.listen(port, () => {
  console.log(`community-food-sharing server is running on port ${port}`);
});
