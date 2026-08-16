const fs = require('fs');

const file = 'client/src/pages/progress.tsx';
let source = fs.readFileSync(file, 'utf8');

const before = [
  '  if (stepId === "market-research") {',
  '    const planMarket = database?.businessPlans.evidence?.market;',
  '    const data = readJson("market-research-state");',
  '    if (!data || typeof data !== "object") {',
  '      if (planMarket?.satisfied) {',
  '        return {',
  '          percent: 100,',
  '          status: "completed",',
  '          source: "plan",',
  '          detail: "The completed business plan contains " + planMarket.completedSignals + " of " + planMarket.totalSignals + " substantive market-validation signals, including a demand signal.",',
  '          completed: true,',
  '        };',
  '      }',
].join('\n');

const after = [
  '  if (stepId === "market-research") {',
  '    const planMarket = database?.businessPlans.evidence?.market;',
  '    if (planMarket?.satisfied) {',
  '      return {',
  '        percent: 100,',
  '        status: "completed",',
  '        source: "plan",',
  '        detail: "The completed business plan contains " + planMarket.completedSignals + " of " + planMarket.totalSignals + " substantive market-validation signals, including a demand signal.",',
  '        completed: true,',
  '      };',
  '    }',
  '    const data = readJson("market-research-state");',
  '    if (!data || typeof data !== "object") {',
].join('\n');

if (!source.includes(after)) {
  if (!source.includes(before)) throw new Error('Market evidence refinement anchor not found');
  source = source.replace(before, after);
}

fs.writeFileSync(file, source);
console.log('Market evidence precedence refined');
