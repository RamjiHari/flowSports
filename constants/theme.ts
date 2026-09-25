export const colors = {
  ink: "#12222e",
  inkSoft: "#5b6b7a",
  courtBlue: "#123a5e",
  courtBlueDeep: "#0b2540",
  boys: "#1f4e78",
  boysSoft: "#e9f0f6",
  girls: "#ad0059",
  girlsSoft: "#fbe8f1",
  gold: "#dea526",
  goldDeep: "#a9791a",
  cream: "#faf6ec",
  card: "#ffffff",
  line: "#e4e0d6",
  lineStrong: "#d3cdbe",
  win: "#dff0d8",
  winInk: "#2c6e2f",
  loss: "#fbe4e1",
  lossInk: "#a5372a",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 18, xl: 24 };

export const radius = { sm: 8, md: 14, lg: 20 };

export function categoryColor(category: "Boys" | "Girls") {
  return category === "Boys" ? colors.boys : colors.girls;
}

export function categorySoft(category: "Boys" | "Girls") {
  return category === "Boys" ? colors.boysSoft : colors.girlsSoft;
}
