import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);

    // Log the received fields for debugging
    console.log('Received fields:', fields);

    // Mock AI analysis - Replace this with your actual AI integration
    const mockAnalysis = `Based on the analysis of your solar panel system:

1. Current Condition Assessment:
   - Overall system appears to be functioning at 85% efficiency
   - Minor dust accumulation detected
   - No significant physical damage observed

2. Recommended Maintenance Actions:
   - Schedule a professional cleaning within the next 2 weeks
   - Inspect and tighten all mounting hardware
   - Check electrical connections for any loose wiring

3. Preventive Measures:
   - Implement monthly cleaning routine
   - Monitor system performance through your dashboard
   - Schedule next professional inspection in 6 months

4. Potential Optimizations:
   - Consider adjusting panel angles for optimal seasonal performance
   - Evaluate surrounding vegetation for potential shading issues

Priority Level: Medium
Estimated maintenance time: 2-3 hours`;

    return res.status(200).json({
      recommendation: mockAnalysis
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Error processing request' });
  }
} 