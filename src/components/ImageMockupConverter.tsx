import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Check, X } from 'lucide-react';
import { convertImageToMockup } from '../services/openaiService';

interface ImageMockupConverterProps {
  onMockupGenerated: (xmlContent: string) => void;
  onClose: () => void;
}

export const ImageMockupConverter: React.FC<ImageMockupConverterProps> = ({
  onMockupGenerated,
  onClose
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keyVisible, setKeyVisible] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    processFile(file);
  };

  // Process the selected file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Clear previous errors
    setError(null);

    // Read the file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Extract the base64 portion of the data URL
        const base64 = result.split(',')[1];
        setSelectedImage(base64);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  };

  // Handle conversion to mockup
  const handleConvertToMockup = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await convertImageToMockup(selectedImage, apiKey);
      
      if (result.success && result.xmlContent) {
        onMockupGenerated(result.xmlContent);
      } else {
        setError(result.error || 'Failed to convert image to mockup.');
      }
    } catch (error) {
      console.error('Error in handleConvertToMockup:', error);
      setError('An unexpected error occurred during conversion.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    processFile(files[0]);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Convert Image to Mockup</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={keyVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your OpenAI API key"
            />
            <button
              onClick={() => setKeyVisible(!keyVisible)}
              className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              type="button"
            >
              {keyVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your API key is required for OpenAI's GPT-4 Vision API and never stored or shared. Make sure you have access to the gpt-4-vision-preview model.
            <span className="block mt-1 text-amber-600">
              <strong>Note:</strong> API keys used in browser environments pose security risks. This is only for demonstration purposes - in production, API requests should be routed through a secure backend.
            </span>
          </p>
        </div>

        <div className="mb-6 flex-1 overflow-auto">
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 
              selectedImage ? 'border-indigo-300' : 'border-gray-300'
            }`}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
            
            {selectedImage ? (
              <>
                <div className="relative w-full max-h-64 overflow-hidden mb-3">
                  <img
                    src={`data:image/jpeg;base64,${selectedImage}`}
                    alt="Selected mockup"
                    className="mx-auto max-h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-indigo-600 flex items-center">
                  <Check size={16} className="mr-1" />
                  Image selected. Click to change
                </p>
              </>
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload mockup image or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG up to 5MB
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConvertToMockup}
            disabled={!selectedImage || !apiKey.trim() || loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              !selectedImage || !apiKey.trim() || loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </span>
            ) : (
              'Convert to Mockup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 