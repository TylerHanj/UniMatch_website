export function buildUnisUrl({
                                 search = "",
                                 country = "",
                             }) {
    const endpoint = "http://universities.hipolabs.com/search";
    const url = new URL(endpoint);

    if (search.trim()) {
        url.searchParams.set("name", search.trim());
    }

    if (country.trim() != 'all') {
        url.searchParams.set("country", country.trim());
    }

    return url.toString();
}