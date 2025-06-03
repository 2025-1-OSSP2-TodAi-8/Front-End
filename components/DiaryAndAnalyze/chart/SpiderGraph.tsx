// 파일명: SpiderGraph.tsx
import React from "react";
import { View } from "react-native";
import Svg, { G, Polygon, Line, Text, Circle } from "react-native-svg";

interface Point {
  x: number;
  y: number;
}

interface SpiderGraphProps {
  graphSize?: number; // SVG 캔버스 크기 (정사각형)
  scaleCount?: number; // 눈금(격자) 개수, 예: 5 라고 하면 20,40,60,80,100 처럼 5단계
  data: Array<{ [key: string]: number }>;
  options?: {
    max?: number;        // 데이터 최대값 (없으면 자동 계산)
    colorList?: string[]; // 다수의 폴리곤에 색을 다르게 줄 경우 사용
    dotList?: boolean[];  // 꼭짓점에 점(circle)을 찍을지 여부
  };
}

/**
 * @param count   축(레이더) 축 개수(예: 6각형이면 6)
 * @param radius  반지름
 * @param centerX 중심 X 좌표
 * @param centerY 중심 Y 좌표
 * @returns 각 축 꼭짓점의 좌표(Point[]) - 중심에서 시작, 시계방향으로 진행
 */
function getPoints(
  count: number,
  radius: number,
  centerX: number,
  centerY: number
): Point[] {
  const angleStep = (2 * Math.PI) / count;
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    pts.push({
      x: centerX + radius * Math.sin(angle),
      y: centerY - radius * Math.cos(angle),
    });
  }
  return pts;
}

/**
 * @param points 다각형을 구성하는 좌표 배열
 * @returns SVG Polygon에 들어갈 문자열 ( "x1,y1 x2,y2 x3,y3 ..." )
 */
function getPolygonPoints(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * @param data    { label1: 값1, label2: 값2, ... }
 * @param keys    레이더 축 순서대로 배치된 label 문자열 배열
 * @param radius  최대 반지름
 * @param centerX 중심 X
 * @param centerY 중심 Y
 * @param max     데이터 최대값 (0이 아니어야 함)
 * @returns 각 data 값에 대응하는 (x,y) 좌표(Point[]) 배열
 */
function getDataPoints(
  data: { [key: string]: number },
  keys: string[],
  radius: number,
  centerX: number,
  centerY: number,
  max: number
): Point[] {
  const angleStep = (2 * Math.PI) / keys.length;
  const pts: Point[] = [];

  for (let i = 0; i < keys.length; i++) {
    const rawValue = data[keys[i]];
    // rawValue가 유효한 숫자인지 체크, 아니면 0으로 처리
    const value = typeof rawValue === "number" && !isNaN(rawValue) ? rawValue : 0;
    // max가 0이 되지 않도록 기본값 1 처리
    const safeMax = max > 0 ? max : 1;
    const r = (value / safeMax) * radius;

    const angle = i * angleStep;
    pts.push({
      x: centerX + r * Math.sin(angle),
      y: centerY - r * Math.cos(angle),
    });
  }

  return pts;
}

const SpiderGraph: React.FC<SpiderGraphProps> = ({
  graphSize = 300,
  scaleCount = 5,
  data = [],
  options = {},
}) => {
  // 데이터가 없거나 빈 배열이면 아무것도 렌더하지 않음
  if (!data || data.length === 0) return null;

  // 1) 레이더 축(레이블) 목록(예: ["화남","슬픔","혐오","행복","공포","놀람"] 등)
  const keys = Object.keys(data[0]);
  const axisCount = keys.length;

  // 2) 데이터 최대값 계산 (options.max이 주어지면 그걸, 아니면 data 중 최댓값)
  const computedMax =
    typeof options.max === "number"
      ? options.max
      : Math.max(...data.map((d) => Math.max(...Object.values(d)), 0));
  // 이때 computedMax가 0이라면 r 계산 시 NaN 방지 위해 1로 대체
  const max = computedMax > 0 ? computedMax : 1;

  // 3) SVG 중앙 좌표와 반지름
  const centerX = graphSize / 2;
  const centerY = graphSize / 2;
  // 외곽(폴리곤)이 화면에 딱 맞게 그려지도록 여유 공간 30px 정도 확보
  const radius = graphSize / 2 - 30;

  // 4) 눈금(스케일) 당 값(예: max=100, scaleCount=5 -> [20,40,60,80,100])
  const stepValue = max / scaleCount; // 예: 100/5 = 20

  return (
    <View>
      <Svg width={graphSize} height={graphSize}>
        <G>
          {/**
           * 1) 내부 격자(스케일) 그리기
           *    - scaleCount개 만큼 동심원 형태(실제로는 동일한 형태의 다각형)를 그린다.
           *    - 각 단계마다 top 위치(위쪽 정중앙) 에 눈금 값을 텍스트로 표시한다.
           */}
          {[...Array(scaleCount)].map((_, i) => {
            // i = 0,1,2,3,4 (총 scaleCount 번)
            // 반지름: (i+1)/scaleCount * 최대반지름
            const r = ((i + 1) * radius) / scaleCount;
            // 해당 반지름에서 다각형을 그리기 위한 꼭짓점 좌표들
            const polygonPoints = getPoints(axisCount, r, centerX, centerY);
            // 눈금 값(예: 20, 40, 60, 80, 100)
            const gridValue = Math.round(stepValue * (i + 1));

            return (
              <G key={`scale-${i}`}>
                {/* 스케일 다각형(격자) */}
                <Polygon
                  points={getPolygonPoints(polygonPoints)}
                  fill="none"
                  stroke="#918F8F"
                  strokeWidth={0.5}
                />
                {/* 위쪽(12시 방향) 텍스트 눈금 */}
                <Text
                  x={centerX}
                  // centerY - r 위치는 다각형의 꼭짓점(위쪽)보다 약간 위에 찍힘 → margin을 약간 줌
                  y={centerY - r - 4}
                  fontSize={10}
                  fill="#666"

                  textAnchor="middle"
                  alignmentBaseline="baseline"
                >
                  {gridValue}
                </Text>
              </G>
            );
          })}

          {/**
           * 2) 축(레이더) 라인 그리기
           *    - 중심에서 외곽(반지름)까지 뻗은 6개(또는 keys.length 개) 라인을 그린다.
           */}
          {getPoints(axisCount, radius, centerX, centerY).map((pt, idx) => (
            <Line
              key={`axis-${idx}`}
              x1={centerX}
              y1={centerY}
              x2={pt.x}
              y2={pt.y}
              stroke="#ccc"

            />
          ))}

          {/**
           * 3) 데이터 폴리곤 그리기
           *    - data 가 여러 개(layer) 들어올 수 있어서 .map 으로 처리
           *    - options.colorList[idx] 가 있으면 해당 색상, 아니면 기본 보라색으로 처리
           */}
          {data.map((d, idx) => {
            const dataPts = getDataPoints(d, keys, radius, centerX, centerY, max);
            const fillColor = options.colorList && options.colorList[idx]
              ? options.colorList[idx] + "55"
              : "#6A0DAD55";
            const strokeColor = options.colorList && options.colorList[idx]
              ? options.colorList[idx]
              : "#6A0DAD";

            return (
              <Polygon
                key={`data-poly-${idx}`}
                points={getPolygonPoints(dataPts)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={2}
              />
            );
          })}

          {/**
           * 4) 데이터 꼭짓점 Dot 그리기 (options.dotList[idx] 가 true 일 때만 표시)
           */}
          {data.map((d, idx) => {
            if (!options.dotList || !options.dotList[idx]) {
              return null;
            }
            const dataPts = getDataPoints(d, keys, radius, centerX, centerY, max);
            const dotColor = options.colorList && options.colorList[idx]
              ? options.colorList[idx]
              : "#6A0DAD";

            return dataPts.map((pt, i) => (
              <Circle
                key={`dot-${idx}-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={dotColor}
              />
            ));
          })}

          {/**
           * 5) 축 레이블(감정 이름 등) 그리기
           *    - 외곽 반지름 + 25 정도 떨어진 위치에 표시 (18에서 25로 증가)
           */}
          {getPoints(axisCount, radius + 20, centerX, centerY).map((pt, i) => (
            <Text
              key={`label-${i}`}
              x={pt.x}
              y={pt.y}
              fontSize={10}
              fontWeight="bold"
              fill="#34495E"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {keys[i]}
            </Text>
          ))}
        </G>
      </Svg>
    </View>
  );
};

export default SpiderGraph;