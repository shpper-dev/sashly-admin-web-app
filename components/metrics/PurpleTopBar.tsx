export default function PurpleTopBar(props: any) {
  const { x, y, width, height } = props;
  if (!width || !height) return null;
  const radius = 6;
  const color = "#7F50F4";
  return (
    <g>
      <path d={`M ${x},${y + height} L ${x},${y + radius} Q ${x},${y} ${x + radius},${y} L ${x + width - radius},${y} Q ${x + width},${y} ${x + width},${y + radius} L ${x + width},${y + height} Z`} fill="rgba(127,80,244,0.12)" />
      <path d={`M ${x},${y + radius} Q ${x},${y} ${x + radius},${y} L ${x + width - radius},${y} Q ${x + width},${y} ${x + width},${y + radius}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}
