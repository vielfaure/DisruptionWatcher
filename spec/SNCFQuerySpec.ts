import "jasmine";
import { SNCFQuery } from "../src/wrappers/SNCFQuery";

describe("SNCF API", () => {
    describe("Query builder", () => {
        it("Create empty valid query", () => {
            expect(new SNCFQuery().toQueryString()).toBe("https://api.sncf.com/v1/coverage/sncf/");
        });
        it("Create vehicle journeys retrieval valid query", () => {
            expect(new SNCFQuery().vehicleJourneys().toQueryString()).
                toBe("https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/");
        });
        it("Create specific vehicle journey retrieval valid query", () => {
            expect(new SNCFQuery().vehicleJourneys().headsign("9879").toQueryString()).
                toBe("https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/?headsign=9879");
        });
        it("Create vehicle journeys retrieval with interval valid query", () => {
            expect(new SNCFQuery().vehicleJourneys().since("20190201T000000").until("20190202T000000").toQueryString()).
                toBe("https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/?since=20190201T000000&until=20190202T000000"); // tslint:disable-line max-line-length
        });
        it("Create vehicle journey retrieval with no disruptions valid query", () => {
            expect(new SNCFQuery().vehicleJourneys().disableDisruptions().toQueryString()).
                toBe("https://api.sncf.com/v1/coverage/sncf/vehicle_journeys/?disable_disruptions=true");
        });
        it("Create disruptions retrieval valid query", () => {
            expect(new SNCFQuery().disruptions().toQueryString()).
                toBe("https://api.sncf.com/v1/coverage/sncf/disruptions/");
        });
    });
});
