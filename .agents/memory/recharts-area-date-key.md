---
name: Recharts AreaChart date string key bug
description: Using date strings as XAxis dataKey causes Area to only render at first categorical position
---

When using `AreaChart` with `dataKey="someDate"` where values are date strings like "2024-06-15", Recharts renders the area fill only at the leftmost point, even though the X-axis tick labels appear correctly spaced across the full width.

**Why:** Recharts' categorical XAxis partially treats date-formatted strings as parseable date values for data point positioning, causing a mismatch between tick label positions and actual data plot positions.

**How to apply:** Always use numeric indices as the X-axis dataKey for AreaChart/LineChart when data points represent categories (e.g. reports over time). Use `tickFormatter` to show the human-readable date labels.

```tsx
// WRONG — date strings cause area to render only at first position
const data = history.map((v, i) => ({ date: reports[i].date, value: v }));
<XAxis dataKey="date" />

// CORRECT — numeric index ensures even spacing
const data = history.map((v, i) => ({ x: i, value: v }));
<XAxis dataKey="x" type="number" scale="linear" domain={[0, data.length - 1]}
  ticks={data.map((_, i) => i)} tickFormatter={(i) => dates[i]} />
```

Also: the SVG `<defs>` linearGradient approach works fine ONCE the chart data spans the full width. The earlier gradient invisibility was a symptom of the area not rendering at all, not a gradient configuration problem.
