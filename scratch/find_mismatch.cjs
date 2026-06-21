const fs = require('fs');

const content = fs.readFileSync('/Users/niko/Documents/Личное/AI/Antigravity/OmniLab/src/components/EngineeringCard.js', 'utf8');

const stack = [];
const lines = content.split('\n');

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  // Calculate line number
  const before = content.substring(0, i);
  const lineNo = before.split('\n').length;
  
  if (char === '{') {
    stack.push({ char, lineNo, index: i });
  } else if (char === '}') {
    if (stack.length === 0) {
      console.log(`Extra closing brace } at line ${lineNo}`);
    } else {
      stack.pop();
    }
  }
}

console.log(`Stack size at EOF: ${stack.length}`);
stack.forEach(item => {
  console.log(`Unclosed ${item.char} opened at line ${item.lineNo}: ${lines[item.lineNo - 1]}`);
});
