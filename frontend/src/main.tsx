import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Sparkles,
  Plus,
  ArrowUpRight,
  Layers3,
  Bookmark,
  Shirt,
  ChevronDown,
  Check,
  X,
  SlidersHorizontal,
  Search,
  ArrowRight,
  LogOut,
  Heart,
  Menu,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import "./style.css";
import { resolveApiUrl, requestJson } from "./api";
import { validTheme, resolvedTheme, type Theme } from "./theme";
type Category = "tops" | "pants" | "shoes" | "jackets";
type Cloth = {
  id: string;
  name: string;
  category: Category;
  color: string;
  texture: string;
  style: string;
  image?: string;
};
type Look = {
  id?: string;
  name?: string;
  items: Cloth[];
  style: string;
  score?: number;
  breakdown?: Record<string, number>;
};
type Wardrobe = { id: string; name: string };
const rawApi = (import.meta as unknown as { env: Record<string, string> }).env
  .VITE_API_URL;
// Configuration validation happens per request so an invalid URL cannot crash the UI.
const API = (rawApi?.trim() || "/api").replace(/\/+$/, "");
const styles = ["Everyday", "Minimal", "Smart casual", "Streetwear", "Evening"];
const seed: Cloth[] = [
  ["1", "The everyday tee", "tops", "#e9e5dc", "cotton"],
  ["2", "Relaxed Oxford", "tops", "#aab6ae", "cotton"],
  ["3", "Straight-leg denim", "pants", "#506778", "denim"],
  ["4", "Tailored trousers", "pants", "#817864", "linen"],
  ["5", "Classic court sneakers", "shoes", "#e8e4dc", "leather"],
  ["6", "Suede loafers", "shoes", "#886448", "leather"],
  ["7", "The chore jacket", "jackets", "#8b927a", "cotton"],
  ["8", "Soft knit cardigan", "jackets", "#b8a18a", "knit"],
].map(([id, name, category, color, texture]) => ({
  id,
  name,
  category: category as Category,
  color,
  texture,
  style: "Everyday",
}));
function Garment({ item }: { item: Cloth }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true,
      object = "";
    if (item.image) {
      fetch(`${API}/images/${item.image}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("atelier-token")}`,
        },
      })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.blob();
        })
        .then((b) => {
          object = URL.createObjectURL(b);
          if (active) setUrl(object);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
      if (object) URL.revokeObjectURL(object);
    };
  }, [item.image]);
  if (item.image)
    return url ? (
      <img src={url} alt={item.name} />
    ) : (
      <span>Loading image…</span>
    );
  const shape =
    item.category === "tops" ? (
      <>
        <path d="M64 34 88 24 Q110 42 132 24 L156 34 185 73 157 94 145 76 145 180 75 180 75 76 63 94 35 73Z" />
        <path
          d="M88 24Q110 57 132 24"
          fill="none"
          stroke="#666"
          opacity=".25"
        />
      </>
    ) : item.category === "pants" ? (
      <>
        <path d="M72 26H148L158 184H116L110 96 104 184H62Z" />
        <path
          d="M72 42H148M110 42V88M77 44Q78 64 64 68M143 44Q142 64 153 68"
          fill="none"
          stroke="#fff"
          opacity=".25"
        />
      </>
    ) : item.category === "shoes" ? (
      <>
        <path d="M37 91 56 69 77 86 129 94 155 109Q185 110 184 133H40Q23 116 37 91Z" />
        <path d="M47 143H178V154H47Z" fill="#d4d0c7" />
        <path
          d="M85 87 76 106M102 91 94 109M117 95 111 111"
          stroke="#fff"
          strokeWidth="5"
        />
        <path
          d="M54 55 74 37 94 51 145 59 173 75Q198 81 196 97L135 96 77 83Z"
          opacity=".65"
        />
      </>
    ) : (
      <>
        <path d="M77 29 95 23H125L143 29 176 59 185 168 154 174 142 75 145 189H75L78 75 66 174 35 168 44 59Z" />
        <path
          d="M95 23 110 51 125 23M110 51V189M84 92H101V119H84M119 92H136V119H119"
          fill="none"
          stroke="#fff"
          opacity=".35"
        />
        {[66, 91, 116, 141, 166].map((y) => (
          <circle key={y} cx="111" cy={y} r="2" fill="#555" />
        ))}
      </>
    );
  return (
    <svg
      viewBox="0 0 220 210"
      role="img"
      aria-label={`${item.name}, sample illustration`}
    >
      <defs>
        <filter id={`shadow${item.id}`}>
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".13" />
        </filter>
        <linearGradient id={`fabric${item.id}`} x1="0" x2="1">
          <stop stopColor={item.color} />
          <stop offset=".5" stopColor={item.color} />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <g fill={`url(#fabric${item.id})`} filter={`url(#shadow${item.id})`}>
        {shape}
      </g>
    </svg>
  );
}
function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    validTheme(localStorage.getItem("atelier-theme")),
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = resolvedTheme(
        theme,
        media.matches,
      );
      document.documentElement.style.colorScheme = resolvedTheme(
        theme,
        media.matches,
      );
    };
    apply();
    localStorage.setItem("atelier-theme", theme);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const [token, setToken] = useState(
    sessionStorage.getItem("atelier-token") || "",
  );
  const demo = !token;
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([
    { id: "demo", name: "Everyday essentials" },
    { id: "travel", name: "Weekend getaway" },
  ]);
  const [wid, setWid] = useState("demo");
  const [clothes, setClothes] = useState<Cloth[]>(seed);
  const [looks, setLooks] = useState<Look[]>([]);
  const [saved, setSaved] = useState<Look[]>(() =>
    JSON.parse(localStorage.getItem("atelier-saved-demo") || "[]"),
  );
  const [view, setView] = useState("studio");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("Everyday");
  const [harmony, setHarmony] = useState("balanced");
  const [jacket, setJacket] = useState(true);
  const [anchor, setAnchor] = useState("");
  const [modal, setModal] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);
  const [register, setRegister] = useState(false);
  async function request(path: string, method = "GET", body?: unknown) {
    const base = resolveApiUrl(rawApi);
    return requestJson(base + path, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
  }
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (demo) return;
    let active = true;
    request("/wardrobes")
      .then((ws) => {
        if (active) {
          setWardrobes(ws);
          setWid(ws[0]?.id || "");
          setClothes([]);
          setSaved([]);
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [token]);
  useEffect(() => {
    setAnchor("");
    setLooks([]);
    if (demo) {
      setSaved(
        JSON.parse(localStorage.getItem(`atelier-saved-${wid}`) || "[]"),
      );
      setClothes(
        wid === "travel"
          ? seed.filter((c) => ["2", "4", "6", "8"].includes(c.id))
          : seed,
      );
      return;
    }
    if (!wid) return;
    let active = true;
    Promise.all([
      request(`/wardrobes/${wid}/clothes`),
      request(`/wardrobes/${wid}/outfits`),
    ])
      .then(([c, o]) => {
        if (active) {
          setClothes(c);
          setSaved(o);
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [wid, token]);
  useEffect(() => {
    if (!modal) return;
    const prior = document.activeElement as HTMLElement;
    const dialog = document.querySelector("dialog");
    dialog?.showModal();
    (dialog?.querySelector("input,button,select") as HTMLElement)?.focus();
    return () => {
      dialog?.close();
      prior?.focus();
    };
  }, [modal]);
  async function generate() {
    setBusy(true);
    setError("");
    try {
      if (demo) {
        const pool = (c: Category) => clothes.filter((x) => x.category === c);
        const out: Look[] = [];
        for (const top of pool("tops"))
          for (const pants of pool("pants"))
            for (const shoes of pool("shoes")) {
              const items = [
                top,
                pants,
                shoes,
                ...(jacket
                  ? pool("jackets").slice(out.length % 2, (out.length % 2) + 1)
                  : []),
              ];
              if (!anchor || items.some((x) => x.id === anchor))
                out.push({ items, style });
            }
        setLooks(out.slice(0, 4));
      } else
        setLooks(
          await request(`/wardrobes/${wid}/generate`, "POST", {
            style,
            harmony,
            include_jacket: jacket,
            anchor_id: anchor || null,
          }),
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(look: Look) {
    setError("");
    try {
      if (isSaved(look)) {
        setNotice("This outfit is already saved");
        return;
      }
      const name = `${look.style} / ${saved.length + 1}`;
      if (demo) {
        const next = [...saved, { ...look, id: crypto.randomUUID(), name }];
        setSaved(next);
        localStorage.setItem(`atelier-saved-${wid}`, JSON.stringify(next));
      } else {
        await request(`/wardrobes/${wid}/outfits`, "POST", {
          name,
          style: look.style,
          cloth_ids: look.items.map((x) => x.id),
        });
        setSaved(await request(`/wardrobes/${wid}/outfits`));
      }
      setNotice("Outfit saved to your collection");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function isSaved(look: Look) {
    return saved.some(
      (x) =>
        x.items
          .map((c) => c.id)
          .sort()
          .join() ===
        look.items
          .map((c) => c.id)
          .sort()
          .join(),
    );
  }
  async function remove(look: Look) {
    try {
      if (!demo)
        await request(`/wardrobes/${wid}/outfits/${look.id}`, "DELETE");
      const next = saved.filter((x) => x.id !== look.id);
      setSaved(next);
      if (demo)
        localStorage.setItem(`atelier-saved-${wid}`, JSON.stringify(next));
      setNotice("Outfit removed");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      if (modal === "auth") {
        const result = await request(
          register ? "/auth/register" : "/auth/login",
          "POST",
          { email: f.get("email"), password: f.get("password") },
        );
        sessionStorage.setItem("atelier-token", result.token);
        setToken(result.token);
      } else if (modal === "wardrobe") {
        const w = await request("/wardrobes", "POST", { name: f.get("name") });
        setWardrobes([...wardrobes, w]);
        setWid(w.id);
      } else {
        await request(`/wardrobes/${wid}/clothes`, "POST", f);
        setClothes(await request(`/wardrobes/${wid}/clothes`));
        setNotice("New piece added to your wardrobe");
      }
      setModal("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const visible = clothes.filter(
    (c) =>
      (category === "all" || category === c.category) &&
      c.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("studio");
          }}
        >
          <span className="brandmark">a</span>atelier
          <span className="brand-dot">.</span>
        </a>
        <div className="nav-label">YOUR PERSONAL STYLING SPACE</div>
        <nav>
          {[
            ["studio", "Outfit studio", Sparkles],
            ["wardrobe", "My wardrobe", Shirt],
            ["saved", "Saved outfits", Bookmark],
          ].map(([key, label, Icon]) => {
            const I = Icon as typeof Shirt;
            return (
              <button
                className={view === key ? "nav-item selected" : "nav-item"}
                key={key as string}
                onClick={() => {
                  setView(key as string);
                  setMobile(false);
                }}
              >
                <I size={19} />
                {label as string}
                {key === "saved" && (
                  <span className="count">{saved.length}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="wardrobe-label">
          MY WARDROBES{" "}
          <button
            aria-label="Create wardrobe"
            onClick={() => setModal(demo ? "auth" : "wardrobe")}
          >
            <Plus size={16} />
          </button>
        </div>
        {wardrobes.map((w) => (
          <button
            key={w.id}
            className={`wardrobe-nav ${wid === w.id ? "current" : ""}`}
            onClick={() => setWid(w.id)}
          >
            <span className="tiny-square" />
            {w.name}
            {wid === w.id && <Check size={14} />}
          </button>
        ))}
        <div className="side-tip">
          <div className="tip-icon">
            <Layers3 size={20} />
          </div>
          <h3>
            Less guessing.
            <br />
            More getting dressed.
          </h3>
          <p>A fresh perspective on the pieces you already love.</p>
        </div>
        <button
          className="profile"
          onClick={() => {
            if (demo) setModal("auth");
            else {
              sessionStorage.removeItem("atelier-token");
              setToken("");
              setWardrobes([
                { id: "demo", name: "Everyday essentials" },
                { id: "travel", name: "Weekend getaway" },
              ]);
              setWid("demo");
              setSaved(
                JSON.parse(localStorage.getItem("atelier-saved-demo") || "[]"),
              );
            }
          }}
        >
          <span className="avatar">{demo ? "A" : "You"}</span>
          <span>
            {demo ? "Your styling space" : "My account"}
            <small>{demo ? "Sample wardrobe · Sign in" : "Sign out"}</small>
          </span>
          {demo ? <ArrowUpRight size={16} /> : <LogOut size={16} />}
        </button>
      </aside>
      <main>
        <header>
          <button
            className="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <span className="breadcrumb">
            Your space <span>/</span>{" "}
            {view === "studio"
              ? "Outfit studio"
              : view === "saved"
                ? "Saved outfits"
                : "My wardrobe"}
          </span>
          <span className="header-right">
            <label className="theme-picker">
              {theme === "dark" ? (
                <Moon size={15} />
              ) : theme === "light" ? (
                <Sun size={15} />
              ) : (
                <Monitor size={15} />
              )}
              <select
                aria-label="Appearance"
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <span className="status-dot" />
            {demo ? "Explore sample wardrobe" : "Personal wardrobe"}
            <button
              className="icon-button"
              aria-label="Sign in or manage account"
              onClick={() => setModal("auth")}
            >
              <span className="mini-avatar">A</span>
            </button>
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">A LITTLE INSPIRATION, EVERY DAY</div>
              <h1>
                {view === "studio"
                  ? "Good outfits start here."
                  : view === "wardrobe"
                    ? "Meet your wardrobe."
                    : "Looks worth keeping."}
              </h1>
              <p>
                {view === "studio"
                  ? "Your clothes. New combinations. A style that feels like you."
                  : view === "wardrobe"
                    ? "A home for every piece, and the possibilities between them."
                    : "Your favorite combinations, ready when you are."}
              </p>
            </div>
            <button
              className="button white"
              onClick={() =>
                setModal(demo ? "auth" : wid ? "upload" : "wardrobe")
              }
            >
              <Plus size={17} /> Add a piece
            </button>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {view === "studio" && (
            <section className="studio-panel">
              <div className="studio-intro">
                <span className="small-label">
                  <Sparkles size={15} /> THE OUTFIT STUDIO
                </span>
                <h2>
                  Make the most
                  <br />
                  of what you own.
                </h2>
                <p>
                  Pick a mood. We’ll find the pieces
                  <br />
                  that come together effortlessly.
                </p>
                <div className="palette">
                  <i style={{ background: "#7e8c70" }} />
                  <i style={{ background: "#c1b295" }} />
                  <i style={{ background: "#566675" }} />
                  <i style={{ background: "#eee8da" }} />
                  <span>A wardrobe of possibilities</span>
                </div>
              </div>
              <div className="studio-controls">
                <div className="control-header">
                  <h3>What’s your mood today?</h3>
                  <span>01 / MAKE IT YOURS</span>
                </div>
                <div className="style-buttons">
                  {styles.map((x) => (
                    <button
                      className={style === x ? "active" : ""}
                      onClick={() => setStyle(x)}
                      key={x}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <div className="select-row">
                  <label>
                    Color direction
                    <select
                      value={harmony}
                      onChange={(e) => setHarmony(e.target.value)}
                    >
                      <option value="balanced">A balanced palette</option>
                      <option value="tonal">Soft & tonal</option>
                      <option value="contrast">A little contrast</option>
                    </select>
                  </label>
                  <label>
                    Start with a piece
                    <select
                      value={anchor}
                      onChange={(e) => setAnchor(e.target.value)}
                    >
                      <option value="">Surprise me</option>
                      {clothes
                        .filter((c) => jacket || c.category !== "jackets")
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <div className="generate-row">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={jacket}
                      onChange={(e) => {
                        setJacket(e.target.checked);
                        if (
                          !e.target.checked &&
                          clothes.find((c) => c.id === anchor)?.category ===
                            "jackets"
                        )
                          setAnchor("");
                      }}
                    />
                    <span className="toggle" />
                    Include a layer
                  </label>
                  <button
                    className="button primary"
                    disabled={busy || !wid}
                    onClick={generate}
                  >
                    <Sparkles size={17} />
                    {busy ? "Finding your outfits…" : "Create my outfits"}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </section>
          )}
          {view === "studio" && looks.length > 0 && (
            <section className="looks-section">
              <div className="section-heading">
                <div>
                  <h2>Your next great outfit</h2>
                  <p>
                    {demo
                      ? "Sample combinations · Sign in to match your uploaded pieces"
                      : "Combinations from your wardrobe"}
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={generate}
                  disabled={busy}
                >
                  Refresh looks <Sparkles size={15} />
                </button>
              </div>
              <div className="look-grid">
                {looks.map((look, i) => (
                  <article className="look-card" key={i}>
                    <div className="look-art">
                      {look.items.map((c) => (
                        <div key={c.id}>
                          <Garment item={c} />
                        </div>
                      ))}
                    </div>
                    <div className="look-info">
                      <div>
                        <span className="small-label">
                          {look.style.toUpperCase()}
                        </span>
                        <h3>
                          {
                            [
                              "An easy kind of day",
                              "Quiet confidence",
                              "A fresh perspective",
                              "Your everyday, elevated",
                            ][i]
                          }
                        </h3>
                        {look.score !== undefined && (
                          <p>
                            {look.score} / 100 compatibility · heuristic score
                          </p>
                        )}
                      </div>
                      <button
                        className={`save-button ${isSaved(look) ? "is-saved" : ""}`}
                        aria-label="Save outfit"
                        onClick={() => save(look)}
                      >
                        {isSaved(look) ? (
                          <Check size={18} />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    </div>
                    <div className="look-names">
                      {look.items.map((c) => c.name).join(" · ")}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
          {view !== "saved" && (
            <section className="wardrobe-section">
              <div className="section-heading">
                <div>
                  <h2>
                    {view === "studio"
                      ? "Your wardrobe, at a glance"
                      : "All your favorite pieces"}{" "}
                    <span>{clothes.length} pieces</span>
                  </h2>
                  <p>
                    {wardrobes.find((w) => w.id === wid)?.name ||
                      "Create your first wardrobe"}
                    {demo ? " · Illustrated sample pieces" : ""}
                  </p>
                </div>
                {view === "studio" ? (
                  <button
                    className="text-button"
                    onClick={() => setView("wardrobe")}
                  >
                    View wardrobe <ArrowUpRight size={17} />
                  </button>
                ) : (
                  <label className="search">
                    <Search size={15} />
                    <input
                      aria-label="Search clothes"
                      placeholder="Find a piece…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                )}
              </div>
              <div className="filter-bar">
                <div className="category-tabs">
                  {["all", "tops", "pants", "shoes", "jackets"].map((c) => (
                    <button
                      className={category === c ? "active" : ""}
                      key={c}
                      onClick={() => setCategory(c)}
                    >
                      {c === "all"
                        ? "All pieces"
                        : c[0].toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
                <span className="filter-caption">
                  <SlidersHorizontal size={15} /> Curated by you
                </span>
              </div>
              <div className="clothes-grid">
                {visible.map((c) => (
                  <button
                    className={`cloth-card ${anchor === c.id ? "anchored" : ""}`}
                    key={c.id}
                    onClick={() => {
                      setAnchor(anchor === c.id ? "" : c.id);
                      setView("studio");
                      setNotice(
                        anchor === c.id
                          ? "Starting piece cleared"
                          : `${c.name} selected as your starting piece`,
                      );
                    }}
                  >
                    <div className="cloth-art">
                      <Garment item={c} />
                      <span className="cloth-hover">
                        {anchor === c.id ? (
                          <Check size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </span>
                    </div>
                    <div className="cloth-info">
                      <h3>{c.name}</h3>
                      <div>
                        <span>
                          {c.texture[0].toUpperCase() + c.texture.slice(1)} ·{" "}
                          {c.category}
                        </span>
                        <i style={{ background: c.color }} />
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  className="add-card"
                  onClick={() =>
                    setModal(demo ? "auth" : wid ? "upload" : "wardrobe")
                  }
                >
                  <span>
                    <Plus size={23} />
                  </span>
                  <h3>A little room for more</h3>
                  <p>Add a piece you love</p>
                </button>
              </div>
            </section>
          )}
          {view === "saved" && (
            <section className="saved-section">
              {!saved.length ? (
                <div className="empty">
                  <Bookmark size={35} />
                  <h2>Your collection starts with a look.</h2>
                  <p>
                    Create an outfit, then save your favorite combinations here.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => setView("studio")}
                  >
                    Explore the studio <ArrowRight size={17} />
                  </button>
                </div>
              ) : (
                <div className="look-grid">
                  {saved.map((l) => (
                    <article className="look-card" key={l.id}>
                      <div className="look-art">
                        {l.items.map((c) => (
                          <div key={c.id}>
                            <Garment item={c} />
                          </div>
                        ))}
                      </div>
                      <div className="look-info">
                        <div>
                          <span className="small-label">{l.style}</span>
                          <h3>{l.name}</h3>
                        </div>
                        <button
                          className="save-button"
                          aria-label="Remove saved outfit"
                          onClick={() => remove(l)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="look-names">
                        {l.items.map((c) => c.name).join(" · ")}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
          <footer>
            <span className="footer-spark">
              <Sparkles size={14} /> A little less effort. A little more you.
            </span>
            <span>Made for your everyday.</span>
          </footer>
        </div>
      </main>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
      {modal && (
        <dialog
          onCancel={() => {
            setModal("");
            setError("");
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal("");
          }}
        >
          <form onSubmit={submit}>
            <button
              type="button"
              className="close"
              aria-label="Close dialog"
              onClick={() => {
                setModal("");
                setError("");
              }}
            >
              <X size={20} />
            </button>
            <span className="small-label">YOUR ATELIER</span>
            <h2>
              {modal === "auth"
                ? register
                  ? "Make room for your style."
                  : "Welcome to your wardrobe."
                : modal === "wardrobe"
                  ? "A wardrobe for every mood."
                  : "Add something you love."}
            </h2>
            <p>
              {modal === "auth"
                ? "Your account is handled by the Python API, with Supabase storing the database. Keep the backend running while you sign in."
                : modal === "wardrobe"
                  ? "Give this collection a name."
                  : "Use a clear photo of one garment. Confirm its color and fabric."}
            </p>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            {modal === "auth" ? (
              <>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    minLength={10}
                    maxLength={128}
                    required
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                  />
                </label>
                <small>At least 10 characters</small>
              </>
            ) : (
              <label>
                {" "}
                {modal === "wardrobe" ? "Wardrobe name" : "Piece name"}
                <input
                  name="name"
                  required
                  maxLength={80}
                  placeholder={
                    modal === "wardrobe"
                      ? "Summer in the city"
                      : "Relaxed linen shirt"
                  }
                />
              </label>
            )}
            {modal === "upload" && (
              <>
                <label className="upload-input">
                  Photo
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                  />
                  <small>JPG, PNG or WebP · up to 10 MB</small>
                </label>
                <div className="select-row">
                  <label>
                    Category
                    <select name="category">
                      {["tops", "pants", "shoes", "jackets"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Texture
                    <select name="texture">
                      {[
                        "cotton",
                        "denim",
                        "knit",
                        "leather",
                        "linen",
                        "silk",
                        "other",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="select-row">
                  <label>
                    Style
                    <select name="style">
                      {styles.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Main garment color
                    <input type="color" name="color" defaultValue="#8b927a" />
                  </label>
                </div>
              </>
            )}
            <button className="button primary wide" disabled={busy}>
              {busy
                ? "Please wait…"
                : modal === "auth"
                  ? register
                    ? "Create account"
                    : "Sign in"
                  : modal === "wardrobe"
                    ? "Create wardrobe"
                    : "Add to wardrobe"}
              <ArrowRight size={17} />
            </button>
            {modal === "auth" && (
              <button
                className="text-button auth-switch"
                type="button"
                onClick={() => setRegister(!register)}
              >
                {register
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
            )}
          </form>
        </dialog>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
