import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const LaTeXTest = () => {
    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6">LaTeX Support Test</h1>
            
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Direct LaTeX Test:</h2>
                    <p className="mb-2">
                        Inline math: <InlineMath math="E = mc^2" />
                    </p>
                    <p className="mb-2">
                        Fraction: <InlineMath math="\frac{a}{b}" />
                    </p>
                    <p className="mb-2">
                        Square root: <InlineMath math="\sqrt{x^2 + y^2}" />
                    </p>
                    <BlockMath math="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" />
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold mb-2">User's Example:</h2>
                    <p className="mb-2">
                        To find <InlineMath math="\frac{dy}{dx}" /> for the given function:
                    </p>
                    <BlockMath math="y = \ln \left( \left( \frac{2x^3}{3x^2 + 5} \right)^4 \right)" />
                    <p className="mb-2">
                        First, we can use the property of logarithms that <InlineMath math="\ln(a^b) = b \cdot \ln(a)" />:
                    </p>
                    <BlockMath math="y = 4 \cdot \ln \left( \frac{2x^3}{3x^2 + 5} \right)" />
                    <p className="mb-2">
                        Now, apply the logarithmic differentiation rule:
                    </p>
                    <BlockMath math="\frac{dy}{dx} = 4 \cdot \frac{1}{\frac{2x^3}{3x^2 + 5}} \cdot \frac{d}{dx}\left(\frac{2x^3}{3x^2 + 5}\right)" />
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold mb-2">Inline Math Examples:</h2>
                    <p className="mb-2">
                        The quadratic formula is: <InlineMath math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                    </p>
                    <p className="mb-2">
                        Einstein's famous equation: <InlineMath math="E = mc^2" />
                    </p>
                    <p className="mb-2">
                        The golden ratio: <InlineMath math="\phi = \frac{1 + \sqrt{5}}{2}" />
                    </p>
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold mb-2">Block Math Examples:</h2>
                    <BlockMath math="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" />
                    <BlockMath math="\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}" />
                    <BlockMath math="\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} ax + by \\ cx + dy \end{pmatrix}" />
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold mb-2">Complex Examples:</h2>
                    <BlockMath math="\nabla \cdot \vec{E} = \frac{\rho}{\epsilon_0}" />
                    <BlockMath math="\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}" />
                </div>
            </div>
        </div>
    );
};

// Test function to verify LaTeX rendering
export const testLaTeXRendering = () => {
    try {
        // Test if KaTeX is available
        if (typeof window !== 'undefined' && window.katex) {
            console.log('✅ KaTeX is available');
        } else {
            console.log('❌ KaTeX is not available');
        }
        
        // Test if react-katex components are available
        if (InlineMath && BlockMath) {
            console.log('✅ react-katex components are available');
        } else {
            console.log('❌ react-katex components are not available');
        }
        
        // Test if CSS is loaded
        const katexStyles = document.querySelector('link[href*="katex"]');
        if (katexStyles) {
            console.log('✅ KaTeX CSS is loaded');
        } else {
            console.log('❌ KaTeX CSS is not loaded');
        }
        
        // Test regex pattern
        const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
        const testString = "The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and here's a block: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$";
        const testParts = testString.split(mathRegex);
        console.log('✅ Regex test - Original string:', testString);
        console.log('✅ Regex test - Split parts:', testParts);
        
        return true;
    } catch (error) {
        console.error('❌ LaTeX test failed:', error);
        return false;
    }
};

export default LaTeXTest; 