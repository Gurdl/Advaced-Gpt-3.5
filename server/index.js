import { config } from 'dotenv';
import { OpenAI } from 'openai'
import express from 'express';
import cors from 'cors';
config();
const app = express();
const port = 3080;

// Create the Open ai object to acces the api:
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// CHAT-COMPLETION MODEL:
//MODELS:	gpt-4, gpt-4-0613, gpt-4-32k, gpt-4-32k-0613, gpt-3.5-turbo, 
// gpt-3.5-turbo-0613, gpt-3.5-turbo-16k, gpt-3.5-turbo-16k-0613
// Links:https://platform.openai.com/docs/models/model-endpoint-compatibility
const chat_Completion_Models = ['gpt-4', 'gpt-4-0613',
  'gpt-4-32k', 'gpt-4-32k-0613', 'gpt-3.5-turbo', 'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613']

// COMPLETION MODEL Legacy:
// Models: text-davinci-003, text-davinci-002, text-davinci-001, text-curie-001, 
// text-babbage-001, text-ada-001, davinci, curie, babbage, ada
// Links:https://platform.openai.com/docs/models/model-endpoint-compatibility
const Only_Completion_Models = [
  'text-davinci-003', 'text-davinci-002', 'text-davinci-001', 
  'text-curie-001', 'text-babbage-001', 'text-ada-001', 'davinci', 
  'curie', 'babbage', 'ada'
];

app.post("/", async (req, res) => {
  const { message, currentModel } = req.body;
  console.log(message, "message");
  console.log(currentModel, "current Model")

  // For chat_Completion_Models:
  if (chat_Completion_Models.includes(currentModel)) 
  {
    console.log("supported in the v1/chat/completions endpoint");
    const response = await openai.chat.completions.create({
      model: currentModel,
      messages: [{ "role": "user", "content": message }],
      // messages:message
    })
    console.log(response.choices[0].message);
    res.json({
      message: response.choices[0].message.content,
    })

  }
  // For only completion models:
  else{
    console.log("This is only_completion model!")
    const completion = await openai.completions.create({
      model: currentModel,
      prompt: message,
      max_tokens: 300,
    });
    console.log(completion.choices[0].text);
    res.json({
      message: completion.choices[0].text
    })
  }

})


// Get all the availabe models:
app.get("/models", async (req, res) => {
  const list = await openai.models.list();
  // Filter Only chat_completion models
  const chatCompletionModels = list.data.filter((model) =>
    { return chat_Completion_Models.includes(model.id)?model.id:""}
  );
  // Filter only completion models:
  const CompletionModels = list.data.filter((model) =>
    { return Only_Completion_Models.includes(model.id)?model.id:""}
  );
  // Combine both arrays
  const combinedModels = [...chatCompletionModels, ...CompletionModels];
  res.json({ models: combinedModels });

})

app.listen(port, () => {
  console.log(`app is working on ${port}`);
})