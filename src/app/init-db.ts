import mongoose from 'mongoose';
import Utils from '../utils';
import Models from '../models';
import Types from '../types';

mongoose.Promise = import("bluebird");

process.env.DB = process.env[`DB_URI_${/live/.test(process.env.NODE_ENV)?"LIVE":"LOCAL"}`];

const dbString = process.env.DB;
const dbName = process.env.DB_NAME;
let options = {
    //user:process.env.DB_USER,
    //pass: process.env.DB_PASS,
    dbName
};

class Db {
  public static connect = async () => {
    try {
      const conn = await mongoose.connect(dbString,{
        "dbName":dbName,
        "connectTimeoutMS":10000,
        "socketTimeoutMS":10000
      });
      Utils.print("ok","ok","MongoDb connected");
    }
    catch(err) {
      if(err.message.indexOf("ECONNREFUSED") !== -1) {
        Utils.print("debug",'db',"Error: The server was not able to reach MongoDB. Maybe it's not running?");
        process.exit(1);
      }
      else {
        Utils.print("debug",'db',`MongoDB connection error. ${err}`);
        throw err;
      }
    }
  };
}
export default Db;