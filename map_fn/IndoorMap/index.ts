import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { promises as fs } from "fs";
import {
  FEATURE_MAP,
  isThermostatTelemetry,
  isTVTelemetry,
  setFeatureState,
} from "./common";

let features = [];

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  if (req.method === "GET") {
    // page requested
    context.res = {
      body: await fs.readFile("./dist/IndoorMap/public/index.html"),
    };
    return;
  }
  if (req.method === "POST") {
    if (req.body.messageSource === "telemetry") {
      context.log("Received telemetry");
      if (isTVTelemetry(req.body)) {
      } else if (isThermostatTelemetry(req.body)) {
        await setFeatureState(
          `UNIT${FEATURE_MAP[req.body.enrichments.ThmRoom]}`,
          "temperature",
          req.body.telemetry.temperature
        );
      }
    }
  }
  context.log("HTTP trigger function processed a request.");
  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};

export default httpTrigger;
