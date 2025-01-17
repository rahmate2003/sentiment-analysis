import { useState } from 'react';
import axios from 'axios';


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

      const response = await axios.post('/api/analyze-sentiment', { text });

      // Periksa apakah respons sesuai dengan format yang diharapkan
      if (
        response.data &&
        response.data.sentiment &&
        Array.isArray(response.data.sentiment) &&
        response.data.sentiment[0] &&
        Array.isArray(response.data.sentiment[0]) &&
        response.data.sentiment[0][0]
      ) {
        setResult(response.data.sentiment[0][0]);
      } else {
        setResult({ unexpectedResponse: response.data });
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error details:', err);
      const errorMessage =
        {
          401: 'Authentication failed. Please check API key.',
          429: 'Too many requests. Please wait a moment and try again.',
          ECONNABORTED: 'Request timed out. Please try again.',
        }[err.response?.status || err.code] ||
        err.response?.data?.error ||
        err.message ||
        'Failed to analyze sentiment. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const getSentimentColor = (label) =>
  ({
    LABEL_0: 'text-red-500', // Negative
    LABEL_1: 'text-yellow-500', // Neutral
    LABEL_2: 'text-green-500', // Positive
  }[label] || 'text-gray-500');

  const getReadableLabel = (label) =>
  ({
    LABEL_0: 'Negatif',
    LABEL_1: 'Netral',
    LABEL_2: 'Positif',
  }[label] || label);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center items-center">
      <div className="w-full max-w-xl px-6 py-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Traveloka Sentiment Analysis
        </h1>

        <div className="mb-6">
          <label
            htmlFor="text-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter your text in Indonesian
          </label>
          <textarea
            id="text-input"
            className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
          className="w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analisis...
            </>
          ) : (
            'Analisis Sentimen'
          )}
        </button>

        {loading && (
          <div className="mt-4">
            <p className="text-gray-500">Sedang menganalisis, mohon tunggu...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">Hasil Analisis</h2>
            {result.label ? (
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
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-red-600">
                  Unexpected Response
                </h3>
                <pre className="text-sm bg-gray-100 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(result.unexpectedResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
