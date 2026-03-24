const fs = require('fs');

const text = fs.readFileSync('schools.txt', 'utf-8');
const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const schools = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // A school entry starts with a rank number or something like "T14", "↑2 18", "↓3 36", "75+", etc.
  // Actually, looking at the format:
  // 1
  // Stanford University logo
  // Stanford University
  // Stanford, California
  // 173
  // 3.96
  // 8.9%
  // 40%
  
  // Let's find the line that ends with " logo"
  if (line.endsWith(' logo')) {
    // The previous line should be the rank
    let rankStr = lines[i-1];
    // clean up rankStr (e.g., "↑2 18" -> "18", "↓3 36" -> "36", "T14" -> ignore and look up)
    let rank = parseInt(rankStr.replace(/[^0-9]/g, ''));
    if (isNaN(rank)) {
      // maybe it's "HYS" or "T14", let's look further back or just assign a default
      let back = 2;
      while (isNaN(rank) && i - back >= 0 && back < 5) {
        rank = parseInt(lines[i-back].replace(/[^0-9]/g, ''));
        back++;
      }
      if (isNaN(rank)) rank = 100; // fallback
    }
    
    const name = lines[i+1];
    const location = lines[i+2];
    const lsatStr = lines[i+3];
    const gpaStr = lines[i+4];
    const acceptStr = lines[i+5];
    const biglawStr = lines[i+6];
    
    let lsat = parseInt(lsatStr);
    if (isNaN(lsat)) lsat = 150;
    
    let biglaw = parseInt(biglawStr.replace('%', ''));
    if (isNaN(biglaw)) biglaw = 0;
    
    // Estimate living cost based on location (very rough)
    let livingCostYearly = 20000;
    if (location.includes('New York') || location.includes('California') || location.includes('Boston') || location.includes('Washington, D.C.')) {
      livingCostYearly = 28000;
    } else if (location.includes('Chicago') || location.includes('Philadelphia') || location.includes('Seattle')) {
      livingCostYearly = 22000;
    }
    
    schools.push({
      name,
      grossY1: 60000, // Default estimate
      scholarship: 0,
      guarantee: false,
      condType: 'none',
      condRate: 0,
      rank,
      lsat,
      biglaw,
      livingCostYearly
    });
    
    i += 7;
  } else {
    i++;
  }
}

// Read src/data.ts
let dataTs = fs.readFileSync('src/data.ts', 'utf-8');

// Replace initialSchools array
const startIdx = dataTs.indexOf('export const initialSchools: SchoolData[] = [');
const endIdx = dataTs.indexOf('];', startIdx) + 2;

const newArrayStr = 'export const initialSchools: SchoolData[] = [\n' + schools.map(s => `  ${JSON.stringify(s)}`).join(',\n') + '\n];';

dataTs = dataTs.substring(0, startIdx) + newArrayStr + dataTs.substring(endIdx);

fs.writeFileSync('src/data.ts', dataTs);
console.log(`Parsed ${schools.length} schools and updated src/data.ts`);
