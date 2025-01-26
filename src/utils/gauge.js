// https://github.com/ricardovcorrea/react-native-segmented-round-display/blob/master/src/helpers.js
// Defines types for the Cartesian and Polar coordinates

  // Converts polar coordinates (radius, angle) to Cartesian coordinates (x, y)
  const polarToCartesian = (
	centerX,
	centerY,
	radius,
	angleInDegrees,
  ) => {
	const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;

	return {
	  x: centerX + radius * Math.cos(angleInRadians),
	  y: centerY + radius * Math.sin(angleInRadians),
	};
  };

  // Draws an SVG path for an arc from startAngle to endAngle
  const drawArc = (
	x,
	y,
	radius,
	startAngle,
	endAngle,
  ) => {
	const start = polarToCartesian(x, y, radius, endAngle);
	const end = polarToCartesian(x, y, radius, startAngle);

	const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

	const pathData = [
	  'M',
	  start.x,
	  start.y,
	  'A',
	  radius,
	  radius,
	  0,
	  largeArcFlag,
	  0,
	  end.x,
	  end.y,
	].join(' ');

	return pathData;
  };

  // Scales a value from one range to another
  const scaleValue = (
	value,
	from,
	to,
  ) => {
	// Check for valid ranges
	if (from[1] === from[0]) {
	  throw new Error('Invalid range: from range has zero width.');
	}

	const scale = (to[1] - to[0]) / (from[1] - from[0]);
	const cappedValue = Math.min(from[1], Math.max(from[0], value)) - from[0];

	return Math.round(cappedValue * scale + to[0]); // Use Math.round for clarity
  };

  export {polarToCartesian, drawArc, scaleValue}
