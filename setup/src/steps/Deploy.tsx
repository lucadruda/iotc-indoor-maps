import React from "react";

const Deploy = React.memo(() => {
  return (
    <div>
      <h2>Deploy Maps account to your Azure Subscription</h2>
      <a
        href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure%2Fazure-quickstart-templates%2Fmaster%2Fquickstarts%2Fmicrosoft.storage%2Fstorage-account-create%2Fazuredeploy.json"
        target="_blank"
      >
        <img src="https://aka.ms/deploytoazurebutton" />
      </a>
    </div>
  );
});
export default Deploy;
