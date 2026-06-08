const mongoose = require("mongoose");
require("dotenv").config();

const connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log("db done"))
      .catch((error) => {
        console.log("db failed")
        console.log(error)
        process.exit(1)
      })
};

module.exports = { connect };


