import { useMemo, useEffect, useState } from "react";
import { useHash, useDebounce } from "react-use";
import { formatDistance } from "date-fns";

function useSearch({ type, page, filter, includeOfficial }) {
  let [result, setResult] = useState();

  useEffect(() => {
    let outdated = false;

    const searchParams = new URLSearchParams({
      // "x-algolia-agent": "TS DT Fetch",
      "x-algolia-application-id": "OFCNCOG2CU",
      "x-algolia-api-key": "f54e21fa3a2a0160595bb058179bfb1e",
    });

    const href = `https://ofcncog2cu-2.algolianet.com/1/indexes/*/queries?${searchParams.toString()}`;

    fetch(href, {
      method: "POST",
      body: JSON.stringify({
        // https://grep.app/search?q=OFCNCOG2CU
        // https://github.com/algolia/npm-search#usage
        requests: [
          {
            analyticsTags: ["typescriptlang.org/dt/search"],
            attributesToHighlight: ["name", "description", "keywords"],
            //restrictSearchableAttributes: ["name"],
            attributesToRetrieve: [
              "isDeprecated",
              "description",
              // "dependencies",
              // "downloadsLast30Days",
              // "homepage",
              "humanDownloadsLast30Days",
              // "keywords",
              "modified",
              "name",
              "owner",
              // "repository",
              // "version",
            ],
            facets: ["owner.name", "isDeprecated"],
            //facets: ["keywords", "keywords", "owner.name"],
            filters: `${
              !includeOfficial ? "NOT owner.name:parcel-bundler AND" : ""
            } NOT owner.name:thejameskyle AND isDeprecated:false`,
            hitsPerPage: 24,
            indexName: "npm-search",
            maxValuesPerFacet: 10,
            page: page,
            params: "",
            query: `parcel-${type}- ${filter}`,
            tagFilters: "",
          },
        ],
      }),
    }).then(async (r) => {
      let json = await r.json();
      if (!outdated) {
        setResult(json.results[0]);
      }
    });

    return () => {
      outdated = true;
    };
  }, [type, page, filter, includeOfficial]);

  return result;
}

function useHashState(initialValue) {
  const [hash, setHash] = useHash();

  const normalizedHash = hash.length > 0 ? hash.substr(1) : "";

  let state = useMemo(() => {
    if (normalizedHash.length > 0) {
      try {
        let params = new URLSearchParams(normalizedHash);
        return Object.fromEntries(
          [...params.entries()].map(([k, v]) => [k, JSON.parse(v)])
        );
      } catch (e) {}
    }
    return initialValue;
  }, [normalizedHash]);

  return [
    state,
    (change) => {
      let newState = { ...state, ...change };
      // setHash(encodeURIComponent(JSON.stringify(newState)));

      let params = new URLSearchParams();
      for (let [k, v] of Object.entries(newState)) {
        params.set(k, JSON.stringify(v));
      }
      setHash(params.toString());
    },
  ];
}

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
    <div className="bg-white flex gap-2 flex-col items-center py-2">
      <div className="flex gap-2">
        <label className="flex gap-1">
          Plugin type:
          <select
            value={type}
            onChange={(e) => setState({ type: e.target.value })}
            className="shadow-md bg-gradient-to-b rounded-md px-1 border-gray-400 border"
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
            onChange={(e) => setState({ filter: e.target.value })}
            className="shadow-md bg-gradient-to-b rounded-md px-1 border-gray-400 border"
          />
        </label>
        <label className="flex gap-1 items-center">
          <input
            type="checkbox"
            checked={includeOfficial}
            onChange={(e) => setState({ includeOfficial: e.target.checked })}
            className="shadow-md bg-gradient-to-b rounded-md px-1 border-gray-400 border"
          />
          Include offical Plugins
        </label>
      </div>
      <div className="w-3xl">
        {results?.hits.map((r, i) => (
          <div
            key={i}
            className="mx-auto my-4 w-full p-3 bg-white rounded-xl shadow-md gap-2 grid grid-cols-2 grid-rows-2"
          >
            <a
              className="font-bold underline"
              href={`https://www.npmjs.com/package/${r.name}`}
            >
              {r.name}
            </a>
            <div className="text-right text-gray-400">
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
