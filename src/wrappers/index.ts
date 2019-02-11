import requestPromise = require("request-promise");
import { Logger } from "../util/Logger";
import { ISNCFResponse } from "./ISNCFResponse";
import { SNCFQuery } from "./SNCFQuery";

const logger = Logger.getLogger();

export class SNCF {
    private _token: string;

    constructor(token: string) {
        this._token = token;
    }

    public createQuery(): SNCFQuery {
        return new SNCFQuery();
    }

    public async resultsCount(query: SNCFQuery): Promise<number> {
        const results = await this.get(query.toQueryString());

        return (results as any).pagination.total_result;
    }

    public async results(query: SNCFQuery): Promise<ISNCFResponse> {
        return this.get(query.toQueryString());
    }

    public async collection(query: SNCFQuery, maxPages: number | null = null): Promise<any[]> {
        const collection: object[] = [];
        let nextPage: string | null = query.toQueryString();
        let pageCount = 0;

        while (nextPage && (maxPages === null || pageCount < maxPages)) {
            const results: ISNCFResponse = await this.get(nextPage);
            collection.push(...((results as any)[query.collectionName] || []));
            const nextPageObject = results.links.find((el: any) => el.type === "next");
            nextPage = nextPageObject !== undefined ? nextPageObject.href : null;
            pageCount++;
        }

        return collection;
    }

    private async get(url: string): Promise<ISNCFResponse> {
        logger.debug(`Fetching ${url}...`);
        const response: ISNCFResponse = await requestPromise({
            headers: {
                Authorization: this._token,
            },
            json: true,
            url,
        });

        if (response.error) {
            throw new Error(`SNCF API error : ${response.error.id} (${response.error.message}).`);
        }

        return response;
    }
}
