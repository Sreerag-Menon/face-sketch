import { useState } from "react";

export default function FaceSketchGenerator() {
  const [prompt, setPrompt] = useState("");
  const [modification, setModification] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImage = async (isModification = false) => {
    if (!prompt && !isModification) return;
    setLoading(true);
    setImageUrl("");

    try {
      const basePrompt = `${prompt}, pencil sketch style, highly detailed, black and white, realistic shading, cross-hatching, hand-drawn, artistic, portrait, face-focused, expressive`;
      const finalPrompt = isModification ? `${basePrompt}, ${modification}` : basePrompt;
      const finalNegativePrompt = negativePrompt || "low quality, bad anatomy, blurry, deformed, beard, mustache";

      const response = await fetch("https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2-1", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: finalPrompt,
          parameters: {
            negative_prompt: finalNegativePrompt,
          },
        }),
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Face Sketch Generator</h1>
        <input
          type="text"
          className="w-full max-w-md p-3 border rounded-lg shadow-sm mb-2"
          placeholder="Enter description (e.g., 'A middle-aged man')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <input
          type="text"
          className="w-full max-w-md p-3 border rounded-lg shadow-sm mb-2"
          placeholder="What to avoid? (e.g., 'no beard, no mustache')"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
        />
        <button
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
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
          {/* <input
            type="text"
            className="w-full max-w-md mt-4 p-3 border rounded-lg shadow-sm"
            placeholder="Modify image (e.g., 'Add glasses, longer hair')"
            value={modification}
            onChange={(e) => setModification(e.target.value)}
          />
          <button
            className="mt-2 px-6 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
            onClick={() => generateImage(true)}
            disabled={loading || !modification}
          >
            {loading ? "Modifying..." : "Modify Image"}
          </button> */}
        </div>
      )}
    </div>
  );
}
