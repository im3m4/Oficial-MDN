// Node-only test adapter. Production still resolves the native Workers module.
import { registerHooks } from 'node:module';
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export const env = {}; export const waitUntil = () => {}; export class WorkerEntrypoint {}', shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
