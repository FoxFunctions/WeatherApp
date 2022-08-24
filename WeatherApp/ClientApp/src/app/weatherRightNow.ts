// To parse this data:
//
//   import { Convert, Parks } from "./file";
//
//   const parks = Convert.toParks(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface WeatherNow {
    coord:      Coord;
    weather:    Weather[];
    base:       string;
    main:       Main;
    visibility: number;
    wind:       Wind;
    clouds:     Clouds;
    dt:         number;
    sys:        Sys;
    timezone:   number;
    id:         number;
    name:       string;
    cod:        number;
}

export interface Clouds {
    all: number;
}

export interface Coord {
    lon: number;
    lat: number;
}

export interface Main {
    temp:       number;
    feels_like: number;
    temp_min:   number;
    temp_max:   number;
    pressure:   number;
    humidity:   number;
}

export interface Sys {
    type:    number;
    id:      number;
    country: string;
    sunrise: number;
    sunset:  number;
}

export interface Weather {
    id:          number;
    main:        string;
    description: string;
    icon:        string;
}

export interface Wind {
    speed: number;
    deg:   number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toParks(json: string): WeatherNow {
        return cast(JSON.parse(json), r("Parks"));
    }

    public static parksToJson(value: WeatherNow): string {
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
        { json: "coord", js: "coord", typ: r("Coord") },
        { json: "weather", js: "weather", typ: a(r("Weather")) },
        { json: "base", js: "base", typ: "" },
        { json: "main", js: "main", typ: r("Main") },
        { json: "visibility", js: "visibility", typ: 0 },
        { json: "wind", js: "wind", typ: r("Wind") },
        { json: "clouds", js: "clouds", typ: r("Clouds") },
        { json: "dt", js: "dt", typ: 0 },
        { json: "sys", js: "sys", typ: r("Sys") },
        { json: "timezone", js: "timezone", typ: 0 },
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "cod", js: "cod", typ: 0 },
    ], false),
    "Clouds": o([
        { json: "all", js: "all", typ: 0 },
    ], false),
    "Coord": o([
        { json: "lon", js: "lon", typ: 3.14 },
        { json: "lat", js: "lat", typ: 3.14 },
    ], false),
    "Main": o([
        { json: "temp", js: "temp", typ: 3.14 },
        { json: "feels_like", js: "feels_like", typ: 3.14 },
        { json: "temp_min", js: "temp_min", typ: 3.14 },
        { json: "temp_max", js: "temp_max", typ: 3.14 },
        { json: "pressure", js: "pressure", typ: 0 },
        { json: "humidity", js: "humidity", typ: 0 },
    ], false),
    "Sys": o([
        { json: "type", js: "type", typ: 0 },
        { json: "id", js: "id", typ: 0 },
        { json: "country", js: "country", typ: "" },
        { json: "sunrise", js: "sunrise", typ: 0 },
        { json: "sunset", js: "sunset", typ: 0 },
    ], false),
    "Weather": o([
        { json: "id", js: "id", typ: 0 },
        { json: "main", js: "main", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "icon", js: "icon", typ: "" },
    ], false),
    "Wind": o([
        { json: "speed", js: "speed", typ: 0 },
        { json: "deg", js: "deg", typ: 0 },
    ], false),
};
