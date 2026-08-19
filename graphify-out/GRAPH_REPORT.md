# Graph Report - WebPort  (2026-08-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1113 nodes · 3013 edges · 61 communities (57 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a5ff9ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 15
- Community 16
- Community 17
- Community 19
- Community 20
- Community 21
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 54
- Community 56

## God Nodes (most connected - your core abstractions)
1. `esc()` - 183 edges
2. `each()` - 126 edges
3. `url()` - 75 edges
4. `start()` - 36 edges
5. `absolute()` - 28 edges
6. `horizon()` - 23 edges
7. `money()` - 23 edges
8. `cta()` - 22 edges
9. `crumbs()` - 21 edges
10. `productArt()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `buildSite()` --indirect_call--> `url()`  [INFERRED]
  build.js → src/_lib/html.js
- `loadSite()` --calls--> `url()`  [EXTRACTED]
  build.js → src/_lib/html.js
- `writeSitemap()` --calls--> `url()`  [EXTRACTED]
  build.js → src/_lib/html.js
- `buildSite()` --indirect_call--> `absolute()`  [INFERRED]
  build.js → src/_lib/html.js
- `buildSite()` --calls--> `document()`  [EXTRACTED]
  build.js → src/_lib/layout.js

## Import Cycles
- None detected.

## Communities (61 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (68): arch(), band(), cypressRow(), EXPERIENCE_ART, horizon(), JOURNAL_PALETTE, MOTIFS, PALETTES (+60 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (32): MIME, outDir, port, resolveFile(), server, basePath, studio, experimentHead() (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (40): root, start(), announce(), anyRoomAvailable(), blockedReason(), cellAttributes(), escapeHtml(), goTo() (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (37): box(), cross(), norm(), pack(), SHAPES, sphere(), torusKnot(), cross() (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (19): he(), ia(), ja(), Lc(), Md(), Nc(), Nd(), oa() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (14): bookingScenario(), BREAKPOINTS, calendarKeyboardScenario(), check(), dayDelta(), executablePath, failures, notes (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (40): @fontsource-variable/archivo, @fontsource-variable/bodoni-moda, @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/instrument-sans, @fontsource-variable/jetbrains-mono (+32 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (33): pipeline(), cta(), pageHead(), sectionHead(), ANNUAL_DISCOUNT, changelog, compliance, customerBySlug (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (24): Gw(), advance(), checkOverflow(), cleanUpClassName(), constructor(), destroy(), emit(), internalStart() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (36): barChart(), buildDataset(), CHART_SIZES, compact(), dataTable(), escapeAttr(), grid(), legend() (+28 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (32): add(), announce(), announcer(), catalogue, clear(), commit(), getLines(), lines (+24 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (29): footer(), header(), nav, footer(), header(), nav, crumbs(), render() (+21 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (28): COMMERCE, escapeSvg(), GROUND, productArt(), SHAPES, shift(), accordion(), cta() (+20 more)

### Community 13 - "Community 13"
Cohesion: 0.07
Nodes (4): ic(), Ka(), La(), rb()

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (25): buildSite(), expand(), joinRoute(), loadSite(), main(), outDir, root, routeFor() (+17 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (21): swatch(), catalogueIsland(), crumbs(), facetLabelIsland(), label(), productCard(), productGrid(), categories (+13 more)

### Community 17 - "Community 17"
Cohesion: 0.05
Nodes (84): attrs(), ENTITIES, addLine(), broadcast(), clearBag(), badge, countItems(), getBag() (+76 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (20): Ao(), cb(), cc(), gb(), hb(), jb(), kb(), ob() (+12 more)

### Community 20 - "Community 20"
Cohesion: 0.20
Nodes (17): origin, CSP_HASH, SNIPPET, attrOf(), checkCspHash(), checkDocument(), errors, fail() (+9 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (17): CART_KEY, FACET_KEYS, facetCounts(), filterProducts(), isValidLine(), PRICE_BANDS, readCart(), readQuery() (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (13): capabilities, faqs, principles, studies, studyBySlug, meta, render(), meta (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (5): buildCloth(), buildNet(), buildRope(), STRUCTURES, World

### Community 25 - "Community 25"
Cohesion: 0.23
Nodes (13): meta, render(), footer(), header(), nav, each(), accordion(), dashboard() (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.23
Nodes (14): EXTINCTION, init(), draw(), drawDiver(), drawLungs(), drawScale(), onScroll(), progress() (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (16): _a(), Ae(), ce(), $d(), ee(), ga(), ha(), ka() (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (15): C(), Dc(), Nq(), Ia(), Ja(), pb(), rc(), tc() (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.24
Nodes (12): init(), announce(), build(), draw(), impulse(), measure(), setPlaying(), start() (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (13): atStop(), data, GB_STOPS, HOST_STOPS, init(), planCard(), readState(), reasonUnavailable() (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.23
Nodes (12): _assertThisInitialized(), Gc(), Hc(), ic(), t(), ta(), Timeline(), Tween() (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.19
Nodes (12): CLOTH_PHYSICS, createDrape(), advance(), build(), buildWeaveTile(), draw(), drawAt(), gather() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.27
Nodes (11): jf(), lf(), mf(), N(), nf(), O(), of(), tf() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.20
Nodes (10): Db(), J(), nb(), oc(), qc(), Tb(), Ua(), Va() (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (9): A(), B(), F(), G(), fd(), L(), P(), Q() (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (7): DIAGRAMS, crumbs(), pages, renderStudy(), DIAGRAM_TITLES, pages, renderFeature()

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (6): Aa(), Ca(), na(), Vb(), wb(), Xb()

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (7): buildCommand, cleanUrls, headers, installCommand, outputDirectory, $schema, trailingSlash

### Community 40 - "Community 40"
Cohesion: 0.43
Nodes (5): compile(), createCaustics(), draw(), resize(), PALETTE

### Community 41 - "Community 41"
Cohesion: 0.43
Nodes (5): variantPrice(), init(), finishLabel(), render(), root

### Community 42 - "Community 42"
Cohesion: 0.43
Nodes (6): deliveryPanel(), detailsPanel(), meta, render(), reviewPanel(), STEPS

### Community 43 - "Community 43"
Cohesion: 0.43
Nodes (4): constructor(), kill(), revert(), split()

### Community 44 - "Community 44"
Cohesion: 0.52
Nodes (6): initAccordions(), initAll(), initForms(), initNav(), initTabs(), messageFor()

### Community 45 - "Community 45"
Cohesion: 0.43
Nodes (5): compile(), createSignal(), draw(), resize(), PALETTE

### Community 46 - "Community 46"
Cohesion: 0.47
Nodes (6): Animation(), Da(), la(), ma(), Ua(), Va()

### Community 47 - "Community 47"
Cohesion: 0.53
Nodes (6): Eb(), Ma(), Na(), Oa(), Ra(), z()

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (5): Context(), Db(), Eb(), fb(), ib()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (4): o(), Mq(), Tq(), Mp()

## Knowledge Gaps
- **165 isolated node(s):** `MOTIFS`, `PALETTES`, `journalBySlug`, `roomBySlug`, `bookingData` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `Community 11` to `Community 0`, `Community 1`, `Community 37`, `Community 7`, `Community 9`, `Community 42`, `Community 12`, `Community 15`, `Community 16`, `Community 17`, `Community 23`, `Community 25`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `each()` connect `Community 25` to `Community 0`, `Community 1`, `Community 37`, `Community 7`, `Community 42`, `Community 11`, `Community 12`, `Community 16`, `Community 17`, `Community 23`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `money()` connect `Community 10` to `Community 41`, `Community 42`, `Community 12`, `Community 16`, `Community 21`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `MOTIFS`, `PALETTES`, `journalBySlug` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07816632383191302 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11205073995771671 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09191583610188261 - nodes in this community are weakly interconnected._