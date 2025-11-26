import { ctf } from "./commands/ctf.js";
import { help } from "./commands/help.js";
import { InteractionType, InteractionResponseType } from "discord-api-types/v10";

// Map commands for easy lookup
const commands = new Map();
commands.set(ctf.data.name, ctf);
commands.set(help.data.name, help);

export interface Env {
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APPLICATION_ID: string;
	DISCORD_TOKEN: string;
}

// --- NATIVE VERIFICATION (No discord-interactions dependency) ---
async function verifyDiscordRequest(request: Request, env: Env) {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();

	if (!signature || !timestamp) {
		return { isValid: false, interaction: null };
	}

	const hexKey = env.DISCORD_PUBLIC_KEY;

	// Convert hex key to binary
	const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

	// Import the key for verification
	const key = await crypto.subtle.importKey(
		'raw',
		keyBytes,
		{ name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
		false,
		['verify']
	);

	const encoder = new TextEncoder();
	const data = encoder.encode(timestamp + body);
	const signatureData = new Uint8Array(signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

	const isValid = await crypto.subtle.verify(
		'NODE-ED25519',
		key,
		signatureData,
		data
	);

	return { isValid, interaction: JSON.parse(body) };
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// 1. Verify the request comes from Discord
		if (request.method === "POST") {
			const { isValid, interaction } = await verifyDiscordRequest(request, env);

			if (!isValid || !interaction) {
				return new Response("Bad request signature", { status: 401 });
			}

			// 2. Handle Interaction Types
			if (interaction.type === InteractionType.Ping) {
				// Discord ping (health check)
				return new Response(JSON.stringify({ type: InteractionResponseType.Pong }), {
					headers: { "Content-Type": "application/json" },
				});
			}

			if (interaction.type === InteractionType.ApplicationCommand) {
				// Slash Command
				const commandName = interaction.data.name;
				const command = commands.get(commandName);

				if (command) {
					try {
						const responseData = await command.execute(interaction);
						return new Response(JSON.stringify(responseData), {
							headers: { "Content-Type": "application/json" },
						});
					} catch (err) {
						console.error(err);
						return new Response(
							JSON.stringify({
								type: InteractionResponseType.ChannelMessageWithSource,
								data: {
									content: "An error occurred while executing the command.",
									flags: 64, // Ephemeral
								},
							}),
							{ headers: { "Content-Type": "application/json" } }
						);
					}
				}
			}
		}

		return new Response("Not Found", { status: 404 });
	},
};
