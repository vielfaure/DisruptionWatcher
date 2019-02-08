import { IArgv } from "../util/ArgvHelper";
import { Command } from "./Command";

export class DisruptionsRetrievalCommand extends Command {
    constructor(args: IArgv) {
        super(args);
    }

    public async execute() {
        // tslint:disable-line
    }
}

/*

Imported code to review :

import moment from "moment";
import { SNCFCacheManager } from "../../CacheManager/SNCFCacheManager";
import { ISNCFCacheData } from "../../CacheManager/SNCFCacheManager/ISNCFCacheData";
import { Configuration } from "../../Configuration";
import { Navitia } from "../../Navitia";
import { INavitiaResponseDisruption, INavitiaResponseDisruptionStop, NavitiaDisruptionStopStatus, NavitiaDisruptionType } from "../../Navitia/INavitiaResponse";
import { Logger } from "../../Utils/Logger";
import { MathHelper } from "../../Utils/MathHelper";
import { MomentHelper } from "../../Utils/MomentHelper";
import { DisruptionCause } from "./DisruptionCause";
import { DisruptionStop } from "./DisruptionStop";

const logger = Logger.getLogger();

export class SNCFProcessor {
  public startDate: moment.Moment;
  public endDate: moment.Moment;
  public totalTrips: number = 0;
  public totalDelayedTrips: number = 0;
  public totalPartialTrips: number = 0;
  public totalCanceledTrips: number = 0;
  public totalDelay: number = 0; // In seconds.
  public causes: Map<string, DisruptionCause> = new Map();
  public stops: Map<string, DisruptionStop> = new Map();
  public processed: boolean = false;

  private _navitia: Navitia;
  private _disruptionsData: INavitiaResponseDisruption[] = [];
  private _prioritizeCache: boolean;

  constructor(startDate?: moment.Moment, endDate?: moment.Moment, prioritizeCache?: boolean) {
    this._navitia = new Navitia(Configuration.configuration.navitiaSncfToken);
    this._prioritizeCache = prioritizeCache !== undefined ? prioritizeCache : true;

    this.startDate = startDate || MomentHelper.yesterday().startOf("day");
    this.endDate = endDate || this.startDate.clone().endOf("day");
  }

  public get delayedTripsPercentage(): number {
    return MathHelper.percentageOfBase(this.totalDelayedTrips, this.totalTrips);
  }

  public get partialTripsPercentage(): number {
    return MathHelper.percentageOfBase(this.totalPartialTrips, this.totalTrips);
  }

  public get canceledTripsPercentage(): number {
    return MathHelper.percentageOfBase(this.totalCanceledTrips, this.totalTrips);
  }

  public async process() {
    if (MomentHelper.isSameDay(this.startDate, this.endDate)) {
      await this.processSingleDay();
    } else {
      await this.processMultipleDays();
    }
  }

  private async processSingleDay() {
    if (this._prioritizeCache) {
      try {
        const parsedData: ISNCFCacheData = await SNCFCacheManager.loadFromCache(this.startDate, this.endDate);
        this.totalTrips = parsedData.totalTrips;
        this._disruptionsData = parsedData.disruptionsData;
      } catch (err) {
        logger.error("Error while loading from cache.", err);
      }
    }

    if (this.totalTrips === 0) {
      await this.getTripsData();
    }
    if (this._disruptionsData.length === 0) {
      await this.getDisruptionsData();
    }
    this.processDisruptionsData();
    try {
      const data: ISNCFCacheData = {
        disruptionsData: this._disruptionsData,
        totalTrips: this.totalTrips,
      };
      await SNCFCacheManager.saveToCache(this.startDate, data);
    } catch (err) {
      logger.error("Error while saving to cache.", err);
    }
    this.processed = true;
  }

  private async processMultipleDays() {
    try {
      const parsedData: ISNCFCacheData = await SNCFCacheManager.loadFromCache(this.startDate, this.endDate);
      this.totalTrips = parsedData.totalTrips;
      this._disruptionsData = parsedData.disruptionsData;
    } catch (err) {
      logger.error(`Error while loading from cache, aborting.`, err);
      throw new Error(
        "Error while loading days from cache, multiple days processing can't finish.",
      );
    }
    this.processDisruptionsData();
    this.processed = true;
  }

  private async getTripsData() {
    logger.info(`Getting trips data for ${this.startDate.toString()}...`);

    const query = this._navitia.createQuery()
      .endpoint("https://api.sncf.com")
      .version("v1")
      .coverage("sncf")
      .vehicleJourneys()
      .since(MomentHelper.momentToShortDateTimeString(this.startDate))
      .until(MomentHelper.momentToShortDateTimeString(this.endDate))
      .count(0)
      .disableDisruptions();
    this.totalTrips = await this._navitia.resultsCount(query);
  }

  private async getDisruptionsData() {
    logger.info(`Getting disruptions data for ${this.startDate.toString()}...`);

    const query = this._navitia.createQuery()
      .endpoint("https://api.sncf.com")
      .version("v1")
      .coverage("sncf")
      .disruptions()
      .since(MomentHelper.momentToShortDateTimeString(this.startDate))
      .until(MomentHelper.momentToShortDateTimeString(this.endDate))
      .count(500);
    this._disruptionsData = await this._navitia.collection(query);
  }

  private processDisruptionsData() {
    logger.info(`Processing disruptions data for ${MomentHelper.humanizeDate(this.startDate, this.endDate)}...`);

    for (const disruption of this._disruptionsData) {
      if (disruption.severity.name === NavitiaDisruptionType.TRIP_DELAYED) {
        this.processDelayedTripDisruption(disruption);
      } else if (disruption.severity.name === NavitiaDisruptionType.TRIP_MODIFIED) {
        this.processPartialTripDisruption(disruption);
      } else if (disruption.severity.name === NavitiaDisruptionType.TRIP_CANCELED) {
        this.processCanceledTripDisruption(disruption);
      } else {
        logger.error(`Unknown severity name : ${disruption.severity.name}`);
      }

      this.processDisruptionCause(disruption);
    }

    // Reorder causes map by cause occurrences.
    this.causes = new Map([...this.causes.entries()].sort((a, b) => {
      return b[1].occurrences - a[1].occurrences;
    }));

    // Reorder stops map by stop delays.
    this.stops = new Map([...this.stops.entries()].sort((a, b) => {
      return b[1].totalDelay - a[1].totalDelay;
    }));
  }

  private processDelayedTripDisruption(disruption: INavitiaResponseDisruption) {
    this.totalDelayedTrips++;
    const impactedStops = disruption.impacted_objects[0].impacted_stops;
    let biggestDelay = 0; // In seconds
    for (const stop of impactedStops) {
      if (stop.departure_status !== NavitiaDisruptionStopStatus.STOP_DELAYED) {
        continue;
      }
      const baseDepartureTime = MomentHelper.shortTimeStringToMoment(stop.base_departure_time);
      const amendedDepartureTime = MomentHelper.shortTimeStringToMoment(stop.amended_departure_time);
      const delay = amendedDepartureTime.diff(baseDepartureTime, "seconds"); // In seconds
      if (delay <= 0) {
        continue;
      }
      if (delay > biggestDelay) {
        biggestDelay = delay;
      }
      this.addDisruptionStop(stop.stop_point, delay);
    }
    this.totalDelay += biggestDelay;
  }

  private processPartialTripDisruption(disruption: INavitiaResponseDisruption) {
    const impactedStops = disruption.impacted_objects[0].impacted_stops;
    for (const stop of impactedStops) {
      if (stop.departure_status === NavitiaDisruptionStopStatus.STOP_DELETED) {
        this.totalPartialTrips++;
        break;
      }
    }
  }

  private processCanceledTripDisruption(disruption: INavitiaResponseDisruption) {
    this.totalCanceledTrips++;
  }

  private processDisruptionCause(disruption: INavitiaResponseDisruption) {
    if (disruption.messages && disruption.messages.length > 0) {
      const cause = disruption.messages[0].text;
      const existingCause = this.causes.get(cause) || new DisruptionCause(cause);

      existingCause.occurrences += 1;
      if (disruption.severity.name === NavitiaDisruptionType.TRIP_DELAYED) {
        existingCause.totalDelayedTrips += 1;
      } else if (disruption.severity.name === NavitiaDisruptionType.TRIP_MODIFIED) {
        existingCause.totalPartialTrips += 1;
      } else if (disruption.severity.name === NavitiaDisruptionType.TRIP_CANCELED) {
        existingCause.totalCanceledTrips += 1;
      }

      this.causes.set(cause, existingCause);
    }
  }

  private addDisruptionStop(stop: INavitiaResponseDisruptionStop, delay: number = 0) {
    const stopName = stop.label;
    const existingStop = this.stops.get(stopName) || new DisruptionStop(stop);

    if (delay > 0) {
      existingStop.addDelay(delay);
    }

    this.stops.set(stopName, existingStop);
  }
}

*/
