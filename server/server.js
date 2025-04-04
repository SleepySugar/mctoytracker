// server/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mcdonalds-toys', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Define Location Schema
const locationSchema = new mongoose.Schema({
  id: String, // Use placeId as id
  name: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  address: String,
  rating: Number,
  placeId: String,
  toys: [String],
});

const Location = mongoose.model('Location', locationSchema);

// Endpoint to get all locations
app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching locations');
  }
});

// Endpoint to update or add locations (without overriding toys)
app.post('/locations', async (req, res) => {
  try {
    const locations = req.body;
    console.log('Received locations:', locations);

    for (const loc of locations) {
      const existingLoc = await Location.findOne({ placeId: loc.placeId });

      if (existingLoc) {
        // Update existing location without overriding toy data
        existingLoc.name = loc.name;
        existingLoc.coordinates = loc.coordinates;
        existingLoc.address = loc.address;
        existingLoc.rating = loc.rating;
        // Do not update toys here to preserve existing toy data
        await existingLoc.save();
      } else {
        // Create new location
        const newLocation = new Location(loc);
        await newLocation.save();
      }
    }

    res.send('Data saved successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving locations');
  }
});

// Endpoint to update toys for a specific location
app.put('/locations/:placeId/toys', async (req, res) => {
  try {
    const placeId = req.params.placeId;
    const toys = req.body.toys;

    const existingLoc = await Location.findOne({ placeId });

    if (existingLoc) {
      existingLoc.toys = toys;
      await existingLoc.save();
      res.send('Toys updated successfully');
    } else {
      res.status(404).send('Location not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating toys');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
