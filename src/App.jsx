import { useState } from 'react';
import axios from 'axios';

const API_KEY = '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';
const API_URL = 'https://api-inference.huggingface.co/models/delvinnr/sentiment-analysis-indobert';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios({
        method: 'POST',
        url: API_URL,
        data: {
          inputs: text,
        },
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      // Handle the nested array response structure
      if (Array.isArray(response.data) &&
        Array.isArray(response.data[0]) &&
        response.data[0].length > 0) {
        // Sort by score to get the highest probability
        const predictions = response.data[0].sort((a, b) => b.score - a.score);
        setResult(predictions[0]);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error details:', err);

      if (err.response?.status === 401) {
        setError('Authentication failed. Please check API key.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to analyze sentiment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label) => {
    const colors = {
      'LABEL_0': 'text-red-600',    // Negative
      'LABEL_1': 'text-yellow-600', // Neutral
      'LABEL_2': 'text-green-600'   // Positive
    };
    return colors[label] || 'text-gray-600';
  };

  const getReadableLabel = (label) => {
    const labels = {
      'LABEL_0': 'Negative',
      'LABEL_1': 'Neutral',
      'LABEL_2': 'Positive'
    };
    return labels[label] || label;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                  Traveloka Sentiment Analysis
                </h1>

                <div className="mb-4">
                  <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your text in Indonesian
                  </label>
                  <textarea
                    id="text-input"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    rows="4"
                    placeholder="Masukkan teks untuk analisis sentimen..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={analyzeSentiment}
                  disabled={loading || !text.trim()}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Sentiment'
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sentiment:</span>
                        <span className={`font-medium ${getSentimentColor(result.label)}`}>
                          {getReadableLabel(result.label)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">
                          {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;