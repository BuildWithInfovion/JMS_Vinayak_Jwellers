// backend/models/Counter.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // This will be 'invoiceNumber'
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

// This function will get the next number
async function getNextSequence(name) {
  const ret = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // {new: true} returns the updated doc, {upsert: true} creates it if it doesn't exist
  );
  return ret.seq;
}

module.exports = { Counter, getNextSequence };
