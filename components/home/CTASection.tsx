export default function CTASection() {
  return (
    <div className="mt-16 md:mt-24 mb-12 md:mb-16">
      <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-start">
        <div className="md:col-span-2">
          <div className="rounded-2xl shadow-2xl overflow-hidden inline-block">
            <img 
              src="https://img.freepik.com/free-photo/woman-inspecting-chair-medium-shot_23-2148966889.jpg" 
              alt="Woman inspecting chair" 
              className="w-full h-auto"
            />
          </div>
        </div>
        
        <div className="md:col-span-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
            About WoodWise
          </h2>
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              WoodWise is an innovative AI-powered platform dedicated to preserving and protecting mahogany wood. 
              Our mission is to make professional wood care accessible to everyone through intelligent technology.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Developed by wood care experts and AI specialists, our system combines decades of restoration 
              knowledge with cutting-edge machine learning to provide accurate damage detection and personalized 
              treatment recommendations.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Whether you're a homeowner, furniture restorer, or interior designer, WoodWise helps you maintain 
              the beauty and longevity of your mahogany wood with smart, data-driven insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
