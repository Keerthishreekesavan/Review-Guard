const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const { detectToxicity } = require('../utils/toxicity');         // rule-based fallback
const { checkDuplicate } = require('../utils/tfidf');            // rule-based fallback
const { checkDuplicateAI } = require('../utils/aiDuplicate');    // semantic (primary)
const { detectToxicityAI } = require('../utils/aiToxicity');     // semantic (primary)
const { aiReviewQueue, isQueueReady } = require('../queues/aiQueue');


// ---------------------------------------------------------------------------
// POST /api/reviews  —  Submit a new review
// Flow:
//   1. Quick sync checks (Toxicity & Duplicate)
//   2. Interrupt with 422 if toxic and not confirmed
//   3. Interrupt with 409 if duplicate and not confirmed
//   4. Save with aiStatus: 'complete'
//   5. Return 201 fast
// ---------------------------------------------------------------------------
const submitReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productName, rating, reviewText, confirmDuplicate, confirmToxicity, wasRevised } = req.body;
    const io = req.app.get('io');

    // === STEP 1: Fetch existing reviews for duplicate comparison ===
    const existingReviews = await Review.find({
      status: { $in: ['pending', 'approved'] },
      isDeleted: { $ne: true }
    }).select('+embeddingVector reviewText _id productName');

    // === STEP 1.5: Emit initial scanning event to Live Feed ===
    io.emit('system:threat-log', {
      type: 'scanning',
      message: `SCANNING... Incoming review for "${productName}"`,
      user: req.user.name,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    });

    // === STEP 2: Quick sync AI checks (Duplicate & Toxicity) ===
    const [duplicateResult, toxicityResult] = await Promise.all([
      checkDuplicateAI(reviewText, existingReviews),
      detectToxicityAI(reviewText)
    ]);

    // === STEP 2.5: Emit result event to Live Feed ===
    if (duplicateResult.isDuplicate) {
      io.emit('system:threat-log', {
        type: 'duplicate',
        message: `⚠ DUPLICATE: ${Math.round(duplicateResult.similarity * 100)}% Semantic match. User: ${req.user.name}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    } else if (toxicityResult.isToxic) {
      io.emit('system:threat-log', {
        type: 'flagged',
        message: `⚠ FLAGGED: Toxicity Score ${toxicityResult.score} (${toxicityResult.flags.join(', ')}). User: ${req.user.name}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    } else {
      io.emit('system:threat-log', {
        type: 'cleared',
        message: `✓ CLEARED: User: ${req.user.name} | Toxicity: ${toxicityResult.score}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    }

    // === STEP 3: Handle Interruption (Toxicity + Duplicate Combined) ===
    const isToxic = toxicityResult.isToxic && !confirmToxicity;
    const isDuplicate = duplicateResult.isDuplicate && !confirmDuplicate;

    if (isToxic || isDuplicate) {
      let matchedReview = null;
      if (duplicateResult.isDuplicate) {
        matchedReview = await Review.findById(duplicateResult.duplicateOf).select('reviewText productName');
      }

      const aiAnalysis = {
        toxicity: {
          isToxic: toxicityResult.isToxic,
          score: toxicityResult.score,
          flags: toxicityResult.flags,
          detectedKeywords: toxicityResult.detectedKeywords
        },
        duplicate: {
          isDuplicate:    duplicateResult.isDuplicate,
          duplicateOf:    duplicateResult.duplicateOf,
          similarity:     duplicateResult.similarity,
          matchedText:    matchedReview?.reviewText,
          matchedProduct: matchedReview?.productName
        },
        isCombined: toxicityResult.isToxic && duplicateResult.isDuplicate
      };

      // Return 409 if duplicate is involved, else 422 for pure toxicity
      const statusCode = isDuplicate ? 409 : 422;
      return res.status(statusCode).json({
        message: isToxic && isDuplicate 
          ? 'Multiple guidelines violations detected.' 
          : isToxic ? 'Toxic content detected.' : 'Duplicate review detected.',
        aiAnalysis
      });
    }

    // === STEP 5: Build initial timeline ===
    const initialTimeline = [{
      status:    'Submitted',
      message:   'Review submitted successfully.',
      timestamp: new Date()
    }];
    if (wasRevised) {
      initialTimeline.push({
        status:    'Updated',
        message:   'Review revised by user after AI guidelines warning.',
        timestamp: new Date()
      });
    }

    // === STEP 6: Save review immediately (aiStatus: complete) ===
    const review = await Review.create({
      userId:             req.user._id,
      productName,
      rating,
      reviewText,
      // Toxicity is populated from sync check
      toxicityScore:    toxicityResult.score,
      toxicityFlags:    toxicityResult.flags,
      detectedKeywords: toxicityResult.detectedKeywords,
      // Duplicate data is already known from sync check
      isDuplicate:          duplicateResult.isDuplicate,
      duplicateOf:          duplicateResult.duplicateOf,
      duplicateSimilarity:  duplicateResult.similarity,
      embeddingVector:      duplicateResult.newEmbedding || [],
      aiStatus:  'complete',
      status:    'pending',
      timeline:  initialTimeline
    });

    // === STEP 7: Respond immediately ===
    const populatedReview = await Review.findById(review._id)
      .populate('moderatedBy', 'name')
      .populate('duplicateOf', 'productName reviewText');

    res.status(201).json({
      message: 'Review submitted successfully!',
      review:  populatedReview
    });

  } catch (error) {
    console.error('[ReviewController] submitReview:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/reviews/:id  —  Edit a pending review
// Same hybrid flow as submit, excluding the review being edited.
// ---------------------------------------------------------------------------
const updateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productName, rating, reviewText, confirmDuplicate, confirmToxicity, wasRevised } = req.body;
    const io = req.app.get('io');

    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized.' });
    }
    if (review.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending reviews can be edited.' });
    }

    // Fetch existing reviews (excluding this one) with embedding vectors
    const existingReviews = await Review.find({
      _id:    { $ne: review._id },
      status: { $in: ['pending', 'approved'] },
      isDeleted: { $ne: true }
    }).select('+embeddingVector reviewText _id productName');

    // Emit initial scanning event to Live Feed
    io.emit('system:threat-log', {
      type: 'scanning',
      message: `SCANNING... Edit request for "${productName}"`,
      user: req.user.name,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    });

    // Quick sync AI checks (Duplicate & Toxicity)
    const [duplicateResult, toxicityResult] = await Promise.all([
      checkDuplicateAI(reviewText, existingReviews),
      detectToxicityAI(reviewText)
    ]);

    // Emit result event to Live Feed
    if (duplicateResult.isDuplicate) {
      io.emit('system:threat-log', {
        type: 'duplicate',
        message: `⚠ DUPLICATE: ${Math.round(duplicateResult.similarity * 100)}% Semantic match on edit. User: ${req.user.name}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    } else if (toxicityResult.isToxic) {
      io.emit('system:threat-log', {
        type: 'flagged',
        message: `⚠ FLAGGED: Toxicity Score ${toxicityResult.score} on edit. User: ${req.user.name}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    } else {
      io.emit('system:threat-log', {
        type: 'cleared',
        message: `✓ CLEARED: Edit by ${req.user.name} approved by AI (Toxicity: ${toxicityResult.score})`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    }

    // Handle Interruption (Toxicity + Duplicate Combined)
    const isToxic = toxicityResult.isToxic && !confirmToxicity;
    const isDuplicate = duplicateResult.isDuplicate && !confirmDuplicate;

    if (isToxic || isDuplicate) {
      let matchedReview = null;
      if (duplicateResult.isDuplicate) {
        matchedReview = await Review.findById(duplicateResult.duplicateOf).select('reviewText productName');
      }

      const aiAnalysis = {
        toxicity: {
          isToxic: toxicityResult.isToxic,
          score: toxicityResult.score,
          flags: toxicityResult.flags,
          detectedKeywords: toxicityResult.detectedKeywords
        },
        duplicate: {
          isDuplicate:    duplicateResult.isDuplicate,
          duplicateOf:    duplicateResult.duplicateOf,
          similarity:     duplicateResult.similarity,
          matchedText:    matchedReview?.reviewText,
          matchedProduct: matchedReview?.productName
        },
        isCombined: toxicityResult.isToxic && duplicateResult.isDuplicate
      };

      const statusCode = isDuplicate ? 409 : 422;
      return res.status(statusCode).json({
        message: isToxic && isDuplicate 
          ? 'Multiple guidelines violations detected.' 
          : isToxic ? 'Toxic content detected.' : 'Duplicate review detected.',
        aiAnalysis
      });
    }

    // Update fields — set AI scores synchronously
    review.productName        = productName;
    review.rating             = rating;
    review.reviewText         = reviewText;
    review.toxicityScore      = toxicityResult.score;
    review.toxicityFlags      = toxicityResult.flags;
    review.detectedKeywords   = toxicityResult.detectedKeywords;
    review.isDuplicate        = duplicateResult.isDuplicate;
    review.duplicateOf        = duplicateResult.duplicateOf;
    review.duplicateSimilarity = duplicateResult.similarity;
    review.embeddingVector    = duplicateResult.newEmbedding || review.embeddingVector;
    review.aiStatus           = 'complete';

    // Add to lifecycle timeline
    review.timeline.push({
      status:    'Updated',
      message:   wasRevised
        ? 'Review revised by user after AI guidelines warning.'
        : 'Review content edited by user.',
      timestamp: new Date()
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('moderatedBy', 'name')
      .populate('duplicateOf', 'productName reviewText');

    res.json({
      message: 'Review updated successfully!',
      review:  populatedReview
    });

  } catch (error) {
    console.error('[ReviewController] updateReview:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/reviews/my  —  Get current user's reviews
// ---------------------------------------------------------------------------
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      userId:    req.user._id,
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .populate('moderatedBy', 'name')
      .populate('duplicateOf', 'productName reviewText');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/reviews/:id  —  Soft-delete a user's own review
// ---------------------------------------------------------------------------
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized.' });
    }
    if (review.isDeleted) {
      return res.status(400).json({ message: 'Review is already deleted.' });
    }

    review.isDeleted  = true;
    review.deletedAt  = new Date();
    review.timeline.push({
      status:    'Deleted',
      message:   'Review soft-deleted by user.',
      timestamp: new Date()
    });

    await review.save();
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitReview, getMyReviews, updateReview, deleteReview };
