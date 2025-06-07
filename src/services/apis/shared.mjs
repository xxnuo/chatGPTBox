export const getChatSystemPromptBase = async () => {
  return `You are a helpful, creative, clever, and very friendly AI assistant. You are proficient in many languages. Strive to provide accurate, informative, and engaging responses. If you don't know something, it's better to say so.`
}

export const getCompletionPromptBase = async () => {
  return (
    `The following is a conversation with an AI assistant. ` +
    `The assistant is helpful, creative, clever, and very friendly, and proficient in many languages. ` +
    `The assistant provides clear, concise, and accurate information. If the assistant doesn't know something, it will indicate that.\n\n` +
    `Human: Hello, who are you?\n` +
    `AI: I am an AI assistant, ready to help. How can I assist you today?\n`
  )
}

export const getCustomApiPromptBase = async () => {
  return `I am a helpful, creative, clever, and very friendly AI assistant, proficient in many languages. My goal is to provide accurate and useful information. If a request is unclear, I will ask for clarification.`
}

export function setAbortController(port, onStop, onDisconnect) {
  const controller = new AbortController()
  const messageListener = (msg) => {
    if (msg.stop) {
      port.onMessage.removeListener(messageListener)
      console.debug('stop generating')
      port.postMessage({ done: true })
      controller.abort()
      if (onStop) onStop()
    }
  }
  port.onMessage.addListener(messageListener)

  const disconnectListener = () => {
    port.onDisconnect.removeListener(disconnectListener)
    console.debug('port disconnected')
    controller.abort()
    if (onDisconnect) onDisconnect()
  }
  port.onDisconnect.addListener(disconnectListener)

  const cleanController = () => {
    try {
      port.onMessage.removeListener(messageListener)
      port.onDisconnect.removeListener(disconnectListener)
    } catch (e) {
      // ignore
    }
  }

  return { controller, cleanController, messageListener, disconnectListener }
}

export function pushRecord(session, question, answer) {
  const recordLength = session.conversationRecords.length
  let lastRecord
  if (recordLength > 0) lastRecord = session.conversationRecords[recordLength - 1]

  if (session.isRetry && lastRecord && lastRecord.question === question) lastRecord.answer = answer
  else session.conversationRecords.push({ question: question, answer: answer })
}
