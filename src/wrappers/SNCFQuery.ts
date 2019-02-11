export class SNCFQuery {
    private _endpoint: string = "https://api.sncf.com";
    private _version: string = "v1";
    private _path: Map<string, string> = new Map([["coverage", "sncf"]]);
    private _parameters: Map<string, string> = new Map();

    constructor(endpoint?: string, version?: string, coverage?: string) {
        if (endpoint !== undefined) {
            this._endpoint = endpoint;
        }
        if (version !== undefined) {
            this._version = version;
        }
        if (coverage !== undefined) {
            this.coverage(coverage);
        }
    }

    get collectionName(): string {
        if (this._path.size === 0) {
            throw new Error("Cannot get collection name from an empty path.");
        }
        return Array.from(this._path.keys())[-1];
    }

    public endpoint(endpoint: string): SNCFQuery {
        this._endpoint = endpoint;

        return this;
    }

    public version(version: string): SNCFQuery {
        this._version = version;

        return this;
    }

    public coverage(coverage?: string): SNCFQuery {
        this.addPath("coverage", coverage);

        return this;
    }

    public disruptions(): SNCFQuery {
        this.addPath("disruptions");

        return this;
    }

    public vehicleJourneys(): SNCFQuery {
        this.addPath("vehicle_journeys");

        return this;
    }

    public addPath(path: string, value?: string): SNCFQuery {
        this._path.set(path, value === undefined ? "" : value);

        return this;
    }

    public addParameter(key: string, value: any): SNCFQuery {
        this._parameters.set(key, String(value));

        return this;
    }

    public count(count: number): SNCFQuery {
        this.addParameter("count", count);

        return this;
    }

    public since(date: string): SNCFQuery {
        this.addParameter("since", date);

        return this;
    }

    public until(date: string): SNCFQuery {
        this.addParameter("until", date);

        return this;
    }

    public headsign(headsign: string): SNCFQuery {
        this.addParameter("headsign", headsign);

        return this;
    }

    public disableDisruptions(): SNCFQuery {
        this.addParameter("disable_disruptions", "true");

        return this;
    }

    public toQueryString(): string {
        this.ensureValidQuery();

        let query = `${this._endpoint}/${this._version}/`;

        this._path.forEach((value, key) => {
            query += key + "/";
            if (value.length > 0) {
                query += value + "/";
            }
        });

        if (this._parameters.size > 0) {
            query += "?";
            this._parameters.forEach((value, key) => {
                query += `${key}=${value}&`;
            });
            query = query.slice(0, -1);
        }

        return query;
    }

    public ensureValidQuery() {
        if (!this._endpoint) {
            throw new Error("An endpoint must be set.");
        }
        if (!this._version) {
            throw new Error("A version must be set.");
        }
        if (!this._path.has("coverage")) {
            throw new Error("A coverage must be set.");
        }
    }
}
