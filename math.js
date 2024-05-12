const { DateTime } = require('luxon')
const Math = require('math-expression-evaluator')

// results in quick failure
function getPrompt1() {
  const now = DateTime.utc().startOf('minute').minus({minutes: 2})
  const thisWeek = now.minus({days: 7}).startOf('day')
  const thisMonth = now.startOf('month')
  let res = `Your name is VeloAi and you are a large language model being employed by financial analytics company Velo Data.
    All dates will be provided to you as ISO 8601.
    This week started: ${thisWeek.toString()}
    This month started: ${thisMonth.toString()}
    The time now is: ${now.toString()}
    Do use query_change with close price when asked about coin performance.
    Do use query_change with close_price when asked about up or down.
    Do use query_high_or_low when asked about high or low anything.
    Do include time in your answer when asked.
    Do default to using the trade columns when asked about buys/longs or shorts/sells.
    Do use query_type default: recent.
    Be concise with your answers.`
  res = res.split("\n")
  res = res.map((line) => line.trim())
  return res.join("\n")
}

// fails eventually
function getPrompt2() {
  let res = `Your name is VeloAi and you are a large language model being employed by financial analytics company Velo Data.
    Be concise with your answers.`
  res = res.split("\n")
  res = res.map((line) => line.trim())
  return res.join("\n")
}

function solveMathExpressionSchema() {
  return {
    name: 'solve_math_expression',
    description: 'Solve a given math expression',
    parameters: {
      type: 'object',
      properties: { expression: { type: 'string', description: 'The math expression' } },
      required: ['expression']
    }
  }
}

function solveMathExpression(args) {
  console.log('solveMathExpression called', args.expression)
  try {

    args.expression = args.expression.toLowerCase().replaceAll('x', '*')
    const mexp = new Math
    const lexed = mexp.lex(args.expression)
    const postfixed = mexp.toPostfix(lexed)
    const result = mexp.postfixEval(postfixed)
    return { result }

  } catch (err) {
    console.log('solveMathExpression err', err)
    return { error: err.message }
  }
}

module.exports = {
  getPrompt1,
  getPrompt2,
  solveMathExpressionSchema,
  solveMathExpression
}
