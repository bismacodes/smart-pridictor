import 'dotenv/config';
import { generatePlantingAdvice, getProviderStatus } from './src/predictor.js';
import { PlantingInput } from './src/types.js';

async function runSmokeTest() {
  console.log('====================================================');
  console.log('🌱 SMART PLANTING PREDICTOR: SMOKE TEST RUNNER');
  console.log('====================================================');

  const providerStatus = await getProviderStatus();
  console.log(`📡 Active Provider     : ${providerStatus.activeProvider.toUpperCase()}`);
  console.log(`🤖 Target Model        : ${providerStatus.activeProvider === 'api' ? providerStatus.apiModel : providerStatus.ollamaModel}`);
  console.log(`🔑 Gemini API Key Set  : ${providerStatus.hasApiKey ? 'YES' : 'NO'}`);
  console.log(`💻 Local Ollama Status : ${providerStatus.ollamaAvailable ? 'ONLINE' : 'OFFLINE / UNREACHABLE'}`);
  console.log('----------------------------------------------------');

  // Realistic sample input: Smallholder cereal farming in Northern Guinea Savanna, Nigeria
  const sampleInput: PlantingInput = {
    location: {
      country: 'Nigeria',
      state: 'Kaduna',
      lga: 'Igabi',
      coordinates: { lat: 10.78, lng: 7.44 },
    },
    crop: 'Maize (SAMMAZ 15 Drought-Tolerant Hybrid)',
    intendedDate: 'May 20 - May 30, 2026',
    soilType: 'Sandy Loam',
    irrigation: 'Rainfed Only (Natural Rainfall)',
    weatherObservation: 'First shower (14mm) fell on May 6. Soil dried quickly under 34°C sunshine. Moderate dry spell for past 5 days. Weather forecast projects isolated showers in 3 days.',
    rainfallTrend: 'Early onset transition; historically subject to 7-10 day false start dry spell before persistent monsoonal rains begin in June.',
  };

  console.log('🌾 Sending realistic farm scenario to active provider...');
  console.log(`   Location: ${sampleInput.location.lga} LGA, ${sampleInput.location.state}, ${sampleInput.location.country}`);
  console.log(`   Crop    : ${sampleInput.crop}`);
  console.log(`   Soil    : ${sampleInput.soilType} | Water: ${sampleInput.irrigation}`);
  console.log('----------------------------------------------------');

  const startTime = Date.now();

  try {
    const result = await generatePlantingAdvice(sampleInput);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`⏱️ Response received in ${duration}s`);
    console.log(`📦 Provider Used: ${result.providerUsed} (${result.modelUsed})`);
    console.log('');

    // Verification Assertions
    const assertions: { name: string; pass: boolean; detail?: string }[] = [
      {
        name: 'Recommended planting date present',
        pass: typeof result.recommendedDate === 'string' && result.recommendedDate.length > 0,
        detail: result.recommendedDate,
      },
      {
        name: 'Recommended planting window present',
        pass: typeof result.recommendedWindow === 'string' && result.recommendedWindow.length > 0,
        detail: result.recommendedWindow,
      },
      {
        name: 'Suitability score is valid number (0 - 100)',
        pass: typeof result.suitabilityScore === 'number' && result.suitabilityScore >= 0 && result.suitabilityScore <= 100,
        detail: `${result.suitabilityScore}% (${result.suitabilityLevel})`,
      },
      {
        name: 'Summary explanation in plain language present',
        pass: typeof result.summaryReason === 'string' && result.summaryReason.length > 10,
        detail: result.summaryReason,
      },
      {
        name: 'Soil moisture assessment provided',
        pass: Boolean(result.soilMoistureAssessment && result.soilMoistureAssessment.status),
        detail: result.soilMoistureAssessment?.status,
      },
      {
        name: 'Distinguishes weather forecast from seasonal outlook',
        pass: Boolean(result.distinctionForecastVsSeasonal && result.distinctionForecastVsSeasonal.shortTermForecast && result.distinctionForecastVsSeasonal.seasonalOutlook),
        detail: 'Forecast vs Seasonal separation verified',
      },
      {
        name: 'Weather risk alerts provided',
        pass: Array.isArray(result.weatherAlerts) && result.weatherAlerts.length > 0,
        detail: `${result.weatherAlerts?.length || 0} alert(s) generated`,
      },
      {
        name: 'Farm activity timeline and reminders provided',
        pass: Array.isArray(result.activityTimeline) && result.activityTimeline.length > 0,
        detail: `${result.activityTimeline?.length || 0} timeline reminder(s)`,
      },
    ];

    let allPassed = true;
    for (const assertion of assertions) {
      if (assertion.pass) {
        console.log(`  ✓ ${assertion.name}: ${assertion.detail}`);
      } else {
        console.error(`  ✗ FAILED: ${assertion.name}`);
        allPassed = false;
      }
    }

    console.log('----------------------------------------------------');
    if (allPassed) {
      console.log('🎉 VERIFICATION SUCCESSFUL: All crop advisory assertions met.');
      console.log('=== SMOKE TEST RESULT: PASS ===');
      process.exit(0);
    } else {
      console.error('⚠️ VERIFICATION FAILURE: One or more assertions failed.');
      console.log('=== SMOKE TEST RESULT: FAIL ===');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ FATAL TEST ERROR:', error);
    console.log('=== SMOKE TEST RESULT: FAIL ===');
    process.exit(1);
  }
}

runSmokeTest();
