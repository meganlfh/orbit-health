import {METRICS, assess} from './model.js';

const GUIDANCE = {
  heartRate: {
    recheck: 'Stop exercising, secure yourself in a stable position, rest, and repeat the heart-rate measurement.',
    takeAction: 'Check for dizziness, chest pain, or breathlessness, and consider recent exercise, dehydration, and microgravity-related cardiovascular changes.',
    seekHelp: 'Inform the crew medical officer if abnormal readings persist or concerning symptoms are present.',
    spaceTip: 'Compare the result with your personal baseline and recent activity.'
  },
  systolic: {
    recheck: 'Secure yourself, rest for 5 minutes, and repeat the measurement with your arm supported at heart level.',
    takeAction: 'Check for dizziness, headache, or vision changes, and avoid sudden movements if you feel dizzy.',
    seekHelp: 'Follow the crew medical protocol if the reading remains abnormal or concerning symptoms are present.',
    spaceTip: 'Microgravity-related fluid shifts can affect blood pressure; keep your position consistent between readings.'
  },
  temperature: {
    recheck: 'Rest and repeat the temperature measurement using the same approved device and measurement site.',
    takeAction: 'Check for fever, chills, other symptoms, and unusual cabin temperature or environmental conditions.',
    seekHelp: 'Notify the crew medical officer if the abnormal reading persists or concerning symptoms are present.',
    spaceTip: 'In a closed spacecraft, report possible infection symptoms early under the mission medical protocol.'
  },
  glucose: {
    recheck: 'Repeat the measurement with clean, mission-approved equipment if the reading may be inaccurate.',
    takeAction: 'For a low reading, follow the onboard hypoglycaemia protocol, including prescribed fast-acting glucose. For a high reading, follow the approved hydration and medical-management plan.',
    seekHelp: 'Notify the crew medical officer if abnormal readings persist or symptoms are present.',
    spaceTip: 'Keep glucose supplies sealed and prevent blood contamination in microgravity.'
  },
  sleep: {
    recheck: 'Review the tracker or log and confirm the sleep and wake times and total sleep for the last 24 hours.',
    takeAction: 'Follow the mission sleep schedule, reduce light and noise before scheduled sleep, and avoid caffeine close to bedtime.',
    seekHelp: 'Report persistent fatigue, poor sleep, or concentration difficulties through the crew medical protocol.',
    spaceTip: 'Use spacecraft lighting schedules to support circadian rhythms rather than relying on sunrise or sunset.'
  },
  oxygenSaturation: {
    recheck: 'Stop physical activity, secure yourself, check sensor placement, and repeat the measurement if it is safe to do so.',
    takeAction: 'Check the spacecraft oxygen, pressure, and carbon-dioxide monitoring systems for an environmental problem.',
    seekHelp: 'Alert the crew and follow mission emergency-oxygen procedures if required.',
    spaceTip: 'Low oxygen saturation can indicate a spacecraft environmental problem, not only a personal health issue.'
  },
  radiationExposure: {
    recheck: 'Verify the daily dose on your assigned dosimeter and check current mission radiation alerts.',
    takeAction: 'Stop non-essential activities, move to the designated radiation shelter, and follow shielding procedures when directed.',
    seekHelp: 'Follow the mission radiation-emergency protocol, monitor the dosimeter, and remain sheltered until the crew receives clearance.',
    spaceTip: 'Use the spacecraft’s most effectively shielded area during radiation events.'
  }
};

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
    const guidance = GUIDANCE[flag.key];
    actions.push({
      type: 'flag',
      key: flag.key,
      title: `${METRICS[flag.key].label}: unhealthy range actions`,
      recheck: guidance.recheck,
      takeAction: guidance.takeAction,
      seekHelp: guidance.seekHelp,
      spaceTip: guidance.spaceTip,
      followUp: true,
      trend: true
    });
  }

  return actions;
}
