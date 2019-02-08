import { Configuration } from "./config";
import { CommandGroup, CommandManager } from "./commands";
import { ArgvHelper } from "./util/ArgvHelper";
import { Logger } from "./util/Logger";
import { MomentHelper } from "./util/MomentHelper";

MomentHelper.setupMoment();

const logger = Logger.setupLogger();

async function main() {
  const argv = ArgvHelper.argv;

  // Load configuration.
  let configurationPath: string | undefined;
  if (argv.config) {
    configurationPath = argv.config as string;
  }
  await Configuration.loadConfiguration(configurationPath);

  // Execute commands if any.
  if (argv.group) {
    await CommandManager.execute(argv.group as CommandGroup, argv);
  }
}

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
