import uuid from 'uuid';
const metricData: { [id: string]: { id: string; label: string; start: number; end: number } } = {};
export const metricStart = (label: string) => {
  const id = uuid.v4();
  // console.time(`${label}-${id}`);
  metricData[id] = { id, label, start: new Date().getTime(), end: undefined };
  return id;
};

export const metricStop = (id: string) => {
  const metric = metricData[id];
  // const time = console.timeEnd(`${metric.label}-${id}`);
  metricData[id].end = new Date().getTime();
  console.log(`${metric.label}::${id}: ${metricData[id].end - metricData[id].start} ms`);
};
