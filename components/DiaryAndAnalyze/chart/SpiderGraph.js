import React from "react";
import { View } from "react-native";
import Svg, { G, Polygon, Line, Text, Circle } from "react-native-svg";

function getPoints(count, radius, centerX, centerY) {
  let angle = (2 * Math.PI) / count;
  let points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: centerX + radius * Math.sin(i * angle),
      y: centerY - radius * Math.cos(i * angle),
    });
  }
  return points;
}

function getPolygonPoints(points) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function getDataPoints(data, keys, radius, centerX, centerY, max) {
  let angle = (2 * Math.PI) / keys.length;
  let points = [];
  for (let i = 0; i < keys.length; i++) {
    let value = data[keys[i]];
    let r = (value / max) * radius;
    points.push({
      x: centerX + r * Math.sin(i * angle),
      y: centerY - r * Math.cos(i * angle),
    });
  }
  return points;
}

const SpiderGraph = ({
  graphSize = 300,
  scaleCount = 5,
  numberInterval = 1,
  data = [],
  options = {},
}) => {
  if (!data || data.length === 0) return null;
  const keys = Object.keys(data[0]);
  const max = options.max || Math.max(...data.map((d) => Math.max(...Object.values(d))));
  const centerX = graphSize / 2;
  const centerY = graphSize / 2;
  const radius = graphSize / 2 - 30;

  return (
    <View>
      <Svg width={graphSize} height={graphSize}>
        <G>
          {/* Draw scales */}
          {[...Array(scaleCount)].map((_, i) => {
            const r = ((i + 1) * radius) / scaleCount;
            const points = getPoints(keys.length, r, centerX, centerY);
            return (
              <Polygon
                key={i}
                points={getPolygonPoints(points)}
                fill="none"
                stroke="#ccc"
                strokeWidth={1}
              />
            );
          })}

          {/* Draw axis lines */}
          {keys.map((key, i) => {
            const points = getPoints(keys.length, radius, centerX, centerY);
            return (
              <Line
                key={key}
                x1={centerX}
                y1={centerY}
                x2={points[i].x}
                y2={points[i].y}
                stroke="#ccc"
                strokeWidth={1}
              />
            );
          })}

          {/* Draw data polygons */}
          {data.map((d, idx) => {
            const points = getDataPoints(d, keys, radius, centerX, centerY, max);
            return (
              <Polygon
                key={idx}
                points={getPolygonPoints(points)}
                fill={options.colorList && options.colorList[idx] ? options.colorList[idx] + '55' : '#6A0DAD55'}
                stroke={options.colorList && options.colorList[idx] ? options.colorList[idx] : '#6A0DAD'}
                strokeWidth={2}
              />
            );
          })}

          {/* Draw dots */}
          {data.map((d, idx) => {
            const points = getDataPoints(d, keys, radius, centerX, centerY, max);
            return options.dotList && options.dotList[idx] ? (
              points.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={options.colorList && options.colorList[idx] ? options.colorList[idx] : '#6A0DAD'}
                />
              ))
            ) : null;
          })}

          {/* Draw labels */}
          {keys.map((key, i) => {
            const points = getPoints(keys.length, radius + 18, centerX, centerY);
            return (
              <Text
                key={key}
                x={points[i].x}
                y={points[i].y}
                fontSize={14}
                fontWeight="bold"
                fill="#34495E"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {key}
              </Text>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default SpiderGraph; 