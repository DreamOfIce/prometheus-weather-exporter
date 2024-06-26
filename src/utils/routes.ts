import { type FastifyInstance } from "fastify";
import { MetricPrefix } from "./consts";
import { Metric, MetricRegistry } from "./metric";
import { getWeather, weatherHelps } from "./weather";
import { getCityId } from "./utils";

//eslint-disable-next-line @typescript-eslint/require-await
export const routes = async (server: FastifyInstance) => {
  server.get("/", (_request, reply) =>
    reply.redirect(301, `/metrics?city=54511`),
  ); // Beijing
  server.get<{
    Querystring: { city?: string; province?: string; id?: string };
  }>("/metrics", async (request, reply) => {
    let cityId: number;
    try {
      cityId = getCityId(request.query, server.cityMapping);
    } catch (err) {
      await reply.code(400);
      throw err;
    }
    const {
      country,
      province,
      city,
      lastUpdate,
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      windDirection,
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      windScale,
      ...weathers
    } = await getWeather(cityId);

    const registry = new MetricRegistry(MetricPrefix);
    registry.setLabel("country", country);
    registry.setLabel("province", province);
    registry.setLabel("city", city);
    for (const [key, value] of Object.entries(weathers)) {
      registry.addMetric(
        key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`),
        new Metric.Gauge(value).setTimestamp(lastUpdate.getTime()),
        weatherHelps[key],
      );
    }
    return registry.export();
  });
};
