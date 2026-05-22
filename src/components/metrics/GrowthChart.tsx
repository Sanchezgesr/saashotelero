export function GrowthChart({ data }: { data: { month: string; count: number }[] }) {
  if (data.length === 0) return null

  const width = 500; const height = 200; const padding = 30
  const maxVal = Math.max(...data.map(p => p.count), 5)
  const getX = (i: number) => padding + (i * (width - padding * 2)) / (data.length - 1)
  const getY = (v: number) => height - padding - (v * (height - padding * 2)) / maxVal

  const pathD = data.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.count)}`, '')
  const areaD = pathD + ` L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={padding} y1={padding + p * (height - padding * 2)} x2={width - padding} y2={padding + p * (height - padding * 2)} className="stroke-gray-100" strokeWidth={1} />
      ))}
      <path d={areaD} fill="url(#chartGradient)" opacity={0.15} />
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
      {data.map((p, i) => <circle key={i} cx={getX(i)} cy={getY(p.count)} r={5} fill="#2563eb" />)}
      {data.map((p, i) => <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" className="text-[10px] fill-gray-400 font-medium">{p.month}</text>)}
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
