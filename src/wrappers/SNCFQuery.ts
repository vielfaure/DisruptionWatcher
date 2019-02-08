export class SNCFQuery {
    private _endpoint: string = "https://api.sncf.com";
    private _version: string = "v1";
    private _coverage: string = "sncf";
    private _path: string[] = [];
    private _parameters: Map<string, string> = new Map();

    get collectionName(): string {
        if (this._path.length === 0) {
            throw new Error("Cannot get collection name from an empty path.");
        }
        return this._path[this._path.length - 1];
    }

    public endpoint(endpoint: string): SNCFQuery {
        this._endpoint = endpoint;

        return this;
    }

    public version(version: string): SNCFQuery {
        this._version = version;

        return this;
    }

    public coverage(coverage: string): SNCFQuery {
        this._coverage = coverage;

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

    public addPath(path: string): SNCFQuery {
        if (this._path.indexOf(path) === -1) {
            this._path.push(path);
        }

        return this;
    }

    public count(count: number): SNCFQuery {
        this._parameters.set("count", String(count));

        return this;
    }

    public since(date: string): SNCFQuery {
        this._parameters.set("since", date);

        return this;
    }

    public until(date: string): SNCFQuery {
        this._parameters.set("until", date);

        return this;
    }

    public disableDisruptions(): SNCFQuery {
        this._parameters.set("disable_disruptions", "true");

        return this;
    }

    public toQueryString(): string {
        this.ensureValidQuery();

        let query = `${this._endpoint}/${this._version}/coverage/${this._coverage}/`;
        if (this._path.length > 0) {
            query += this._path.join("/") + "/";
        }
        if (this._parameters.size > 0) {
            query += "?";
            this._parameters.forEach((value, key) => {
                query += `${key}=${value}&`;
            });
        }

        return query;
    }

    private ensureValidQuery() {
        if (!this._endpoint) {
            throw new Error("An endpoint must be set.");
        }
        if (!this._version) {
            throw new Error("A version must be set.");
        }
        if (!this._coverage) {
            throw new Error("A coverage must be set.");
        }
    }
}
