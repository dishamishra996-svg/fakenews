import Contract from "@/components/Contract";

export default function VerifyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Content Verification
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Submit content for verification, check trust scores, or report
          suspicious content. All actions are recorded on the Stellar blockchain.
        </p>
      </div>

      <Contract />
    </div>
  );
}
