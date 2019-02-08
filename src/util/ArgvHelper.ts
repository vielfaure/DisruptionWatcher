import yargs from "yargs";

// Setup CLI arguments.
const argv = yargs
  .option("config", {
    describe: "Specifies the path to the config file.",
    type: "string",
  })
  .help("help")
  .argv;

export interface IArgv {
  config?: string;
  group?: string;
}

export class ArgvHelper {
  public static get argv(): IArgv {
    return {
      config: argv.config,
    };
  }
}
