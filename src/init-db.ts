import mongoose from 'mongoose';
import Utils from '@utils';
mongoose.Promise = import("bluebird");

export const initDb = async () => {
  try {
    const isLive = Utils.isProd() || Utils.isEnv("live");
    const dbLabel = `DB_URI_${isLive?"LIVE":"LOCAL"}`;
    const dbUri = Utils.getVar(dbLabel) || '';
    const dbName = Utils.getVar("DB_NAME");
    const dbOpts = {
      dbName,
      connectTimeoutMS:10000,
      socketTimeoutMS:10000
    };

    if(!dbUri) throw {status:500,message:"No mongodb connection string provided"};
    const conn = await mongoose.connect(dbUri,dbOpts);
    Utils.ok("mongodb","Connected");
    return conn;
  }
  catch(err:any) {
    if(err.message.indexOf("ECONNREFUSED") !== -1) {
      Utils.error("mongodb","The server was not able to connect. Check your internet connection and MDB service.");
      process.exit(1);
    }
    else {
      Utils.error("mongodb",`Connection error. ${err}`);
      throw err;
    }
  }
};
export default initDb;