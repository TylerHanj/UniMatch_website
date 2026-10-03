export function buildUnisUrl({ search = "", country = "" }) {
    const endpoint = "http://universities.hipolabs.com/search";
    const url = new URL(endpoint);

    const name = search.trim();
    const countryName = country.trim();

    if (name) {
        url.searchParams.set("name", name);
    }

    if (countryName && countryName.toLowerCase() !== "all") {
        url.searchParams.set("country", countryName);
    }

    return url.toString();
}
