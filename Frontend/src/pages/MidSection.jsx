import React, { useEffect, useMemo, useState } from "react";
import { SearchBar } from "../components/SearchBar";

// Endpoints for option lists
const API_BODY_PARTS = "https://exercisedb-api.vercel.app/api/v1/bodyparts";
const API_MUSCLES = "https://exercisedb-api.vercel.app/api/v1/muscles";
const API_EQUIPMENTS = "https://exercisedb-api.vercel.app/api/v1/equipments";

// Exercise fetchers
const GET_BY_BODYPART = (bp) =>
  `https://biofitiq.onrender.com/exercise/bybodypart/${encodeURIComponent(bp)}`;
const GET_BY_MUSCLE = (m) =>
  `https://biofitiq.onrender.com/muscle/bymuscle/${encodeURIComponent(m)}`;
const GET_BY_EQUIP = (e) =>
  `https://biofitiq.onrender.com/equipment/byequipment/${encodeURIComponent(
    e
  )}`;

export const MidSection = () => {
  // Options
  const [bodyParts, setBodyParts] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [equipments, setEquipments] = useState([]);

  // Selection
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");

  // UI state
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [error, setError] = useState("");
  const [showPanel, setShowPanel] = useState(false); // Hidden until "Get Started"

  // Cards
  const [cards, setCards] = useState([]);

  // Disable logic: only one filter active at a time
  const disableMuscle = useMemo(
    () => !!selectedBodyPart || !!selectedEquipment,
    [selectedBodyPart, selectedEquipment]
  );
  const disableBodyPart = useMemo(
    () => !!selectedMuscle || !!selectedEquipment,
    [selectedMuscle, selectedEquipment]
  );
  const disableEquipment = useMemo(
    () => !!selectedBodyPart || !!selectedMuscle,
    [selectedBodyPart, selectedMuscle]
  );

  // Load options once
  useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        setLoadingMeta(true);
        setError("");
        const [bpRes, mRes, eRes] = await Promise.all([
          fetch(API_BODY_PARTS),
          fetch(API_MUSCLES),
          fetch(API_EQUIPMENTS),
        ]);
        if (!bpRes.ok || !mRes.ok || !eRes.ok)
          throw new Error("Failed list fetch");
        const [bpJson, mJson, eJson] = await Promise.all([
          bpRes.json(),
          mRes.json(),
          eRes.json(),
        ]);
        // Your API shape: { success: true, data: [{ name: "abs" }, ...] }
        const bp = Array.isArray(bpJson?.data)
          ? bpJson.data
          : Array.isArray(bpJson)
          ? bpJson
          : [];
        const ms = Array.isArray(mJson?.data)
          ? mJson.data
          : Array.isArray(mJson)
          ? mJson
          : [];
        const eq = Array.isArray(eJson?.data)
          ? eJson.data
          : Array.isArray(eJson)
          ? eJson
          : [];
        if (!on) return;
        setBodyParts(bp);
        setMuscles(ms);
        setEquipments(eq);
      } catch {
        setError("Could not load options. Please retry.");
      } finally {
        if (on) setLoadingMeta(false);
      }
    };
    load();
    return () => {
      on = false;
    };
  }, []);

  const clearOthers = (who) => {
    if (who === "body") {
      setSelectedMuscle("");
      setSelectedEquipment("");
    } else if (who === "muscle") {
      setSelectedBodyPart("");
      setSelectedEquipment("");
    } else if (who === "equip") {
      setSelectedBodyPart("");
      setSelectedMuscle("");
    }
  };

  const canSearch = selectedBodyPart || selectedMuscle || selectedEquipment;

  const fetchCards = async () => {
    try {
      setLoadingCards(true);
      setError("");
      let url = "";
      if (selectedBodyPart) url = GET_BY_BODYPART(selectedBodyPart);
      else if (selectedMuscle) url = GET_BY_MUSCLE(selectedMuscle);
      else if (selectedEquipment) url = GET_BY_EQUIP(selectedEquipment);
      else {
        setCards([]);
        return;
      }
      console.log(url);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      console.log(data);
      const list = data?.structured_data?.exercises || [];
      setCards(list);
    } catch {
      setError("Could not fetch exercises. Try a different filter.");
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  return (
    <div className="w-full mt-20 bg-black flex justify-center items-center flex-col px-4 md:px-8">
      <p className="text-white text-4xl md:text-7xl font-extralight text-center transition-opacity duration-500 ease-out">
        Discover Targeted Exercises Instantly
      </p>
      <p className="text-white text-lg md:text-xl mt-6 md:mt-10 font-medium text-center transition-opacity duration-500 ease-out">
        - With AI-Driven Precision.
      </p>

      {/* Primary CTA only, inputs hidden until clicked */}
      {!showPanel && (
        <div className="flex justify-center items-center mt-10">
          <button
            className="text-center text-base md:text-xl font-light px-4 md:px-5 py-2 m-5 text-white border-2 rounded-3xl border-blue-300 hover:bg-blue-300/20 transition-colors"
            onClick={() => setShowPanel(true)}
          >
            Get Started
          </button>
        </div>
      )}

      {/* Revealed panel: search inputs + results */}
      {showPanel && (
        <div className="w-full max-w-5xl mt-6 animate-fade-in">
          {/* Filters container */}
          <div className="w-full bg-black/60 backdrop-blur-sm rounded-xl border border-blue-300/30 p-4 md:p-6 shadow-lg shadow-blue-300/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchBar
                id="sb-body"
                name="bodyPart"
                label="Body Part"
                placeholder="Select body part"
                options={bodyParts}
                disabled={disableBodyPart || loadingMeta}
                value={selectedBodyPart}
                onChange={(v) => {
                  setSelectedBodyPart(v);
                  if (v) clearOthers("body");
                }}
              />
              <SearchBar
                id="sb-muscle"
                name="muscle"
                label="Muscle"
                placeholder="Select muscle"
                options={muscles}
                disabled={disableMuscle || loadingMeta}
                value={selectedMuscle}
                onChange={(v) => {
                  setSelectedMuscle(v);
                  if (v) clearOthers("muscle");
                }}
              />
              <SearchBar
                id="sb-equip"
                name="equipment"
                label="Equipment"
                placeholder="Select equipment"
                options={equipments}
                disabled={disableEquipment || loadingMeta}
                value={selectedEquipment}
                onChange={(v) => {
                  setSelectedEquipment(v);
                  if (v) clearOthers("equip");
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                className="text-center text-base md:text-xl font-light px-4 md:px-5 py-2 text-white border rounded-3xl border-blue-300 hover:bg-blue-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!canSearch || loadingCards}
                onClick={fetchCards}
              >
                {loadingCards ? "Loading..." : "Show Exercises"}
              </button>
              <button
                className="text-center text-base md:text-xl font-light px-4 md:px-5 py-2 text-white/80 border rounded-3xl border-white/20 hover:bg-white/10 transition-colors"
                onClick={() => {
                  setSelectedBodyPart("");
                  setSelectedMuscle("");
                  setSelectedEquipment("");
                  setCards([]);
                  setError("");
                }}
              >
                Reset
              </button>
              <button
                className="text-center text-base md:text-xl font-light px-4 md:px-5 py-2 text-white/80 border rounded-3xl border-white/20 hover:bg-white/10 transition-colors"
                onClick={() => {
                  setShowPanel(false);
                  setSelectedBodyPart("");
                  setSelectedMuscle("");
                  setSelectedEquipment("");
                  setCards([]);
                  setError("");
                }}
              >
                Close Panel
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-500/10 text-rose-200 px-4 py-3">
                {error}
              </div>
            )}

            <p className="mt-3 text-sm text-white/60">
              Pick any one filter; others auto-disable to avoid conflicts.
            </p>
          </div>

          {/* Results */}
          {(loadingCards || cards.length > 0) && (
            <div className="w-full mt-6">
              <div className="mt-2 rounded-lg border border-blue-300/20 bg-black/40 px-4 py-3 text-white">
                <p className="text-sm">
                  Showing results for:{" "}
                  <span className="text-blue-300">
                    {selectedBodyPart ||
                      selectedMuscle ||
                      selectedEquipment ||
                      "—"}
                  </span>
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((c, idx) => (
                  <article
                    key={`${c.name}-${idx}`}
                    className="group rounded-2xl border border-white/10 bg-linear-to-b from-white/5 via-black/40 to-black/80 backdrop-blur-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-400/20 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015]"
                  >
                    {/* Image */}
                    <div className="relative aspect-4/3 overflow-hidden">
                      <img
                        src={c.gifImage}
                        alt={c.name}
                        className="h-full w-full object-cover transform group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />

                      {/* Level Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 border border-blue-300/30 text-blue-200 backdrop-blur-md shadow-sm">
                        {c.level}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-white text-xl font-semibold tracking-wide">
                        {c.name}
                      </h3>

                      {/* Divider line */}
                      <div className="mt-3 h-px w-full bg-white/10"></div>

                      {/* Pros, Mistakes, Warnings */}
                      <div className="mt-4 space-y-3">
                        {/* Pros */}
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 hover:bg-emerald-500/20 transition-colors">
                          <p className="text-emerald-300 text-sm font-medium">
                            Pros
                          </p>
                          <ul className="list-disc pl-5 text-white/80 text-sm mt-1 space-y-1">
                            {(c.pros || []).slice(0, 3).map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Mistakes */}
                        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 hover:bg-amber-500/20 transition-colors">
                          <p className="text-amber-300 text-sm font-medium">
                            Common Mistakes
                          </p>
                          <ul className="list-disc pl-5 text-white/80 text-sm mt-1 space-y-1">
                            {(c.CommonMistakes || [])
                              .slice(0, 2)
                              .map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                          </ul>
                        </div>

                        {/* Warnings */}
                        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 hover:bg-rose-500/20 transition-colors">
                          <p className="text-rose-300 text-sm font-medium">
                            Warnings
                          </p>
                          <ul className="list-disc pl-5 text-white/80 text-sm mt-1 space-y-1">
                            {(c.Warnings || []).slice(0, 2).map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Directions Preview */}
                      <div className="mt-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                          {(c.directions || []).slice(0, 3).join(" • ")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {!loadingCards && cards.length === 0 && !error && (
                <div className="mt-6 rounded-lg border border-white/10 bg-black/50 px-4 py-6 text-center text-white/70">
                  No exercises found. Try another filter.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subtle fade keyframes */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        .animate-fade-in { animation: fade-in 400ms ease-out both; }
      `}</style>
    </div>
  );
};
