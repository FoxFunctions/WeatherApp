// To parse this data:
//
//   import { Convert, Parks } from "./file";
//
//   const parks = Convert.toParks(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Forecast {
    cod:     string;
    message: number;
    cnt:     number;
    list:    List[];
    city:    City;
}

export interface City {
    id:         number;
    name:       string;
    coord:      Coord;
    country:    string;
    population: number;
    timezone:   number;
    sunrise:    number;
    sunset:     number;
}

export interface Coord {
    lat: number;
    lon: number;
}

export interface List {
    dt:         number;
    main:       MainClass;
    weather:    Weather[];
    clouds:     Clouds;
    wind:       Wind;
    visibility: number;
    pop:        number;
    sys:        Sys;
    dt_txt:     Date;
    rain?:      Rain;
}

export interface Clouds {
    all: number;
}

export interface MainClass {
    temp:       number;
    feels_like: number;
    temp_min:   number;
    temp_max:   number;
    pressure:   number;
    sea_level:  number;
    grnd_level: number;
    humidity:   number;
    temp_kf:    number;
}

export interface Rain {
    "3h": number;
}

export interface Sys {
    pod: Pod;
}

export enum Pod {
    D = "d",
    N = "n",
}

export interface Weather {
    id:          number;
    main:        MainEnum;
    description: Description;
    icon:        string;
}

export enum Description {
    BrokenClouds = "broken clouds",
    ClearSky = "clear sky",
    FewClouds = "few clouds",
    LightRain = "light rain",
    OvercastClouds = "overcast clouds",
    ScatteredClouds = "scattered clouds",
}

export enum MainEnum {
    Clear = "Clear",
    Clouds = "Clouds",
    Rain = "Rain",
}

export interface Wind {
    speed: number;
    deg:   number;
    gust?: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toParks(json: string): Forecast {
        return cast(JSON.parse(json), r("Parks"));
    }

    public static parksToJson(value: Forecast): string {
        return JSON.stringify(uncast(value, r("Parks")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Parks": o([
        { json: "cod", js: "cod", typ: "" },
        { json: "message", js: "message", typ: 0 },
        { json: "cnt", js: "cnt", typ: 0 },
        { json: "list", js: "list", typ: a(r("List")) },
        { json: "city", js: "city", typ: r("City") },
    ], false),
    "City": o([
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "coord", js: "coord", typ: r("Coord") },
        { json: "country", js: "country", typ: "" },
        { json: "population", js: "population", typ: 0 },
        { json: "timezone", js: "timezone", typ: 0 },
        { json: "sunrise", js: "sunrise", typ: 0 },
        { json: "sunset", js: "sunset", typ: 0 },
    ], false),
    "Coord": o([
        { json: "lat", js: "lat", typ: 3.14 },
        { json: "lon", js: "lon", typ: 3.14 },
    ], false),
    "List": o([
        { json: "dt", js: "dt", typ: 0 },
        { json: "main", js: "main", typ: r("MainClass") },
        { json: "weather", js: "weather", typ: a(r("Weather")) },
        { json: "clouds", js: "clouds", typ: r("Clouds") },
        { json: "wind", js: "wind", typ: r("Wind") },
        { json: "visibility", js: "visibility", typ: 0 },
        { json: "pop", js: "pop", typ: 3.14 },
        { json: "sys", js: "sys", typ: r("Sys") },
        { json: "dt_txt", js: "dt_txt", typ: Date },
        { json: "rain", js: "rain", typ: u(undefined, r("Rain")) },
    ], false),
    "Clouds": o([
        { json: "all", js: "all", typ: 0 },
    ], false),
    "MainClass": o([
        { json: "temp", js: "temp", typ: 3.14 },
        { json: "feels_like", js: "feels_like", typ: 3.14 },
        { json: "temp_min", js: "temp_min", typ: 3.14 },
        { json: "temp_max", js: "temp_max", typ: 3.14 },
        { json: "pressure", js: "pressure", typ: 0 },
        { json: "sea_level", js: "sea_level", typ: 0 },
        { json: "grnd_level", js: "grnd_level", typ: 0 },
        { json: "humidity", js: "humidity", typ: 0 },
        { json: "temp_kf", js: "temp_kf", typ: 3.14 },
    ], false),
    "Rain": o([
        { json: "3h", js: "3h", typ: 3.14 },
    ], false),
    "Sys": o([
        { json: "pod", js: "pod", typ: r("Pod") },
    ], false),
    "Weather": o([
        { json: "id", js: "id", typ: 0 },
        { json: "main", js: "main", typ: r("MainEnum") },
        { json: "description", js: "description", typ: r("Description") },
        { json: "icon", js: "icon", typ: "" },
    ], false),
    "Wind": o([
        { json: "speed", js: "speed", typ: 3.14 },
        { json: "deg", js: "deg", typ: 0 },
        { json: "gust", js: "gust", typ: u(undefined, 3.14) },
    ], false),
    "Pod": [
        "d",
        "n",
    ],
    "Description": [
        "broken clouds",
        "clear sky",
        "few clouds",
        "light rain",
        "overcast clouds",
        "scattered clouds",
    ],
    "MainEnum": [
        "Clear",
        "Clouds",
        "Rain",
    ],
};
