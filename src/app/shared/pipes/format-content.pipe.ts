import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatContent',
  standalone: true
})
export class FormatContentPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    let formattedContent = value;

    // Convertir les retours à la ligne en paragraphes
    formattedContent = formattedContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        // Détecter les titres
        if (line.startsWith('# ')) {
          return `<h1 class="article-h1">${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 class="article-h2">${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 class="article-h3">${line.substring(4)}</h3>`;
        }
        // Détecter le code
        else if (line.startsWith('```')) {
          return `<pre class="article-pre"><code class="article-code">`;
        }
        // Paragraphes normaux
        else {
          return `<p class="article-p">${this.processInlineFormatting(line)}</p>`;
        }
      })
      .join('');

    // Nettoyer les blocs de code
    formattedContent = formattedContent.replace(/<pre>.*?<code>(.*?)<\/code><\/pre>/gs,
      (match, codeContent) => {
        return `<pre class="article-pre"><code class="article-code">${this.escapeHtml(codeContent)}</code></pre>`;
      }
    );

    return this.sanitizer.bypassSecurityTrustHtml(formattedContent);
  }

  private processInlineFormatting(text: string): string {
    // Gras : **texte**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italique : *texte*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code inline : `code`
    text = text.replace(/`(.*?)`/g, '<code class="article-inline-code">$1</code>');

    // Liens : [texte](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return text;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
