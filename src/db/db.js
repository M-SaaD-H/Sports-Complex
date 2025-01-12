import mongoose from 'mongoose'

async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log('Mongo DB connected successfully', connectionInstance.connection.host);
    } catch(error) {
        console.log('Error in connecting Mongo DB E:', error);
        process.exit(1);
    }
}

export default connectDB