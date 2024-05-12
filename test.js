const split = require('split')
const Groq = require('groq-sdk')
const math = require('./math.js')
const argv = require('minimist')(process.argv.slice(2))

const llmTemp = 0.0
const llmMax = 1024
const llmModel = 'llama3-70b-8192'

const httpRetry = 3
const httpTimeout = 1000 * 12

function onError(err) {
  console.error('error', err)
  process.exit(1)
}

async function sleep(ms) {
  return new Promise((res, rej) => {
    setTimeout(() => res({timeout: true}), ms)
  })
}

let stdin = null

function getNextLine() {
  if (!stdin) { stdin = process.stdin.pipe(split()) }
  return new Promise((res, rej) => {
    stdin.once('data', (line) => res(line.trim()))
  })
}

async function queryHttp(api, args, retry=0) {
  try {

    if (retry > 0) { console.log('http retry', retry) }
    const timeout = sleep(httpTimeout)
    const pending = api.chat.completions.create(args)
    const result = await Promise.race([timeout, pending])
    if (!result?.timeout) { return result }
    if (retry < httpRetry) { return queryHttp(api, args, retry + 1) }
    throw new Error('http retry limit hit')

  } catch (err) {
    if (retry < httpRetry) { return queryHttp(api, args, retry + 1) }
    else { throw err }
  }
}

async function queryModel(api, model, message, thread, depth=1) {
  let messages = []
  if (thread) { messages = [...thread] }
  if (!thread && useAltPrompt) { messages.push({role: 'system', content: math.getPrompt2()}) }
  else if (!thread) { messages.push({role: 'system', content: math.getPrompt1()}) }
  if (message) { messages.push({role: 'user', content: message}) }

  let schemas = fnCall = undefined
  if (depth === 1) {
    schemas = [math.solveMathExpressionSchema()]
    fnCall = {name: 'solve_math_expression'}
  }

  console.log(depth, 'function_call', fnCall)
  console.log(depth, 'schemas', schemas)
  console.log(depth, 'messages', messages)
  const chatCompletion = await queryHttp(api, {
    model: model,
    temperature: llmTemp,
    max_tokens: llmMax,
    functions: schemas,
    function_call: fnCall,
    messages
  })

  const reply = chatCompletion.choices[0].message
  console.log(depth, 'reply', reply)
  messages.push(reply)

  // text answer
  if (reply.content) { return messages }

  // fn call
  let result = null
  const args = JSON.parse(reply.function_call.arguments)

  try {
    result = await math.solveMathExpression(args)
    console.log(depth, 'fn result', result)
  } catch (err) {
    console.log('error fn exec', fnName, err)
    messages.push({role: 'assistant', content: 'error fn exec'})
    return messages
  }

  messages.push({role: 'function', name: reply.function_call.name, content: JSON.stringify(result)})
  return queryModel(api, model, null, messages, depth+1)
}

async function loop(api) {
  let thread = null
  let line = await getNextLine()
  while (line.length > 0) {
    let begin = Date.now()
    thread = await queryModel(api, llmModel, line, thread)
    let end = Date.now()
    const result = thread[thread.length - 1]
    console.log(llmModel, `${end-begin}ms`, result.content)
    line = await getNextLine()
  }
  process.exit(0)
}

const useAltPrompt = argv.alt
const groq = new Groq({ apiKey: process.env.groq_key })

loop(groq).catch(onError)
