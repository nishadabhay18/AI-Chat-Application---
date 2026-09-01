import mongoose from "mongoose";

function connect() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('Connected to Database')
        }).catch(err => {
            console.log('Error while connecting DB', err)
        })
}

export default connect
