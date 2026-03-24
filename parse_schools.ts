import * as fs from 'fs';

const text = fs.readFileSync('schools.txt', 'utf-8');
const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const schools: any[] = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  if (line.endsWith(' logo')) {
    let rankStr = lines[i-1];
    
    // Extract rank properly. It might be "↓2 18" or "18" or "T14"
    let rankMatch = rankStr.match(/\b(\d+)\b$/);
    let rank = rankMatch ? parseInt(rankMatch[1]) : NaN;
    
    if (isNaN(rank)) {
      let back = 2;
      while (isNaN(rank) && i - back >= 0 && back < 5) {
        rankMatch = lines[i-back].match(/\b(\d+)\b$/);
        rank = rankMatch ? parseInt(rankMatch[1]) : NaN;
        back++;
      }
      if (isNaN(rank)) rank = 100;
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
    
    let livingCostYearly = 20000;
    if (location.includes('New York') || location.includes('California') || location.includes('Boston') || location.includes('Washington, D.C.')) {
      livingCostYearly = 28000;
    } else if (location.includes('Chicago') || location.includes('Philadelphia') || location.includes('Seattle')) {
      livingCostYearly = 22000;
    }
    
    schools.push({
      name,
      grossY1: 60000,
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

let dataTs = fs.readFileSync('src/data.ts', 'utf-8');

const startIdx = dataTs.indexOf('export const initialSchools: SchoolData[] = [');
const endIdx = dataTs.indexOf('];', startIdx) + 2;

const newArrayStr = 'export const initialSchools: SchoolData[] = [\n' + schools.map(s => `  ${JSON.stringify(s)}`).join(',\n') + '\n];';

dataTs = dataTs.substring(0, startIdx) + newArrayStr + dataTs.substring(endIdx);

fs.writeFileSync('src/data.ts', dataTs);
console.log(`Parsed ${schools.length} schools and updated src/data.ts`);
