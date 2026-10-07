export type Route = 'home' | 'adventures' | 'wardrobe' | 'settings' | 'dev-sprites';

const HASHES: Record<Route, string> = {
  home: '#/',
  adventures: '#/adventures',
  wardrobe: '#/wardrobe',
  settings: '#/settings',
  'dev-sprites': '#/dev/sprites',
};

export function parseRoute(hash: string): Route {
  const match = (Object.keys(HASHES) as Route[]).find((route) => HASHES[route] === hash);
  return match ?? 'home';
}

export function routeHash(route: Route): string {
  return HASHES[route];
}

export function navigate(route: Route): void {
  if (location.hash !== HASHES[route]) location.hash = HASHES[route];
}
