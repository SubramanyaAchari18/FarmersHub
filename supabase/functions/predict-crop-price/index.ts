import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropName, category, state, season } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Predicting price for:', { cropName, category, state, season });

    const systemPrompt = `You are an AI-powered agricultural price prediction system for India. Based on the crop information provided, analyze market trends, seasonal factors, regional demand-supply, and historical data to predict crop prices.

Your response MUST be a valid JSON object with this exact structure:
{
  "predicted_price_per_kg": <number>,
  "confidence_score": <number between 0-1>,
  "explanation": "<brief explanation>",
  "factors": ["<factor1>", "<factor2>", "<factor3>"],
  "recommendation": "<advice for farmer>"
}

Consider these factors in your analysis:
- Seasonal demand and supply patterns
- Regional market conditions in the specified state
- Current market trends in India
- Weather and climate impact
- Festival seasons and special occasions
- Export-import dynamics
- Government MSP (Minimum Support Price) if applicable
- Storage and transportation costs

Provide realistic price predictions in Indian Rupees (₹) per kg.`;

    const userPrompt = `Predict the market price for:
Crop: ${cropName}
Category: ${category}
State: ${state}
Season: ${season}

Provide a detailed price prediction with analysis.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits depleted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Raw AI response:', aiResponse);

    // Extract JSON from response (in case it's wrapped in markdown or text)
    let prediction;
    try {
      // Try to find JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        prediction = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback with basic structure
      prediction = {
        predicted_price_per_kg: 0,
        confidence_score: 0,
        explanation: aiResponse,
        factors: [],
        recommendation: "Please try again"
      };
    }

    console.log('Price prediction generated:', prediction);

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predict-crop-price function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});