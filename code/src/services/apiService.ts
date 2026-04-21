export async function fetchElectionData(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
    }
    return await response.json();
}