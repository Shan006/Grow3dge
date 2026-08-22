const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/@$@D/.gemini/antigravity/brain/8dff446b-2c87-4205-ab6f-15cc3341b299';
const destDir = path.join(__dirname, 'public', 'badges');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
const mappings = [
  { prefix: 'incubator_guidelines', destPrefix: 'incubator-guidelines' },
  { prefix: 'marketing_foundations', destPrefix: 'marketing-foundations' },
  { prefix: 'know_your_customers', destPrefix: 'know-your-customers' },
  { prefix: 'go_to_market', destPrefix: 'go-to-market' },
  { prefix: 'activate_community', destPrefix: 'activate-your-community' },
  { prefix: 'media_partnerships', destPrefix: 'media-partnerships' }
];

let copiedCount = 0;

for (const file of files) {
  if (!file.endsWith('.jpg')) continue;
  
  for (const map of mappings) {
    if (file.startsWith(map.prefix)) {
      const srcPath = path.join(srcDir, file);
      
      // Copy to both earned and locked versions
      const destEarned = path.join(destDir, `${map.destPrefix}-earned.jpg`);
      const destLocked = path.join(destDir, `${map.destPrefix}-locked.jpg`);
      
      fs.copyFileSync(srcPath, destEarned);
      fs.copyFileSync(srcPath, destLocked);
      
      console.log(`Copied ${file} to ${map.destPrefix} (earned & locked)`);
      copiedCount++;
    }
  }
}

// Copy fallback placeholders as well
try {
  const defaultPlaceholderSrc = path.join(srcDir, files.find(f => f.startsWith('incubator_guidelines') && f.endsWith('.jpg')));
  fs.copyFileSync(defaultPlaceholderSrc, path.join(destDir, 'placeholder-earned.jpg'));
  fs.copyFileSync(defaultPlaceholderSrc, path.join(destDir, 'placeholder-locked.jpg'));
  console.log('Copied default placeholders.');
} catch (e) {
  console.warn('Could not copy placeholders:', e.message);
}

console.log(`Success: Copied ${copiedCount} badges.`);
