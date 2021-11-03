import { AzureMapsManagementClient } from "@azure/arm-maps";
import { ResourceManagementClient } from "@azure/arm-resources";
import axios, { AxiosResponse } from "axios";
import { IotCentralClient } from "@azure/arm-iotcentral";
import siteTemplate from "./azure/azuredeploy_site.json";
import { AzureCredentials, SiteParameters } from "./common";
import { InteractiveBrowserCredential } from "@azure/identity";

const RESOURCE_GROUP = "lucamaps";
const ACCOUNT_NAME = "iim-account";
const API_VERSION = "2.0";
const IOTC_API_VERSION = "1.0";

// const client = new AzureMapsManagementClient(credential, SUBSCRIPTION_ID);

export async function createResourceGroup(
  armClient: ResourceManagementClient,
  location?: string
) {
  const exists = await armClient.resourceGroups.checkExistence(RESOURCE_GROUP);
  if (exists.body) {
    return;
  }
  await armClient.resourceGroups.createOrUpdate(RESOURCE_GROUP, {
    location: location ?? "westeurope",
  });
}

export async function creator(client: AzureMapsManagementClient) {
  const account = await client.accounts.createOrUpdate(
    RESOURCE_GROUP,
    ACCOUNT_NAME,
    {
      sku: { name: "G2" },
      kind: "Gen2",
    }
  );
  console.log(account);
}

export async function login(tenantId: string) {
  const credential = new InteractiveBrowserCredential({
    clientId: "0523c52d-806a-4f07-9dda-8950eb13055f",
    tenantId,
  });

  return credential;
}

export async function getMapData(
  credentials: AzureCredentials,
  subscriptionId: string,
  mapAccountName: string
): Promise<{ mapSubscriptionKey: string; mapLocation: string,resourceGroupName:string } | null> {
  const client = new AzureMapsManagementClient(credentials, subscriptionId);
  const accounts = await client.accounts.listBySubscription();
  const mapAccount = accounts.find((ac) => (ac as any).name === mapAccountName);
  const regexp = new RegExp(
    `/subscriptions/${subscriptionId}/resourceGroups/([\\S]+)/providers/Microsoft.Maps/accounts/${mapAccountName}`
  );
  const matches = (mapAccount as any).id.match(regexp);
  if (matches && matches.length === 2) {
    const resourceGroupName = matches[1];
    const keys = await client.accounts.listKeys(
      resourceGroupName,
      mapAccountName
    );
    //TODO use real location
    return { mapSubscriptionKey: keys.primaryKey!, mapLocation: "us",resourceGroupName };
  }
  return null;
}

export async function listCentralApps(
  credentials: AzureCredentials,
  subscriptionId: string
) {
  const client = new IotCentralClient(credentials, subscriptionId);
  return client.apps.listBySubscription();
}

export async function createCentralApiToken(
  credentials: AzureCredentials,
  appUrl: string
): Promise<string | null> {
  const bearer = await credentials.getToken(
    "https://apps.azureiotcentral.com/user_impersonation"
  );
  appUrl = appUrl.split(".")[0] + ".azureiotcentral.com";
  const tokenId = `iotc-indm-${Math.floor(Math.random() * 20000)}`;
  const res = await axios.put<{
    id: string;
    roles: {
      role: string;
    }[];
    expiry: string;
    token: string;
  }>(
    `https://${appUrl}/api/apiTokens/${tokenId}?api-version=${IOTC_API_VERSION}`,
    {
      roles: [
        {
          role: "ca310b8d-2f4a-44e0-a36e-957c202cd8d4",
        },
      ],
      expiry: "2023-12-31T23:59:00.000Z",
    },
    {
      headers: {
        Authorization: `Bearer ${bearer!.token}`,
      },
    }
  );
  if (res.status === 200) {
    return res.data.token;
  }
  return null;
}

export async function uploadPackage(
  data: any,
  location: string,
  subscriptionKey: string,
  onProgress: (progress: number) => void
) {
  let progress = 0;
  const res = await axios.post<any>(
    `https://${location}.atlas.microsoft.com/mapData?api-version=${API_VERSION}&dataFormat=dwgzippackage&subscription-key=${subscriptionKey}`,
    data,
    {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    }
  );
  onProgress((progress += 0.1));
  if (res.headers["operation-location"]) {
    // call this until 200 and return drawing id
    return await waitForSuccess(
      `${res.headers["operation-location"]}&subscription-key=${subscriptionKey}`,
      {
        body: "status",
        header: "resource-location",
      },
      (res) => {
        const re =
          /https:\/\/us\.atlas\.microsoft\.com\/mapData\/metadata\/([\S]+)\?api-version=2\.0/;
        const matches = res.headers["resource-location"].match(re);
        if (matches && matches.length === 2) {
          return matches[1];
        }
        return null;
      },
      onProgress
    );
  }
}

export async function convertPackage(
  udid: string,
  location: string,
  subscriptionKey: string
) {
  const res = await axios.post<any>(
    `https://${location}.atlas.microsoft.com/conversions?api-version=${API_VERSION}&udid=${udid}&inputType=DWG&subscription-key=${subscriptionKey}&outputOntology=facility-2.0`
  );
  if (res.headers["operation-location"]) {
    // call this until 200 and return drawing id
    return await waitForSuccess(
      `${res.headers["operation-location"]}&subscription-key=${subscriptionKey}`,
      {
        body: "status",
        header: "resource-location",
      },
      (res) => {
        const re = new RegExp(
          `https://${location}.atlas.microsoft.com/conversions/([\\S]+)\\?api-version=${API_VERSION}`
        );
        const matches = res.headers["resource-location"].match(re);
        if (matches && matches.length === 2) {
          return matches[1];
        }
        return null;
      }
    );
  }
}

export async function createOrUpdateDataSet(
  conversionId: string,
  location: string,
  subscriptionKey: string,
  datasetId?: string
) {
  const res = await axios.post<any>(
    `https://${location}.atlas.microsoft.com/datasets?api-version=${API_VERSION}&conversionId=${conversionId}&subscription-key=${subscriptionKey}${
      datasetId ? `&datasetId=${datasetId}` : ""
    }`
  );
  if (res.headers["operation-location"]) {
    // call this until 200 and return drawing id
    return await waitForSuccess(
      `${res.headers["operation-location"]}&subscription-key=${subscriptionKey}`,
      {
        body: "status",
        header: "resource-location",
      },
      (res) => {
        const re = new RegExp(
          `https://${location}.atlas.microsoft.com/datasets/([\\S]+)\\?api-version=${API_VERSION}`
        );
        const matches = res.headers["resource-location"].match(re);
        if (matches && matches.length === 2) {
          return matches[1];
        }
        return null;
      }
    );
  }
}

export async function createTileset(
  datasetId: string,
  location: string,
  subscriptionKey: string
) {
  const res = await axios.post<any>(
    `https://${location}.atlas.microsoft.com/tilesets?api-version=${API_VERSION}&datasetID=${datasetId}&subscription-key=${subscriptionKey}`
  );
  if (res.headers["operation-location"]) {
    // call this until 200 and return drawing id
    return await waitForSuccess(
      `${res.headers["operation-location"]}&subscription-key=${subscriptionKey}`,
      {
        body: "status",
        header: "resource-location",
      },
      (res) => {
        const re = new RegExp(
          `https://${location}.atlas.microsoft.com/tilesets/([\\S]+)\\?api-version=${API_VERSION}`
        );
        const matches = res.headers["resource-location"].match(re);
        if (matches && matches.length === 2) {
          return matches[1];
        }
        return null;
      }
    );
  }
}

export async function createStateset(
  datasetId: string,
  location: string,
  subscriptionKey: string
) {
  const res = await axios.post<any>(
    `https://${location}.atlas.microsoft.com/featurestatesets?api-version=${API_VERSION}&datasetId=${datasetId}&subscription-key=${subscriptionKey}`,
    {
      styles: [
        {
          keyName: "occupied",
          type: "boolean",
          rules: [
            {
              true: "#8e5a00",
              false: "#FFFFFF",
            },
          ],
        },
        {
          keyName: "temperature",
          type: "number",
          rules: [
            {
              range: {
                minimum: "13",
                exclusiveMaximum: "18",
              },
              color: "#0000FF",
            },
            {
              range: {
                minimum: "24",
              },
              color: "#FF0000",
            },
            {
              range: {
                minimum: "18",
                exclusiveMaximum: "24",
              },
              color: "#00FF00",
            },
          ],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (res.status === 200) {
    return res.data["statesetId"];
  }
  return null;
}

async function waitForSuccess(
  url: string,
  expectedResult: {
    body?: string;
    header?: string;
  },
  onSuccess: (res: AxiosResponse<any>) => string | null,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let progress = 0;
    const intid = setInterval(async () => {
      onProgress?.((progress += 0.1));
      try {
        const res = await axios.get<any>(url);
        if (
          res.status === 200 &&
          ((expectedResult.body &&
            res.data[expectedResult.body] === "Succeeded") ||
            (expectedResult.header && res.headers[expectedResult.header]))
        ) {
          clearInterval(intid);
          onProgress?.(1);
          const result = onSuccess(res);
          if (result) {
            resolve(result);
          } else {
            reject(result);
          }
        }
      } catch (ex) {
        reject();
      }
    }, 5000);
  });
}

export async function createStaticApp(
  credentials: AzureCredentials,
  subscriptionId: string,
  resourceGroup: string,
  parameters: Partial<SiteParameters>
) {
  const client = new ResourceManagementClient(credentials, subscriptionId);
  const deployment = await client.deployments.createOrUpdate(
    'lucadruda',
    "staticsite",
    {
      properties: {
        mode: "Incremental",
        template: siteTemplate,
        parameters: Object.entries({
          ...parameters,
          scriptUri:
            "https://raw.githubusercontent.com/lucadruda/iotc-indoor-maps/indoor_maps/setup/src/azure/deployment_az.sh",
          siteFolder: "map-react",
          gitRepo: "https://github.com/lucadruda/iotc-indoor-maps",
          gitBranch: "indoor_maps",
        } as SiteParameters).reduce((obj: any, [key, value]) => {
          obj[key] = { value };
          return obj;
        }, {}),
      },
    }
  );
  debugger;
  if (deployment.id) {
    if (
      deployment.properties?.outputs &&
      deployment.properties.outputs.staticWebsiteUrl
    )
      return deployment.properties.outputs.staticWebsiteUrl.value;
  }
  return null;
}
