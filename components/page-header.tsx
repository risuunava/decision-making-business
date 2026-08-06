import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[13px] text-sub">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
