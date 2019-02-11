export interface ISNCFResponse {
    disruptions?: ISNCFResponseDisruption[];

    pagination?: {
        start_page: number;
        items_on_page: number;
        items_per_page: number;
        total_results: number;
    };

    links: [{
        href: string;
        type: string;
        rel: string;
        templated: boolean;
    }];

    context: {
        timezone: string;
        current_datetime: string;
    };

    error?: {
        id: string;
        message: string;
    };

    [propName: string]: any;
}

export interface ISNCFResponseDisruption extends ISNCFResponse {
    status: string;
    disruption_id: string;
    severity: {
        color: string;
        priority: number;
        name: SNCFDisruptionType;
        effect: string;
    };
    impact_id: string;
    application_periods: [{
        begin: string;
        end: string;
    }];
    messages?: [{
        text: string;
    }];
    updated_at: string;
    uri: string;
    impacted_objects: [{
        impacted_stops: [{
            amended_arrival_time: string;
            stop_point: ISNCFResponseDisruptionStop;
            stop_time_effect: string;
            departure_status: SNCFDisruptionStopStatus;
            amended_departure_time: string;
            base_arrival_time: string;
            cause: string;
            base_departure_time: string;
            arrival_status: SNCFDisruptionStopStatus;
        }];
    }];
    disruption_url: string;
    contributor: string;
    cause: string;
    id: string;
}

export interface ISNCFResponseDisruptionStop extends ISNCFResponse {
    name: string;
    coord: {
        lat: string;
        lon: string;
    };
    label: string;
    id: string;
}

export enum SNCFDisruptionType {
    TRIP_DELAYED  = "trip delayed",
    TRIP_MODIFIED = "trip modified",
    TRIP_CANCELED = "trip canceled",
}

export enum SNCFDisruptionStopStatus {
    STOP_UNCHANGED = "unchanged",
    STOP_DELAYED   = "delayed",
    STOP_DELETED   = "deleted",
}
