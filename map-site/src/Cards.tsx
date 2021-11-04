import {
  List,
  mergeStyleSets,
  PrimaryButton,
  Text,
  TextField,
} from "@fluentui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getTelemetryValue, setProperty, triggerCommand } from "./central";
import { ThermostatProperties, TVProperties } from "./types";

type CardProps = {
  data: any;
};
type CardItem = { key: string; value: any; onEdit?: (val: any) => void };

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
    alignItems: "center",
    marginBottom: 10,
    selectors: {
      "&:hover": {
        textDecoration: "underline",
        cursor: "pointer",
      },
    },
  },
});

const onRenderListItem = (item?: CardItem, index?: number) => (
  <div className={classNames.item}>
    <Text style={{ fontWeight: 600 }}>{item?.key}</Text>
    {item?.onEdit ? (
      <TextField
        type="number"
        style={{ width: 60 }}
        value={item.value}
        onChange={(e, val) => {
          item?.onEdit?.(val);
        }}
      />
    ) : (
      <Text>{item?.value}</Text>
    )}
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
export const ThermostatCard = React.memo<CardProps>(({ data }) => {
  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [targetTemperature, setTargetTemperature] = useState(0);
  const { properties }: { properties: ThermostatProperties } = data;

  const fetchTelemetry = useCallback(async () => {
    setCurrentTemperature(
      await getTelemetryValue(data.properties.id, "temperature")
    );
  }, [setCurrentTemperature, data.properties.id]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const items = useMemo<CardItem[]>(
    () => [
      {
        key: "Temperature",
        value: currentTemperature ? `${currentTemperature} °C` : "-",
      },
      {
        key: "Target Temperature",
        value: targetTemperature,
        onEdit: (val) => {
          setTargetTemperature(parseInt(val));
        },
      },
    ],
    [currentTemperature, targetTemperature]
  );

  return (
    <div className={classNames.expandedCard}>
      <List
        className={classNames.list}
        items={items}
        onRenderCell={onRenderListItem}
      />
      <PrimaryButton
        text="Set Temperature"
        onClick={async () => {
          await setProperty(
            properties.id,
            "targetTemperature",
            targetTemperature
          );
        }}
      />
    </div>
  );
});
