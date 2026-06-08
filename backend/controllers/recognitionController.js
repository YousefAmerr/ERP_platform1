import { fetchAllRecognitions } from '../models/recognitionModel.js';

export async function getRecognitions(req, res) {
  try {
    const rows = await fetchAllRecognitions();
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching recognitions:', err.message || err);
    return res.status(500).json({ success: false, message: 'Failed to fetch recognitions' });
  }
}

export default { getRecognitions };
