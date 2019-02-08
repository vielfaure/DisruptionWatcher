import moment from "moment";
import momentDurationFormatSetup = require("moment-duration-format");

export class MomentHelper {
  public static shortTimeStringToMoment(time: string): moment.Moment {
    return moment(time, "HHmmss");
  }

  public static momentToShortDateTimeString(date: moment.Moment): string {
    return date.format("YYYYMMDDTHHmmss");
  }

  public static shortDateStringToMoment(date: string): moment.Moment {
    return moment(date, "YYYYMMDD");
  }

  public static momentToShortDateString(date: moment.Moment): string {
    return date.format("YYYYMMDD");
  }

  public static yesterday(): moment.Moment {
    return moment().subtract(1, "days");
  }

  public static isSameDay(firstDate: moment.Moment, secondDate: moment.Moment): boolean {
    return firstDate.isSame(secondDate, "day");
  }

  public static isSameWeek(firstDate: moment.Moment, secondDate: moment.Moment): boolean {
    return firstDate.isSame(secondDate, "week");
  }

  public static isSameMonth(firstDate: moment.Moment, secondDate: moment.Moment): boolean {
    return firstDate.isSame(secondDate, "month");
  }

  public static isSameYear(firstDate: moment.Moment, secondDate: moment.Moment): boolean {
    return firstDate.isSame(secondDate, "year");
  }

  public static humanizeDuration(
    inp?: moment.DurationInputArg1,
    unit?: moment.DurationInputArg2,
    short: boolean = false): string {
    if (short) {
      return moment.duration(inp, unit).format("d[j] h[h] m[m] s[s]", { trim: "both" });
    }
    return moment.duration(inp, unit).format();
  }

  public static humanizeDate(startDate: moment.Moment, endDate: moment.Moment): string {
    if (this.isSameDay(startDate, endDate)) {
      return startDate.format("dddd DD MMMM YYYY");
    } else {
      return `${startDate.format("DD MMMM YYYY")} to ${endDate.format("DD MMMM YYYY")}`;
    }
  }

  public static setupMoment() {
    momentDurationFormatSetup(moment as any);
    /* tslint:disable:object-literal-sort-keys */
    moment.updateLocale("fr", {
      durationLabelsStandard: {
        S: "milliseconde",
        SS: "millisecondes",
        s: "seconde",
        ss: "secondes",
        m: "minute",
        mm: "minutes",
        h: "heure",
        hh: "heures",
        d: "jour",
        dd: "jours",
        w: "semaine",
        ww: "semaines",
        M: "mois",
        MM: "mois",
        y: "année",
        yy: "années",
      },
      durationLabelsShort: {
        S: "msec",
        SS: "msecs",
        s: "sec",
        ss: "secs",
        m: "min",
        mm: "mins",
        h: "hr",
        hh: "hrs",
        d: "jr",
        dd: "jrs",
        w: "sem",
        ww: "sems",
        M: "mo",
        MM: "mos",
        y: "an",
        yy: "ans",
      },
      durationTimeTemplates: {
        HMS: "h:mm:ss",
        HM: "h:mm",
        MS: "m:ss",
      },
      durationLabelTypes: [
        { type: "standard", string: "__" },
        { type: "short", string: "_" },
      ],
      durationPluralKey: (token: string, integerValue: number, decimalValue: number): string => {
        // Singular for a value of `1`, but not for `1.0`.
        if (integerValue === 1 && decimalValue === null) {
          return token;
        }

        return token + token;
      },
    } as any);
    /* tslint:enable:object-literal-sort-keys */
    moment.locale("fr");
  }
}
