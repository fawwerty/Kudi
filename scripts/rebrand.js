const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (['node_modules', '.git', '.next'].includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.match(/\.(ts|tsx|js|jsx|md|json)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Kudi')) {
        content = content.replace(/Kudi/g, 'Kudi');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const targetDir = 'C:\\Users\\KWAFO NATHANIEL SNR\\Desktop\\NICE\\Kudi';
processDir(targetDir);
console.log("Done rebranding.");
