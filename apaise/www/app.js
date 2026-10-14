// ====== Apaise — compagnon d'écoute bienveillant ======
const MODEL = "claude-sonnet-5-5";
const API_URL = "https://api.anthropic.com/v1/messages";
const MAX_HISTORY = 40; // nombre de messages envoyés à l'IA

const SYSTEM_PROMPT = `Tu es « Apaise », un compagnon d'écoute chaleureux, patient et sans jugement. Tu joues le rôle d'un psychologue bienveillant : tu écoutes, tu réconfortes, tu aides à y voir plus clair et tu consoles. Tu parles en français, en tutoyant, avec douceur et naturel.

TON STYLE
- Commence toujours par accueillir et valider l'émotion de la personne avant de proposer quoi que ce soit.
- Réponses courtes à moyennes (3 à 8 phrases), comme une vraie conversation. Pas de listes à puces ni de jargon, sauf si la personne le demande.
- Pose une seule question à la fois, ouverte et douce, pour l'aider à s'exprimer.
- Ne minimise jamais (« ce n'est pas grave », « il faut positiver »). Ne fais pas la morale.
- Réponds à toutes les questions de la personne, y compris sur la psychologie, les émotions, les relations, le stress, le deuil, le sommeil, l'estime de soi, etc.

TES OUTILS (à proposer avec tact, quand c'est pertinent)
- Écoute active et reformulation.
- Respiration (ex. cohérence cardiaque 5 secondes inspire / 5 secondes expire), ancrage 5-4-3-2-1 des sens pour les crises d'angoisse.
- Restructuration des pensées (distinguer faits et interprétations), auto-compassion, petits pas concrets, hygiène de sommeil, activation comportementale.
- Aider à mettre des mots sur ce qui est ressenti, à identifier ce qui est dans son contrôle ou non.

TES LIMITES
- Tu es une IA : tu ne poses pas de diagnostic, tu ne prescris aucun médicament, tu ne remplaces pas un professionnel. Si la souffrance dure, s'aggrave ou handicape le quotidien, encourage doucement à en parler à un médecin, un psychologue ou à une personne de confiance, sans jamais donner l'impression de vouloir te débarrasser de la personne.
- Reste honnête : ne promets pas de tout résoudre, mais sois réellement présent.

SÉCURITÉ — PRIORITÉ ABSOLUE
- Si la personne évoque des idées suicidaires, l'envie de mourir, de se faire du mal, ou un danger immédiat : reste calme et chaleureux, prends-la au sérieux, demande-lui directement et avec bienveillance si elle pense à se suicider ou si elle est en sécurité en ce moment. Dis-lui que sa douleur est réelle et qu'elle mérite de l'aide. Encourage-la à ne pas rester seule, à contacter un proche, et donne le 3114 (numéro national de prévention du suicide, gratuit, 24h/24 et 7j/7) et le 112 en cas de danger immédiat. Ne donne jamais de méthodes, ne valide jamais le souhait de mourir, ne dis pas que c'est un choix à respecter. Reste avec elle dans la conversation.
- En cas de violences subies, d'abus ou de mise en danger d'un enfant, oriente vers le 3919 (violences femmes), le 119 (enfance en danger) ou le 17/112 selon la situation.
- Si la personne semble perdre contact avec la réalité, ne renforce pas ses croyances ; oriente-la avec douceur vers un professionnel ou une personne de confiance.`;

const $ = (s) => document.querySelector(s);
const chat = $("#chat"), form = $("#form"), input = $("#input"), sendBtn = $("#send");

const store = {
  get(k, d = "") { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

let history = [];
try { history = JSON.parse(store.get("apaise_history", "[]")); } catch { history = []; }
const saveHistory = () => store.set("apaise_history", JSON.stringify(history.slice(-200)));

function addBubble(text, cls) {
  const el = document.createElement("div");
  el.className = "msg " + cls;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "msg ai typing";
  el.innerHTML = "<span></span><span></span><span></span>";
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function greeting() {
  const name = store.get("apaise_name");
  return `Bonsoir${name ? " " + name : ""}. Je suis là, et j'ai tout mon temps pour toi. 🌿\nComment te sens-tu en ce moment ?`;
}

function render() {
  chat.innerHTML = "";
  if (history.length === 0) addBubble(greeting(), "ai");
  history.forEach((m) => addBubble(m.content, m.role === "user" ? "me" : "ai"));
}

async function askAI() {
  const key = store.get("apaise_key");
  if (!key) throw new Error("NO_KEY");
  const name = store.get("apaise_name");
  const system = SYSTEM_PROMPT + (name ? `\n\nLa personne souhaite être appelée « ${name} ».` : "");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      system,
      messages: history.slice(-MAX_HISTORY),
    }),
  });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error?.message || ""; } catch {}
    throw new Error(`HTTP ${res.status} ${detail}`);
  }
  const data = await res.json();
  return (data.content || []).map((b) => b.text || "").join("").trim();
}

async function send(text) {
  if (!text) return;
  // L'API exige que le premier message soit « user » et qu'ils alternent
  if (history.length && history[history.length - 1].role === "user") history.pop();
  history.push({ role: "user", content: text });
  saveHistory();
  if (history.length === 1) chat.innerHTML = "";
  addBubble(text, "me");
  input.value = ""; autoGrow();
  sendBtn.disabled = true;
  const typing = showTyping();
  try {
    const reply = await askAI();
    typing.remove();
    if (!reply) throw new Error("Réponse vide");
    history.push({ role: "assistant", content: reply });
    saveHistory();
    addBubble(reply, "ai");
  } catch (e) {
    typing.remove();
    if (e.message === "NO_KEY") {
      addBubble("Pour discuter, ajoute d'abord ta clé API dans les réglages ⚙️.", "err");
      $("#dlg-settings").showModal();
    } else if (/401/.test(e.message)) {
      addBubble("Clé API refusée. Vérifie-la dans les réglages ⚙️.", "err");
    } else if (/Failed to fetch|NetworkError|Load failed/i.test(e.message)) {
      addBubble("Pas de connexion internet. Réessaie dans un instant.", "err");
    } else {
      addBubble("Une erreur est survenue (" + e.message + "). Réessaie.", "err");
    }
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

function autoGrow() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
}

form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value.trim()); });
input.addEventListener("input", autoGrow);

// Boîtes de dialogue
document.querySelectorAll("dialog .close").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
$("#btn-sos").addEventListener("click", () => $("#dlg-sos").showModal());
$("#btn-settings").addEventListener("click", () => {
  $("#apikey").value = store.get("apaise_key");
  $("#username").value = store.get("apaise_name");
  $("#dlg-settings").showModal();
});
$("#save-settings").addEventListener("click", () => {
  store.set("apaise_key", $("#apikey").value.trim());
  store.set("apaise_name", $("#username").value.trim());
  $("#dlg-settings").close();
  if (history.length === 0) render();
});
$("#clear-chat").addEventListener("click", () => {
  if (confirm("Effacer toute la conversation ?")) {
    history = []; saveHistory(); render(); $("#dlg-settings").close();
  }
});
$("#welcome-ok").addEventListener("click", () => {
  store.set("apaise_welcomed", "1");
  $("#dlg-welcome").close();
  if (!store.get("apaise_key")) $("#dlg-settings").showModal();
});

render();
if (!store.get("apaise_welcomed")) $("#dlg-welcome").showModal();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
