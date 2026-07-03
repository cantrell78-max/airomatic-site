---
title: The Beauty of Mathematics
description: A tour through algebra, geometry, calculus, and famous identities — all rendered with KaTeX in Markdown.
pubDate: 2026-07-03
---

Mathematics has a language of its own. When you publish technical writing on the web, plain text falls short — you need equations that look as elegant on screen as they do on paper. KaTeX makes that possible in static sites, with no runtime JavaScript.

## Algebra: solving the general quadratic

Every student learns that a quadratic $ax^2 + bx + c = 0$ has solutions given by the quadratic formula:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

The discriminant $\Delta = b^2 - 4ac$ tells us whether roots are real ($\Delta \geq 0$) or complex ($\Delta < 0$). Expanding powers is equally compact with the binomial theorem:

$$
(a + b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k
$$

## Geometry: from triangles to spheres

The Pythagorean theorem $a^2 + b^2 = c^2$ relates the sides of a right triangle. Circles and spheres extend the idea into higher dimensions:

$$
A = \pi r^2, \qquad V = \frac{4}{3}\pi r^3
$$

These formulas appear everywhere — from architecture to computer graphics.

## Calculus: change and accumulation

Calculus formalizes two complementary ideas. The derivative measures instantaneous rate of change:

$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

Integration reverses differentiation. The fundamental theorem connects them:

$$
\int_a^b f(x)\,dx = F(b) - F(a)
$$

One of the most surprising results in analysis is the Gaussian integral:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## Euler's identity: poetry in one line

Many mathematicians consider Euler's identity the most beautiful equation in mathematics:

$$
e^{i\pi} + 1 = 0
$$

It unites five fundamental constants — $e$, $i$, $\pi$, $1$, and $0$ — in a single, breathtaking equality.

## The golden ratio

The golden ratio $\varphi$ appears in art, architecture, and nature. It satisfies $\varphi^2 = \varphi + 1$, with closed form:

$$
\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.618
$$

Fibonacci numbers approach $\varphi$ in their growth rate. Binet's formula makes the connection explicit:

$$
F_n = \frac{\varphi^n - \psi^n}{\sqrt{5}}, \quad \psi = \frac{1 - \sqrt{5}}{2}
$$

## The Mandelbrot set

Fractals reveal infinite complexity from simple rules. The Mandelbrot set arises from iterating $z_{n+1} = z_n^2 + c$ with $z_0 = 0$. A complex number $c$ belongs to the set when the orbit never escapes:

$$
M = \left\{ c \in \mathbb{C} : \limsup_{n\to\infty} |z_n| \le 2 \right\}
$$

Plotting $M$ in the complex plane produces one of the most iconic images in mathematics.

## Polar curves

Curves expressed in polar coordinates $r = f(\theta)$ produce striking shapes. Three classics:

**Rose curve:** $r = a\cos(k\theta)$

**Cardioid:** $r = a(1 + \cos\theta)$

**Lemniscate of Bernoulli:** $r^2 = a^2\cos(2\theta)$

## Publishing math on the web

With Astro, you write these expressions directly in Markdown. At build time, `remark-math` parses the LaTeX delimiters and `rehype-katex` renders them to HTML. The result is fast, accessible, and beautiful — exactly what a static math blog needs.

This section lives at [airomatic.ai/math](/math/) — explore the [formula gallery](/math/examples/) and [syntax comparison](/math/comparison/) to see how it all works.