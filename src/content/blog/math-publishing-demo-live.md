---
title: "Building a KaTeX math publishing demo live with Grok Build"
description: "Live session: integrating KaTeX into airomatic.ai for beautiful math rendering — formula gallery, Markdown comparison, and a new /math/ section."
pubDate: 2026-07-03
youtubeId: u7SX0SGZ6XI
---

After the [xMoney hype tracker](/blog/xmoney-hype-tracker-live/), we turned to something every technical writer needs: **beautiful math on the web**. In this session we built a full KaTeX publishing reference and folded it into airomatic.ai at [**/math/**](/math/).

## What we built

A complete math publishing section powered by **KaTeX**, **remark-math**, and **rehype-katex** — all rendered at build time with zero client-side JavaScript:

- **[Overview](/math/)** — setup guide and reusable Astro components
- **[Formula gallery](/math/examples/)** — algebra, geometry, calculus, Euler's identity, the Mandelbrot set, polar curves
- **[Markdown comparison](/math/comparison/)** — LaTeX source next to rendered output
- **[Math blog](/math/blog/)** — sample article with inline and display equations

The same stack that powers this post: write `$...$` for inline math and `$$...$$` for display blocks in Markdown.

## Why KaTeX?

Publishing equations on the web used to mean slow JavaScript renderers or ugly images. KaTeX compiles LaTeX to HTML at build time — fast, crisp, and accessible. Pair it with Astro's static output and you get a site that loads instantly while still looking like a textbook.

A few formulas we featured in the demo:

**Euler's identity** — often called the most beautiful equation in mathematics:

$$
e^{i\pi} + 1 = 0
$$

**The quadratic formula** — every algebra student knows it:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

**The golden ratio** $\varphi$, which satisfies $\varphi^2 = \varphi + 1$:

$$
\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.618
$$

**The Mandelbrot set** — infinite complexity from a simple iteration $z_{n+1} = z_n^2 + c$:

$$
M = \left\{ c \in \mathbb{C} : \limsup_{n\to\infty} |z_n| \le 2 \right\}
$$

Browse the full [formula gallery](/math/examples/) or read [The Beauty of Mathematics](/math/blog/beauty-of-mathematics/) for a longer tour with even more equations.

## Watch the stream

The session recording is embedded above. Follow along as we scaffold the Astro project, wire up KaTeX, build the demo pages, integrate everything into airomatic-site, and push to GitHub.

**Previous episode** — [xMoney hype tracker](/blog/xmoney-hype-tracker-live/) ([YouTube](https://youtu.be/Rr-T0IIi3bs)).

Subscribe on [YouTube](https://www.youtube.com/@airomaticAI) for notifications when we go live. Questions or topic ideas? [Send a message](/contact/).