const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const badgesDir = path.join(publicDir, 'badges');
const certsDir = path.join(publicDir, 'certificates');

fs.mkdirSync(badgesDir, { recursive: true });
fs.mkdirSync(certsDir, { recursive: true });

const modules = [
  { id: 'incubator-guidelines', name: 'Incubator Guidelines' },
  { id: 'marketing-foundations', name: 'Marketing Foundations' },
  { id: 'know-your-customers', name: 'Know Your Customers' },
  { id: 'go-to-market', name: 'Go To Market' },
  { id: 'activate-your-community', name: 'Activate Your Community' },
  { id: 'media-partnerships', name: 'Media & Partnerships' }
];

modules.forEach(m => {
  const earnedSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#3B82F6" rx="20"/><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle">\n    <tspan x="50%" dy="-1em">${m.name}</tspan>\n    <tspan x="50%" dy="2em">Earned</tspan>\n  </text></svg>`;
  
  const lockedSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#333" rx="20"/><text x="50%" y="50%" fill="#888" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle">\n    <tspan x="50%" dy="-1em">${m.name}</tspan>\n    <tspan x="50%" dy="2em">Locked</tspan>\n  </text></svg>`;

  fs.writeFileSync(path.join(badgesDir, `${m.id}-earned.svg`), earnedSvg);
  fs.writeFileSync(path.join(badgesDir, `${m.id}-locked.svg`), lockedSvg);
});

const certSvg = `<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/><text x="50%" y="50%" fill="#555" font-family="sans-serif" font-size="48" text-anchor="middle" dominant-baseline="middle">Certificate Placeholder</text></svg>`;
fs.writeFileSync(path.join(certsDir, 'certificate-template.svg'), certSvg);

console.log('Placeholder SVGs generated successfully.');
