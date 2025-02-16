import { useState } from "react";

export default function FaceSketchGenerator() {
  const [prompt, setPrompt] = useState("");
  const [modification, setModification] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImage = async (isModification = false) => {
    if (!prompt && !isModification) return;
    setLoading(true);
    setImageUrl("");
    try {
      const basePrompt = `${prompt}, pencil sketch style, highly detailed, black and white, realistic shading, cross-hatching, hand-drawn, artistic, portrait, face-focused, expressive`;
      const finalPrompt = isModification ? `${basePrompt}, ${modification}` : basePrompt;
      
      const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: finalPrompt })
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Face Sketch Generator</h1>
        <input
          type="text"
          className="w-full max-w-md p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter description (e.g., 'A middle-aged man with a beard')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={() => generateImage(false)}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {imageUrl && (
        <div className="w-full md:w-1/2 flex flex-col items-center p-4">
          <div className="border rounded-lg shadow-md overflow-hidden">
            <img src={imageUrl} alt="Generated Face Sketch" className="w-96 h-auto" />
          </div>
          <input
            type="text"
            className="w-full max-w-md mt-4 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Modify image (e.g., 'Add glasses, make the beard longer')"
            value={modification}
            onChange={(e) => setModification(e.target.value)}
          />
          <button
            className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
            onClick={() => generateImage(true)}
            disabled={loading || !modification}
          >
            {loading ? "Modifying..." : "Modify Image"}
          </button>
        </div>
      )}
    </div>
  );
}

