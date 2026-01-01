const mongoose = require('mongoose');
const Availability = require('./models/Availability');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const id = '69560e6b9351488145b9161d';
    const doc = await Availability.findOne({ professionalId: id }).lean();
    console.log('Availability doc:', JSON.stringify(doc, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
