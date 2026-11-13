import {METRICS, assess} from './model.js';

const GUIDANCE = {
  heartRate: {
    check: 'Repeat the resting count with the mission-approved method and confirm the value is entered in beats per minute (bpm).',
    context: 'Record posture, recent activity, measurement time, and the device or counting method used.'
  },
  systolic: {
    check: 'Repeat the measurement with the mission-approved cuff and technique; confirm this is the systolic value in millimetres of mercury (mmHg).',
    context: 'Record posture, cuff and arm used, recent activity, and measurement time.'
  },
  temperature: {
    check: 'Repeat with the mission-approved thermometer and method; confirm the value is entered in degrees Celsius (°C).',
    context: 'Record the measurement site and device, recent activity, environment, and measurement time.'
  },
  glucose: {
    check: 'Repeat with the mission-approved measurement method and confirm the value is entered in milligrams per decilitre (mg/dL).',
    context: 'Record meal timing, recent activity, measurement method, and measurement time.'
  },
  sleep: {
    check: 'Review the sleep interval and confirm the total for the last 24 hours is entered in hours.',
    context: 'Record interruptions, schedule changes, perceived sleep quality, and relevant mission demands.'
  },
  mood: {
    check: 'Confirm the self-report uses the 1–5 scale: 1 is very low, 3 is neutral, and 5 is very positive.',
    context: 'Record recent sleep, workload, isolation or interpersonal context, and any reported symptoms.'
  }
};

const followUp = 'Report the verified reading and recorded context through established mission medical procedures, and follow instructions from designated medical personnel.';

export function actionGuidance(record, now = new Date()) {
  if (!record) return [];
  const result = assess(record, now);
  const actions = [];

  if (record.symptoms) {
    actions.push({
      type: 'symptoms',
      title: 'Reported symptoms take priority',
      detail: 'Follow the established mission medical procedure now and notify the designated medical officer. Do not wait for this app or a network connection; Orbit Health does not send alerts.',
      followUp: true
    });
  }

  if (result.stale) {
    actions.push({
      type: 'stale',
      title: 'Request a fresh check-in',
      detail: 'The latest record is more than 24 hours old. Record a new check-in before relying on the snapshot.',
      followUp: true
    });
  }

  for (const flag of result.flags) {
    actions.push({
      type: 'flag',
      key: flag.key,
      title: `${METRICS[flag.key].label}: review the fictional sample-range flag`,
      check: GUIDANCE[flag.key].check,
      context: GUIDANCE[flag.key].context,
      followUp,
      trend: true
    });
  }

  return actions;
}
