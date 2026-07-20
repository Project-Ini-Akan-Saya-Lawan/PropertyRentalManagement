import Image from "next/image";
import { Workspace } from "@/types";
import { formatIDR } from "@/lib/utils";

interface Props {
  workspace: Workspace;
  floor?: string;
  type?: string;
  date?: string;
  commitmentTerms?: string;
}

export default function BookingSummary({
  workspace,
  floor,
  type,
  date,
  commitmentTerms,
}: Props) {
  const years = commitmentTerms ? parseInt(commitmentTerms) || 1 : 1;
  const yearly = workspace.monthlyPrice * years;
  const tax = yearly * workspace.taxRate;
  const total = yearly + tax;

  // Auto calculate end date
  const endDate = (() => {
    if (!date || !commitmentTerms) return null;
    const start = new Date(date);
    const y = parseInt(commitmentTerms) || 1;
    start.setFullYear(start.getFullYear() + y);
    start.setDate(start.getDate() - 1);
    return start.toISOString().split("T")[0];
  })();

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
      {/* Image */}
      <div className="relative h-40">
        <Image
          src={workspace.image}
          alt={workspace.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white text-xs font-semibold">{workspace.name}</p>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-xs font-bold text-[#2B2B2B] mb-3 uppercase tracking-wider">
          Plan Summary
        </h4>

        <div className="space-y-2 text-xs text-gray-500 mb-4">
          {/* Tower */}
          <div className="flex justify-between">
            <span>Tower</span>
            <span className="font-medium text-[#2B2B2B]">
              {workspace.tower === "Wiwi Tower"
                ? "Wowi Tower"
                : workspace.tower}
            </span>
          </div>

          {/* Type Office */}
          <div className="flex justify-between">
            <span>Type Office</span>
            <span className="font-medium text-[#2B2B2B]">
              {type || workspace.workspaceType}
            </span>
          </div>

          {/* Commitment Terms */}
          {commitmentTerms ? (
            <div className="flex justify-between">
              <span>Commitment Terms</span>
              <span className="font-medium text-[#2B2B2B]">
                {commitmentTerms}
              </span>
            </div>
          ) : (
            <div className="flex justify-between opacity-30">
              <span>Commitment Terms</span>
              <span>—</span>
            </div>
          )}

          {/* Floor */}
          {floor ? (
            <div className="flex justify-between">
              <span>Floor</span>
              <span className="font-medium text-[#2B2B2B]">{floor}</span>
            </div>
          ) : (
            <div className="flex justify-between opacity-30">
              <span>Floor</span>
              <span>—</span>
            </div>
          )}

          {/* Start Date */}
          {date ? (
            <div className="flex justify-between">
              <span>Start Date</span>
              <span className="font-medium text-[#2B2B2B]">{date}</span>
            </div>
          ) : (
            <div className="flex justify-between opacity-30">
              <span>Start Date</span>
              <span>—</span>
            </div>
          )}

          {/* End Date - auto calculated */}
          {endDate ? (
            <div className="flex justify-between">
              <span>End Date</span>
              <span className="font-medium text-[#C9A36A]">{endDate}</span>
            </div>
          ) : (
            <div className="flex justify-between opacity-30">
              <span>End Date</span>
              <span>—</span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
          <p className="font-bold text-[#2B2B2B] mb-2 uppercase tracking-wider text-[10px]">
            Price Breakdown
          </p>
          <div className="flex justify-between text-gray-500">
            <span>
              Annual Fee {commitmentTerms ? `(${commitmentTerms})` : ""}
            </span>
            <span>{formatIDR(yearly)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax + VAT ({(workspace.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatIDR(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#C9A36A] pt-2 border-t border-gray-100">
            <span>Total {commitmentTerms || "Annual"}</span>
            <span>{formatIDR(total)}</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
          * Note: Future charges are subject to local taxes and company pricing
          updates.
        </p>
      </div>
    </div>
  );
}
