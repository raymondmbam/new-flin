export default function Image({ imageUrl, altText = "Generated image" }) {
  return (
    <div className="flex justify-center mt-4">
      <img 
        src={imageUrl} 
        alt={altText} 
        className="rounded-2xl max-w-[80%] shadow-md border border-gray-200" 
      />
    </div>
  );
}