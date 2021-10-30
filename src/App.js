import { useState } from "react";
import { useDebounce } from "react-use";
import { formatDistance } from "date-fns";
import { useSearch, useHashState } from "./hooks.js";

export default function App() {
  const [{ type, page, filter, includeOfficial }, setState] = useHashState({
    type: "transformer",
    page: 0,
    filter: "",
    includeOfficial: false,
  });

  let [debouncedFilter, setDebouncedFilter] = useState("");

  useDebounce(
    () => {
      setDebouncedFilter(filter);
    },
    400,
    [filter]
  );

  let results = useSearch({
    type,
    page,
    filter: debouncedFilter,
    includeOfficial,
  });

  return (
    <div className="flex gap-2 flex-col items-center p-2">
      <div className="flex gap-2 flex-col md:flex-row">
        <label className="flex gap-1">
          Plugin type:
          <select
            value={type}
            onChange={(e) => setState({ type: e.target.value, page: 0 })}
            className="shadow-md bg-white rounded-md px-1 border-gray-400 border"
          >
            {[
              "transformer",
              "resolver",
              "bundler",
              "namer",
              "runtime",
              "packager",
              "optimizer",
              "compressor",
              "validator",
              "config",
              "reporter",
            ].map((v) => (
              <option value={v} key={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex gap-1">
          Filter:
          <input
            type="text"
            value={filter}
            onChange={(e) => setState({ filter: e.target.value, page: 0 })}
            className="shadow-md rounded-md px-1 border-gray-400 border"
          />
        </label>
        <label className="flex gap-1 items-center">
          <input
            type="checkbox"
            checked={includeOfficial}
            onChange={(e) =>
              setState({ includeOfficial: e.target.checked, page: 0 })
            }
            className="shadow-md rounded-md px-1 border-gray-400 border"
          />
          Include offical Plugins
        </label>
      </div>
      <div className="max-w-3xl flex-1">
        {results?.hits.map((r, i) => (
          <div
            key={i}
            className="mx-auto my-4 w-full p-3 bg-white rounded-xl shadow-md gap-2 grid grid-cols-2 grid-rows-2"
          >
            <a
              className="font-bold underline col-span-2 sm:col-span-1"
              href={`https://www.npmjs.com/package/${r.name}`}
            >
              {r.name}
            </a>
            <div className="text-right text-gray-400 col-span-2 sm:col-span-1">
              published{" "}
              {formatDistance(r.modified, new Date(), { addSuffix: true })},
              {r.humanDownloadsLast30Days} ⏬
            </div>
            <div className="col-span-2">{r.description}</div>
          </div>
        ))}
        <div className="flex justify-center gap-2">
          <button
            className="cursor-auto bg-gray-200 rounded-xl shadow-md px-1"
            onClick={() => setState({ page: page - 1 })}
            disabled={page === 0}
          >
            Previous Page
          </button>
          <span>
            {page + 1} {results && `of ${results.nbPages}`}
          </span>
          <button
            className="cursor-auto bg-gray-200 rounded-xl shadow-md px-1"
            onClick={() => setState({ page: page + 1 })}
            disabled={results && page === results.nbPages - 1}
          >
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
}
