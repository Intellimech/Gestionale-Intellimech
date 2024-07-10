import chalk from "chalk";
import fs from "fs";
import path from "path";
import Log from "../models/log.js";

//declare __dirname
const __dirname = path.resolve();

class Logger {
  constructor() {
    console.clear();
  }
  
  static loglevel = {
    success: { name: "SUCCESS", color: chalk.hex("4ADE80").bold, folder: "base" },
    info: { name: "INFO", color: chalk.hex("#60A5FA"), folder: "base" },
    warning: { name: "WARNING", color: chalk.hex("#FACC15"), folder: "base" },
    error: { name: "ERROR", color: chalk.hex("#F87171").bold, folder: "error" },
    debug: { name: "DEBUG", color: chalk.hex("#E879BA").bold, folder: "base" }
  };

  static log(level, message, req, module) {
    const timestamps = new Date().toISOString().replace("T", " ").replace("Z", "");
    const log = Logger.loglevel[level];
    // declare all in an object
    const logObject = {
      timestamps: timestamps,
      level: log.name,
      module: module,
      message: message
    };
    // log to console with color using logObject
    if (level == "debug" && process.env.NODE_ENV !== "development") return;
    console.log(log.color(`${logObject.timestamps} [${log.name}] [${module}] ${message}`));

    // log to file
    const logFolder = path.join(__dirname, "logs", log.folder);
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder, { recursive: true });
    }
    const logFile = path.join(logFolder, `${new Date().toISOString().split("T")[0]}.log`);
    fs.appendFileSync(logFile, `${logObject.timestamps} [${log.name}] [${module}] ${message} from ${req?.ip}\n`);

    // log to database
    Log.create(
      {
        level: log.name,
        module: module,
        message: message,
        ip_address: req?.ip
      }
    ).catch((err) => {
      console.log("Error saving log to database");
    });
  }
}

const logger = new Logger();

export default Logger.log;
