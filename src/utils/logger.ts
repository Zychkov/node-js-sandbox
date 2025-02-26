import { Logger, ILogObj } from "tslog";
import { appendFileSync, existsSync, mkdirSync } from "fs";

const logger = new Logger<ILogObj>({
    name: "TS logger",
    // tslog comes with default log level 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal.
    minLevel: 2,
    type: "pretty", // for color output
    prettyLogTimeZone: "local",
    prettyLogTemplate: "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}.{{ms}} [{{logLevelName}}] ({{filePathWithLine}}) \n",
});

logger.attachTransport((logObj) => {
    const logDir = "logs";
    const logFile = "app.log";

    if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
    }

    appendFileSync(`${logDir}/${logFile}`, JSON.stringify(logObj) + "\n");
});

export default logger;
