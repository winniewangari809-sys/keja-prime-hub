import { createFileRoute } from "@tanstack/react-router";
import { Heart, Target, Users, Award } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About KejaHub — Our Story & Mission",
      },
      {
        name: "description",
        content:
          "Learn about KejaHub's mission to make property ownership accessible to everyone in Kenya through trusted concierge service.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-transparent py-16">
        <div className="container-app">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            About KejaHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            Making property ownership and rental accessible to everyone in Kenya.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="container-app py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              KejaHub was founded on a simple belief: finding a property should be simple, safe, and transparent.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              We started KejaHub to solve the frustrations we experienced in the Kenyan property market.
              Too many intermediaries, unclear documentation, and lack of trust made the process stressful.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Today, KejaHub is the trusted platform for thousands of Kenyans looking to buy, rent, or sell properties.
              We're committed to bringing transparency, security, and ease to every transaction.
            </p>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-display font-bold text-primary mb-4">KH</div>
              <p className="text-gray-600 dark:text-gray-400">Keja Hub</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Mission & Vision */}
      <section className="container-app py-16">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-12 text-center">
          Our Mission & Vision
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              To revolutionize Kenya's property market by providing a trusted, transparent, and user-friendly platform
              that connects buyers, sellers, renters, and landlords while protecting their interests through our expert concierge service.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Vision
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              A Kenya where every person can find their perfect home or investment property without fear,
              where landlords and sellers can list confidently, and where the property market thrives with transparency and trust.
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Core Values */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container-app">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-12 text-center">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Trust & Transparency",
                description:
                  "We believe in complete transparency in all transactions. No hidden fees, no surprises.",
              },
              {
                icon: Award,
                title: "Excellence",
                description:
                  "We're committed to providing the highest quality service and the best properties.",
              },
              {
                icon: Heart,
                title: "Customer First",
                description:
                  "Every decision we make is centered on making the property process better for our users.",
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Team Section */}
      <section className="container-app py-16">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-12 text-center">
          The KejaHub Team
        </h2>

        <div className="text-center max-w-3xl mx-auto">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Our team is made up of property experts, developers, and customer service professionals
            dedicated to making your property experience seamless.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            With years of combined experience in Kenya's property market, we understand the challenges
            you face and are committed to solving them.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Stats Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-16">
        <div className="container-app">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-12 text-center">
            By The Numbers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "500+", label: "Properties Listed" },
              { number: "2K+", label: "Successful Transactions" },
              { number: "98%", label: "Satisfaction Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-display font-bold text-primary mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-700 dark:text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
