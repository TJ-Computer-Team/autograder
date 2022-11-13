const katex = require('katex')

const latexString = 'e = mc^2'

const html = katex.renderToString(latexString)

console.log(html);
