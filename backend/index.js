require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { OpenAI } = require('openai');
const properties = require('./properties');

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/properties - return all available properties
app.get('/api/properties', (req, res) => {
  res.json(properties);
});

// Known cities extracted from property list
const knownCities = [...new Set(properties.map(p => p.location.toLowerCase()))];

// Extract city from message
function extractLocation(message) {
  const lower = message.toLowerCase();
  for (const city of knownCities) {
    if (lower.includes(city)) return city;
  }
  return 'gurugram'; // default fallback
}

// Extract max price from message in INR
function extractMaxPrice(message) {
  const lower = message.toLowerCase();

  const croreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(crore|cr)/);
  if (croreMatch) return parseFloat(croreMatch[1]) * 1e7;

  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(lakh|lac)/);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 1e5;

  const rupeeMatch = lower.match(/(?:rs\.?\s*|rupees\s*)([\d,]+)/);
  if (rupeeMatch) return parseInt(rupeeMatch[1].replace(/,/g, ""));

  const underMatch = lower.match(/\b(?:under|below|less than)\s+(\d+(?:\.\d+)?)/);
  if (underMatch) return parseFloat(underMatch[1]) * 1e5;

  const fallbackMatch = lower.match(/(\d+(?:\.\d+)?)/);
  if (fallbackMatch) {
    const value = parseFloat(fallbackMatch[1]);
    return value < 1000 ? value * 1e5 : value;
  }

  return 5000000; // default: 50 lakhs
}

// Filter properties by location and price
function filterProperties(location, maxPrice) {
  return properties.filter(
    (prop) =>
      prop.location.toLowerCase() === location.toLowerCase() &&
      prop.price <= maxPrice
  );
}

// Log interactions to a file
function logToFile(entry) {
  try {
    const filePath = './logs.json';
    let logs = [];

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      logs = raw ? JSON.parse(raw) : [];
    }

    logs.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("Logging failed:", error.message);
  }
}

// POST /api/chat - handle AI property chat
app.post('/api/chat', async (req, res) => {
  const userQuery = req.body.message;

  // MOCK mode for local testing
  if (process.env.MOCK_OPENAI === "1") {
    const city = extractLocation(userQuery);
    const maxPrice = extractMaxPrice(userQuery);
    const filtered = filterProperties(city, maxPrice);

    const aiResponse = filtered.length
      ? `Here are some properties in ${city} under Rs. ${maxPrice.toLocaleString('en-IN')}:\n` +
        filtered.map(
          (prop) =>
            `• ${prop.type} (${prop.size}) - Rs. ${prop.price.toLocaleString('en-IN')}`
        ).join('\n')
      : `Sorry, no properties found in ${city} under Rs. ${maxPrice.toLocaleString('en-IN')}.`;

    logToFile({
      timestamp: new Date(),
      userQuery,
      aiResponse,
      function_call: {
        name: "filterProperties",
        args: { location: city, maxPrice }
      }
    });

    return res.json({ response: aiResponse, properties: filtered });
  }

  const systemMessage = `You are a helpful real estate assistant. If the query asks for properties filtered by location and max price, use the function filterProperties. Otherwise, answer as usual.`;

  const functions = [
    {
      name: 'filterProperties',
      description: 'Filter hardcoded properties by location and maximum price.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city where the property is located.'
          },
          maxPrice: {
            type: 'integer',
            description: 'Maximum budget in INR.'
          }
        },
        required: ['location', 'maxPrice'],
      }
    }
  ];

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userQuery }
      ],
      functions,
      function_call: 'auto'
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === "function_call" || choice.message.function_call) {
      const funcCall = choice.message.function_call;
      const name = funcCall.name;
      let args = {};

      try {
        args = JSON.parse(funcCall.arguments || '{}');
      } catch {
        return res.status(400).json({ error: 'Failed to parse function arguments' });
      }

      const { location, maxPrice } = args;
      const filtered = filterProperties(location, maxPrice);

      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Format these properties as a nice, readable answer for the user.' },
          { role: 'user', content: userQuery },
          {
            role: 'function',
            name,
            content: JSON.stringify(filtered)
          }
        ]
      });

      const aiResponse = secondResponse.choices[0].message.content;

      logToFile({
        timestamp: new Date(),
        userQuery,
        aiResponse,
        function_call: { name, args }
      });

      return res.json({ response: aiResponse, properties: filtered });
    }

    // Default chat fallback
    const aiResponse = choice.message.content;
    logToFile({ timestamp: new Date(), userQuery, aiResponse, function_call: null });

    return res.json({ response: aiResponse });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    logToFile({
      timestamp: new Date(),
      userQuery,
      aiResponse: "ERROR: " + error.message,
      error: error.toString()
    });

    return res.status(500).json({ error: 'Something went wrong while processing your request.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
