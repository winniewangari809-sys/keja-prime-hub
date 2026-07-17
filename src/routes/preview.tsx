import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      {
        title: "Preview — KejaHub",
      },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container-app py-16">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Preview Page
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This is a preview/demo page for testing components and layouts.
        </p>
      </div>
    </div>
  );
}
