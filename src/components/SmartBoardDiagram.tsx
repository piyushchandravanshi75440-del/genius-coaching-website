import React from 'react';

export interface DiagramPayload {
  title: string;
  caption: string;
  preset: string;
  labels: string[];
  steps: string[];
}

export const SmartBoardDiagram: React.FC<{ diagram: DiagramPayload }> = ({ diagram }) => {
  const preset = (diagram.preset || 'concept_flowchart').toLowerCase();
  const labels = Array.isArray(diagram.labels) ? diagram.labels : [];

  const renderSvg = () => {
    switch (preset) {
      case 'ray_concave_mirror':
        return (
          <svg viewBox="0 0 640 300" className="w-full h-auto max-h-[320px]">
            {/* Principal Axis */}
            <line x1="40" y1="150" x2="580" y2="150" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
            {/* Concave Mirror */}
            <path d="M 480 45 Q 530 150 480 255" fill="none" stroke="#0f172a" strokeWidth="6" />
            <path d="M 492 50 L 502 60 M 498 85 L 508 95 M 503 120 L 513 130 M 503 165 L 513 175 M 498 205 L 508 215 M 488 240 L 498 250" stroke="#64748b" strokeWidth="2" />
            {/* C, F, P points */}
            <circle cx="220" cy="150" r="5" fill="#d97706" />
            <text x="215" y="175" fontSize="14" fontWeight="bold" fill="#0f172a">C</text>
            <circle cx="355" cy="150" r="5" fill="#d97706" />
            <text x="350" y="175" fontSize="14" fontWeight="bold" fill="#0f172a">F</text>
            <circle cx="505" cy="150" r="5" fill="#0f172a" />
            <text x="515" y="168" fontSize="14" fontWeight="bold" fill="#0f172a">P</text>
            {/* Object AB */}
            <line x1="150" y1="150" x2="150" y2="80" stroke="#2563eb" strokeWidth="4" />
            <polygon points="150,72 144,86 156,86" fill="#2563eb" />
            <text x="135" y="68" fontSize="14" fontWeight="bold" fill="#1d4ed8">Object (AB)</text>
            {/* Parallel Ray -> F */}
            <line x1="150" y1="80" x2="495" y2="80" stroke="#dc2626" strokeWidth="2.5" />
            <line x1="495" y1="80" x2="265" y2="210" stroke="#dc2626" strokeWidth="2.5" />
            {/* Ray through C */}
            <line x1="150" y1="80" x2="490" y2="225" stroke="#059669" strokeWidth="2" strokeDasharray="5 3" />
            {/* Real Inverted Image */}
            <line x1="298" y1="150" x2="298" y2="192" stroke="#7c3aed" strokeWidth="4" />
            <polygon points="298,200 292,188 304,188" fill="#7c3aed" />
            <text x="255" y="225" fontSize="13" fontWeight="bold" fill="#6d28d9">Image (A&apos;B&apos;)</text>
          </svg>
        );

      case 'ray_convex_lens':
        return (
          <svg viewBox="0 0 640 300" className="w-full h-auto max-h-[320px]">
            <line x1="30" y1="150" x2="610" y2="150" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M 320 40 Q 355 150 320 260 Q 285 150 320 40 Z" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="3" />
            <circle cx="320" cy="150" r="4" fill="#0f172a" />
            <text x="315" y="172" fontSize="13" fontWeight="bold" fill="#0f172a">O</text>
            <circle cx="210" cy="150" r="4" fill="#d97706" />
            <text x="200" y="172" fontSize="13" fontWeight="bold" fill="#0f172a">F1</text>
            <circle cx="430" cy="150" r="4" fill="#d97706" />
            <text x="422" y="172" fontSize="13" fontWeight="bold" fill="#0f172a">F2</text>
            <line x1="130" y1="150" x2="130" y2="85" stroke="#2563eb" strokeWidth="4" />
            <text x="108" y="75" fontSize="13" fontWeight="bold" fill="#1d4ed8">Object</text>
            <line x1="130" y1="85" x2="320" y2="85" stroke="#dc2626" strokeWidth="2.5" />
            <line x1="320" y1="85" x2="510" y2="210" stroke="#dc2626" strokeWidth="2.5" />
            <line x1="130" y1="85" x2="510" y2="210" stroke="#059669" strokeWidth="2.5" />
            <line x1="510" y1="150" x2="510" y2="210" stroke="#7c3aed" strokeWidth="4" />
            <text x="488" y="232" fontSize="13" fontWeight="bold" fill="#6d28d9">Image</text>
          </svg>
        );

      case 'ohms_law_circuit':
        return (
          <svg viewBox="0 0 640 300" className="w-full h-auto max-h-[320px]">
            {/* Circuit Loop */}
            <rect x="120" y="65" width="400" height="170" rx="8" fill="none" stroke="#0f172a" strokeWidth="4" />
            {/* Resistor Box at top */}
            <rect x="260" y="45" width="120" height="40" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
            <text x="320" y="70" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#92400e">
              Resistor (R)
            </text>
            {/* Voltmeter across R */}
            <path d="M 230 65 L 230 22 L 410 22 L 410 65" fill="none" stroke="#2563eb" strokeWidth="2.5" />
            <circle cx="320" cy="22" r="16" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5" />
            <text x="320" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1d4ed8">V</text>
            {/* Ammeter on right */}
            <circle cx="520" cy="150" r="20" fill="#ecfdf5" stroke="#059669" strokeWidth="3" />
            <text x="520" y="155" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#065f46">A</text>
            {/* Battery at bottom */}
            <rect x="275" y="215" width="90" height="40" fill="#f8fafc" />
            <line x1="305" y1="210" x2="305" y2="260" stroke="#0f172a" strokeWidth="5" />
            <line x1="335" y1="222" x2="335" y2="248" stroke="#0f172a" strokeWidth="3" />
            <text x="292" y="205" fontSize="14" fontWeight="bold" fill="#dc2626">+</text>
            <text x="342" y="205" fontSize="14" fontWeight="bold" fill="#2563eb">-</text>
            <text x="320" y="280" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0f172a">
              Battery (V)  •  V = I × R
            </text>
          </svg>
        );

      case 'right_triangle_trig':
        return (
          <svg viewBox="0 0 640 300" className="w-full h-auto max-h-[320px]">
            <polygon points="150,240 490,240 150,70" fill="#eff6ff" stroke="#0f172a" strokeWidth="4" />
            {/* Right Angle square */}
            <rect x="150" y="215" width="25" height="25" fill="none" stroke="#d97706" strokeWidth="3" />
            <text x="128" y="255" fontSize="16" fontWeight="bold" fill="#0f172a">B (90°)</text>
            <text x="130" y="60" fontSize="16" fontWeight="bold" fill="#0f172a">A</text>
            <text x="498" y="255" fontSize="16" fontWeight="bold" fill="#0f172a">C (θ)</text>
            <text x="72" y="160" fontSize="15" fontWeight="bold" fill="#1d4ed8">Perpendicular (P)</text>
            <text x="315" y="268" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#059669">Base (B)</text>
            <text x="355" y="140" fontSize="15" fontWeight="bold" fill="#dc2626">Hypotenuse (H)</text>
            <rect x="445" y="55" width="165" height="90" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
            <text x="460" y="82" fontSize="13" fontWeight="bold" fill="#0f172a">sin θ = P / H</text>
            <text x="460" y="106" fontSize="13" fontWeight="bold" fill="#0f172a">cos θ = B / H</text>
            <text x="460" y="130" fontSize="13" fontWeight="bold" fill="#0f172a">tan θ = P / B</text>
          </svg>
        );

      case 'quadratic_parabola':
        return (
          <svg viewBox="0 0 640 300" className="w-full h-auto max-h-[320px]">
            <line x1="60" y1="210" x2="580" y2="210" stroke="#64748b" strokeWidth="2" />
            <line x1="320" y1="30" x2="320" y2="280" stroke="#64748b" strokeWidth="2" />
            <path d="M 160 45 Q 320 345 480 45" fill="none" stroke="#2563eb" strokeWidth="4" />
            <circle cx="222" cy="210" r="6" fill="#dc2626" />
            <text x="195" y="232" fontSize="13" fontWeight="bold" fill="#dc2626">Root α</text>
            <circle cx="418" cy="210" r="6" fill="#dc2626" />
            <text x="400" y="232" fontSize="13" fontWeight="bold" fill="#dc2626">Root β</text>
            <circle cx="320" cy="195" r="5" fill="#d97706" />
            <text x="332" y="275" fontSize="14" fontWeight="bold" fill="#0f172a">
              ax² + bx + c = 0
            </text>
          </svg>
        );

      case 'magnetic_solenoid':
        return (
          <svg viewBox="0 0 640 300" className="w-full h-auto max-h-[320px]">
            <ellipse cx="320" cy="150" rx="220" ry="95" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="6 4" />
            <ellipse cx="320" cy="150" rx="180" ry="65" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="200" y="120" width="240" height="60" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
            <path d="M 225 120 L 245 180 M 265 120 L 285 180 M 305 120 L 325 180 M 345 120 L 365 180 M 385 120 L 405 180" stroke="#0f172a" strokeWidth="4" />
            <text x="172" y="156" fontSize="18" fontWeight="bold" fill="#dc2626">S</text>
            <text x="454" y="156" fontSize="18" fontWeight="bold" fill="#059669">N</text>
            <text x="320" y="275" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0f172a">
              Solenoid Magnetic Field Lines
            </text>
          </svg>
        );

      case 'photosynthesis_cycle':
      case 'human_heart_flow':
      case 'concept_flowchart':
      default: {
        const displayLabels =
          labels.length > 0 ? labels.slice(0, 4) : ['Input / Cause', 'Core Process', 'Key Reaction', 'Final Result'];
        return (
          <svg viewBox="0 0 640 280" className="w-full h-auto max-h-[300px]">
            {displayLabels.map((lbl, idx) => {
              const x = 40 + idx * 150;
              const colors = ['#1e293b', '#1d4ed8', '#b45309', '#047857'];
              const bg = colors[idx % colors.length];
              return (
                <g key={idx}>
                  <rect x={x} y={95} width={122} height={86} rx={14} fill={bg} />
                  <foreignObject x={x + 8} y={102} width={106} height={72}>
                    <div className="w-full h-full flex items-center justify-center text-center text-white text-xs font-bold leading-tight px-1">
                      {lbl}
                    </div>
                  </foreignObject>
                  {idx < displayLabels.length - 1 && (
                    <g>
                      <line
                        x1={x + 122}
                        y1={138}
                        x2={x + 148}
                        y2={138}
                        stroke="#f59e0b"
                        strokeWidth="4"
                      />
                      <polygon
                        points={`${x + 150},138 ${x + 140},131 ${x + 140},145`}
                        fill="#f59e0b"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 flex items-center justify-center shadow-inner">
        {renderSvg()}
      </div>

      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {labels.map((label, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-amber-300 text-xs font-bold"
            >
              {idx + 1}. {label}
            </span>
          ))}
        </div>
      )}

      {diagram.steps?.length > 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Board Explanation Steps
          </p>
          <ol className="space-y-1.5 list-decimal list-inside text-sm font-medium text-slate-800">
            {diagram.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SmartBoardDiagram;
