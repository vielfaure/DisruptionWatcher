import { readFile } from "fs";
import { Constants } from "../util/Constants";
import { IConfiguration } from "./IConfiguration";

export class Configuration {
  public static get configuration(): IConfiguration {
    if (!this._configuration) {
      throw new Error("Configuration not loaded.");
    }
    return this._configuration;
  }

  public static async loadConfiguration(path: string = Constants.DEFAULT_CONFIG_FILE): Promise<IConfiguration> {
    return new Promise<IConfiguration>((resolve, reject) => {
      readFile(path, "utf-8", (error, data) => {
        if (error) {
          return reject(error);
        }
        this._configuration = JSON.parse(data);

        return resolve(this._configuration);
      });
    });
  }

  private static _configuration?: IConfiguration;
}
