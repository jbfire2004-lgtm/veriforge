import { AskQuestionForm } from "@/components/expert-qa/AskQuestionForm";

export const metadata = {
  title: "Ask a safety question",
};

export default function AskQuestionPage() {
  return (
    <div className="space-y-vera-6">
      <header>
        <h1 className="text-2xl font-semibold text-vera-deep">Ask a question</h1>
        <p className="mt-vera-2 text-sm text-vera-muted">
          Include trade, site context, and relevant standards. Experts typically respond within 24 hours.
        </p>
      </header>
      <AskQuestionForm />
    </div>
  );
}
