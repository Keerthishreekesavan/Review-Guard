const { detectToxicityAI } = require('../utils/aiToxicity');
require('dotenv').config();

async function testGroq() {
  console.log('--- Groq Toxicity Test ---');
  console.log('Using Groq Key:', process.env.GROQ_API_KEY ? 'Present' : 'MISSING');

  const text = "This product is absolute garbage and the support team are idiots!";
  console.log(`\nAnalyzing toxic review: "${text}"`);

  try {
    const result = await detectToxicityAI(text);
    console.log('\n✅ Groq Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.isToxic) {
      console.log('\n🔥 Test Passed: Groq correctly identified toxicity.');
    } else {
      console.log('\n🤔 Test Failed: Groq did not mark it as toxic.');
    }
  } catch (error) {
    console.error('\n🔴 Error during test:', error.message);
  }
}

testGroq();
