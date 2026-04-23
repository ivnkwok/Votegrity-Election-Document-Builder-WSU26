const DOCS_CREATOR_BASE_URL = "https://docscreator.votegrity.net/helios";

export function buildAdministeredElectionsUrl(): string {
    return `${DOCS_CREATOR_BASE_URL}/elections/administered/raw`;
}

export function buildElectionUsersUrl(electionUuid: string): string {
    return `${DOCS_CREATOR_BASE_URL}/elections/${electionUuid}/voters/adminV2`;
}

export async function fetchElectionData(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
    }
    return await response.json();
}

export async function fetchElectionUsers(electionUuid: string): Promise<any> {
    return fetchElectionData(buildElectionUsersUrl(electionUuid));
}

export async function fetchAdministeredElectionRecords(): Promise<any> {
    return fetchElectionData(buildAdministeredElectionsUrl());
}
