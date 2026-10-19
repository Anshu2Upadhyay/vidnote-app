const express = require('express');
const router = express.Router();

/**
 * Intelligent contextual metadata generator for social platforms
 */
function generateContextualSocialMetadata({ title = '', hashtags = [], category = 'Reels' }) {
  const cleanTitle = (title || '').trim() || 'Exciting Video Moment';
  
  // Format hashtags: ensure they are array of strings without #
  let tagWords = [];
  if (Array.isArray(hashtags)) {
    tagWords = hashtags.map(h => String(h).replace(/^#+/, '').trim()).filter(Boolean);
  } else if (typeof hashtags === 'string') {
    tagWords = hashtags.split(/[\s,#]+/).map(h => h.trim()).filter(Boolean);
  }

  // Derive topic and keywords
  const lowerTitle = cleanTitle.toLowerCase();
  const domainKeywords = [];
  
  if (/travel|mountain|beach|nature|sunrise|sunset|vacation|trip|explore/i.test(lowerTitle)) {
    domainKeywords.push('travel', 'nature', 'adventure', 'scenic', 'wanderlust');
  }
  if (/dog|cat|pet|puppy|kitten|animal/i.test(lowerTitle)) {
    domainKeywords.push('pets', 'cuteanimals', 'dogsofinstagram', 'petlover');
  }
  if (/coffee|cafe|latte|food|recipe|cooking|delicious|morning routine/i.test(lowerTitle)) {
    domainKeywords.push('coffee', 'morningroutine', 'foodie', 'aesthetic', 'coffeetime');
  }
  if (/tech|code|coding|app|dev|software|programming|ai/i.test(lowerTitle)) {
    domainKeywords.push('tech', 'developer', 'coding', 'softwareengineering', 'productivity');
  }
  if (/gym|workout|fitness|fit|health|exercise|running/i.test(lowerTitle)) {
    domainKeywords.push('fitness', 'workoutmotivation', 'healthylifestyle', 'gymlife');
  }

  const allKeywords = Array.from(new Set([...tagWords, ...domainKeywords, category.toLowerCase()])).filter(Boolean);
  const primaryTopic = allKeywords[0] || 'lifestyle';
  const capitalizedTopic = primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1);

  // 1. YouTube Metadata
  const ytTitle = `${cleanTitle} | Must Watch! (4K)`;
  const ytDescription = [
    `🎬 ${cleanTitle}`,
    ``,
    `Welcome back to the channel! In this video, we're sharing ${cleanTitle.toLowerCase()}. Perfect for anyone who loves inspiring ${category.toLowerCase()} content and high-quality creative visuals.`,
    ``,
    `📌 In this video:`,
    `- 0:00 Introduction & Quick Overview`,
    `- 0:12 Key Highlights & Best Angles`,
    `- 0:24 Final Takeaways & Creator Notes`,
    ``,
    `🔔 Don't forget to LIKE, SUBSCRIBE, and turn on notifications so you never miss an update!`,
    `💬 Community Question: What is your favorite thing about ${primaryTopic}? Let us know in the comments below!`,
    ``,
    `Follow us for more updates & save this video to your playlist!`,
    `#VidNote #${capitalizedTopic} #Shorts #ContentCreator`
  ].join('\n');

  const ytTags = Array.from(new Set([
    cleanTitle.toLowerCase(),
    ...allKeywords,
    `${primaryTopic} tips`,
    `${primaryTopic} video`,
    `${category.toLowerCase()} video`,
    'trending',
    'viral',
    'vidnote creator',
    'high quality'
  ])).join(', ');

  const ytHashtags = `#${capitalizedTopic} #${category} #Shorts #Trending #VidNote`;

  // 2. Instagram Metadata
  const igCaption = [
    `✨ ${cleanTitle}`,
    ``,
    `Finding magic in the everyday moments. Drop a ❤️ if you feel this vibe!`,
    ``,
    `📌 Save this reel to your inspiration board!`,
    `👉 Share with someone who needs to see this today ✨`,
    ``,
    `Tell us your thoughts in the comments 👇`
  ].join('\n');

  const igHashtags = Array.from(new Set([
    '#reels',
    '#reelsinstagram',
    '#viralreels',
    '#explorepage',
    `#${primaryTopic}`,
    `#${category.toLowerCase()}`,
    ...allKeywords.map(k => `#${k}`),
    '#creators',
    '#dailyinspiration',
    '#aesthetic',
    '#instadaily',
    '#trendingnow'
  ])).slice(0, 15).join(' ');

  // 3. Facebook Metadata
  const fbPostText = [
    `🌟 "${cleanTitle}"`,
    ``,
    `Take a quick moment to pause and appreciate this! Sometimes the simplest moments bring the greatest joy and creative inspiration.`,
    ``,
    `Have you experienced something like this recently? Tell us your story in the comments below! Don't forget to tag a friend who would love this! 👇✨`
  ].join('\n');

  const fbHashtags = Array.from(new Set([
    `#${capitalizedTopic}`,
    `#${category}`,
    '#InspiringMoments',
    '#Community',
    '#VidNote',
    '#ViralVideo'
  ])).join(' ');

  return {
    youtube: {
      title: ytTitle,
      description: ytDescription,
      tags: ytTags,
      hashtags: ytHashtags
    },
    instagram: {
      reelCaption: igCaption,
      hashtags: igHashtags
    },
    facebook: {
      postText: fbPostText,
      hashtags: fbHashtags
    }
  };
}

// Support both /smart-autofill and /api/ai/smart-autofill
router.post(['/smart-autofill', '/api/ai/smart-autofill'], async (req, res) => {
  try {
    const { title, caption, hashtags, tags, category } = req.body || {};
    const inputTitle = title || caption || '';
    const inputTags = hashtags || tags || [];

    const generated = generateContextualSocialMetadata({
      title: inputTitle,
      hashtags: inputTags,
      category: category || 'Reels'
    });

    return res.json({
      success: true,
      ...generated
    });
  } catch (err) {
    console.error('Smart autofill error:', err);
    return res.status(500).json({
      error: 'Failed to generate social metadata',
      message: err.message
    });
  }
});

module.exports = router;
