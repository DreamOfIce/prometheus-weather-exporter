import { AxiosResponse } from "axios";
import { axios } from "./utils";
import { RefererPrefix, WeatherAPIEndpoint } from "./consts";

interface WeatherAPIResponse {
  code: number;
  msg: string;
  data:
    | {
        lastUpdate: string;
        location: {
          id: string;
          name: string;
          path: string;
        };
        now: {
          humidity: number;
          precipitation: number;
          pressure: number;
          temperature: number;
          windDirection: string;
          windDirectionDegree: number;
          windScale: string;
          windSpeed: number;
        };
      }
    | string; // data may be ""
}

export interface WeatherInfo {
  country: string;
  province: string;
  city: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  pressure: number;
  windDirection: string;
  windDirectionDegree: number;
  windScale: string;
  windSpeed: number;
  lastUpdate: Date;
}

export const weatherHelps: Record<string, string> = {
  temperature: "Current temperature in Celsius",
  humidity: "Current humidity percentage",
  precipitation: "Current precipitation in mm",
  pressure: "Current pressure in hPa",
  windDirectionDegree: "Current wind direction degrees",
  windSpeed: "Current wind speed in metres per second",
};

export const getWeather = async (cityId: number) => {
  let response: AxiosResponse<WeatherAPIResponse>;
  try {
    response = await axios.get<WeatherAPIResponse>(
      `${WeatherAPIEndpoint}${cityId}`,
      {
        headers: {
          referer: `${RefererPrefix}/${cityId}`,
        },
      },
    );
    if (response.data.code !== 0)
      throw new Error(`${response.data.msg}(${response.data.code})`);
  } catch (err) {
    throw new Error(
      `Failed to get weather info${err instanceof Error ? `: ${err.message}` : ""}`,
    );
  }

  const { data } = response;
  if (typeof data.data === "string")
    throw new Error(`Failed to get weather info: invaild city id ${cityId}`);
  const [country, province, city] = <[string, string, string]>(
    data.data.location.path.split(", ")
  );
  const lastUpdate = new Date(
    `${data.data.lastUpdate.replaceAll("/", "-").replace(" ", "T")}+08:00`,
  ); // convert 2024/04/10 21:00 to 2024-04-10T21:00+08:00(ISO8601)
  return { ...data.data.now, country, province, city, lastUpdate };
};
