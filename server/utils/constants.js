const POST_CATEGORIES = ['Houseplants', 'Poisonous Plants', 'Flower Legends', 'Art', 'Investment'];

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const LIMITS = {
  thumbnailBytes: 2 * 1024 * 1024,
  avatarBytes: 1.5 * 1024 * 1024,
};

module.exports = { POST_CATEGORIES, IMAGE_MIME_TYPES, LIMITS };
