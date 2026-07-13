function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">

      <div className="text-5xl">
        {icon}
      </div>

      <h2 className="mt-4 text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-gray-600">
        {description}
      </p>

    </div>
  );
}

export default FeatureCard;