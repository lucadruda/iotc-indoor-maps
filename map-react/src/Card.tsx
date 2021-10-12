import * as React from "react";
import {
  mergeStyleSets,
  HoverCard,
  IExpandingCardProps,
  ThemeProvider,
  Text,
  DirectionalHint,
} from "@fluentui/react";

const classNames = mergeStyleSets({
  compactCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  expandedCard: {
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
  },
  item: {
    selectors: {
      "&:hover": {
        textDecoration: "underline",
        cursor: "pointer",
      },
    },
  },
});

type Item = { name: string; ipAddress: string };
const items = [
  { name: "Name1", ipAddress: "ipAddress1" },
  { name: "Name2", ipAddress: "ipAddress2" },
  { name: "Name3", ipAddress: "ipAddress3" },
];

const onRenderCompactCard = (item: Item): JSX.Element => {
  return (
    <div className={classNames.compactCard}>
      <Text block variant="xLarge">
        {item.name}
      </Text>
    </div>
  );
};

const onRenderExpandedCard = (item: Item): JSX.Element => {
  return (
    <div className={classNames.expandedCard}>
      <Text style={{ fontWeight: 600 }}>{item.name}</Text>
      <Text>{item.ipAddress}</Text>
    </div>
  );
};

export const HoverCardBasicExample: React.FunctionComponent = () => {
  const divref = React.useRef(null);
  const expandingCardProps: IExpandingCardProps = React.useMemo(
    () => ({
      onRenderCompactCard,
      onRenderExpandedCard,
      renderData: items[0],
      directionalHint: DirectionalHint.rightTopEdge,
      gapSpace: 16,
      calloutProps: {
        isBeakVisible: true,
      },
    }),
    [onRenderCompactCard, onRenderExpandedCard]
  );

  React.useEffect(() => {
    (divref.current as any)?.click();
  }, []);

  return (
    <ThemeProvider>
      <HoverCard
        expandingCardProps={expandingCardProps}
        cardDismissDelay={300}
        trapFocus
        sticky
        instantOpenOnClick
      >
        <div ref={divref} style={{ height: 20, width: 20 }}>
          <p>
            Hover over the <i>location</i> cell of a row item to see the card or
            use the keyboard to navigate to it.
          </p>
          <p>
            When using the keyboard to tab to it, the card will open but
            navigation inside of it will not be available.
          </p>
        </div>
      </HoverCard>
    </ThemeProvider>
  );
};
