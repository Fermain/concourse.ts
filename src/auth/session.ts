import {
	apiUrl,
	infoUrl,
	skyIssuerTokenUrl,
	skyTokenUrl,
	teamAuthTokenUrl,
} from "../urls";

export interface BasicCredentials {
	baseUrl: string;
	username: string;
	password: string;
	teamName?: string;
}

export interface AuthState {
	accessToken: string;
	tokenType: string;
	idToken: string;
	expiresAt: number; // epoch seconds
	serverVersion: string;
}

export class AuthSession {
	private state?: AuthState;
	private inFlight: Promise<void> | null = null;

	constructor(private readonly creds: BasicCredentials) {}

	get current(): AuthState | undefined {
		return this.state;
	}

	async ensure(): Promise<void> {
		if (this.state && !isExpired(this.state.expiresAt)) return;
		if (this.inFlight) return this.inFlight;
		this.inFlight = this.authenticate().finally(() => {
			this.inFlight = null;
		});
		return this.inFlight;
	}

	private async authenticate(): Promise<void> {
		const { baseUrl, username, password, teamName } = this.creds;
		const api = apiUrl(baseUrl);

		const infoResp = await fetch(infoUrl(api));
		if (!infoResp.ok) throw new Error("Failed to fetch server info for auth");
		const info = (await infoResp.json()) as { version: string };
		const version = info.version;

		let state: AuthState;

		if (isLt(version, [4, 0, 0])) {
			const team = teamName ?? "main";
			const resp = await fetch(teamAuthTokenUrl(api, team), {
				headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
			});
			if (!resp.ok) throw new Error("Auth (pre v4) failed");
			const body = (await resp.json()) as { value: string; type: string };
			const payload = decodeJwtPayload(body.value) as { exp?: number };
			state = {
				accessToken: body.value,
				tokenType: body.type,
				idToken: body.value,
				expiresAt: payload.exp ?? nowSeconds() + 3600,
				serverVersion: version,
			};
		} else if (isLt(version, [6, 1, 0])) {
			const data = new URLSearchParams({
				grant_type: "password",
				username,
				password,
				scope: "openid+profile+email+federated:id+groups",
			});
			const resp = await fetch(skyTokenUrl(baseUrl), {
				method: "POST",
				headers: {
					Authorization: `Basic ${btoa("fly:Zmx5")}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: data.toString(),
			});
			if (!resp.ok) throw new Error("Auth (post v4) failed");
			const body = (await resp.json()) as {
				accessToken: string;
				tokenType: string;
				expiry: string;
			};
			state = {
				accessToken: body.accessToken,
				tokenType: body.tokenType,
				idToken: body.accessToken,
				expiresAt: Math.floor(new Date(body.expiry).getTime() / 1000),
				serverVersion: version,
			};
		} else {
			const data = new URLSearchParams({
				grant_type: "password",
				username,
				password,
				scope: "openid profile email federated:id groups",
			});
			const resp = await fetch(skyIssuerTokenUrl(baseUrl), {
				method: "POST",
				headers: {
					Authorization: `Basic ${btoa("fly:Zmx5")}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: data.toString(),
			});
			if (!resp.ok) throw new Error("Auth (post v6.1) failed");
			const body = (await resp.json()) as {
				idToken: string;
				accessToken: string;
				tokenType: string;
				expiresIn: number;
			};
			const dateHeader = resp.headers.get("Date");
			const serverNow = dateHeader
				? new Date(dateHeader).getTime() / 1000
				: nowSeconds();
			state = {
				accessToken: body.accessToken,
				tokenType: body.tokenType,
				idToken: body.idToken,
				expiresAt: Math.floor(serverNow + body.expiresIn),
				serverVersion: version,
			};
		}

		this.state = state;
	}
}

export function csrfFromIdToken(idToken: string): string | undefined {
	const payload = decodeJwtPayload(idToken) as { csrf?: string };
	return payload.csrf;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
	const parts = token.split(".");
	if (parts.length < 2) return {};
	const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
	try {
		const json = atob(base64);
		return JSON.parse(json);
	} catch {
		return {};
	}
}

function nowSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

function parseVersion(version: string): [number, number, number] {
	const [maj, min, patch] = version
		.split(".")
		.map((v) => Number.parseInt(v, 10) || 0);
	return [maj, min ?? 0, patch ?? 0];
}

function isLt(version: string, cmp: [number, number, number]): boolean {
	const a = parseVersion(version);
	for (let i = 0; i < 3; i++) {
		if (a[i] < cmp[i]) return true;
		if (a[i] > cmp[i]) return false;
	}
	return false;
}

function isExpired(expiresAtSeconds: number): boolean {
	const skew = 10 * 60;
	return nowSeconds() > expiresAtSeconds - skew;
}
