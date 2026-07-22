interface SiteNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function SiteNameField({ value, onChange }: SiteNameFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="site-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Site Name
      </label>
      <input
        id="site-name"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Hospital, Construction Site A"
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
      />
    </div>
  );
}
