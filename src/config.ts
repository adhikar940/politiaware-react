let config: any = null;

export const loadConfig = async () => {
  if (config) return config;

  const res = await fetch('/config.json');
  if (!res.ok) throw new Error("Failed to load config");

  config = await res.json();
  return config;
};
