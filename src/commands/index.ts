import { IArgv } from "../util/ArgvHelper";
import { JourneysRetrievalCommand } from "./JourneysRetrievalCommand";
import { DisruptionsRetrievalCommand } from "./DisruptionsRetrievalCommand";

export enum CommandGroup {
    COMMAND_GROUP_SNCF = "sncf",
}

export class CommandManager {
    public static async execute(commandGroup: CommandGroup, args: IArgv) {
        const commands = this.COMMANDS_BY_GROUP[commandGroup];
        if (!commands) {
            throw new Error(`No commands found for given command group '${commandGroup}'.`);
        }

        for (const command of commands) {
            await new (command)(args).execute();
        }
    }

    private static COMMANDS_BY_GROUP = {
        [CommandGroup.COMMAND_GROUP_SNCF]: [
            JourneysRetrievalCommand,
            DisruptionsRetrievalCommand,
        ],
    };
}
