import {
  CollectionPoint,
  CollectionRecord,
  Prediction,
  OverflowRisk,
  AppSettings,
  PointStatus
} from '../types';

/**
 * AI-Assisted Waste Demand Predictor
 * Deterministic, explainable prediction service based on current fill rate,
 * historical collection turnover, and temporal cycles.
 */
export function calculateDemandPrediction(
  point: CollectionPoint,
  historicalRecords: CollectionRecord[] = [],
  settings: AppSettings
): Prediction {
  const currentFill = Math.min(100, Math.max(0, point.fillPercentage));
  
  // Calculate average fill accumulation per hour based on waste type and historical cadence
  // Typical bin fills at 0.8% - 2.5% per hour depending on waste type and location
  let baseHourlyRate = 1.2; // default 1.2% per hour
  if (point.wasteType === 'Organic') baseHourlyRate = 1.6;
  if (point.wasteType === 'Recyclable') baseHourlyRate = 1.4;
  if (point.wasteType === 'Hazardous') baseHourlyRate = 0.6;
  if (point.wasteType === 'Electronic') baseHourlyRate = 0.5;

  // Modulate based on zone demand (commercial zones have higher turnover)
  if (point.zoneId === 'zone-1' || point.zoneId === 'zone-2') {
    baseHourlyRate *= 1.25;
  }

  // Modulate based on historical records for this specific bin
  const binRecords = historicalRecords.filter(r => r.pointId === point.id);
  if (binRecords.length > 2) {
    const avgCollectedKg = binRecords.reduce((sum, r) => sum + r.quantityCollected, 0) / binRecords.length;
    const historicalFillFraction = Math.min(1.5, Math.max(0.6, avgCollectedKg / Math.max(point.capacity, 1)));
    baseHourlyRate *= historicalFillFraction;
  }

  // Temporal/Day cycle factor (peak hours)
  const currentHour = new Date().getHours();
  const isPeakOperatingHours = currentHour >= 8 && currentHour <= 20;
  const temporalMultiplier = isPeakOperatingHours ? 1.15 : 0.85;

  const effectiveHourlyRate = baseHourlyRate * temporalMultiplier;

  // Project future fill levels clamped to 100%
  const predicted6h = Math.min(100, Math.round(currentFill + effectiveHourlyRate * 6));
  const predicted12h = Math.min(100, Math.round(currentFill + effectiveHourlyRate * 12));
  const predicted24h = Math.min(100, Math.round(currentFill + effectiveHourlyRate * 24));
  const predicted48h = Math.min(100, Math.round(currentFill + effectiveHourlyRate * 48));

  // Time to reach critical threshold (settings.criticalFillThreshold, default 85%)
  let estimatedTimeToCritical = 0;
  if (currentFill < settings.criticalFillThreshold) {
    const gap = settings.criticalFillThreshold - currentFill;
    estimatedTimeToCritical = Math.max(1, Math.round((gap / effectiveHourlyRate) * 10) / 10);
  }

  // Calculate overflow risk tier
  let overflowRisk: OverflowRisk = 'Low';
  let reasoning = '';

  if (currentFill >= settings.criticalFillThreshold || predicted6h >= 95) {
    overflowRisk = 'Critical';
    reasoning = `Critical overflow risk — currently at ${currentFill}% and projected to breach 95% within 6 hours (rate: ~${effectiveHourlyRate.toFixed(1)}%/hr). Immediate collection required.`;
  } else if (predicted12h >= settings.criticalFillThreshold || currentFill >= settings.highPriorityThreshold) {
    overflowRisk = 'High';
    reasoning = `High overflow risk — estimated to reach critical threshold (${settings.criticalFillThreshold}%) within ${estimatedTimeToCritical} hours at current fill trajectory.`;
  } else if (predicted24h >= 75) {
    overflowRisk = 'Medium';
    reasoning = `Moderate accumulation rate (${effectiveHourlyRate.toFixed(1)}%/hr). Estimated ${estimatedTimeToCritical} hours before reaching critical capacity.`;
  } else {
    overflowRisk = 'Low';
    reasoning = `Safe operational margin. Current fill is ${currentFill}% with adequate headroom for the next 24-48 hours.`;
  }

  // Confidence metric based on data availability
  const confidence = binRecords.length >= 3 ? 92 : 86;

  return {
    pointId: point.id,
    currentFill,
    predicted6h,
    predicted12h,
    predicted24h,
    predicted48h,
    confidence,
    estimatedTimeToCritical,
    reasoning,
    overflowRisk
  };
}

/**
 * AI-Assisted Priority Scoring Engine (0 - 100)
 * Evaluates fill level, forecast trajectory, idle time since service, and overflow hazards.
 * Produces transparent, explainable reasoning with actual numeric factors.
 */
export function calculatePriorityScore(
  point: CollectionPoint,
  prediction: Prediction,
  settings: AppSettings
): { priorityScore: number; status: PointStatus; explanation: string } {
  const fill = Math.min(100, Math.max(0, point.fillPercentage));
  const predicted24 = Math.min(100, Math.max(0, prediction.predicted24h));

  // Time elapsed since last collection (in hours)
  const lastColDate = new Date(point.lastCollection).getTime();
  const hoursSinceCol = Math.max(1, Math.round((Date.now() - lastColDate) / (1000 * 60 * 60)));

  // Weighted scoring elements:
  // 1. Current Fill weight: 35%
  const fillScore = fill * 0.35;

  // 2. Forecasted 24h Fill weight: 25%
  const forecastScore = predicted24 * 0.25;

  // 3. Overflow Risk weight: 20%
  let riskScore = 5;
  if (prediction.overflowRisk === 'Critical') riskScore = 20;
  else if (prediction.overflowRisk === 'High') riskScore = 15;
  else if (prediction.overflowRisk === 'Medium') riskScore = 10;

  // 4. Time since last collection: 15% (max out at 48 hours)
  const timeScore = Math.min(15, (hoursSinceCol / 48) * 15);

  // 5. Waste type sensitivity: 5% (Organic & Hazardous get higher priority due to odor/safety)
  let wasteSensitivity = 2;
  if (point.wasteType === 'Organic' || point.wasteType === 'Hazardous') wasteSensitivity = 5;

  let rawScore = Math.round(fillScore + forecastScore + riskScore + timeScore + wasteSensitivity);
  rawScore = Math.min(100, Math.max(0, rawScore));

  // Determine operational status
  let status: PointStatus = 'Normal';
  if (fill >= settings.criticalFillThreshold || rawScore >= 85 || prediction.overflowRisk === 'Critical') {
    status = fill >= 95 ? 'Overflow Risk' : 'Critical';
  } else if (fill >= settings.highPriorityThreshold || rawScore >= 70 || prediction.overflowRisk === 'High') {
    status = 'High Priority';
  } else if (fill >= 55 || rawScore >= 50) {
    status = 'Attention';
  } else {
    status = 'Normal';
  }

  // Natural language explainability utilizing actual calculated metrics
  let explanation = '';
  if (status === 'Critical' || status === 'Overflow Risk') {
    explanation = `Priority is Critical (${rawScore}/100) because current fill is ${fill}%, predicted demand reaches ${predicted24}% in 24h, and time since last collection is ${hoursSinceCol}h.`;
  } else if (status === 'High Priority') {
    explanation = `Priority is High (${rawScore}/100) as fill level is ${fill}%, approaching critical threshold in approx. ${prediction.estimatedTimeToCritical}h.`;
  } else if (status === 'Attention') {
    explanation = `Moderate priority (${rawScore}/100) — bin is ${fill}% full with steady accumulation (${point.wasteType} waste). Scheduled for proactive pickup.`;
  } else {
    explanation = `Low priority (${rawScore}/100) — current fill is at a stable ${fill}% with no immediate overflow risk.`;
  }

  return {
    priorityScore: rawScore,
    status,
    explanation
  };
}
