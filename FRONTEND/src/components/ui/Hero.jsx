import Button from "../common/Button";

function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-24">

      <h1 className="text-6xl font-bold text-indigo-600">
        🚀 Crack Competitive Exams with AI
      </h1>

      <p className="mt-6 text-2xl text-gray-700">
        AI Powered Mock Test Platform
      </p>

      <p className="mt-3 text-lg text-gray-500 max-w-3xl">
        Practice smarter with adaptive mock tests, instant AI feedback,
        performance tracking, and detailed analytics for any examination.
      </p>

      <div className="mt-10 flex gap-5">

        <Button
          text="Start Free Test"
          bgColor="bg-purple-600"
        />

        <Button
          text="Learn More"
          bgColor="bg-slate-700"
        />

      </div>

    </section>
  );
}

export default Hero;