import Image from "next/image";
import { Workspace } from "@/types";
import { formatIDR } from "@/lib/utils";

interface Props {
  workspace: Workspace;
  floor?: string;
  type?: string;
  date?: string;
  months?: number;
}

export default function BookingSummary({
  workspace,
  floor,
  type,
  date,
  months = 1,
}: Props) {
  const monthly = workspace.monthlyPrice;
  const tax = monthly * workspace.taxRate;
  const monthlyTotal = monthly + tax;

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
        {/* Details */}
        <h4 className="text-xs font-bold text-[#2B2B2B] mb-3 uppercase tracking-wider">
          Plan Summary
        </h4>
        <div className="space-y-2 text-xs text-gray-500 mb-4">
          <div className="flex justify-between">
            <span>Tower</span>
            <span className="font-medium text-[#2B2B2B]">
              {workspace.tower}
            </span>
          </div>
          {floor && (
            <div className="flex justify-between">
              <span>Floor Selected</span>
              <span className="font-medium text-[#2B2B2B]">{floor}</span>
            </div>
          )}
          {type && (
            <div className="flex justify-between">
              <span>Type Office</span>
              <span className="font-medium text-[#2B2B2B]">{type}</span>
            </div>
          )}
          {date && (
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-medium text-[#2B2B2B]">{date}</span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
          <p className="font-bold text-[#2B2B2B] mb-2 uppercase tracking-wider text-[10px]">
            Price Breakdown
          </p>
          <div className="flex justify-between text-gray-500">
            <span>Monthly Fee</span>
            <span>{formatIDR(monthly)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax + VAT ({(workspace.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatIDR(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#C9A36A] pt-2 border-t border-gray-100">
            <span>Monthly Total</span>
            <span>{formatIDR(monthlyTotal)}</span>
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
