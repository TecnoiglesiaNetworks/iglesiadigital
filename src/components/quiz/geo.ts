// Datos de países y ciudades (dataset offline `country-state-city`).
// Se cargan de forma diferida para no pesar la carga inicial del sitio.

export type CountryOpt = { iso: string; name: string; flag: string; dial: string };

// Nombres en español para los países más relevantes de la audiencia.
const ES_NAMES: Record<string, string> = {
  MX: "México", US: "Estados Unidos", ES: "España", AR: "Argentina", CO: "Colombia",
  PE: "Perú", CL: "Chile", EC: "Ecuador", VE: "Venezuela", GT: "Guatemala", CU: "Cuba",
  BO: "Bolivia", DO: "República Dominicana", HN: "Honduras", PY: "Paraguay",
  SV: "El Salvador", NI: "Nicaragua", CR: "Costa Rica", PA: "Panamá", UY: "Uruguay",
  PR: "Puerto Rico", BR: "Brasil", CA: "Canadá", GB: "Reino Unido", FR: "Francia",
  DE: "Alemania", IT: "Italia", PT: "Portugal",
};

// Orden preferente: LatAm y países cercanos a la audiencia primero.
const PRIORITY = [
  "MX", "US", "CO", "AR", "PE", "CL", "EC", "VE", "GT", "ES",
  "DO", "BO", "HN", "PY", "SV", "NI", "CR", "PA", "UY", "CU", "PR", "BR",
];

let _countries: CountryOpt[] | null = null;

export async function loadCountries(): Promise<CountryOpt[]> {
  if (_countries) return _countries;
  const { Country } = await import("country-state-city");
  const all = Country.getAllCountries().map<CountryOpt>((c) => ({
    iso: c.isoCode,
    name: ES_NAMES[c.isoCode] || c.name,
    flag: c.flag,
    dial: (c.phonecode || "").replace(/[^0-9]/g, ""),
  }));
  const prio = PRIORITY.map((iso) => all.find((c) => c.iso === iso)).filter(Boolean) as CountryOpt[];
  const rest = all
    .filter((c) => !PRIORITY.includes(c.iso))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  _countries = [...prio, ...rest];
  return _countries;
}

const _cityCache: Record<string, string[]> = {};

// El dataset incluye colonias, secciones, ejidos y localidades diminutas que
// parecen direcciones. Filtramos ese ruido para dejar nombres de lugares reales.
const CITY_NOISE = /(secci[oó]n|fracci[oó]n|ampliaci[oó]n|\bejido\b|kil[oó]metro|\bkm\b|manzana|\bmz\b|rancher[ií]a|\blote\b)/i;

export async function loadCities(iso: string): Promise<string[]> {
  if (_cityCache[iso]) return _cityCache[iso];
  const { City } = await import("country-state-city");
  const list = City.getCitiesOfCountry(iso) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of list) {
    const name = c.name.trim();
    // Descartamos nombres que empiezan con número o que parecen direcciones.
    if (/^\d/.test(name) || CITY_NOISE.test(name)) continue;
    if (!seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  out.sort((a, b) => a.localeCompare(b, "es"));
  _cityCache[iso] = out;
  return out;
}
