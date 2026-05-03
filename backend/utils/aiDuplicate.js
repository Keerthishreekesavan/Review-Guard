const { HfInference } = require('@huggingface/inference');
const { checkDuplicate: ruleBasedCheck } = require('./tfidf');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const SIMILARITY_THRESHOLD = 0.85; 

/**
 * Compute an embedding vector using Hugging Face.
 * Model: all-MiniLM-L6-v2 (384 dims, fast & accurate)
 */
async function getEmbedding(text) {
  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'your_huggingface_key_here') {
    return null;
  }
  
  try {
    const result = await hf.featureExtraction({
      model: 'BAAI/bge-small-en-v1.5',
      inputs: text.slice(0, 1000),
    });
    // Ensure it's a flat array of numbers
    return Array.from(result);
  } catch (err) {
    console.error('[AI Duplicate] Hugging Face error:', err.message);
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}

async function checkDuplicateAI(newText, existingReviews) {
  try {
    const newEmbedding = await getEmbedding(newText);
    
    if (!newEmbedding || !existingReviews || existingReviews.length === 0) {
      return { ...ruleBasedCheck(newText, existingReviews), newEmbedding };
    }

    let highestSimilarity = 0;
    let mostSimilarId = null;

    for (const review of existingReviews) {
      if (review.embeddingVector && review.embeddingVector.length === newEmbedding.length) {
        const sim = cosineSimilarity(newEmbedding, review.embeddingVector);
        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          mostSimilarId = review._id;
        }
      }
    }

    let isDuplicate = highestSimilarity >= SIMILARITY_THRESHOLD;

    // Hybrid Check: If embedding score is low, verify with TF-IDF
    if (!isDuplicate) {
      const tfidf = ruleBasedCheck(newText, existingReviews);
      if (tfidf.isDuplicate) {
        isDuplicate = true;
        highestSimilarity = tfidf.similarity;
        mostSimilarId = tfidf.duplicateOf;
      } else if (tfidf.similarity > highestSimilarity) {
        highestSimilarity = tfidf.similarity;
        mostSimilarId = tfidf.duplicateOf;
      }
    }

    const roundedSim = Math.round(highestSimilarity * 100) / 100;

    console.log(`[AI Duplicate] Semantic similarity=${roundedSim}, isDuplicate=${isDuplicate}`);

    return {
      isDuplicate,
      duplicateOf: isDuplicate ? mostSimilarId : null,
      similarity: roundedSim,
      newEmbedding
    };

  } catch (err) {
    console.error(`[AI Duplicate] Error:`, err.message);
    return { ...ruleBasedCheck(newText, existingReviews), newEmbedding: null };
  }
}

module.exports = { checkDuplicateAI, getEmbedding, cosineSimilarity };
