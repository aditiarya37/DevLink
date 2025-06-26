// backend/utils/mentionUtils.js
const User = require('../models/User');

// Regex to find our custom mention markup: @@@username@@@
const MENTION_REGEX = /@@@([\w-]+)@@@/g; // ([\w-]+) captures username

/**
 * Extracts usernames from text content based on @@@username@@@ markup.
 * @param {string} text The text content to parse.
 * @returns {Set<string>} A Set of unique usernames found.
 */
const extractUsernamesFromMentions = (text) => {
  if (!text) return new Set();
  const usernames = new Set();
  let match;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    usernames.add(match[1].toLowerCase()); // Store usernames in lowercase for consistent lookup
  }
  return usernames;
};

/**
 * Given a Set of usernames, finds valid User documents and returns their IDs.
 * @param {Set<string>} usernames Set of usernames to look up.
 * @returns {Promise<Array<mongoose.Types.ObjectId>>} A promise that resolves to an array of user ObjectIds.
 */
const getMentionedUserIds = async (usernames) => {
  if (!usernames || usernames.size === 0) return [];
  try {
    const users = await User.find({ username: { $in: Array.from(usernames) } }).select('_id');
    return users.map(user => user._id);
  } catch (error) {
    console.error("Error fetching mentioned user IDs:", error);
    return [];
  }
};

module.exports = {
  extractUsernamesFromMentions,
  getMentionedUserIds,
  MENTION_REGEX, // Export regex if needed elsewhere (e.g., frontend for consistency)
};