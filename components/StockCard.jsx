"use client";

function formatMarketCap(value) {
  if (!value) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function formatVolume(value) {
  if (!value) return "N/A";
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function StockCard({ stock }) {
  const isGain = stock.change >= 0;
  const sign   = isGain ? "+" : "";
  const arrow  = isGain ? "▲" : "▼";
  const accentColor = isGain ? "#10b981" : "#ef4444";

  function handleDownload() {
    const W = 600;
    const H = 340;
    const SCALE = 2; // retina quality

    const canvas = document.createElement("canvas");
    canvas.width  = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);

    // ── Shadow ───────────────────────────────────────────────
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    // ── White card background ────────────────────────────────
    drawRoundedRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "transparent";

    // ── Left accent bar ──────────────────────────────────────
    ctx.save();
    drawRoundedRect(ctx, 4, 4, W - 8, H - 8, 16);
    ctx.clip();
    ctx.fillStyle = accentColor;
    ctx.fillRect(4, 4, 6, H - 8);
    ctx.restore();

    const L = 32;

    // ── Ticker ───────────────────────────────────────────────
    ctx.fillStyle = "#111827";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(stock.ticker, L, 56);

    // ── Company name ─────────────────────────────────────────
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(stock.name, L, 80);

    // ── Price ────────────────────────────────────────────────
    ctx.fillStyle = "#111827";
    ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const priceText = `${stock.currency} ${stock.price.toFixed(2)}`;
    ctx.fillText(priceText, L, 140);

    // ── Change (positioned after price) ─────────────────────
    const priceWidth = ctx.measureText(priceText).width;
    ctx.fillStyle = accentColor;
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const changeText = `${arrow} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)`;
    ctx.fillText(changeText, L + priceWidth + 14, 140);

    // ── Divider ──────────────────────────────────────────────
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L, 164);
    ctx.lineTo(W - 20, 164);
    ctx.stroke();

    // ── Stats grid 2x2 ───────────────────────────────────────
    const stats = [
      { label: "Volume",     value: formatVolume(stock.volume) },
      { label: "Market Cap", value: formatMarketCap(stock.marketCap) },
      { label: "52W High",   value: stock.high52Week ? `$${stock.high52Week.toFixed(2)}` : "N/A" },
      { label: "52W Low",    value: stock.low52Week  ? `$${stock.low52Week.toFixed(2)}`  : "N/A" },
    ];

    const colW = (W - L - 24) / 2;
    stats.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = L + col * colW;
      const y = 192 + row * 58;

      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(s.label, x, y);

      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(s.value, x, y + 22);
    });

    // ── Live badge ───────────────────────────────────────────
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(L + 4, H - 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("Live via Yahoo Finance", L + 14, H - 18);

    // ── Download ─────────────────────────────────────────────
    const link = document.createElement("a");
    link.download = `${stock.ticker}_stock.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }

  return (
    <div
      className="animate-in bg-white rounded-2xl p-4 w-72 shadow-sm relative"
      style={{
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      {/* Download button */}
      <button
        onClick={handleDownload}
        title="Save as JPEG"
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {/* Ticker + name */}
      <div className="mb-3 pr-6">
        <div className="text-lg font-bold text-gray-900 tracking-wide">{stock.ticker}</div>
        <div className="text-xs text-gray-400 mt-0.5">{stock.name}</div>
      </div>

      {/* Price + change */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-gray-900">
          {stock.currency} {stock.price.toFixed(2)}
        </span>
        <span className="text-sm font-semibold" style={{ color: accentColor }}>
          {arrow} {sign}{stock.change.toFixed(2)} ({sign}{stock.changePercent.toFixed(2)}%)
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
        <Stat label="Volume"     value={formatVolume(stock.volume)} />
        <Stat label="Market Cap" value={formatMarketCap(stock.marketCap)} />
        <Stat label="52W High"   value={stock.high52Week ? `$${stock.high52Week.toFixed(2)}` : "N/A"} />
        <Stat label="52W Low"    value={stock.low52Week  ? `$${stock.low52Week.toFixed(2)}`  : "N/A"} />
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-xs text-gray-400">Live via Yahoo Finance</span>
      </div>
    </div>
  );
}