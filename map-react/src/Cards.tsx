import {
  Button,
  List,
  mergeStyleSets,
  PrimaryButton,
  Stack,
  Text,
} from "@fluentui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getTelemetryValue, triggerCommand } from "./central";
import { TVProperties } from "./types";

type CardProps = {
  data: any;
};

const classNames = mergeStyleSets({
  compactCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  expandedCard: {
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    width: "100%",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    selectors: {
      "&:hover": {
        textDecoration: "underline",
        cursor: "pointer",
      },
    },
  },
});

const onRenderListItem = (
  item?: { key: string; value: any },
  index?: number
) => (
  <div className={classNames.item}>
    <Text style={{ fontWeight: 600 }}>{item?.key}</Text>
    <Text>{item?.value}</Text>
  </div>
);

export const TvCard = React.memo<CardProps>(({ data }) => {
  const [currentPower, setCurrentPower] = useState(null);
  const { properties }: { properties: TVProperties } = data;

  const fetchTelemetry = useCallback(async () => {
    setCurrentPower(await getTelemetryValue(data.properties.id, "powerState"));
  }, [setCurrentPower, data.properties.id]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const items = useMemo<any[]>(
    () => [
      {
        key: "IPAddress",
        value: properties.ipaddress,
      },
      {
        key: "Power State",
        value: currentPower ? "ON" : "OFF",
      },
    ],
    [currentPower, properties]
  );

  const power = useCallback(async (poweredOn: boolean) => {}, []);

  return (
    <div className={classNames.expandedCard}>
      <List
        className={classNames.list}
        items={items}
        onRenderCell={onRenderListItem}
      />
      {currentPower ? (
        <PrimaryButton
          text="Power off"
          onClick={async () => {
            await triggerCommand(properties.id, "powerOff");
          }}
        />
      ) : (
        <PrimaryButton
          text="Power on"
          onClick={async () => {
            await triggerCommand(properties.id, "powerOn");
          }}
        />
      )}
    </div>
  );
});
export const ThermostatCard = React.memo<CardProps>(() => null);
