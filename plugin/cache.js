const fs = require('fs');
const path = require('path');

const cacheFilePath = path.join(__dirname, 'cache.json');

const readCache = () => {
  if (fs.existsSync(cacheFilePath)) {
    const data = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(data);
  }
  return {};
};

const writeCache = (cache) => {
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf-8');
};

const getCachedLanguage = () => {
  const cache = readCache();
  return cache.language || 'en';
};

const setCachedLanguage = (language) => {
  const cache = readCache();
  cache.language = language;
  writeCache(cache);
};

module.exports = {
  getCachedLanguage,
  setCachedLanguage,
};
