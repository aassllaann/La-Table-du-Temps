interface Props {
  lineColor: string;
  dotColor: string;
}

export default function OrnamentalDivider({ lineColor, dotColor }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, height: '1px', background: lineColor }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor }} />
      <div style={{ flex: 1, height: '1px', background: lineColor }} />
    </div>
  );
}
