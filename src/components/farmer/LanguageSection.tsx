import { Globe2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

const languages = [
  {
    native: "English",
    name: "English",
  },
  {
    native: "हिन्दी",
    name: "Hindi",
  },
  {
    native: "ਪੰਜਾਬੀ",
    name: "Punjabi",
  },
  {
    native: "मराठी",
    name: "Marathi",
  },
];

export function LanguageSection() {
  return (
    <section id="languages" className="bg-green-50 py-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
            <Globe2 size={23} />
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-950">
            Your language, your choice.
          </h2>

          <p className="mt-4 text-gray-600">
            KisanQueue is designed to support farmers across different
            regions and languages.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {languages.map((language) => (
              <div
                key={language.name}
                className="rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm"
              >
                {language.native}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}