# LaTeX Support in Chat

This application now supports LaTeX mathematical expressions in AI responses. You can use both inline and block math notation.

## Usage

### Inline Math
Use single dollar signs `$...$` for inline mathematical expressions:

```
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
```

### Block Math
Use double dollar signs `$$...$$` for displayed mathematical expressions:

```
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

## Examples

### Basic Math
- Inline: `$E = mc^2$`
- Block: `$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$`

### Fractions and Roots
- `$\frac{a}{b}$` for fractions
- `$\sqrt{x}$` for square roots
- `$\sqrt[n]{x}$` for nth roots

### Greek Letters
- `$\alpha, \beta, \gamma, \delta$`
- `$\pi, \phi, \theta, \lambda$`

### Subscripts and Superscripts
- `$x^2$` for superscripts
- `$x_i$` for subscripts
- `$x_i^2$` for both

### Integrals and Sums
- `$\int_a^b f(x) dx$` for integrals
- `$\sum_{i=1}^n x_i$` for sums

### Matrices
```
$$
\begin{pmatrix} 
a & b \\ 
c & d 
\end{pmatrix}
$$
```

## Features

- ✅ Inline math with `$...$`
- ✅ Block math with `$$...$$`
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Error handling for invalid LaTeX
- ✅ Automatic rendering in AI responses

## Technical Details

The LaTeX support is implemented using a standard and robust markdown processing pipeline:
- **react-markdown**: A powerful React component for rendering markdown.
- **remark-math**: A remark plugin to support math syntax.
- **rehype-katex**: A rehype plugin to render math using KaTeX.
- **KaTeX**: The underlying fast math typesetting library.
- Custom CSS styling for light/dark themes.

## Testing

You can test LaTeX support by asking the AI questions like:
- "What is the quadratic formula?"
- "Show me the derivative of x²"
- "What is the integral of e^x?"
- "Explain the Pythagorean theorem with the formula"

The AI will automatically render any LaTeX expressions in its responses. 