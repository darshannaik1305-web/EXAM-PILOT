import FeatureCard from "../common/FeatureCard";

function Features() {

  const features = [

    {
      id: 1,
      icon: "🤖",
      title: "AI Analysis",
      description: "Get instant AI-powered feedback on your performance."
    },

    {
      id: 2,
      icon: "📚",
      title: "Mock Tests",
      description: "Practice with realistic competitive exam questions."
    },

    {
      id: 3,
      icon: "📈",
      title: "Performance Tracking",
      description: "Monitor your progress and improve weak areas."
    }

  ];

  return (

    <section className="py-20 bg-gray-50">

      <h1 className="text-4xl font-bold text-center">
        Why Choose ExamPilot?
      </h1>

      <div className="mt-12 grid grid-cols-3 gap-8 px-16">

        {

          features.map(feature => (

            <FeatureCard

              key={feature.id}

              icon={feature.icon}

              title={feature.title}

              description={feature.description}

            />

          ))

        }

      </div>

    </section>

  );

}

export default Features;