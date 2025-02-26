
import { Logger, ILogObj } from "tslog";
import { appendFileSync } from "fs";

const logger = new Logger<ILogObj>({
    name: "TS logger",
    // tslog comes with default log level 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal.
    minLevel: 2,
    type: "pretty", // for color output
    prettyLogTimeZone: "local",
    prettyLogTemplate: "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}.{{ms}} [{{logLevelName}}] ({{filePathWithLine}}) \n",
});

logger.attachTransport((logObj) => {
    appendFileSync("logs/app.log", JSON.stringify(logObj) + "\n");
});

export default logger;
