import { useMemo, useEffect, useState } from "react";
import { useHash } from "react-use";

export function useSearch({ type, page, filter, includeOfficial }) {
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

export function useHashState(initialValue) {
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
