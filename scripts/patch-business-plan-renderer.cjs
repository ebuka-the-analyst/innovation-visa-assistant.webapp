const fs = require('fs');

const file = 'server/pdf.ts';
let source = fs.readFileSync(file, 'utf8');

const scopedCellSearchOld = `    const cellContentStart = match.index + match[0].length;\n    const cellRemainder = tableWrapperHtml.slice(cellContentStart);\n    const leakedCellStart = findLeakedCellSectionStart(cellRemainder);`;
const scopedCellSearchNew = `    const cellContentStart = match.index + match[0].length;\n    const cellCloseIndex = tableWrapperHtml.indexOf('</td>', cellContentStart);\n    const cellRemainder = tableWrapperHtml.slice(\n      cellContentStart,\n      cellCloseIndex >= 0 ? cellCloseIndex : tableWrapperHtml.length,\n    );\n    const leakedCellStart = findLeakedCellSectionStart(cellRemainder);`;

if (!source.includes(scopedCellSearchOld) && !source.includes(scopedCellSearchNew)) {
  throw new Error('Expected table-cell repair block not found');
}
source = source.replace(scopedCellSearchOld, scopedCellSearchNew);

const contentCssOld = `    .content {\n      max-width: 100%;\n      overflow-x: hidden;\n    }`;
const contentCssNew = `    .content {\n      display: flow-root;\n      width: 100%;\n      max-width: 100%;\n      min-width: 0;\n      box-sizing: border-box;\n      overflow-x: hidden;\n    }\n    .content > h1,\n    .content > h2,\n    .content > h3,\n    .content > h4,\n    .content > p,\n    .content > ul,\n    .content > ol,\n    .content > blockquote,\n    .content > .table-wrapper,\n    .content > .table-clear,\n    .content > .stacked-table,\n    .content > .chart-container {\n      clear: both;\n      width: 100%;\n      max-width: 100%;\n      min-width: 0;\n      box-sizing: border-box;\n    }`;

if (!source.includes(contentCssOld) && !source.includes(contentCssNew)) {
  throw new Error('Expected content CSS block not found');
}
source = source.replace(contentCssOld, contentCssNew);

const bodyOld = `  <div class=\"content\">\n    \${formatContentWithCharts(content, chartData, primaryColor, plan.useFullCoverImage || false, plan.id || '', secondaryColor, plan.tocStyle)}\n  </div>\n</body>`;
const bodyNew = `  <div class=\"content\">\n    \${formatContentWithCharts(content, chartData, primaryColor, plan.useFullCoverImage || false, plan.id || '', secondaryColor, plan.tocStyle)}\n  </div>\n  <script>\n    (() => {\n      const contentRoot = document.querySelector('.content');\n      if (!contentRoot) return;\n\n      // Historical plans may contain imperfect AI-authored table markup. Browsers can\n      // recover that markup by nesting the next section heading and its body inside a\n      // table cell. Move only the leaked section tail back into normal document flow.\n      const leakedHeadings = Array.from(\n        contentRoot.querySelectorAll('table h1, table h2'),\n      );\n\n      for (const heading of leakedHeadings) {\n        const cell = heading.closest('td, th');\n        const table = heading.closest('table');\n        if (!cell || !table) continue;\n\n        const tableWrapper = table.closest('.table-wrapper') || table;\n        const parent = tableWrapper.parentNode;\n        if (!parent) continue;\n\n        const fragment = document.createDocumentFragment();\n        let node = heading;\n        while (node) {\n          const next = node.nextSibling;\n          fragment.appendChild(node);\n          node = next;\n        }\n\n        parent.insertBefore(fragment, tableWrapper.nextSibling);\n      }\n\n      // Keep every top-level plan block aligned to one printable content width.\n      for (const element of Array.from(contentRoot.children)) {\n        if (!(element instanceof HTMLElement)) continue;\n        element.style.maxWidth = '100%';\n        element.style.minWidth = '0';\n        element.style.boxSizing = 'border-box';\n        element.style.clear = 'both';\n      }\n    })();\n  </script>\n</body>`;

if (!source.includes(bodyOld) && !source.includes(bodyNew)) {
  throw new Error('Expected generated HTML body block not found');
}
source = source.replace(bodyOld, bodyNew);

fs.writeFileSync(file, source);
console.log('Business-plan renderer patch applied');
