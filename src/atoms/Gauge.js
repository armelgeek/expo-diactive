import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import Svg, {G, Path, Circle} from 'react-native-svg';
import {Image, View, StyleSheet} from 'react-native';

import {Spring} from 'react-spring/renderprops-native';
import {drawArc, polarToCartesian, scaleValue} from '../utils/gauge';
import resources from '../resources/resources';

const Icon = ({x, y, size, source, rotate}) => (
  <View
    style={[
      styles.icon,
      {
        width: size,
        height: size,
        transform: [{rotate: `${rotate}deg`}],
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
      },
    ]}>
    <Image source={source} style={{width: size, height: size}} />
  </View>
);

const Gauge = ({
  segments = [],
  filledArcWidth = 20,
  emptyArcWidth = 20,
  arcSpacing = 10,
  totalArcSize = 300,
  radius = 100,
  emptyArcColor = '#ADB1CC',
  filledArcColor = '#5ECCAA',
  animationDuration = 1000,
  animated = true,
  incompleteArcColor = 'red',
  displayValue = false,
  valueBoxColor = 'red',
  valueFontColor = '#FFFFFF',
  iconSize = 30,
  iconSource = resources.home.ring,
  centralCircleColor = '#ffff',
  centralCircleRadius = 95,
  overlayImageSource = null,
  formatValue,
  style,
}) => {
  const [arcs, setArcs] = useState([]);

  const totalArcs = segments.length;
  const totalSpaces = totalArcs - 1;
  const totalSpacing = totalSpaces * arcSpacing;

  const arcSize = (totalArcSize - totalSpacing) / totalArcs;
  const arcsStart = 90 - totalArcSize / 2;

  const margin = 35;
  const svgWidth = (radius + filledArcWidth) * 2 + 2 * margin;
  const svgHeight = (radius + filledArcWidth) * 2 + 2 * (margin - 18);

  const totalFilledValue = segments.reduce(
    (acc, actual) => acc + actual.filled,
    0,
  );

  const createArcs = useCallback(() => {
    const newArcs = segments.map((goal, index) => {
      const newArc = {
        centerX: radius + filledArcWidth + margin,
        centerY: radius + filledArcWidth + margin,
        start: arcsStart + index * arcSize,
        end: arcsStart + arcSize + index * arcSize,
        isComplete: goal.total === goal.filled,
      };

      if (index !== 0) {
        newArc.start += arcSpacing * index;
        newArc.end += arcSpacing * index;
      }

      newArc.filled = scaleValue(
        goal.filled,
        [0, goal.total],
        [newArc.start, newArc.end],
      );

      return newArc;
    });

    setArcs(newArcs);
  }, [segments, arcSize, arcSpacing, filledArcWidth, arcsStart, radius]);

  const renderIcons = () => {
    const positions = [
      {angle: 0, iconSource, rotate: -90},
      {angle: 180, iconSource, rotate: 90},
      {angle: 90, iconSource, rotate: 0},
    ];

    return positions.map(({angle, iconSource, rotate}, index) => {
      const pos = polarToCartesian(
        radius + filledArcWidth + margin,
        radius + filledArcWidth + margin,
        radius + filledArcWidth - 30,
        angle,
      );

      return (
        <Icon
          key={index.toString()}
          x={pos.x}
          y={pos.y}
          size={iconSize}
          source={iconSource}
          rotate={rotate}
        />
      );
    });
  };

  useEffect(() => {
    createArcs();
  }, [segments, createArcs]);

  if (arcs.length === 0) {
    return <></>;
  }

  return (
    <View style={[styles.svgContainer, style]}>
      <Svg width={svgWidth} height={svgHeight}>
        {arcs.map((arc, index) => (
          <G key={index.toString()}>
            <Path
              fill="none"
              stroke={emptyArcColor}
              strokeWidth={emptyArcWidth}
              strokeLinecap="round"
              d={drawArc(arc.centerX, arc.centerY, radius, arc.start, arc.end)}
            />

            {animated && arc.filled > arc.start && (
              <Spring
                from={{x: arc.start, y: 0}}
                to={{x: arc.filled + 0.6, y: filledArcWidth}}
                config={{
                  duration: animationDuration / totalArcs,
                  delay: (animationDuration / totalArcs) * index,
                }}>
                {props => (
                  <Path
                    fill="none"
                    stroke={
                      arc.isComplete
                        ? filledArcColor
                        : incompleteArcColor || filledArcColor
                    }
                    strokeWidth={props.y}
                    strokeLinecap="round"
                    d={drawArc(
                      arc.centerX,
                      arc.centerY,
                      radius,
                      arc.start,
                      props.x,
                    )}
                  />
                )}
              </Spring>
            )}

            {!animated && arc.filled > arc.start && (
              <Path
                fill="none"
                stroke={
                  arc.isComplete
                    ? filledArcColor
                    : incompleteArcColor || filledArcColor
                }
                strokeWidth={filledArcWidth}
                strokeLinecap="round"
                d={drawArc(
                  arc.centerX,
                  arc.centerY,
                  radius,
                  arc.start,
                  arc.filled,
                )}
              />
            )}
          </G>
        ))}

        {displayValue && (
          <G>
            {!animated && renderDisplayValue()}

            {animated && (
              <Spring
                from={{x: arcsStart, value: 0}}
                to={{x: arcs[arcs.length - 1].filled, value: totalFilledValue}}
                config={{duration: animationDuration}}>
                {props => renderDisplayValue(props.x, props.value)}
              </Spring>
            )}
          </G>
        )}

        <Circle
          cx={radius + filledArcWidth + margin}
          cy={radius + filledArcWidth + margin}
          r={centralCircleRadius}
          fill={centralCircleColor}
        />

        {renderIcons()}

        {overlayImageSource && (
          <Image
            resizeMode={'contain'}
            source={overlayImageSource}
            style={{
              position: 'absolute',
              top: radius + filledArcWidth + margin - 120,
              left: radius + filledArcWidth + margin - 95,
              width: 93 * 2,
              height: 135 * 2,
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        )}
      </Svg>
    </View>
  );
};

Gauge.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      total: PropTypes.number.isRequired,
      filled: PropTypes.number.isRequired,
    }),
  ),
  filledArcWidth: PropTypes.number,
  emptyArcWidth: PropTypes.number,
  arcSpacing: PropTypes.number,
  totalArcSize: PropTypes.number,
  radius: PropTypes.number,
  emptyArcColor: PropTypes.string,
  filledArcColor: PropTypes.string,
  formatAmount: PropTypes.func,
  style: PropTypes.object,
  animationDuration: PropTypes.number,
  animated: PropTypes.bool,
  formatValue: PropTypes.func,
  incompleteArcColor: PropTypes.string,
  displayValue: PropTypes.bool,
  valueBoxColor: PropTypes.string,
  valueFontColor: PropTypes.string,
  iconSize: PropTypes.number,
  iconSource: PropTypes.any,
  centralCircleColor: PropTypes.string,
  centralCircleRadius: PropTypes.number,
};

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
  },
  svgContainer: {
    position: 'relative',
  },
  childrenContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    backgroundColor: 'transparent',
  },
});

export default Gauge;
