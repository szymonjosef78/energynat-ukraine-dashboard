// ---- bilingual (EN / UK) -------------------------------------------------
let LANG = "en";
let CURRENT_DATA = null;   // last payload, for re-render on language switch
const UK = {
  "Live: BAF": "Наживо: BAF", "Demo: mock data": "Демо: тестові дані",
  "Daily view": "Щоденний огляд", "Weekly view": "Тижневий огляд",
  "Last refreshed": "Оновлено", "never": "ніколи",
  "Report date": "Дата звіту", "Reporting period": "Звітний період",
  "Stock dashboard": "Панель складу", "Warehouse inventory levels & coverage": "Складські запаси та покриття",
  "Sales dashboard": "Панель продажів", "Sell-through by warehouse & top sellers": "Продажі за складами та топ-товари",
  "PV panels stock by Warehouse": "Запас фотомодулів за складами", "DEYE stock by Warehouse": "Запас DEYE за складами",
  "Stock by warehouse × product": "Запас: склад × товар",
  "Coverage ratio (months of stock vs week-to-date sales)": "Покриття (місяців запасу до продажів тижня)",
  "Sales by manager (USD) —": "Продажі за менеджерами (USD) —",
  "Per-manager metrics — this week": "Показники менеджерів — цей тиждень",
  "PV panels sales by warehouse": "Продажі фотомодулів за складами",
  "Deye sales by warehouse": "Продажі DEYE за складами",
  "Top sellers": "Топ-продажі", "Margin by product": "Маржа за товарами",
  "Weekly action plan — recommendations & issues": "Тижневий план дій — рекомендації та проблеми",
  "For Monday's sales-team & purchasing meeting": "Для понеділкової наради відділу продажів і закупівель",
  "Warehouse": "Склад", "Total": "Разом", "Sales manager": "Менеджер з продажів",
  "TOTAL — all managers": "РАЗОМ — усі менеджери", "Average per manager": "Середнє на менеджера",
  "Days to sell all stock": "Днів до розпродажу запасу", "Coverage": "Покриття",
  "Avg panel price (¢/Wp)": "Сер. ціна модуля (¢/Вт)", "Panels sold": "Продано модулів",
  "DEYE units sold": "Продано DEYE (шт)", "Total stock": "Загальний запас",
  "Today": "Сьогодні", "Same day last week": "Той самий день мин. тижня",
  "This week (WTD)": "Цей тиждень", "Last week (WTD)": "Мин. тиждень",
  "This week (to date)": "Цей тиждень", "Last week (benchmark)": "Мин. тиждень (база)",
  "as of": "станом на", "coverage": "покриття", "sell-through": "розпродаж",
  "vs week to date sales": "до продажів тижня", "vs last week sales": "до продажів мин. тижня",
  // insights
  "💡 What to buy for next week": "💡 Що купити на наступний тиждень",
  "Restock now — fast sellers running low": "Поповнити зараз — топ-товари закінчуються",
  "Ease off — overstocked / slow": "Пригальмувати — надлишок / повільні",
  "👥 Manager performance & issues": "👥 Ефективність менеджерів та проблеми",
  "Top performers this week": "Найкращі цього тижня", "Margin concerns": "Проблеми з маржею",
  "Underperforming this week": "Відстають цього тижня", "None": "Немає",
  "in stock vs": "в запасі проти", "sold this week": "продано цього тижня", "reorder.": "замовити.",
  "mo cover": "міс. покриття", "in stock": "в запасі", "slow — hold off.": "повільно — почекати.",
  "margin": "маржа", "sold at only": "продано лише з", "team avg": "сер. по команді",
  "check pricing/discounts.": "перевірити ціни/знижки.", "this week.": "цього тижня.",
  "mo": "міс", "n/a": "н/д", "d": "дн", "This week": "Цей тиждень", "Last week": "Мин. тиждень",
  "Week to date": "З початку тижня", "Sales USD": "Продажі USD",
  "No manager sales for this period.": "Немає продажів менеджерів за цей період.",
  "Rotate your device": "Поверніть пристрій",
  "This dashboard is easier to read in landscape — please rotate your phone.":
    "Дашборд зручніше читати горизонтально — будь ласка, поверніть телефон.",
};
function t(s) { return (LANG === "uk" && UK[s]) ? UK[s] : s; }

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString(LANG === "uk" ? "uk-UA" : "en-US", { maximumFractionDigits: 1 });
}

function coverageClass(months) {
  if (months === null || months === undefined) return "na";
  if (months < 1) return "coverage-low";
  if (months < 3) return "coverage-mid";
  return "coverage-ok";
}

function coverageText(months) {
  return months === null || months === undefined ? t("n/a") : `${fmtNum(months)} ${t("mo")}`;
}

function fmtUsd(n) {
  if (n === null || n === undefined) return "—";
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function renderManagerSales(ms) {
  const table = document.getElementById("manager-sales-table");
  document.getElementById("manager-period-label").textContent = t((ms && ms.period_label) || "");
  const managers = (ms && ms.managers) || [];
  if (!managers.length) {
    table.innerHTML = `<tbody><tr><td class="muted">${t("No manager sales for this period.")}</td></tr></tbody>`;
    return;
  }
  // Generic columns: current-period columns emphasised, benchmark columns muted.
  const cols = (ms && ms.columns) || [{ label: "Sales USD", field: "sales_usd" }];
  const cls = c => c.muted ? "col-benchmark" : "col-current";
  const n = managers.length;
  const totals = cols.map(c => managers.reduce((s, m) => s + (m[c.field] || 0), 0));
  const head = cols.map(c =>
    `<th class="${cls(c)}">${t(c.label)}${c.sub ? `<div class="period-range">${c.sub}</div>` : ""}</th>`).join("");
  table.innerHTML = `
    <thead><tr><th>#</th><th>${t("Sales manager")}</th>${head}</tr></thead>
    <tbody>
      ${managers.map((m, i) => `
        <tr><td>${i + 1}</td><td>${m.manager}</td>
          ${cols.map(c => `<td class="${cls(c)}">${fmtUsd(m[c.field] || 0)}</td>`).join("")}</tr>
      `).join("")}
      <tr class="total-row"><td></td><td>${t("TOTAL — all managers")}</td>
        ${totals.map((v, j) => `<td class="${cls(cols[j])}">${fmtUsd(v)}</td>`).join("")}</tr>
      <tr class="avg-row"><td></td><td>${t("Average per manager")}</td>
        ${totals.map((v, j) => `<td class="${cls(cols[j])}">${fmtUsd(n ? v / n : 0)}</td>`).join("")}</tr>
    </tbody>`;
}

function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
}

function setLang(l) {
  LANG = l;
  document.querySelectorAll("[data-lang-btn]").forEach(b =>
    b.classList.toggle("active", b.getAttribute("data-lang-btn") === l));
  if (CURRENT_DATA) render(CURRENT_DATA);
}

function loadData() {
  document.querySelectorAll("[data-lang-btn]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-lang-btn") === LANG);
    b.addEventListener("click", () => setLang(b.getAttribute("data-lang-btn")));
  });
  render(window.__DASHBOARD_DATA__);
}

function render(data) {
  CURRENT_DATA = data;
  document.getElementById("loading-msg").classList.add("hidden");
  applyStaticI18n();

  const badge = document.getElementById("data-source-badge");
  badge.textContent = data.data_source === "baf" ? t("Live: BAF") : t("Demo: mock data");
  badge.className = "badge " + (data.data_source === "baf" ? "baf" : "mock");

  document.getElementById("last-refreshed").textContent =
    t("Last refreshed") + ": " + (data.last_refreshed
      ? new Date(data.last_refreshed).toLocaleString(LANG === "uk" ? "uk-UA" : "en-US") : t("never"));

  const variantBadge = document.getElementById("variant-badge");
  variantBadge.textContent = data.variant === "daily" ? t("Daily view") : t("Weekly view");
  variantBadge.className = "badge " + (data.variant === "daily" ? "variant-daily" : "variant-weekly");

  const scope = data.report_scope || {};
  const scopeEl = document.getElementById("report-scope");
  if (scopeEl && scope.text) {
    const prefix = scope.kind === "weekly" ? t("Reporting period") : t("Report date");
    scopeEl.textContent = `${prefix}: ${scope.text}`;
  }

  const cov = data.coverage || {};
  renderTypeStock("panel-stock", data.panel_stock, cov.panels);
  renderTypeStock("deye-stock", data.deye_stock, cov.deye);
  renderManagerSales(data.manager_sales);
  renderTypeSales("panel-sales", data.panel_sales);
  renderTypeSales("deye-sales", data.deye_sales);
  renderSalesTopSellers(data.sales_top_sellers);
  const isDaily = data.variant === "daily";

  ["panel-stock-section", "deye-stock-section", "manager-sales-section", "panel-sales-section",
   "deye-sales-section", "sales-top-sellers-section"].forEach(id =>
     document.getElementById(id).classList.remove("hidden"));

  // Both reports: sales dashboard on the LEFT, stock dashboard on the RIGHT.
  // News & competitor activity are removed from both dashboards (still carried in
  // the payload for the email digest).
  const cols = document.querySelectorAll(".monitor-column");
  cols[1].insertBefore(document.querySelector(".stock-group"), cols[1].firstChild);
  document.getElementById("news-section").classList.add("hidden");
  document.getElementById("competitor-section").classList.add("hidden");

  // Weekly extras: action-plan insights + per-manager metrics (this week).
  if (!isDaily) {
    renderInsights(data.weekly_insights);
    renderManagerMetrics(data.manager_metrics);
  }

  // Margin-by-product section removed from both reports (per spec).
  document.getElementById("sales-margin-section").classList.add("hidden");
}

function renderManagerMetrics(mm) {
  const sec = document.getElementById("manager-metrics-section");
  if (!sec || !mm || !mm.length) { if (sec) sec.classList.add("hidden"); return; }
  document.getElementById("manager-metrics-table").innerHTML = `
    <thead><tr><th>#</th><th>${t("Sales manager")}</th>
      <th class="col-current">${t("Avg panel price (¢/Wp)")}</th>
      <th>${t("Panels sold")}</th><th>${t("DEYE units sold")}</th></tr></thead>
    <tbody>${mm.map((m, i) => `<tr><td>${i + 1}</td><td>${m.manager}</td>
      <td class="col-current">${m.cents_per_wp != null ? m.cents_per_wp.toFixed(1) + "¢" : "—"}</td>
      <td>${fmtNum(m.panel_units)}</td><td>${fmtNum(m.deye_units)}</td></tr>`).join("")}</tbody>`;
  sec.classList.remove("hidden");
}

function renderInsights(ins) {
  const sec = document.getElementById("insights-section");
  if (!sec || !ins) { if (sec) sec.classList.add("hidden"); return; }
  const li = (items, fmt) => (items && items.length
    ? items.map(x => `<li>${fmt(x)}</li>`).join("") : `<li class="muted">${t("None")}</li>`);
  const buy = li(ins.restock, p =>
    `<b>${p.name}</b> — ${fmtNum(p.stock)} ${t("in stock vs")} ${fmtNum(p.sold)} ${t("sold this week")} (${p.coverage} ${t("mo cover")}); ${t("reorder.")}`);
  const over = li(ins.overstock, p =>
    `<b>${p.name}</b> — ${fmtNum(p.stock)} ${t("in stock")} (${p.coverage} ${t("mo cover")}); ${t("slow — hold off.")}`);
  const top = li(ins.top_managers, m => `<b>${m.name}</b> — ${fmtUsd(m.sales)} (${m.margin_pct}% ${t("margin")})`);
  const concern = li(ins.margin_concerns, m =>
    `<b>${m.name}</b> — ${fmtUsd(m.sales)} ${t("sold at only")} ${m.margin_pct}% ${t("margin")} (${t("team avg")} ${ins.team_margin_pct}%); ${t("check pricing/discounts.")}`);
  const under = li(ins.underperformers, m => `<b>${m.name}</b> — ${fmtUsd(m.sales)} ${t("this week.")}`);
  document.getElementById("insights-grid").innerHTML = `
    <div class="insight-card buy">
      <h3>${t("💡 What to buy for next week")}</h3>
      <div class="ins-h">${t("Restock now — fast sellers running low")}</div><ul>${buy}</ul>
      <div class="ins-h">${t("Ease off — overstocked / slow")}</div><ul>${over}</ul>
    </div>
    <div class="insight-card people">
      <h3>${t("👥 Manager performance & issues")}</h3>
      <div class="ins-h">${t("Top performers this week")}</div><ul>${top}</ul>
      <div class="ins-h">${t("Margin concerns")}</div><ul>${concern}</ul>
      <div class="ins-h">${t("Underperforming this week")}</div><ul>${under}</ul>
    </div>`;
  sec.classList.remove("hidden");
}

function renderTypeStock(idPrefix, stock, cov) {
  const cardsEl = document.getElementById(`${idPrefix}-cards`);
  const covMonths = cov ? cov.coverage_months : stock.coverage_total;
  const covLabel = cov && cov.label ? cov.label.toLowerCase() : "last month";
  const days = cov ? cov.days_to_sell_all : null;
  cardsEl.innerHTML = `
    <div class="card"><div class="label">${t("Total stock")}</div><div class="value">${fmtNum(stock.grand_total)}</div>
      <div class="sub">${t("as of")} ${stock.snapshot_date || "—"} &middot; ${t("coverage")} ${coverageText(covMonths)}
        <span class="muted">(${t("vs week to date sales")})</span>${days != null ? ` &middot; ${t("sell-through")} ${daysToSellText(days)}` : ""}</div></div>
  `;

  const warehouses = Object.keys(stock.by_warehouse);
  const products = stock.products;

  const table = document.getElementById(`${idPrefix}-table`);
  table.innerHTML = `
    <thead><tr><th>${t("Warehouse")}</th><th class="col-total">${t("Total")}</th>${products.map(p => `<th>${p}</th>`).join("")}</tr></thead>
    <tbody>
      ${warehouses.map(wh => `
        <tr><td>${wh}</td><td class="col-total">${fmtNum(stock.total_by_warehouse[wh])}</td>
          ${products.map(p => `<td>${fmtNum(stock.by_warehouse[wh][p])}</td>`).join("")}</tr>
      `).join("")}
      <tr class="total-row"><td>${t("Total")}</td><td class="col-total">${fmtNum(stock.grand_total)}</td>
        ${products.map(p => `<td>${fmtNum(stock.product_grand_totals[p])}</td>`).join("")}</tr>
    </tbody>
  `;

  const covTable = document.getElementById(`${idPrefix}-coverage-table`);
  covTable.innerHTML = `
    <thead><tr><th></th><th class="col-total">${t("Total")}</th>${products.map(p => `<th>${p}</th>`).join("")}</tr></thead>
    <tbody>
      <tr><td>${t("Coverage")}</td><td class="col-total ${coverageClass(stock.coverage_total)}">${coverageText(stock.coverage_total)}</td>
        ${products.map(p => {
          const c = stock.coverage_by_product[p];
          return `<td class="${coverageClass(c)}">${coverageText(c)}</td>`;
        }).join("")}</tr>
    </tbody>
  `;
}

function daysCoverageClass(days) {
  if (days === null || days === undefined) return "na";
  // Same tiers as coverageClass (months), converted to days (~30/mo).
  if (days < 30) return "coverage-low";
  if (days < 90) return "coverage-mid";
  return "coverage-ok";
}

function daysToSellText(days) {
  return days === null || days === undefined ? "—" : `${Math.round(days)} ${t("d")}`;
}

function renderTypeSales(idPrefix, sales) {
  const warehouses = sales.warehouses;
  const periods = sales.periods;
  // current-period columns emphasised; benchmark columns muted
  const cls = p => (p.muted ? "col-benchmark" : "col-current");
  const table = document.getElementById(`${idPrefix}-table`);
  table.innerHTML = `
    <thead><tr><th>${t("Warehouse")}</th>${periods.map(p => `
      <th class="${cls(p)}">${t(p.label)}<div class="period-range">${p.start} to ${p.end}</div></th>
    `).join("")}</tr></thead>
    <tbody>
      <tr class="total-row"><td>${t("Total")}</td>${periods.map(p => `<td class="${cls(p)}">${fmtNum(p.total)}</td>`).join("")}</tr>
      ${warehouses.map(wh => `
        <tr><td>${wh}</td>${periods.map(p => `<td class="${cls(p)}">${fmtNum(p.by_warehouse[wh])}</td>`).join("")}</tr>
      `).join("")}
      <tr><td>${t("Days to sell all stock")}</td>${periods.map(p =>
        `<td class="${cls(p)} ${daysCoverageClass(p.days_to_sell_all)}">${daysToSellText(p.days_to_sell_all)}</td>`
      ).join("")}</tr>
    </tbody>
  `;
}

function topSellerRows(items, tagClass, tagLabel) {
  return items.map(s => `
    <tr><td><span class="badge tag ${tagClass}">${tagLabel}</span></td><td>${s.name}</td><td>${fmtNum(s.qty)}</td></tr>
  `).join("");
}

function renderSalesTopSellers(periods) {
  const grid = document.getElementById("sales-top-sellers-grid");
  grid.innerHTML = periods.map(p => `
    <div class="top-seller-card ${p.muted ? "benchmark-card" : "current-card"}">
      <h3>${t(p.label)}<div class="period-range">${p.start} to ${p.end}</div></h3>
      <table class="top-seller-table">
        <tbody>
          ${topSellerRows(p.panels, "tag-panel", "PANEL")}
          ${topSellerRows(p.deye, "tag-deye", "DEYE")}
        </tbody>
      </table>
    </div>
  `).join("");
}

function unitMarginText(item) {
  if (item.unit_margin_usd === null || item.unit_margin_usd === undefined) return "—";
  const digits = item.unit_margin_label === "Wp" ? 3 : 2;
  return `$${item.unit_margin_usd.toFixed(digits)}/${item.unit_margin_label}`;
}

function marginRows(items, tagClass, tagLabel) {
  return items.map(item => {
    const negative = (item.unit_margin_usd !== null && item.unit_margin_usd < 0) ? "margin-negative" : "";
    const flag = item.fully_matched ? "" : "*";
    return `
    <tr>
      <td><span class="badge tag ${tagClass}">${tagLabel}</span></td>
      <td>${item.name}${flag}</td>
      <td>${fmtNum(item.qty)}</td>
      <td class="${negative}">$${fmtNum(item.margin_usd)}</td>
      <td class="${negative}">${unitMarginText(item)}</td>
    </tr>`;
  }).join("");
}

function marginSubtotalText(label, totals) {
  const pct = totals.margin_pct === null ? "—" : `${totals.margin_pct}%`;
  return `${label}: revenue $${fmtNum(totals.revenue_usd)} &middot; cost $${fmtNum(totals.cost_usd)} &middot; margin $${fmtNum(totals.margin_usd)} (${pct})`;
}

function renderSalesMargin(periods) {
  const grid = document.getElementById("sales-margin-grid");
  grid.innerHTML = periods.map(p => `
    <div class="top-seller-card">
      <h3>${p.label}<div class="muted period-range">${p.start} to ${p.end}</div></h3>
      <div class="margin-subtotal">${marginSubtotalText("Panels", p.panels_total)}</div>
      <div class="margin-subtotal">${marginSubtotalText("DEYE", p.deye_total)}</div>
      <table class="margin-table">
        <thead><tr><th></th><th>Product</th><th>Qty</th><th>Margin</th><th>Unit margin</th></tr></thead>
        <tbody>
          ${marginRows(p.panels, "tag-panel", "PANEL")}
          ${marginRows(p.deye, "tag-deye", "DEYE")}
        </tbody>
      </table>
    </div>
  `).join("");
}

function newsScoreBadge(article) {
  const span = document.createElement("span");
  span.className = `badge tag tier-${article.tier}`;
  span.textContent = article.relevance_score;
  return span;
}

function renderNewsHero(article) {
  const hero = document.getElementById("news-hero-card");
  hero.innerHTML = "";
  hero.classList.remove("hidden");

  const meta = document.createElement("div");
  meta.className = "hero-meta";

  const tierBadge = document.createElement("span");
  tierBadge.className = `badge tag tier-${article.tier}`;
  tierBadge.textContent = `${article.tier_label} · ${article.relevance_score}`;
  meta.appendChild(tierBadge);

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "badge tag category-tag";
  categoryBadge.textContent = article.category;
  meta.appendChild(categoryBadge);

  const sourceBadge = document.createElement("span");
  sourceBadge.className = "badge tag source-tag";
  sourceBadge.textContent = article.source;
  meta.appendChild(sourceBadge);

  hero.appendChild(meta);

  const link = document.createElement("a");
  link.href = article.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "hero-title";
  link.textContent = article.title;
  hero.appendChild(link);

  if (article.summary) {
    const p = document.createElement("p");
    p.className = "hero-summary";
    p.textContent = article.summary;
    hero.appendChild(p);
  }
}

function renderNewsList(articles) {
  const list = document.getElementById("news-list");
  list.innerHTML = "";

  for (const a of articles) {
    const row = document.createElement("div");
    row.className = "list-row";

    row.appendChild(newsScoreBadge(a));

    const link = document.createElement("a");
    link.href = a.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "list-title";
    link.textContent = a.title;
    row.appendChild(link);

    const source = document.createElement("span");
    source.className = "list-source";
    source.textContent = a.source;
    row.appendChild(source);

    list.appendChild(row);
  }
}

function renderNews(news) {
  document.getElementById("news-date-label").textContent = news.fetch_date || "no data yet";

  const heroCard = document.getElementById("news-hero-card");
  const list = document.getElementById("news-list");

  if (!news.articles.length) {
    heroCard.classList.add("hidden");
    list.innerHTML = "";
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No relevant stories today.";
    list.appendChild(p);
    return;
  }

  renderNewsHero(news.articles[0]);
  renderNewsList(news.articles.slice(1));
}

function renderCompetitorActivity(posts) {
  const panel = document.getElementById("competitor-panel");
  panel.innerHTML = "";

  if (!posts.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No competitor activity available.";
    panel.appendChild(p);
    return;
  }

  for (const post of posts) {
    const row = document.createElement("div");
    row.className = "list-row";

    const company = document.createElement("span");
    company.className = "badge tag source-tag";
    company.textContent = post.company;
    row.appendChild(company);

    const link = document.createElement("a");
    link.href = post.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "list-title";
    link.textContent = post.title || post.url;
    row.appendChild(link);

    panel.appendChild(row);
  }
}

loadData();
