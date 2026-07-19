const sensitive = /((?:api[_-]?key|secret|password|passwd|token|client[_-]?secret)\s*[:=]\s*["']?)([^\s"']+)/gi;
export function redactSecrets(value: string): string { return value.replace(sensitive, "$1[REDACTED]").replace(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]"); }
