function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function coverageClass(months) {
  if (months === null || months === undefined) return "na";
  if (months < 1) return "coverage-low";
  if (months < 3) return "coverage-mid";
  return "coverage-ok";
}

function coverageText(months) {
  return months === null || months === undefined ? "n/a" : `${fmtNum(months)} mo`;
}

function loadData() {
  render(window.__DASHBOARD_DATA__);
}

function render(data) {
  document.getElementById("loading-msg").classList.add("hidden");

  const badge = document.getElementById("data-source-badge");
  badge.textContent = data.data_source === "baf" ? "Live: BAF" : "Demo: mock data";
  badge.className = "badge " + (data.data_source === "baf" ? "baf" : "mock");

  document.getElementById("last-refreshed").textContent =
    "Last refreshed: " + (data.last_refreshed ? new Date(data.last_refreshed).toLocaleString() : "never");

  renderTypeStock("panel-stock", data.panel_stock);
  renderTypeStock("deye-stock", data.deye_stock);
  renderTypeSales("panel-sales", data.panel_sales);
  renderTypeSales("deye-sales", data.deye_sales);
  renderSalesTopSellers(data.sales_top_sellers);
  renderSalesMargin(data.sales_margin);
  renderNews(data.news);
  renderCompetitorActivity(data.competitor_activity);

  document.getElementById("panel-stock-section").classList.remove("hidden");
  document.getElementById("deye-stock-section").classList.remove("hidden");
  document.getElementById("panel-sales-section").classList.remove("hidden");
  document.getElementById("deye-sales-section").classList.remove("hidden");
  document.getElementById("sales-top-sellers-section").classList.remove("hidden");
  document.getElementById("sales-margin-section").classList.remove("hidden");
  document.getElementById("news-section").classList.remove("hidden");
  document.getElementById("competitor-section").classList.remove("hidden");
}

function renderTypeStock(idPrefix, stock) {
  const cardsEl = document.getElementById(`${idPrefix}-cards`);
  cardsEl.innerHTML = `
    <div class="card"><div class="label">Total stock</div><div class="value">${fmtNum(stock.grand_total)}</div>
      <div class="sub">as of ${stock.snapshot_date || "—"} &middot; coverage ${coverageText(stock.coverage_total)}</div></div>
  `;

  const warehouses = Object.keys(stock.by_warehouse);
  const products = stock.products;

  const table = document.getElementById(`${idPrefix}-table`);
  table.innerHTML = `
    <thead><tr><th>Warehouse</th><th class="col-total">Total</th>${products.map(p => `<th>${p}</th>`).join("")}</tr></thead>
    <tbody>
      ${warehouses.map(wh => `
        <tr><td>${wh}</td><td class="col-total">${fmtNum(stock.total_by_warehouse[wh])}</td>
          ${products.map(p => `<td>${fmtNum(stock.by_warehouse[wh][p])}</td>`).join("")}</tr>
      `).join("")}
      <tr class="total-row"><td>Total</td><td class="col-total">${fmtNum(stock.grand_total)}</td>
        ${products.map(p => `<td>${fmtNum(stock.product_grand_totals[p])}</td>`).join("")}</tr>
    </tbody>
  `;

  const covTable = document.getElementById(`${idPrefix}-coverage-table`);
  covTable.innerHTML = `
    <thead><tr><th></th><th class="col-total">Total</th>${products.map(p => `<th>${p}</th>`).join("")}</tr></thead>
    <tbody>
      <tr><td>Coverage</td><td class="col-total ${coverageClass(stock.coverage_total)}">${coverageText(stock.coverage_total)}</td>
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
  return days === null || days === undefined ? "—" : `${Math.round(days)} d`;
}

function renderTypeSales(idPrefix, sales) {
  const warehouses = sales.warehouses;
  const periods = sales.periods;
  const table = document.getElementById(`${idPrefix}-table`);
  table.innerHTML = `
    <thead><tr><th>Warehouse</th>${periods.map(p => `
      <th>${p.label}<div class="muted period-range">${p.start} to ${p.end}</div></th>
    `).join("")}</tr></thead>
    <tbody>
      <tr class="total-row"><td>Total</td>${periods.map(p => `<td>${fmtNum(p.total)}</td>`).join("")}</tr>
      ${warehouses.map(wh => `
        <tr><td>${wh}</td>${periods.map(p => `<td>${fmtNum(p.by_warehouse[wh])}</td>`).join("")}</tr>
      `).join("")}
      <tr><td>Days to sell all stock</td>${periods.map(p =>
        `<td class="${daysCoverageClass(p.days_to_sell_all)}">${daysToSellText(p.days_to_sell_all)}</td>`
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
    <div class="top-seller-card">
      <h3>${p.label}<div class="muted period-range">${p.start} to ${p.end}</div></h3>
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
