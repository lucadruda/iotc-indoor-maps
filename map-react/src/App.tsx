import React, { useCallback, useMemo, useRef, useState } from "react";
import "./App.css";
import { indoor, control } from "azure-maps-indoor";
import * as atlas from "azure-maps-control";
import { isEqual } from "lodash";
import { useEffect } from "react";
import {
  FontWeights,
  mergeStyleSets,
  Text,
  HoverCard,
  IExpandingCardProps,
  DirectionalHint,
} from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import {
  getRandomPosition,
  statesetId,
  subscriptionKey,
  tilesetIds,
  useCard,
} from "./common";
// import { occupyRoom, reserveRoom } from "./map";
import TvIcon from "./icons/tv.png";
import ThermostatIcon from "./icons/thermostat.png";
import { ThermostatProperties, TVProperties } from "./types";
import { getDevices } from "./central";
import { ThermostatCard, TvCard } from "./Cards";

const mapId = "map-id";

const App = React.memo(() => {
  const { state: cardState, open: openCard } = useCard();
  const [devices, setDevices] = useState({});
  const { current: tvDataSource } = useRef<atlas.source.DataSource>(
    new atlas.source.DataSource()
  );
  const { current: thermostatDataSource } = useRef<atlas.source.DataSource>(
    new atlas.source.DataSource()
  );
  const [features, setFeatures] = useState<any[]>([]);
  const labelId = useId("card-label");
  const descriptionId = useId("card-description");
  const popupRef = useRef<HTMLDivElement>(null);

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
    },
    item: {
      display: "flex",
      justifyContent: "space-between",
      selectors: {
        "&:hover": {
          textDecoration: "underline",
          cursor: "pointer",
        },
      },
    },
  });

  const onMouseOver = useCallback(
    (map, event, layer) => {
      const features = map.layers.getRenderedShapes(event.position, layer);
      features.forEach((feature: any) => {
        const template =
          feature.dataSource.id === tvDataSource.getId() ? "tv" : "thermostat";
        openCard(
          feature.data.properties.featureId,
          { ...feature.data, template },
          [
            atlas.Pixel.getX(event.pixel!) - 10,
            atlas.Pixel.getY(event.pixel!) - 10,
          ]
        );
        popupRef.current?.focus();
      });
    },
    [openCard]
  );

  const refresh = useCallback(async () => {
    if (features.length === 0) {
      return;
    }
    const devs = await getDevices();
    if (isEqual(devs, devices)) {
      return;
    }
    tvDataSource.clear();
    thermostatDataSource.clear();
    await Promise.all(
      devs.tv.map(async (tv) => {
        if (tv.properties?.room) {
          const feature = features.find(
            (feature) =>
              parseInt(feature.properties.name) === tv.properties?.room
          );
          if (feature) {
            tvDataSource.add(
              new atlas.data.Feature<atlas.data.Geometry, TVProperties>(
                new atlas.data.Point(getRandomPosition(feature)),
                {
                  id: tv.id,
                  name: tv.displayName,
                  ipaddress: tv.properties?.ipAddress ?? null,
                }
              )
            );
          }
        }
      })
    );

    await Promise.all(
      devs.thermostats.map(async (thm) => {
        if (thm.properties?.room) {
          const feature = features.find(
            (feature) =>
              parseInt(feature.properties.name) === thm.properties?.room
          );
          if (feature) {
            thermostatDataSource.add(
              new atlas.data.Feature<atlas.data.Geometry, ThermostatProperties>(
                new atlas.data.Point(getRandomPosition(feature)),
                {
                  id: thm.id,
                  name: thm.displayName,
                  targetTemperature: thm.properties?.targetTemperature ?? null,
                  maxTempSinceLastReboot:
                    thm.properties?.maxTempSinceLastReboot ?? null,
                }
              )
            );
          }
        }
      })
    );
    setDevices(devs);
  }, [thermostatDataSource, tvDataSource, features, devices]);

  useEffect(() => {
    refresh();
    const inId = setInterval(refresh, 10000);
    return () => clearInterval(inId);
  }, [refresh]);

  useEffect(() => {
    const indoorMap = new atlas.Map(mapId, {
      //use your facility's location
      center: [7.446113203345874, 46.946908419572395],
      //or, you can use bounds: [# west, # south, # east, # north] and replace # with your Map bounds
      view: "Auto",
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: subscriptionKey,
      },
      zoom: 18.5,
    });
    indoorMap.events.add("ready", async () => {
      const levelControl = new control.LevelControl({
        position: atlas.ControlPosition.TopRight,
      });

      const indoorManager = new indoor.IndoorManager(indoorMap, {
        levelControl: levelControl, //level picker
        tilesetId: tilesetIds[0],
        statesetId: statesetId, // Optional
      });

      if (statesetId.length > 0) {
        indoorManager.setDynamicStyling(true);
      }

      indoorMap.events.add("levelchanged", indoorManager, (eventData) => {
        //put code that runs after a level has been changed
        console.log("The level has changed:", eventData);
      });

      indoorMap.events.add("facilitychanged", indoorManager, (eventData) => {
        //put code that runs after a facility has been changed
        console.log("The facility has changed:", eventData);
      });

      indoorMap.events.add("click", function (e) {
        const features = indoorMap.layers.getRenderedShapes(e.position, "unit");
        features.forEach((feature: any) => {
          if (feature.layer.id.endsWith("indoor_unit_office")) {
            console.log(feature);
          }
        });
      });

      await indoorMap.imageSprite.add("tv-icon", TvIcon);
      await indoorMap.imageSprite.add("thermostat-icon", ThermostatIcon);
      indoorMap.sources.add(tvDataSource);
      indoorMap.sources.add(thermostatDataSource);

      const tvsLayer = new atlas.layer.SymbolLayer(tvDataSource, undefined, {
        minZoom: 19,
        iconOptions: {
          //Pass in the id of the custom icon that was loaded into the map resources.
          image: "tv-icon",

          //Optionally scale the size of the icon.
          size: 0.2,
        },
      });

      const thmsLayer = new atlas.layer.SymbolLayer(
        thermostatDataSource,
        undefined,
        {
          minZoom: 19,
          iconOptions: {
            //Pass in the id of the custom icon that was loaded into the map resources.
            image: "thermostat-icon",

            //Optionally scale the size of the icon.
            size: 0.2,
          },
        }
      );

      indoorMap.layers.add(tvsLayer);
      indoorMap.layers.add(thmsLayer);
      indoorMap.events.add("mouseover", tvsLayer, (e) =>
        onMouseOver(indoorMap, e, tvsLayer)
      );
      indoorMap.events.add("mouseover", thmsLayer, (e) =>
        onMouseOver(indoorMap, e, thmsLayer)
      );

      /** Initialize features */
      indoorMap.events.add("load", (e) => {
        try {
          const features = indoorMap.layers.getRenderedShapes(
            undefined,
            "unit"
          );
          setFeatures(indoorMap.layers.getRenderedShapes(undefined, "unit"));
        } catch (ex) {
          console.log(ex);
        }
      });
    });
  }, [setFeatures, onMouseOver, tvDataSource, thermostatDataSource]);

  const onRenderExpandedCard = useCallback(
    (): JSX.Element => (
      <>
        {cardState.data.template === "tv" && <TvCard data={cardState.data} />}
        {cardState.data.template === "thermostat" && (
          <ThermostatCard data={cardState.data} />
        )}
      </>
    ),
    [cardState, classNames]
  );

  const onRenderCompactCard = useCallback((): JSX.Element => {
    return (
      <div className={classNames.compactCard}>
        <Text block variant="xLarge" className={styles.title} id={labelId}>
          {cardState.data.properties.name}
        </Text>
        <Text block variant="small" id={descriptionId}>
          {cardState.data.properties.ipaddress}
        </Text>
      </div>
    );
  }, [cardState, classNames, descriptionId, labelId]);

  const expandingCardProps: IExpandingCardProps = useMemo(
    () => ({
      onRenderCompactCard,
      onRenderExpandedCard,
      renderData: {},
      directionalHint: DirectionalHint.rightTopEdge,
      gapSpace: 16,
      calloutProps: {
        isBeakVisible: true,
      },
    }),
    [onRenderCompactCard, onRenderExpandedCard]
  );

  return (
    <div className="App">
      <div id={mapId}></div>
      {cardState.show && (
        <div
          style={{
            position: "absolute",
            left: cardState.pagePosition?.[0],
            top: cardState.pagePosition?.[1],
            height: "100%",
          }}
        >
          <HoverCard
            expandingCardProps={expandingCardProps}
            cardDismissDelay={300}
            trapFocus
            sticky
            instantOpenOnClick
          >
            <div style={{ height: 20, width: 20 }}></div>
          </HoverCard>
        </div>
        //   <Text block variant="xLarge" className={styles.title} id={labelId}>
        //     {cardState.data.properties.name}
        //   </Text>
        //   <Text block variant="small" id={descriptionId}>
        //     Message body is optional. If help documentation is available, consider adding a link to learn more at the
        //     bottom.
        //   </Text>
        //   <Stack horizontal tokens={{ childrenGap: 40 }}>
        //     {!cardState.data.state['stateValue:occupied'] &&
        //       <Link onClick={() => {
        //         reserveRoom(cardState.id as string, cardState.data.state['stateValue:reserved']);
        //         dismissCard()
        //       }} className={styles.link}>
        //         {!cardState.data.state['stateValue:reserved'] ? 'Reserve Room' : 'Free Room'}
        //       </Link>}
        //     <Link onClick={() => {
        //       occupyRoom(cardState.id as string, cardState.data.state['stateValue:occupied']);
        //       dismissCard()
        //     }} className={styles.link}>
        //       {!cardState.data.state['stateValue:occupied'] ? 'Occupy room' : 'Free Room'}
        //     </Link>
        //   </Stack>
        // </Card>
      )}
    </div>
  );
});

const styles = mergeStyleSets({
  button: {
    width: 130,
  },
  card: {
    width: 320,
    padding: "20px 24px",
  },
  title: {
    marginBottom: 12,
    fontWeight: FontWeights.bold,
  },
  link: {
    display: "block",
    marginTop: 20,
  },
});

export default App;
