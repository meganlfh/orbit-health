// These fictional envelopes are UI demonstrations, NOT clinical thresholds.
export const METRICS = {
  heartRate: { label: 'Resting heart rate', unit: 'bpm', min: 1, max: 300, step: 1, envelope: [55, 90], system: 'cardio' },
  systolic: { label: 'Systolic pressure', unit: 'mmHg', min: 1, max: 300, step: 1, envelope: [100, 135], system: 'cardio' },
  temperature: { label: 'Body temperature', unit: '°C', min: 20, max: 45, step: 0.1, envelope: [36.2, 37.5], system: 'immune' },
  glucose: { label: 'Blood glucose', unit: 'mg/dL', min: 1, max: 1000, step: 1, envelope: [75, 140], system: 'nutrition' },
  sleep: { label: 'Sleep in last 24 hours', unit: 'hours', min: 0, max: 24, step: 0.1, envelope: [7, 9], system: 'mind' },
  oxygenSaturation: { label: 'Oxygen saturation (SpO₂)', unit: '%', min: 0, max: 100, step: 0.1, envelope: [95, 100], system: 'respiratory' },
  radiationExposure: { label: 'Daily radiation exposure', unit: 'mSv/day', min: 0, max: 100000, step: 0.001, envelope: [0, 1], system: 'radiation' }
};
export const MEASUREMENT_GUIDES = {
  heartRate: {
    intro: 'Microgravity can affect cardiovascular function.',
    equipment: 'Wearable heart-rate monitor',
    steps: ['Secure yourself in a stable position.', 'Rest for 5 minutes.', 'Wear the sensor snugly and remain still.', 'Record heart rate (bpm).'],
    spaceTip: 'Compare readings with your personal baseline.'
  },
  systolic: {
    intro: 'Fluid shifts in microgravity can affect blood pressure.',
    equipment: 'Automated upper-arm cuff',
    steps: ['Secure your body in a stable position.', 'Rest for 5 minutes.', 'Wrap the cuff around your bare upper arm at heart level.', 'Keep your arm supported and still.', 'Record systolic pressure (mmHg).'],
    spaceTip: 'Keep arm position consistent between readings.'
  },
  temperature: {
    intro: 'Temperature changes may indicate illness.',
    equipment: 'Digital thermometer',
    steps: ['Secure yourself and the thermometer.', 'Place the thermometer as instructed by the device manufacturer.', 'Wait for a stable reading.', 'Record temperature (°C).'],
    spaceTip: 'Use the same measurement site each time.'
  },
  glucose: {
    intro: 'Changes in diet, stress, and physical activity during spaceflight may affect blood glucose regulation.',
    equipment: 'Blood glucose meter, test strips, and sterile lancet',
    steps: ['Secure yourself and all equipment to prevent floating.', 'Clean and thoroughly dry your fingertip.', 'Insert a test strip into the glucose meter.', 'Prick the side of your fingertip using a sterile lancet.', 'Apply a small blood drop to the test strip.', 'Record glucose level (mg/dL) and whether you have eaten recently.', 'Dispose of the lancet and blood-contaminated materials in approved containers.'],
    spaceTip: 'Keep blood droplets contained and equipment secured in microgravity to prevent contamination.'
  },
  sleep: {
    intro: 'Spaceflight can disrupt sleep cycles.',
    equipment: 'Sleep tracker or digital log',
    steps: ['Wear the sleep tracker during scheduled sleep, if assigned.', 'Record sleep and wake times.', 'Enter total sleep hours for the last 24 hours.'],
    spaceTip: 'Follow mission sleep schedules rather than sunrise or sunset.'
  },
  oxygenSaturation: {
    intro: 'Oxygen saturation supports checks for respiratory problems.',
    equipment: 'Pulse oximeter',
    steps: ['Secure yourself and remain still.', 'Place the sensor on your finger.', 'Wait for a stable reading.', 'Record SpO₂ (%).'],
    spaceTip: 'Check sensor placement if readings seem unusual.'
  },
  radiationExposure: {
    intro: 'Space radiation increases long-term health risks.',
    equipment: 'Personal radiation dosimeter',
    steps: ['Check your assigned dosimeter.', 'Read the daily exposure value.', 'Sync or enter the daily dose reading.', 'Check for mission radiation alerts.'],
    spaceTip: 'Follow mission-specific radiation limits.'
  }
};
export const ROUTINES = ['Record daily check-in', 'Review assigned exercise plan', 'Review food and fluid log', 'Complete private wellbeing reflection'];
const FOLLOW_UP_REASONS = new Set(['unhealthy-range', 'symptoms', 'stale']);
const derivedRecordId = date => `record-${date.getTime().toString(36)}`;
export function validateRecord(input, now = new Date()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid check-in.');
  const date = new Date(input.date);
  if (typeof input.date !== 'string' || !Number.isFinite(+date) || +date > +now + 60000) throw new Error('Choose a valid date and time that is not in the future.');
  const id = input.id ?? derivedRecordId(date);
  if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(id)) throw new Error('Record ID is invalid.');
  const recordType = input.recordType ?? 'full';
  if (!['full','follow-up'].includes(recordType)) throw new Error('Record type is invalid.');
  const record = {id, date: date.toISOString(), recordType};
  for (const [key, metric] of Object.entries(METRICS)) {
    const value = input[key];
    if (value == null) {
      if (recordType === 'full') throw new Error(`${metric.label}: enter a measurement.`);
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value < metric.min || value > metric.max || (metric.step === 1 && !Number.isInteger(value))) throw new Error(`${metric.label}: enter a valid value from ${metric.min} to ${metric.max}.`);
    record[key] = value;
  }
  if (typeof input.symptoms !== 'boolean') throw new Error('Specify whether concerning symptoms are present.');
  if (typeof input.notes !== 'string' || input.notes.length > 500) throw new Error('Notes must be text of at most 500 characters.');
  record.symptoms = input.symptoms;
  record.notes = input.notes;
  const hasFollowUp = input.followUpTo != null || input.followUpIndicator != null || input.followUpReason != null;
  if (hasFollowUp) {
    if (typeof input.followUpTo !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input.followUpTo) || input.followUpTo === id) throw new Error('Follow-up source is invalid.');
    if (input.followUpIndicator != null && !Object.hasOwn(METRICS, input.followUpIndicator)) throw new Error('Follow-up indicator is invalid.');
    if (!FOLLOW_UP_REASONS.has(input.followUpReason)) throw new Error('Follow-up reason is invalid.');
    if (input.followUpReason === 'unhealthy-range' && !input.followUpIndicator) throw new Error('Indicator follow-ups must identify an indicator.');
    if (input.followUpReason !== 'unhealthy-range' && input.followUpIndicator != null) throw new Error('Only unhealthy-range follow-ups can identify an indicator.');
    if (recordType === 'follow-up' && input.followUpIndicator && !Number.isFinite(record[input.followUpIndicator])) throw new Error('Measure the selected follow-up indicator.');
    record.followUpTo = input.followUpTo;
    record.followUpIndicator = input.followUpIndicator ?? null;
    record.followUpReason = input.followUpReason;
  }
  return record;
}
export function parseImport(data, now = new Date()) {
  if (![1,2,3].includes(data?.version) || !Array.isArray(data.records) || data.records.length > 500) throw new Error('Expected an Orbit Health version 1, 2, or 3 export with at most 500 check-ins.');
  const records = data.records.map(r => validateRecord(r, now));
  if (new Set(records.map(r => r.date)).size !== records.length) throw new Error('Duplicate check-in timestamps in file.');
  if (new Set(records.map(r => r.id)).size !== records.length) throw new Error('Duplicate record IDs in file.');
  const byId = new Map(records.map(record => [record.id, record]));
  for (const record of records) {
    if (!record.followUpTo) continue;
    const source = byId.get(record.followUpTo);
    if (!source) throw new Error('Follow-up source record is missing.');
    if (source.date >= record.date) throw new Error('A follow-up must be later than its source record.');
  }
  return records.sort((a,b) => a.date.localeCompare(b.date));
}
export function assess(record, now = new Date()) {
  if (!record) return {state:'empty', title:'Awaiting your first check-in', flags:[], stale:false};
  const flags = Object.entries(METRICS).filter(([key, m]) => Number.isFinite(record[key]) && (record[key] < m.envelope[0] || record[key] > m.envelope[1])).map(([key,m]) => ({key, label:m.label, message:`${record[key]} ${m.unit} is outside the fictional demo envelope (${m.envelope.join('–')} ${m.unit}).`}));
  const stale = +now - +new Date(record.date) > 24 * 3600000;
  return {state:record.symptoms ? 'urgent' : flags.length ? 'review' : 'logged', title:record.symptoms ? 'Follow the mission medical protocol' : flags.length ? `${flags.length} demo range ${flags.length === 1 ? 'flag' : 'flags'} to review` : record.recordType==='follow-up'?'Follow-up recorded':'Check-in recorded', flags, stale};
}
export function unhealthyTrendPoints(records, key) {
  const metric = METRICS[key];
  if (!metric || !Array.isArray(records)) return [];
  const values = records.map(record => record[key]);
  return values.map(value => Number.isFinite(value) && (value < metric.envelope[0] || value > metric.envelope[1]));
}
export function demoRecords(now = new Date()) {
  return Array.from({length:14}, (_,i) => ({id:`demo-${String(i+1).padStart(2,'0')}`,date:new Date(+now - (13-i)*86400000).toISOString(),recordType:'full',heartRate:[66,68,65,70,67,69,72,68,71,74,72,76,78,82][i],systolic:115 + i % 6,temperature:Number((36.6 + (i % 3)/10).toFixed(1)),glucose:92 + i%9,sleep:[8,7.7,8.2,7.5,7.8,7.4,7.6,7.2,7.1,7.5,7,6.8,6.5,6.2][i],oxygenSaturation:Number((98 - (i % 4)/10).toFixed(1)),radiationExposure:Number((0.08 + i * 0.004).toFixed(3)),symptoms:false,notes:i===13?'Synthetic example: interrupted sleep after a busy mission day.':'Synthetic demo record.'}));
}
export function csv(records) {
  const keys = ['id','date','recordType',...Object.keys(METRICS),'symptoms','notes','followUpTo','followUpIndicator','followUpReason'];
  // Neutralize spreadsheet formulas even when a cell begins with whitespace.
  const cell = v => '"' + String(typeof v === 'string' && /^[\s]*[=+@\-]/.test(v) ? "'"+v : v).replaceAll('"','""') + '"';
  return [keys.join(','),...records.map(r => keys.map(k=>cell(r[k] ?? '')).join(','))].join('\r\n');
}
