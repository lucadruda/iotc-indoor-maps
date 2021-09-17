import React from 'react';
import './App.css';
import { indoor, control } from 'azure-maps-indoor';
import * as atlas from 'azure-maps-control';
import { useEffect } from 'react';
import { Callout, FontWeights, mergeStyleSets, Text, Link, Stack } from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import { statesetId, subscriptionKey, tilesetId, useCallout } from './common';
import { occupyRoom, reserveRoom } from './map';

const mapId = 'map-id';


const App = React.memo(() => {

  const { state: calloutState, open: openCallout, dismiss: dismissCallout } = useCallout();
  const labelId = useId('callout-label');
  const descriptionId = useId('callout-description');


  useEffect(() => {
    const map = new atlas.Map(mapId, {
      //use your facility's location
      center: [-122.1321, 47.636457],
      //or, you can use bounds: [# west, # south, # east, # north] and replace # with your Map bounds
      style: "blank",
      view: "Auto",
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: subscriptionKey,
      },
      zoom: 18.5,

    });
    map.events.add("ready", () => {
      const levelControl = new control.LevelControl({
        position: atlas.ControlPosition.TopRight
      });

      const indoorManager = new indoor.IndoorManager(map, {
        levelControl: levelControl, //level picker
        tilesetId: tilesetId,
        statesetId: statesetId, // Optional
      });

      if (statesetId.length > 0) {
        indoorManager.setDynamicStyling(true);
      }


      map.events.add("levelchanged", indoorManager, (eventData) => {
        //put code that runs after a level has been changed
        console.log("The level has changed:", eventData);
      });

      map.events.add("facilitychanged", indoorManager, (eventData) => {
        //put code that runs after a facility has been changed
        console.log("The facility has changed:", eventData);
      });

      map.events.add("click", function (e) {
        const features = map.layers.getRenderedShapes(e.position, "unit");
        features.forEach((feature: any) => {
          if (feature.layer.id.endsWith('indoor_unit_office')) {
            console.log(feature);
            openCallout(feature.properties.featureId, feature, e.originalEvent as MouseEvent);
          }
        });
      });
    });
  }, [openCallout]);

  return (
    <div className="App">
      <div id={mapId}>
      </div>
      {calloutState.show && (
        <Callout
          className={styles.callout}
          ariaLabelledBy={labelId}
          ariaDescribedBy={descriptionId}
          role="alertdialog"
          gapSpace={0}
          target={calloutState.event}
          onDismiss={dismissCallout}
          setInitialFocus
        >
          <Text block variant="xLarge" className={styles.title} id={labelId}>
            {calloutState.data.properties.name}
          </Text>
          <Text block variant="small" id={descriptionId}>
            Message body is optional. If help documentation is available, consider adding a link to learn more at the
            bottom.
          </Text>
          <Stack horizontal tokens={{ childrenGap: 40 }}>
            {!calloutState.data.state['stateValue:occupied'] &&
              <Link onClick={() => {
                reserveRoom(calloutState.id as string, calloutState.data.state['stateValue:reserved']);
                dismissCallout()
              }} className={styles.link}>
                {!calloutState.data.state['stateValue:reserved'] ? 'Reserve Room' : 'Free Room'}
              </Link>}
            <Link onClick={() => {
              occupyRoom(calloutState.id as string, calloutState.data.state['stateValue:occupied']);
              dismissCallout()
            }} className={styles.link}>
              {!calloutState.data.state['stateValue:occupied'] ? 'Occupy room' : 'Free Room'}
            </Link>
          </Stack>
        </Callout>
      )}
    </div>
  );
});

const styles = mergeStyleSets({
  button: {
    width: 130,
  },
  callout: {
    width: 320,
    padding: '20px 24px',
  },
  title: {
    marginBottom: 12,
    fontWeight: FontWeights.semilight,
  },
  link: {
    display: 'block',
    marginTop: 20,
  },
});

export default App;
