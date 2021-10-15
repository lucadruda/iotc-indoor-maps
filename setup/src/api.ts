import { AzureMapsManagementClient } from "@azure/arm-maps";
import { InteractiveBrowserCredential } from "@azure/identity";
import { ResourceManagementClient, ResourceGroups } from "@azure/arm-resources";

const SUBSCRIPTION_ID = "2efa8bb6-25bf-4895-ba64-33806dd00780";
// const SUBSCRIPTION_ID = "7c989b7d-a7d5-4256-9f3f-809d6554cec8";
const RESOURCE_GROUP = "iotc-indoor-maps";
const ACCOUNT_NAME = "iim-account";

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

export async function login() {
  const credential = new InteractiveBrowserCredential({
    clientId: "0523c52d-806a-4f07-9dda-8950eb13055f",
    // tenantId: "9e88becc-48d3-42b4-9766-543fd455ad51",
  });
  console.log(credential);

  return new ResourceManagementClient(credential, SUBSCRIPTION_ID);
  const client = new AzureMapsManagementClient(credential, SUBSCRIPTION_ID);
  return client;
}
