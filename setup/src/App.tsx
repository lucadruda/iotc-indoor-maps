import { DefaultButton } from "@fluentui/react";
import React, { useState } from "react";
import { creator, login } from "./api";
import { useSteps } from "./hooks";

const App = React.memo(() => {
  const [resourceGroups, setResourceGroups] = useState<string[]>([]);
  return (
    <div>
      <DefaultButton
        onClick={async () => {
          const client = await login();
          console.log(client);
          // await creator(client);
          // const rgs = await client.resourceGroups.list();
          // setResourceGroups(rgs.map((rg) => rg.name!));
        }}
        text="Login"
      />
      <div>
        {resourceGroups.map((rg) => (
          <p>{rg}</p>
        ))}
      </div>
    </div>
  );
});

export function Wizard() {
  const [] = useSteps();
  return <div></div>;
}

export default App;
