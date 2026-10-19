export function buildUnisUrl({ search = "", country = "" }) {
    const endpoint = "https://my-uni-proxy-inky.vercel.app/";
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
