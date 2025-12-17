import mongoose from "mongoose";

const DBconnect = async()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/Event_Management`);
        console.log("✅ Database connected successfully")
    }
    catch(error){
        console.log(error.message);
        process.exit(1);
    }
}

export default DBconnect;