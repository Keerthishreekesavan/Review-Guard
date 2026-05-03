const { getEmbedding } = require('../utils/aiDuplicate');
require('dotenv').config();

async function testSemantic() {
  console.log('--- Semantic AI Test ---');
  console.log('Using HF Token:', process.env.HUGGINGFACE_API_KEY ? 'Present' : 'MISSING');

  const text = "The build quality of this laptop is absolutely fantastic!";
  console.log(`\nGenerating vector for: "${text}"`);

  try {
    const vector = await getEmbedding(text);
    if (vector && vector.length > 0) {
      console.log(`\n✅ SUCCESS! Generated a ${vector.length}-dimensional semantic vector.`);
      console.log(`First few values: ${vector.slice(0, 5).join(', ')}...`);
      console.log('\nSemantic duplicate detection is now ACTIVE.');
    } else {
      console.log('\n❌ FAILED: Received an empty or null vector.');
    }
  } catch (error) {
    console.error('\n🔴 Error during test:', error.message);
  }
}

testSemantic();
