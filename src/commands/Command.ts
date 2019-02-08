import { IArgv } from "../util/ArgvHelper";

export abstract class Command {
  private _args: IArgv;

  constructor(args: IArgv) {
    this._args = args;
  }

  public abstract async execute(): Promise<void>;
}
