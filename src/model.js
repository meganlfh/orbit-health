// These fictional envelopes are UI demonstrations, NOT clinical thresholds.
export const METRICS = {
  heartRate: { label: 'Resting heart rate', unit: 'bpm', min: 1, max: 300, step: 1, envelope: [55, 90], system: 'cardio' },
  systolic: { label: 'Systolic pressure', unit: 'mmHg', min: 1, max: 300, step: 1, envelope: [100, 135], system: 'cardio' },
  temperature: { label: 'Body temperature', unit: '°C', min: 20, max: 45, step: 0.1, envelope: [36.2, 37.5], system: 'immune' },
  glucose: { label: 'Blood glucose', unit: 'mg/dL', min: 1, max: 1000, step: 1, envelope: [75, 140], system: 'nutrition' },
  sleep: { label: 'Sleep in last 24 hours', unit: 'hours', min: 0, max: 24, step: 0.1, envelope: [7, 9], system: 'mind' },
  oxygenSaturation: { label: 'Oxygen saturation (SpO₂)', unit: '%', min: 0, max: 100, step: 0.1, envelope: [95, 100], system: 'respiratory' },
  radiationExposure: { label: 'Cumulative radiation exposure', unit: 'mSv', min: 0, max: 100000, step: 0.001, envelope: [0, 600], system: 'radiation' }
};
export const ROUTINES = ['Record daily check-in', 'Review assigned exercise plan', 'Review food and fluid log', 'Complete private wellbeing reflection'];
export function validateRecord(input, now = new Date()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid check-in.');
  const date = new Date(input.date);
  if (typeof input.date !== 'string' || !Number.isFinite(+date) || +date > +now + 60000) throw new Error('Choose a valid date and time that is not in the future.');
  const record = {date: date.toISOString()};
  for (const [key, metric] of Object.entries(METRICS)) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < metric.min || value > metric.max || (metric.step === 1 && !Number.isInteger(value))) throw new Error(`${metric.label}: enter a valid value from ${metric.min} to ${metric.max}.`);
    record[key] = value;
  }
  if (typeof input.symptoms !== 'boolean') throw new Error('Specify whether concerning symptoms are present.');
  if (typeof input.notes !== 'string' || input.notes.length > 500) throw new Error('Notes must be text of at most 500 characters.');
  record.symptoms = input.symptoms;
  record.notes = input.notes;
  return record;
}
export function parseImport(data, now = new Date()) {
  if (data?.version !== 1 || !Array.isArray(data.records) || data.records.length > 500) throw new Error('Expected an Orbit Health version 1 export with at most 500 check-ins.');
  const records = data.records.map(r => validateRecord(r, now));
  if (new Set(records.map(r => r.date)).size !== records.length) throw new Error('Duplicate check-in timestamps in file.');
  return records.sort((a,b) => a.date.localeCompare(b.date));
}
export function assess(record, now = new Date()) {
  if (!record) return {state:'empty', title:'Awaiting your first check-in', flags:[], stale:false};
  const flags = Object.entries(METRICS).filter(([key, m]) => m.envelope && (record[key] < m.envelope[0] || record[key] > m.envelope[1])).map(([key,m]) => ({key, label:m.label, message:`${record[key]} ${m.unit} is outside the fictional demo envelope (${m.envelope.join('–')} ${m.unit}).`}));
  const stale = +now - +new Date(record.date) > 24 * 3600000;
  return {state:record.symptoms ? 'urgent' : flags.length ? 'review' : 'logged', title:record.symptoms ? 'Follow the mission medical protocol' : flags.length ? `${flags.length} demo range ${flags.length === 1 ? 'flag' : 'flags'} to review` : 'Check-in recorded', flags, stale};
}
export function demoRecords(now = new Date()) {
  return Array.from({length:14}, (_,i) => ({date:new Date(+now - (13-i)*86400000).toISOString(),heartRate:[66,68,65,70,67,69,72,68,71,74,72,76,78,82][i],systolic:115 + i % 6,temperature:Number((36.6 + (i % 3)/10).toFixed(1)),glucose:92 + i%9,sleep:[8,7.7,8.2,7.5,7.8,7.4,7.6,7.2,7.1,7.5,7,6.8,6.5,6.2][i],oxygenSaturation:Number((98 - (i % 4)/10).toFixed(1)),radiationExposure:Number((0.08 + i * 0.004).toFixed(3)),symptoms:false,notes:i===13?'Synthetic example: interrupted sleep after a busy mission day.':'Synthetic demo record.'}));
}
export function csv(records) {
  const keys = ['date',...Object.keys(METRICS),'symptoms','notes'];
  // Neutralize spreadsheet formulas even when a cell begins with whitespace.
  const cell = v => '"' + String(typeof v === 'string' && /^[\s]*[=+@\-]/.test(v) ? "'"+v : v).replaceAll('"','""') + '"';
  return [keys.join(','),...records.map(r => keys.map(k=>cell(r[k])).join(','))].join('\r\n');
}
